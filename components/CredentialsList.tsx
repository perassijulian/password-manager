"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, ClipboardCheck, Copy } from "lucide-react";

type Credential = {
  id: string;
  service: string;
  username: string;
  password: string;
};

export default function CredentialsList() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revealed, setRevealed] = useState<{ [key: string]: boolean }>({});
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    async function fetchCredentials() {
      try {
        const res = await fetch("/api/credentials");
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Failed to load credentials");
        setCredentials(data.credentials);
      } catch (err: any) {
        setError(err.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    }

    fetchCredentials();
  }, []);

  function toggleReveal(id: string) {
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const handleCopy = async (id: string, password: string) => {
    await navigator.clipboard.writeText(password);
    setCopied((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [id]: false })), 1500);
  };

  if (loading)
    return <p className="text-center mt-6 text-gray-600">Loading...</p>;
  if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;
  if (credentials.length === 0)
    return (
      <p className="text-center mt-6 text-gray-500">No credentials saved.</p>
    );

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-4">
      <h2 className="text-xl font-semibold mb-4">Your Credentials</h2>
      {credentials.map((cred) => (
        <div
          key={cred.id}
          className="p-4 bg-white border rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0"
        >
          <div className="flex-1 space-y-1">
            <p className="font-medium text-gray-800">{cred.service}</p>
            <p className="text-sm text-gray-600">{cred.username}</p>
            <p className="text-sm text-gray-800">
              {revealed[cred.id] ? cred.password : "••••••••"}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => toggleReveal(cred.id)}
              className="text-blue-600 hover:text-blue-800"
            >
              {revealed[cred.id] ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <button
              onClick={() => {
                handleCopy(cred.id, cred.password);
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              {copied[cred.id] ? (
                <ClipboardCheck size={20} />
              ) : (
                <Copy size={20} />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
