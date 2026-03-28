export type View =
  | "landing"
  | "login"
  | "customer-dashboard"
  | "tasker-dashboard"
  | "live-task"
  | "wallet"
  | "payment-success"
  | "payment-failure";

export interface AppUser {
  name: string;
  phone: string;
  email: string;
  role: "customer" | "tasker";
  walletBalance: number;
}
