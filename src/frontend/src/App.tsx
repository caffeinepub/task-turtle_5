import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import AppNavbar from "./components/AppNavbar";
import { useBackend } from "./hooks/useBackend";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import CustomerDashboard from "./pages/CustomerDashboard";
import LandingPage from "./pages/LandingPage";
import LiveTaskScreen from "./pages/LiveTaskScreen";
import LoginPage from "./pages/LoginPage";
import PaymentFailure from "./pages/PaymentFailure";
import PaymentSuccess from "./pages/PaymentSuccess";
import TaskerDashboard from "./pages/TaskerDashboard";
import WalletPage from "./pages/WalletPage";
import type { AppUser, View } from "./types/app";

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [user, setUser] = useState<AppUser | null>(null);
  const [activeLiveTaskId, setActiveLiveTaskId] = useState<bigint | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [autoLoginDone, setAutoLoginDone] = useState(false);
  const { clear, identity, isInitializing } = useInternetIdentity();
  const { backend, isLoading: backendLoading } = useBackend();

  // Check for payment redirect on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (payment === "success") {
      const amount = Number(params.get("amount") ?? "0");
      setPaymentAmount(amount);
      setView("payment-success");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (payment === "cancelled") {
      setView("payment-failure");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Auto-login: if II session exists, load profile and go to dashboard
  useEffect(() => {
    if (autoLoginDone) return;
    if (isInitializing) return;
    if (!identity || !backend || backendLoading) return;
    if (user) {
      setAutoLoginDone(true);
      return;
    }

    // Identity exists from a saved session — try to auto-login
    backend
      .getMyProfile()
      .then((profileOpt) => {
        if (profileOpt.__kind__ === "Some") {
          const u = profileOpt.value;
          const savedRole =
            (localStorage.getItem("tt_role") as "customer" | "tasker") ??
            "customer";
          setUser({
            name: u.name,
            phone: u.phone,
            email: u.email,
            role: savedRole,
            walletBalance: Number(u.walletBalance),
          });
          setView(
            savedRole === "tasker" ? "tasker-dashboard" : "customer-dashboard",
          );
        }
      })
      .catch(() => {
        // No profile yet, stay on landing
      })
      .finally(() => {
        setAutoLoginDone(true);
      });
  }, [identity, backend, backendLoading, isInitializing, user, autoLoginDone]);

  const handleLogin = (loggedInUser: AppUser) => {
    localStorage.setItem("tt_role", loggedInUser.role);
    setUser(loggedInUser);
    setAutoLoginDone(true);
    setView(
      loggedInUser.role === "customer"
        ? "customer-dashboard"
        : "tasker-dashboard",
    );
  };

  const handleLogout = () => {
    clear();
    localStorage.removeItem("tt_role");
    setUser(null);
    setAutoLoginDone(false);
    setView("landing");
  };

  const openLiveTask = (taskId: bigint) => {
    setActiveLiveTaskId(taskId);
    setView("live-task");
  };

  useEffect(() => {
    if (
      !user &&
      view !== "landing" &&
      view !== "login" &&
      view !== "payment-success" &&
      view !== "payment-failure"
    ) {
      setView("landing");
    }
  }, [user, view]);

  return (
    <div className="min-h-screen bg-background">
      {user && view !== "payment-success" && view !== "payment-failure" && (
        <AppNavbar user={user} onNavigate={setView} onLogout={handleLogout} />
      )}
      {view === "landing" && (
        <LandingPage onGetStarted={() => setView("login")} />
      )}
      {view === "login" && (
        <LoginPage onLogin={handleLogin} onBack={() => setView("landing")} />
      )}
      {view === "customer-dashboard" && user && (
        <CustomerDashboard
          user={user}
          onOpenLiveTask={openLiveTask}
          onGoToTaskerHub={() => setView("tasker-dashboard")}
        />
      )}
      {view === "tasker-dashboard" && user && (
        <TaskerDashboard user={user} onOpenLiveTask={openLiveTask} />
      )}
      {view === "live-task" && user && activeLiveTaskId !== null && (
        <LiveTaskScreen
          taskId={activeLiveTaskId}
          user={user}
          onBack={() =>
            setView(
              user.role === "customer"
                ? "customer-dashboard"
                : "tasker-dashboard",
            )
          }
        />
      )}
      {view === "wallet" && user && (
        <WalletPage
          user={user}
          onUpdateBalance={(bal) => setUser({ ...user, walletBalance: bal })}
        />
      )}
      {view === "payment-success" && (
        <PaymentSuccess
          amount={paymentAmount}
          onGoToWallet={() => setView("wallet")}
        />
      )}
      {view === "payment-failure" && (
        <PaymentFailure onGoToWallet={() => setView("wallet")} />
      )}
      <Toaster richColors position="top-right" />
    </div>
  );
}
