import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Shield, Turtle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useBackend } from "../hooks/useBackend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import type { AppUser } from "../types/app";

interface LoginPageProps {
  onLogin: (user: AppUser) => void;
  onBack: () => void;
}

export default function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const { backend, isLoading: backendLoading } = useBackend();
  const { login, clear, loginStatus, identity, isInitializing, isLoggingIn } =
    useInternetIdentity();

  const [role, setRole] = useState<"customer" | "tasker">("customer");
  const [step, setStep] = useState<"role" | "setup">("role");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);

  // Use refs to avoid stale closures without re-triggering the effect
  const onLoginRef = useRef(onLogin);
  onLoginRef.current = onLogin;
  const clearRef = useRef(clear);
  clearRef.current = clear;
  const roleRef = useRef(role);
  roleRef.current = role;

  useEffect(() => {
    if (!identity || !backend || backendLoading) return;
    if (loginStatus !== "success" && loginStatus !== "idle") return;

    setCheckingProfile(true);
    backend
      .getMyProfile()
      .then((profileOpt) => {
        if (profileOpt.__kind__ === "Some") {
          const u = profileOpt.value;
          toast.success(`Welcome back, ${u.name}!`);
          onLoginRef.current({
            name: u.name,
            phone: u.phone,
            email: u.email,
            role: roleRef.current,
            walletBalance: Number(u.walletBalance),
          });
        } else {
          setStep("setup");
          setCheckingProfile(false);
        }
      })
      .catch(() => {
        setCheckingProfile(false);
        toast.error("Failed to load profile. Please try again.");
        clearRef.current();
      });
  }, [identity, backend, backendLoading, loginStatus]);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!backend) {
      toast.error("Connecting to network...");
      return;
    }
    setSaving(true);
    try {
      const u = await backend.createOrUpdateUser(
        name.trim(),
        "",
        "",
        28.6139,
        77.209,
      );
      if (role === "tasker") {
        await backend.toggleTaskerMode(true);
      }
      toast.success(`Welcome, ${u.name}!`);
      onLogin({
        name: u.name,
        phone: u.phone,
        email: u.email,
        role,
        walletBalance: Number(u.walletBalance),
      });
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const isAuthLoading =
    isInitializing || isLoggingIn || checkingProfile || saving;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(160deg, #0F3A22 0%, #0B0F0C 100%)",
      }}
    >
      <div className="w-full max-w-sm">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-white/60 hover:text-white text-sm mb-8 transition-colors"
          data-ocid="login.link"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <Turtle className="h-7 w-7 text-brand-green" />
            <span className="text-white font-bold text-xl">Task Turtle</span>
          </div>

          {step === "role" ? (
            <>
              <h2 className="text-white font-extrabold text-2xl mb-1">
                Get Started
              </h2>
              <p className="text-white/50 text-sm mb-6">
                Choose your role and sign in securely
              </p>

              <div className="flex rounded-2xl bg-white/5 border border-white/10 p-1 mb-6">
                <button
                  type="button"
                  className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-all ${
                    role === "customer"
                      ? "bg-brand-green text-brand-dark"
                      : "text-white/60 hover:text-white"
                  }`}
                  onClick={() => setRole("customer")}
                  data-ocid="login.toggle"
                >
                  Post Tasks
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-all ${
                    role === "tasker"
                      ? "bg-brand-green text-brand-dark"
                      : "text-white/60 hover:text-white"
                  }`}
                  onClick={() => setRole("tasker")}
                  data-ocid="login.toggle"
                >
                  Earn as Tasker
                </button>
              </div>

              <Button
                className="w-full rounded-full bg-brand-green text-brand-dark font-bold py-5 hover:bg-brand-green-hover flex items-center justify-center gap-2"
                onClick={login}
                disabled={isAuthLoading}
                data-ocid="login.submit_button"
              >
                {isAuthLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4" />
                )}
                {isLoggingIn
                  ? "Opening login..."
                  : checkingProfile
                    ? "Loading profile..."
                    : isInitializing
                      ? "Initializing..."
                      : "Login with Internet Identity"}
              </Button>

              <p className="text-white/30 text-xs text-center mt-3">
                Secure, passwordless login · No password needed
              </p>
            </>
          ) : (
            <>
              <h2 className="text-white font-extrabold text-2xl mb-1">
                One last step!
              </h2>
              <p className="text-white/50 text-sm mb-6">
                What should we call you?
              </p>

              <div className="space-y-4">
                <div>
                  <Label className="text-white/70 text-sm mb-1 block">
                    Your Name
                  </Label>
                  <Input
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && void handleSaveProfile()
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl"
                    autoFocus
                    data-ocid="login.input"
                  />
                </div>
                <Button
                  className="w-full rounded-full bg-brand-green text-brand-dark font-bold py-5 hover:bg-brand-green-hover"
                  onClick={() => void handleSaveProfile()}
                  disabled={saving}
                  data-ocid="login.submit_button"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Continue →"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
