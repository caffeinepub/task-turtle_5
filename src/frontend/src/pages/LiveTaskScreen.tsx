import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle2, Key, Loader2, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Task } from "../backend.d";
import { useBackend } from "../hooks/useBackend";
import type { AppUser } from "../types/app";

interface LiveTaskScreenProps {
  taskId: bigint;
  user: AppUser;
  onBack: () => void;
}

const STATUSES = [
  "posted",
  "accepted",
  "inprogress",
  "otp_pending",
  "completed",
];
const STATUS_LABELS: Record<string, string> = {
  posted: "Posted",
  accepted: "Tasker Accepted",
  inprogress: "In Progress",
  otp_pending: "OTP Pending",
  completed: "Completed",
};

export default function LiveTaskScreen({
  taskId,
  user,
  onBack,
}: LiveTaskScreenProps) {
  const { backend } = useBackend();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState("");
  const [otpDisplay, setOtpDisplay] = useState("");
  const [generatingOtp, setGeneratingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadTask = useCallback(async () => {
    if (!backend) return;
    try {
      const result = await backend.getTask(taskId);
      if (result.__kind__ === "Some") {
        setTask(result.value);
      }
    } catch {
      toast.error("Failed to load task");
    } finally {
      setLoading(false);
    }
  }, [backend, taskId]);

  useEffect(() => {
    loadTask();
    const interval = setInterval(loadTask, 5000);
    return () => clearInterval(interval);
  }, [loadTask]);

  const handleGenerateOTP = async () => {
    if (!backend) return;
    setGeneratingOtp(true);
    try {
      const res = await backend.generateOTP(taskId);
      if (res.ok) {
        setOtpDisplay(res.otp);
        toast.success(`OTP: ${res.otp}`);
        loadTask();
      } else {
        toast.error("Failed to generate OTP");
      }
    } catch {
      toast.error("Error");
    } finally {
      setGeneratingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      toast.error("Enter OTP");
      return;
    }
    if (!backend) return;
    setVerifyingOtp(true);
    try {
      const res = await backend.verifyOTP(taskId, otp);
      if (res.ok) {
        toast.success("Task completed! 🎉");
        loadTask();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("OTP verification failed");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleCancel = async () => {
    if (!backend) return;
    setCancelling(true);
    try {
      const res = await backend.cancelTask(taskId);
      if (res.ok) {
        toast.success("Task cancelled");
        loadTask();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to cancel");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-[50vh]"
        data-ocid="live.loading_state"
      >
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Task not found</p>
        <Button onClick={onBack} className="mt-4" data-ocid="live.button">
          Go Back
        </Button>
      </div>
    );
  }

  const currentIdx = STATUSES.indexOf(task.status);

  return (
    <main className="max-w-md mx-auto px-4 py-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors"
        data-ocid="live.link"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      <h1 className="text-2xl font-extrabold text-foreground mb-1">
        {task.title}
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        ₹{Number(task.amount)}
        {Number(task.tip) > 0 ? ` + ₹${Number(task.tip)} tip` : ""}
      </p>

      <Card className="rounded-2xl border border-border shadow-card mb-6">
        <CardContent className="p-5">
          <h2 className="font-bold text-sm mb-4 text-muted-foreground uppercase tracking-wider">
            Task Progress
          </h2>
          <div className="space-y-0">
            {STATUSES.map((s, idx) => {
              const isDone = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              const isFuture = idx > currentIdx;
              return (
                <div key={s} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                        isCurrent
                          ? "border-brand-green bg-brand-green text-brand-dark"
                          : isDone
                            ? "border-brand-green bg-brand-mint text-green-700"
                            : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-bold">{idx + 1}</span>
                      )}
                    </div>
                    {idx < STATUSES.length - 1 && (
                      <div
                        className={`w-0.5 h-6 my-0.5 ${isDone ? "bg-brand-green" : "bg-border"}`}
                      />
                    )}
                  </div>
                  <div
                    className={`pt-1.5 pb-4 ${isFuture ? "opacity-40" : ""}`}
                  >
                    <p
                      className={`text-sm font-semibold ${
                        isCurrent ? "text-brand-green" : "text-foreground"
                      }`}
                    >
                      {STATUS_LABELS[s]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {user.role === "customer" && task.status === "inprogress" && (
          <div className="space-y-2">
            {otpDisplay && (
              <div className="flex items-center justify-center gap-2 bg-brand-mint border border-green-300 rounded-2xl p-4">
                <Key className="h-5 w-5 text-green-700" />
                <span className="text-green-700 font-extrabold text-3xl tracking-widest">
                  {otpDisplay}
                </span>
              </div>
            )}
            <Button
              className="w-full rounded-full bg-brand-green text-brand-dark font-bold hover:bg-brand-green-hover"
              onClick={handleGenerateOTP}
              disabled={generatingOtp}
              data-ocid="live.primary_button"
            >
              {generatingOtp ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Generate OTP
                </>
              )}
            </Button>
          </div>
        )}

        {user.role === "tasker" && task.status === "otp_pending" && (
          <div className="flex gap-2">
            <Input
              placeholder="Enter OTP from customer"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="rounded-xl flex-1"
              maxLength={4}
              data-ocid="live.input"
            />
            <Button
              className="rounded-full bg-brand-green text-brand-dark font-bold hover:bg-brand-green-hover"
              onClick={handleVerifyOTP}
              disabled={verifyingOtp}
              data-ocid="live.submit_button"
            >
              {verifyingOtp ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Verify"
              )}
            </Button>
          </div>
        )}

        {task.status === "completed" && (
          <div className="flex items-center justify-center gap-2 bg-brand-mint border border-green-300 rounded-2xl p-4">
            <CheckCircle2 className="h-5 w-5 text-green-700" />
            <span className="text-green-700 font-bold">
              Task Completed! Payment released.
            </span>
          </div>
        )}

        {user.role === "customer" &&
          task.status !== "completed" &&
          task.status !== "cancelled" && (
            <Button
              variant="outline"
              className="w-full rounded-full border-red-300 text-red-500 hover:bg-red-50"
              onClick={handleCancel}
              disabled={cancelling}
              data-ocid="live.delete_button"
            >
              {cancelling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Task
                </>
              )}
            </Button>
          )}
      </div>
    </main>
  );
}
