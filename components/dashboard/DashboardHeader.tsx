import { DoorOpen } from "lucide-react";
import ThemeToggleButton from "@/components/ThemeToggleButton";

interface DashboardHeaderProps {
  handleLogout: () => void;
}

export default function DashboardHeader({
  handleLogout,
}: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-foreground text-xl font-bold">Dashboard</h1>
      <div className="flex items-center gap-2">
        <ThemeToggleButton />
        <button
          onClick={handleLogout}
          className="p-2 rounded-full transition text-red-500 hover:text-red-700"
          title="Log Out"
        >
          <DoorOpen size={20} />
        </button>
      </div>
    </div>
  );
}
