import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Key, Loader2, MapPin, Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Task } from "../backend.d";
import { useBackend } from "../hooks/useBackend";
import type { AppUser } from "../types/app";

interface CustomerDashboardProps {
  user: AppUser;
  onOpenLiveTask: (taskId: bigint) => void;
  onGoToTaskerHub: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  posted: "bg-yellow-400/20 text-yellow-600 border-yellow-400/30",
  accepted: "bg-blue-400/20 text-blue-600 border-blue-400/30",
  inprogress: "bg-purple-400/20 text-purple-600 border-purple-400/30",
  otp_pending: "bg-orange-400/20 text-orange-600 border-orange-400/30",
  completed: "bg-brand-mint text-green-700 border-green-400/30",
  cancelled: "bg-red-400/20 text-red-600 border-red-400/30",
};

const MY_LAT = 28.6139;
const MY_LNG = 77.209;

export default function CustomerDashboard({
  onOpenLiveTask,
  onGoToTaskerHub,
}: CustomerDashboardProps) {
  const { backend } = useBackend();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [otpMap, setOtpMap] = useState<Record<string, string>>({});
  const [generatingOtp, setGeneratingOtp] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    amount: "",
    tip: "",
    storeAddress: "",
    storeLat: "28.6129",
    storeLng: "77.2295",
    customerLat: "28.6139",
    customerLng: "77.209",
  });

  const loadTasks = useCallback(async () => {
    if (!backend) return;
    setLoading(true);
    try {
      const data = await backend.getMyTasksAsCustomer();
      setTasks(data);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [backend]);

  const loadAvailableTasks = useCallback(async () => {
    if (!backend) return;
    setLoadingAvailable(true);
    try {
      const data = await backend.getNearbyTasks(MY_LAT, MY_LNG, 20.0);
      setAvailableTasks(data.filter((t) => t.status === "posted"));
    } catch {
      toast.error("Failed to load available tasks");
    } finally {
      setLoadingAvailable(false);
    }
  }, [backend]);

  useEffect(() => {
    loadTasks();
    loadAvailableTasks();
  }, [loadTasks, loadAvailableTasks]);

  const handlePost = async () => {
    if (!form.title || !form.amount) {
      toast.error("Title and amount are required");
      return;
    }
    if (!backend) return;
    setPosting(true);
    try {
      await backend.postTask(
        form.title,
        form.description,
        BigInt(Math.round(Number(form.amount))),
        BigInt(Math.round(Number(form.tip) || 0)),
        form.storeAddress || "Nearby Store",
        Number.parseFloat(form.storeLat),
        Number.parseFloat(form.storeLng),
        Number.parseFloat(form.customerLat),
        Number.parseFloat(form.customerLng),
      );
      toast.success("Task posted! Looking for a tasker nearby...");
      setDialogOpen(false);
      setForm({
        title: "",
        description: "",
        amount: "",
        tip: "",
        storeAddress: "",
        storeLat: "28.6129",
        storeLng: "77.2295",
        customerLat: "28.6139",
        customerLng: "77.209",
      });
      loadTasks();
      loadAvailableTasks();
    } catch {
      toast.error("Failed to post task");
    } finally {
      setPosting(false);
    }
  };

  const handleGenerateOTP = async (taskId: bigint) => {
    const key = taskId.toString();
    if (!backend) return;
    setGeneratingOtp(key);
    try {
      const res = await backend.generateOTP(taskId);
      if (res.ok) {
        setOtpMap((prev) => ({ ...prev, [key]: res.otp }));
        toast.success(`OTP: ${res.otp}`);
      } else {
        toast.error("Failed to generate OTP");
      }
    } catch {
      toast.error("Error generating OTP");
    } finally {
      setGeneratingOtp(null);
    }
  };

  const handleAcceptAndEarn = async (taskId: bigint) => {
    const key = taskId.toString();
    if (!backend) return;
    setAcceptingId(key);
    try {
      const res = await backend.acceptTask(taskId);
      if (res.ok) {
        toast.success("Task accepted! Redirecting to Tasker Hub...");
        onGoToTaskerHub();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to accept task");
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Dashboard</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadTasks();
              loadAvailableTasks();
            }}
            disabled={loading || loadingAvailable}
            data-ocid="customer.button"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading || loadingAvailable ? "animate-spin" : ""}`}
            />
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="rounded-full bg-brand-green text-brand-dark font-bold hover:bg-brand-green-hover"
                data-ocid="customer.primary_button"
              >
                <Plus className="h-4 w-4 mr-1" /> Post a Task
              </Button>
            </DialogTrigger>
            <DialogContent
              className="rounded-3xl max-w-md"
              data-ocid="customer.dialog"
            >
              <DialogHeader>
                <DialogTitle className="text-xl font-extrabold">
                  Post a New Task
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                <div>
                  <Label className="text-sm mb-1 block">Task Title *</Label>
                  <Input
                    placeholder="Bring 1kg bananas from Big Bazaar"
                    value={form.title}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, title: e.target.value }))
                    }
                    className="rounded-xl"
                    data-ocid="customer.input"
                  />
                </div>
                <div>
                  <Label className="text-sm mb-1 block">Description</Label>
                  <Textarea
                    placeholder="Any specific details..."
                    value={form.description}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, description: e.target.value }))
                    }
                    className="rounded-xl resize-none"
                    rows={2}
                    data-ocid="customer.textarea"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm mb-1 block">Amount (₹) *</Label>
                    <Input
                      type="number"
                      placeholder="150"
                      value={form.amount}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, amount: e.target.value }))
                      }
                      className="rounded-xl"
                      data-ocid="customer.input"
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-1 block">Tip (₹)</Label>
                    <Input
                      type="number"
                      placeholder="20"
                      value={form.tip}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, tip: e.target.value }))
                      }
                      className="rounded-xl"
                      data-ocid="customer.input"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm mb-1 block">Store Address</Label>
                  <Input
                    placeholder="Big Bazaar, Connaught Place"
                    value={form.storeAddress}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, storeAddress: e.target.value }))
                    }
                    className="rounded-xl"
                    data-ocid="customer.input"
                  />
                </div>
                <Button
                  className="w-full rounded-full bg-brand-green text-brand-dark font-bold hover:bg-brand-green-hover"
                  onClick={handlePost}
                  disabled={posting}
                  data-ocid="customer.submit_button"
                >
                  {posting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Post Task"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="my-tasks">
        <TabsList className="w-full rounded-2xl mb-5 bg-muted">
          <TabsTrigger
            value="my-tasks"
            className="flex-1 rounded-xl text-sm font-semibold"
            data-ocid="customer.tab.1"
          >
            My Tasks
          </TabsTrigger>
          <TabsTrigger
            value="find-tasks"
            className="flex-1 rounded-xl text-sm font-semibold relative"
            data-ocid="customer.tab.2"
          >
            Find Tasks
            {availableTasks.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-brand-green text-brand-dark text-xs font-bold">
                {availableTasks.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* My Tasks Tab */}
        <TabsContent value="my-tasks">
          {loading ? (
            <div
              className="flex items-center justify-center py-16"
              data-ocid="customer.loading_state"
            >
              <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
            </div>
          ) : tasks.length === 0 ? (
            <div
              className="text-center py-16 text-muted-foreground"
              data-ocid="customer.empty_state"
            >
              <div className="text-5xl mb-4">🐢</div>
              <p className="font-semibold">No tasks yet</p>
              <p className="text-sm mt-1">
                Post your first task and a nearby tasker will handle it!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task, i) => (
                <Card
                  key={task.id.toString()}
                  className="rounded-2xl border border-border shadow-card"
                  data-ocid={`customer.item.${i + 1}`}
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
                    {task.description && (
                      <p className="text-muted-foreground text-sm mb-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-bold text-foreground">
                        ₹{Number(task.amount)}
                      </span>
                      {Number(task.tip) > 0 && (
                        <span className="text-muted-foreground">
                          +₹{Number(task.tip)} tip
                        </span>
                      )}
                      <span className="text-muted-foreground text-xs ml-auto">
                        {task.storeAddress}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs"
                        onClick={() => onOpenLiveTask(task.id)}
                        data-ocid={`customer.edit_button.${i + 1}`}
                      >
                        Track Task
                      </Button>
                      {task.status === "inprogress" && (
                        <Button
                          size="sm"
                          className="rounded-full text-xs bg-brand-green text-brand-dark hover:bg-brand-green-hover"
                          onClick={() => handleGenerateOTP(task.id)}
                          disabled={generatingOtp === task.id.toString()}
                          data-ocid={`customer.primary_button.${i + 1}`}
                        >
                          {generatingOtp === task.id.toString() ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <Key className="h-3 w-3 mr-1" /> Generate OTP
                            </>
                          )}
                        </Button>
                      )}
                      {otpMap[task.id.toString()] && (
                        <div className="flex items-center gap-1 bg-brand-mint border border-green-300 rounded-full px-3 py-1">
                          <span className="text-green-700 font-bold text-sm tracking-widest">
                            OTP: {otpMap[task.id.toString()]}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Find Tasks Tab */}
        <TabsContent value="find-tasks">
          {loadingAvailable ? (
            <div
              className="flex items-center justify-center py-16"
              data-ocid="customer.find_loading"
            >
              <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
            </div>
          ) : availableTasks.length === 0 ? (
            <div
              className="text-center py-16 text-muted-foreground"
              data-ocid="customer.find_empty"
            >
              <MapPin className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="font-semibold">No tasks available nearby</p>
              <p className="text-sm mt-1">
                Check back soon — new tasks appear all the time!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableTasks.map((task, i) => (
                <Card
                  key={task.id.toString()}
                  className="rounded-2xl border border-border shadow-card"
                  data-ocid={`customer.find_item.${i + 1}`}
                >
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-bold">
                        {task.title}
                      </CardTitle>
                      <span className="text-brand-green font-extrabold text-sm whitespace-nowrap">
                        ₹{Number(task.amount)}
                        {Number(task.tip) > 0 && (
                          <span className="text-muted-foreground font-normal text-xs ml-1">
                            +₹{Number(task.tip)} tip
                          </span>
                        )}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    {task.description && (
                      <p className="text-muted-foreground text-sm mb-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-start gap-2 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-orange-400" />
                        <span className="font-medium">Pick:</span>
                        <span>{task.storeAddress || "Nearby Store"}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-brand-green" />
                        <span className="font-medium">Deliver:</span>
                        <span>
                          {task.customerLat.toFixed(4)},{" "}
                          {task.customerLng.toFixed(4)}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="rounded-full bg-brand-green text-brand-dark font-bold hover:bg-brand-green-hover w-full"
                      onClick={() => handleAcceptAndEarn(task.id)}
                      disabled={acceptingId === task.id.toString()}
                      data-ocid={`customer.find_accept.${i + 1}`}
                    >
                      {acceptingId === task.id.toString() ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Accept & Earn"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
