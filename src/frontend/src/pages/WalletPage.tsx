import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Info, Loader2, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Payment } from "../backend.d";
import { useBackend } from "../hooks/useBackend";
import type { AppUser } from "../types/app";

interface WalletPageProps {
  user: AppUser;
  onUpdateBalance: (bal: number) => void;
}

export default function WalletPage({ onUpdateBalance }: WalletPageProps) {
  const { backend } = useBackend();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<Payment[]>([]);
  const [loadingBal, setLoadingBal] = useState(false);
  const [loadingHist, setLoadingHist] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [adding, setAdding] = useState(false);

  const loadData = useCallback(async () => {
    if (!backend) return;
    setLoadingBal(true);
    setLoadingHist(true);
    try {
      const [bal, hist] = await Promise.all([
        backend.getWalletBalance(),
        backend.getEarningsHistory(),
      ]);
      setBalance(Number(bal));
      setHistory(hist);
      onUpdateBalance(Number(bal));
    } catch {
      toast.error("Failed to load wallet data");
    } finally {
      setLoadingBal(false);
      setLoadingHist(false);
    }
  }, [backend, onUpdateBalance]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddMoney = async () => {
    if (!addAmount || Number(addAmount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!backend) return;
    setAdding(true);
    try {
      const newBal = await backend.addToWallet(
        BigInt(Math.round(Number(addAmount))),
      );
      setBalance(Number(newBal));
      onUpdateBalance(Number(newBal));
      toast.success(`₹${addAmount} added to wallet!`);
      setAddAmount("");
      loadData();
    } catch {
      toast.error("Failed to add money");
    } finally {
      setAdding(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-extrabold text-foreground mb-6">Wallet</h1>

      <Card
        className="rounded-3xl border-0 shadow-card mb-6 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0F3A22 0%, #0B0F0C 100%)",
        }}
      >
        <CardContent className="p-8 text-center">
          <p className="text-white/60 text-sm mb-1">Available Balance</p>
          {loadingBal ? (
            <Loader2
              className="h-8 w-8 animate-spin text-brand-green mx-auto my-2"
              data-ocid="wallet.loading_state"
            />
          ) : (
            <p className="text-5xl font-extrabold text-white">₹{balance}</p>
          )}
          <p className="text-white/40 text-xs mt-2">Escrow protected</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border shadow-card mb-6">
        <CardHeader>
          <CardTitle className="text-base font-bold">Add Money</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-sm mb-1 block">Amount (₹)</Label>
              <Input
                type="number"
                placeholder="500"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="rounded-xl"
                data-ocid="wallet.input"
              />
            </div>
            <div className="flex items-end">
              <Button
                className="rounded-full bg-brand-green text-brand-dark font-bold hover:bg-brand-green-hover"
                onClick={handleAddMoney}
                disabled={adding}
                data-ocid="wallet.primary_button"
              >
                {adding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {[100, 200, 500, 1000].map((amt) => (
              <button
                key={amt}
                type="button"
                className="rounded-full bg-muted text-muted-foreground text-xs px-3 py-1 hover:bg-accent transition-colors"
                onClick={() => setAddAmount(amt.toString())}
                data-ocid="wallet.button"
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 bg-brand-mint/40 border border-green-200 rounded-2xl p-4 mb-6">
        <Info className="h-4 w-4 text-green-700 flex-shrink-0 mt-0.5" />
        <p className="text-green-800 text-sm">
          <strong>Platform fee:</strong> We charge ₹3–₹5 per task. This helps us
          maintain fast, secure delivery across your city.
        </p>
      </div>

      <Card className="rounded-2xl border border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-bold">
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingHist ? (
            <div
              className="flex items-center justify-center py-10"
              data-ocid="wallet.loading_state"
            >
              <Loader2 className="h-6 w-6 animate-spin text-brand-green" />
            </div>
          ) : history.length === 0 ? (
            <div
              className="text-center py-10 text-muted-foreground"
              data-ocid="wallet.empty_state"
            >
              No transactions yet
            </div>
          ) : (
            <Table data-ocid="wallet.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Platform Fee</TableHead>
                  <TableHead>You Earn</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((p, i) => (
                  <TableRow
                    key={p.taskId.toString()}
                    data-ocid={`wallet.row.${i + 1}`}
                  >
                    <TableCell className="text-sm">
                      #{p.taskId.toString()}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      ₹{Number(p.amount)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      ₹{Number(p.platformFee)}
                    </TableCell>
                    <TableCell className="text-sm font-bold text-brand-forest">
                      ₹{Number(p.taskerEarning)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`rounded-full text-xs ${
                          p.released
                            ? "bg-brand-mint text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {p.released ? "Released" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
