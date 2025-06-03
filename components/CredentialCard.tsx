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
      className="p-5 bg-white border border-gray-200 rounded-2xl shadow-md transition hover:shadow-lg flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0"
    >
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-lg font-medium text-gray-900">{cred.service}</p>
          <button
            onClick={() => handleDelete(cred.id)}
            className="text-red-500 hover:text-red-700"
            aria-label={`Delete ${cred.service}`}
          >
            <Trash2 size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-500">{cred.username}</p>
        <div className="flex items-center justify-between">
          <p className="text-md text-gray-800 tracking-wider">
            {revealed[cred.id] ? cred.password : "••••••••"}
          </p>
          <div className="flex gap-3 items-center justify-end">
            <button
              onClick={() => toggleReveal(cred.id)}
              className="text-blue-600 hover:text-blue-800"
            >
              {revealed[cred.id] ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <button
              onClick={() => {
                handleCopy(cred.id);
              }}
              className="text-blue-600 hover:text-blue-800"
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
