import { Button } from "@/components/ui/button";
import { ListTodo, LogOut, Search, Turtle, Wallet } from "lucide-react";
import type { AppUser, View } from "../types/app";

interface AppNavbarProps {
  user: AppUser;
  onNavigate: (v: View) => void;
  onLogout: () => void;
}

export default function AppNavbar({
  user,
  onNavigate,
  onLogout,
}: AppNavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full bg-brand-dark border-b border-white/10 shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 text-white font-bold text-lg"
          onClick={() =>
            onNavigate(
              user.role === "customer"
                ? "customer-dashboard"
                : "tasker-dashboard",
            )
          }
          data-ocid="nav.link"
        >
          <Turtle className="h-6 w-6 text-brand-green" />
          <span className="hidden sm:inline">Task Turtle</span>
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          {user.role === "customer" ? (
            <Button
              size="sm"
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => onNavigate("customer-dashboard")}
              data-ocid="nav.link"
            >
              <ListTodo className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">My Tasks</span>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => onNavigate("tasker-dashboard")}
              data-ocid="nav.link"
            >
              <Search className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Browse Tasks</span>
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => onNavigate("wallet")}
            data-ocid="nav.link"
          >
            <Wallet className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Wallet</span>
          </Button>
          <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-white/20">
            <span className="text-white/70 text-sm">{user.name}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-white/60 hover:text-red-400 hover:bg-white/10"
            onClick={onLogout}
            data-ocid="nav.button"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
