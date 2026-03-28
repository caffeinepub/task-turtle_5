import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

interface PaymentFailureProps {
  onGoToWallet: () => void;
}

export default function PaymentFailure({ onGoToWallet }: PaymentFailureProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "backOut" }}
        className="max-w-sm w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.15,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
          className="w-24 h-24 rounded-full bg-red-950/50 border-4 border-red-600 flex items-center justify-center mx-auto mb-6"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-12 h-12"
            aria-hidden="true"
          >
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        <h1 className="text-3xl font-extrabold text-white mb-2">
          Payment Cancelled
        </h1>
        <p className="text-white/60 mb-8">
          Your wallet was not charged. You can try again anytime.
        </p>

        <Button
          onClick={onGoToWallet}
          className="w-full rounded-full bg-brand-green text-brand-dark font-bold hover:bg-brand-green-hover py-6 text-lg"
          data-ocid="payment_failure.primary_button"
        >
          Try Again
        </Button>
      </motion.div>
    </main>
  );
}
