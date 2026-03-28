export type View =
  | "landing"
  | "login"
  | "customer-dashboard"
  | "tasker-dashboard"
  | "live-task"
  | "wallet";

export interface AppUser {
  name: string;
  phone: string;
  email: string;
  role: "customer" | "tasker";
  walletBalance: number;
}
