import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Turtle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useBackend } from "../hooks/useBackend";
import type { AppUser } from "../types/app";

interface LoginPageProps {
  onLogin: (user: AppUser) => void;
  onBack: () => void;
}

export default function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const { backend } = useBackend();
  const [role, setRole] = useState<"customer" | "tasker">("customer");
  const [step, setStep] = useState<"info" | "otp">("info");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Please fill in name and phone");
      return;
    }
    toast.success("OTP sent! Use 1234 for demo.");
    setStep("otp");
  };

  const handleVerifyOTP = async () => {
    if (otp !== "1234") {
      toast.error("Incorrect OTP. Use 1234 for demo.");
      return;
    }
    if (!backend) {
      toast.error("Connecting to network...");
      return;
    }
    setLoading(true);
    try {
      const user = await backend.createOrUpdateUser(
        name,
        phone,
        email || "",
        28.6139,
        77.209,
      );
      if (role === "tasker") {
        await backend.toggleTaskerMode(true);
      }
      toast.success(`Welcome, ${user.name}!`);
      onLogin({
        name: user.name,
        phone: user.phone,
        email: user.email,
        role,
        walletBalance: Number(user.walletBalance),
      });
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

          <h2 className="text-white font-extrabold text-2xl mb-1">
            {step === "info" ? "Create Account" : "Verify OTP"}
          </h2>
          <p className="text-white/50 text-sm mb-6">
            {step === "info"
              ? "Join thousands of users near you"
              : `OTP sent to +91 ${phone}`}
          </p>

          {step === "info" ? (
            <>
              <div className="flex rounded-2xl bg-white/5 border border-white/10 p-1 mb-5">
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

              <div className="space-y-4">
                <div>
                  <Label className="text-white/70 text-sm mb-1 block">
                    Full Name
                  </Label>
                  <Input
                    placeholder="Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl"
                    data-ocid="login.input"
                  />
                </div>
                <div>
                  <Label className="text-white/70 text-sm mb-1 block">
                    Phone Number
                  </Label>
                  <Input
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl"
                    data-ocid="login.input"
                  />
                </div>
                <div>
                  <Label className="text-white/70 text-sm mb-1 block">
                    Email (optional)
                  </Label>
                  <Input
                    placeholder="rahul@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl"
                    data-ocid="login.input"
                  />
                </div>
                <Button
                  className="w-full rounded-full bg-brand-green text-brand-dark font-bold py-5 hover:bg-brand-green-hover"
                  onClick={handleSendOTP}
                  data-ocid="login.submit_button"
                >
                  Send OTP
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-white/70 text-sm mb-1 block">
                  Enter OTP
                </Label>
                <Input
                  placeholder="1234"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl text-center text-2xl tracking-widest"
                  maxLength={4}
                  data-ocid="login.input"
                />
                <p className="text-white/30 text-xs mt-2 text-center">
                  Demo: use 1234
                </p>
              </div>
              <Button
                className="w-full rounded-full bg-brand-green text-brand-dark font-bold py-5 hover:bg-brand-green-hover"
                onClick={handleVerifyOTP}
                disabled={loading}
                data-ocid="login.submit_button"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Verify & Continue"
                )}
              </Button>
              <button
                type="button"
                onClick={() => setStep("info")}
                className="w-full text-white/40 hover:text-white text-sm transition-colors"
                data-ocid="login.link"
              >
                ← Change details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
