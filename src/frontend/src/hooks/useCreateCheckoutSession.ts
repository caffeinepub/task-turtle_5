import { useMutation } from "@tanstack/react-query";
import { useActor } from "./useActor";

export interface CheckoutSession {
  id: string;
  url: string;
}

type ShoppingItem = {
  name: string;
  amount: number;
  quantity: number;
  currency: string;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation<CheckoutSession, Error, number>({
    mutationFn: async (amount: number) => {
      if (!actor) throw new Error("Not connected");

      const items: ShoppingItem[] = [
        {
          name: `Wallet Top-up ₹${amount}`,
          amount: amount * 100,
          quantity: 1,
          currency: "inr",
        },
      ];

      const successUrl = `${window.location.protocol}//${window.location.host}/?payment=success&amount=${amount}`;
      const cancelUrl = `${window.location.protocol}//${window.location.host}/?payment=cancelled`;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = await (actor as any).createCheckoutSession(
        items,
        successUrl,
        cancelUrl,
      );
      const session = typeof raw === "string" ? JSON.parse(raw) : raw;

      if (!session?.url) throw new Error("Invalid checkout session");
      return session as CheckoutSession;
    },
  });
}
