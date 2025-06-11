import { EyeOff, Plus } from "lucide-react";

export default function CredentialToggleButton({
  onClick,
  isOpen,
}: {
  onClick?: () => void;
  isOpen?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-background-terciary border border-border text-primary-foreground hover:brightness-95 flex items-center justify-center gap-2 w-full max-w-md mx-auto px-6 pt-2 pb-4 rounded-t-2xl transition"
    >
      {isOpen ? <EyeOff size={18} /> : <Plus size={18} />}
      {isOpen ? "Close Form" : "Add New Credential"}
    </button>
  );
}
