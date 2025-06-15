import { Eye, EyeOff, Copy, Check, Trash2 } from "lucide-react";

interface Credential {
  id: string;
  service: string;
  username: string;
  password: string;
}

interface CredentialCardProps {
  cred: Credential;
  handleCopy: (id: string) => void;
  toggleReveal: (id: string) => void;
  handleDelete: (id: string) => void;
  revealed: { [key: string]: boolean };
  copied: { [key: string]: boolean };
}

export default function CredentialCard({
  cred,
  handleCopy,
  toggleReveal,
  handleDelete,
  revealed,
  copied,
}: CredentialCardProps) {
  return (
    <div
      key={cred.id}
      className="p-5 bg-background-secondary border border-border rounded-2xl shadow-md transition transition-transform
      hover:shadow-lg hover:scale-[1.02]
      flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0"
    >
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-foreground text-lg font-medium">{cred.service}</p>
          <button
            onClick={() => handleDelete(cred.id)}
            className="text-red-500 hover:text-red-700 transition-colors duration-150 dark:text-red-400 dark:hover:text-red-500"
            aria-label={`Delete ${cred.service}`}
          >
            <Trash2 size={20} />
          </button>
        </div>
        <p className="text-foreground-secondary text-sm">{cred.username}</p>
        <div className="flex items-center justify-between">
          <p className="text-foreground text-md tracking-wider">
            {revealed[cred.id] ? cred.password : "••••••••"}
          </p>
          <div className="flex gap-3 items-center justify-end">
            <button
              onClick={() => toggleReveal(cred.id)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500 transition-colors duration-150"
            >
              {revealed[cred.id] ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <button
              onClick={() => {
                handleCopy(cred.id);
              }}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500 transition-colors duration-150"
            >
              {copied[cred.id] ? (
                <Check size={20} className="text-green-600" />
              ) : (
                <Copy size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
