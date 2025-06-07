import { DoorOpen, Moon, Sun } from "lucide-react";
import Toast from "@/components/Toast";
import { ToastProps } from "@/types";

interface DashboardHeaderProps {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  toast: ToastProps | null;
  setToast: (toast: ToastProps | null) => void;
  handleLogout: () => void;
}

export default function DashboardHeader({
  darkMode,
  setDarkMode,
  toast,
  setToast,
  handleLogout,
}: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-xl font-bold">Dashboard</h1>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setDarkMode((prev: boolean) => !prev)}
          className="p-2 rounded-full transition"
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
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
