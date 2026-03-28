import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, MapPin, RefreshCw, Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Task } from "../backend.d";
import { useBackend } from "../hooks/useBackend";
import type { AppUser } from "../types/app";

interface TaskerDashboardProps {
  user: AppUser;
  onOpenLiveTask: (taskId: bigint) => void;
}

const STATUS_COLORS: Record<string, string> = {
  posted: "bg-yellow-400/20 text-yellow-600 border-yellow-400/30",
  accepted: "bg-blue-400/20 text-blue-600 border-blue-400/30",
  inprogress: "bg-purple-400/20 text-purple-600 border-purple-400/30",
  otp_pending: "bg-orange-400/20 text-orange-600 border-orange-400/30",
  completed: "bg-brand-mint text-green-700 border-green-400/30",
  cancelled: "bg-red-400/20 text-red-600 border-red-400/30",
};

function calcDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): string {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`;
}

export default function TaskerDashboard({
  onOpenLiveTask,
}: TaskerDashboardProps) {
  const { backend } = useBackend();
  const [isOnline, setIsOnline] = useState(false);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [nearbyTasks, setNearbyTasks] = useState<Task[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const MY_LAT = 28.6139;
  const MY_LNG = 77.209;

  const loadData = useCallback(async () => {
    if (!backend) return;
    setLoading(true);
    try {
      const [nearby, myT, bal] = await Promise.all([
        backend.getNearbyTasks(MY_LAT, MY_LNG, 10.0),
        backend.getMyTasksAsTasker(),
        backend.getWalletBalance(),
      ]);
      setNearbyTasks(nearby.filter((t) => t.status === "posted"));
      setMyTasks(myT);
      setWalletBalance(Number(bal));
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [backend]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleOnline = async (val: boolean) => {
    if (!backend) return;
    setTogglingOnline(true);
    try {
      await backend.toggleTaskerMode(val);
      setIsOnline(val);
      toast.success(
        val ? "You're online! Tasks will appear now." : "You're offline.",
      );
      if (val) loadData();
    } catch {
      toast.error("Failed to toggle status");
    } finally {
      setTogglingOnline(false);
    }
  };

  const handleAccept = async (taskId: bigint) => {
    const key = taskId.toString();
    if (!backend) return;
    setAcceptingId(key);
    try {
      const res = await backend.acceptTask(taskId);
      if (res.ok) {
        toast.success("Task accepted!");
        loadData();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to accept task");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleStart = async (taskId: bigint) => {
    const key = taskId.toString();
    if (!backend) return;
    setStartingId(key);
    try {
      const res = await backend.startTask(taskId);
      if (res.ok) {
        toast.success("Task started!");
        loadData();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to start task");
    } finally {
      setStartingId(null);
    }
  };

  const handleVerifyOTP = async (taskId: bigint) => {
    const key = taskId.toString();
    const otp = otpInputs[key] ?? "";
    if (!otp) {
      toast.error("Enter OTP");
      return;
    }
    if (!backend) return;
    setVerifyingId(key);
    try {
      const res = await backend.verifyOTP(taskId, otp);
      if (res.ok) {
        toast.success("Task completed! Payment released.");
        loadData();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("OTP verification failed");
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="rounded-2xl border border-border shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Wallet className="h-4 w-4" />
              Wallet
            </div>
            <div className="text-2xl font-extrabold text-foreground">
              ₹{walletBalance}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-border shadow-card">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="text-muted-foreground text-sm mb-2">Status</div>
            <div className="flex items-center gap-3">
              <Switch
                checked={isOnline}
                onCheckedChange={handleToggleOnline}
                disabled={togglingOnline}
                data-ocid="tasker.switch"
              />
              <Label
                className={`font-bold ${isOnline ? "text-brand-green" : "text-muted-foreground"}`}
              >
                {togglingOnline ? "..." : isOnline ? "Online" : "Offline"}
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold text-foreground">Nearby Tasks</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={loading}
          data-ocid="tasker.button"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {loading ? (
        <div
          className="flex items-center justify-center py-10"
          data-ocid="tasker.loading_state"
        >
          <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
        </div>
      ) : nearbyTasks.length === 0 ? (
        <div
          className="text-center py-10 text-muted-foreground rounded-2xl border border-dashed border-border"
          data-ocid="tasker.empty_state"
        >
          <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <p>
            {isOnline
              ? "No nearby tasks right now"
              : "Go online to see nearby tasks"}
          </p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {nearbyTasks.map((task, i) => (
            <Card
              key={task.id.toString()}
              className="rounded-2xl border border-border shadow-card"
              data-ocid={`tasker.item.${i + 1}`}
            >
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-bold">
                    {task.title}
                  </CardTitle>
                  <span className="text-brand-green font-bold text-sm whitespace-nowrap">
                    ₹{Number(task.amount)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <MapPin className="h-3 w-3" />
                  {task.storeAddress || "Nearby"}
                  <span className="ml-auto font-medium">
                    {calcDistance(MY_LAT, MY_LNG, task.storeLat, task.storeLng)}{" "}
                    away
                  </span>
                </div>
                <Button
                  size="sm"
                  className="rounded-full bg-brand-green text-brand-dark font-bold hover:bg-brand-green-hover w-full"
                  onClick={() => handleAccept(task.id)}
                  disabled={acceptingId === task.id.toString()}
                  data-ocid={`tasker.primary_button.${i + 1}`}
                >
                  {acceptingId === task.id.toString() ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Accept Task"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {myTasks.length > 0 && (
        <>
          <h2 className="text-xl font-extrabold text-foreground mb-4">
            My Active Tasks
          </h2>
          <div className="space-y-3">
            {myTasks.map((task, i) => (
              <Card
                key={task.id.toString()}
                className="rounded-2xl border border-border shadow-card"
                data-ocid={`tasker.item.${nearbyTasks.length + i + 1}`}
              >
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-bold">
                      {task.title}
                    </CardTitle>
                    <Badge
                      className={`rounded-full text-xs border ${STATUS_COLORS[task.status] ?? ""}`}
                    >
                      {task.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs"
                      onClick={() => onOpenLiveTask(task.id)}
                      data-ocid={`tasker.edit_button.${i + 1}`}
                    >
                      Track
                    </Button>
                    {task.status === "accepted" && (
                      <Button
                        size="sm"
                        className="rounded-full text-xs bg-brand-green text-brand-dark hover:bg-brand-green-hover"
                        onClick={() => handleStart(task.id)}
                        disabled={startingId === task.id.toString()}
                        data-ocid={`tasker.primary_button.${nearbyTasks.length + i + 1}`}
                      >
                        {startingId === task.id.toString() ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Start Task"
                        )}
                      </Button>
                    )}
                    {task.status === "otp_pending" && (
                      <div className="flex gap-2 items-center w-full mt-1">
                        <Input
                          placeholder="Enter OTP"
                          value={otpInputs[task.id.toString()] ?? ""}
                          onChange={(e) =>
                            setOtpInputs((prev) => ({
                              ...prev,
                              [task.id.toString()]: e.target.value,
                            }))
                          }
                          className="rounded-xl h-8 text-sm flex-1"
                          maxLength={4}
                          data-ocid={`tasker.input.${i + 1}`}
                        />
                        <Button
                          size="sm"
                          className="rounded-full text-xs bg-brand-green text-brand-dark hover:bg-brand-green-hover"
                          onClick={() => handleVerifyOTP(task.id)}
                          disabled={verifyingId === task.id.toString()}
                          data-ocid={`tasker.submit_button.${i + 1}`}
                        >
                          {verifyingId === task.id.toString() ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Verify"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
