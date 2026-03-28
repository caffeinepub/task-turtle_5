import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend.d";
import { useBackend } from "../hooks/useBackend";

interface PaymentSuccessProps {
  amount: number;
  onGoToWallet: () => void;
}

export default function PaymentSuccess({
  amount,
  onGoToWallet,
}: PaymentSuccessProps) {
  const { backend } = useBackend();
  const [credited, setCredited] = useState(false);

  useEffect(() => {
    if (!backend || credited || !amount) return;
    (async () => {
      try {
        await (backend as backendInterface).addToWallet(BigInt(amount));
        setCredited(true);
      } catch {
        toast.error("Could not credit wallet, please contact support");
      }
    })();
  }, [backend, amount, credited]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
        className="max-w-sm w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
          className="w-24 h-24 rounded-full bg-green-900/50 border-4 border-brand-green flex items-center justify-center mx-auto mb-6"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-12 h-12"
            aria-hidden="true"
          >
            <path
              d="M5 13l4 4L19 7"
              stroke="#22c55e"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        <h1 className="text-3xl font-extrabold text-white mb-2">
          Payment Successful!
        </h1>
        {amount > 0 && (
          <p className="text-5xl font-extrabold text-brand-green my-4">
            ₹{amount}
          </p>
        )}
        <p className="text-white/60 mb-8">
          Your wallet has been topped up successfully.
        </p>

        <Button
          onClick={onGoToWallet}
          className="w-full rounded-full bg-brand-green text-brand-dark font-bold hover:bg-brand-green-hover py-6 text-lg"
          data-ocid="payment_success.primary_button"
        >
          Back to Wallet
        </Button>
      </motion.div>
    </main>
  );
}
