"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, ClipboardCheck, Copy, Trash2, Check } from "lucide-react";

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

  // Copy password to clipboard
  const handleCopy = async (id: string) => {
    try {
      // TODO Reauthenticate user before copying
      const res = await fetch(`/api/credentials/${id}/copy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      const { password } = await res.json();
      await navigator.clipboard.writeText(password);
      setCopied((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => setCopied((prev) => ({ ...prev, [id]: false })), 1000);
    } catch (error) {
      console.error("Failed to copy password:", error);
      return;
    }
  };

  if (loading)
    return <p className="text-center mt-6 text-gray-600">Loading...</p>;
  if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;
  if (credentials.length === 0)
    return (
      <p className="text-center mt-6 text-gray-500">No credentials saved.</p>
    );

  return (
    <div className="max-w-3xl mx-auto mt-2 space-y-4">
      <h2 className="text-xl font-semibold mb-4">Your Credentials</h2>
      {credentials.map((cred) => (
        <div
          key={cred.id}
          className="p-5 bg-white border border-gray-200 rounded-2xl shadow-md transition hover:shadow-lg flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0"
        >
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-lg font-medium text-gray-900">
                {cred.service}
              </p>
              <Trash2 className="text-red-500 hover:text-red-700" size={20} />
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
      ))}
    </div>
  );
}
