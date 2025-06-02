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
      className="flex items-center justify-center gap-2 w-full max-w-md mx-auto bg-blue-500 text-white px-6 pt-2 pb-4 rounded-t-2xl hover:bg-blue-700 transition"
    >
      {isOpen ? <EyeOff size={18} /> : <Plus size={18} />}
      {isOpen ? "Close Form" : "Add New Credential"}
    </button>
  );
}
