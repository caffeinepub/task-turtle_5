import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AppNavbar from "./components/AppNavbar";
import CustomerDashboard from "./pages/CustomerDashboard";
import LandingPage from "./pages/LandingPage";
import LiveTaskScreen from "./pages/LiveTaskScreen";
import LoginPage from "./pages/LoginPage";
import TaskerDashboard from "./pages/TaskerDashboard";
import WalletPage from "./pages/WalletPage";
import type { AppUser, View } from "./types/app";

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [user, setUser] = useState<AppUser | null>(null);
  const [activeLiveTaskId, setActiveLiveTaskId] = useState<bigint | null>(null);

  const handleLogin = (loggedInUser: AppUser) => {
    setUser(loggedInUser);
    setView(
      loggedInUser.role === "customer"
        ? "customer-dashboard"
        : "tasker-dashboard",
    );
  };

  const handleLogout = () => {
    setUser(null);
    setView("landing");
  };

  const openLiveTask = (taskId: bigint) => {
    setActiveLiveTaskId(taskId);
    setView("live-task");
  };

  return (
    <div className="min-h-screen bg-background">
      {user && (
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
      <Toaster richColors position="top-right" />
    </div>
  );
}
