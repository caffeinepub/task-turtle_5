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
import { Textarea } from "@/components/ui/textarea";
import { Key, Loader2, Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Task } from "../backend.d";
import { useBackend } from "../hooks/useBackend";
import type { AppUser } from "../types/app";

interface CustomerDashboardProps {
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

export default function CustomerDashboard({
  onOpenLiveTask,
}: CustomerDashboardProps) {
  const { backend } = useBackend();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [otpMap, setOtpMap] = useState<Record<string, string>>({});
  const [generatingOtp, setGeneratingOtp] = useState<string | null>(null);

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

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

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

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">My Tasks</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadTasks}
            disabled={loading}
            data-ocid="customer.button"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
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
    </main>
  );
}
