import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

export default function StripeSetup() {
  const { actor, isFetching } = useActor();
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [secretKey, setSecretKey] = useState("");
  const [countries, setCountries] = useState("IN");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!actor || isFetching) return;
    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (actor as any).isStripeConfigured();
        setConfigured(Boolean(result));
      } catch {
        setConfigured(false);
      }
    })();
  }, [actor, isFetching]);

  const handleSave = async () => {
    if (!secretKey.trim()) {
      toast.error("Enter a Stripe secret key");
      return;
    }
    if (!actor) return;
    setSaving(true);
    try {
      const allowedCountries = countries
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any).setStripeConfiguration({
        secretKey: secretKey.trim(),
        allowedCountries,
      });
      setConfigured(true);
      setOpen(false);
      toast.success("Stripe configured!");
    } catch {
      toast.error("Failed to configure Stripe");
    } finally {
      setSaving(false);
    }
  };

  if (configured === null) return null;

  if (configured) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <Badge className="bg-green-900/60 text-green-300 border border-green-700 rounded-full px-3 py-1 text-xs flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Stripe payments active
        </Badge>
      </div>
    );
  }

  return (
    <div className="mb-5 rounded-2xl border border-yellow-700/40 bg-yellow-950/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-yellow-400" />
          <span className="text-yellow-300 text-sm font-semibold">
            Stripe not configured
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-xs text-yellow-400 underline hover:no-underline"
        >
          {open ? "Hide" : "Configure"}
        </button>
      </div>
      {open && (
        <div className="space-y-3">
          <div>
            <Label className="text-yellow-200 text-xs mb-1 block">
              Stripe Secret Key
            </Label>
            <Input
              type="password"
              placeholder="sk_live_..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="rounded-xl bg-black/40 border-yellow-700/50 text-white placeholder:text-white/30 text-sm"
              data-ocid="stripe.input"
            />
          </div>
          <div>
            <Label className="text-yellow-200 text-xs mb-1 block">
              Allowed Countries (comma-separated)
            </Label>
            <Input
              placeholder="IN, US, GB"
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
              className="rounded-xl bg-black/40 border-yellow-700/50 text-white placeholder:text-white/30 text-sm"
              data-ocid="stripe.input"
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-yellow-500 text-black font-bold hover:bg-yellow-400 text-sm"
            data-ocid="stripe.submit_button"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Save Configuration
          </Button>
        </div>
      )}
    </div>
  );
}
