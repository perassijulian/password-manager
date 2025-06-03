"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Copy, Trash2, Check } from "lucide-react";
import Toast from "./Toast";
import CredentialCard from "./CredentialCard";

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
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success" | "info";
  } | null>(null);

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
    setRevealed((prev) => {
      const isRevealed = prev[id] || false;
      if (isRevealed) {
        return { ...prev, [id]: false };
      }

      setTimeout(() => {
        setRevealed((prev) => ({ ...prev, [id]: false }));
      }, 2000);
      return { ...prev, [id]: true };
    });
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
        setToast({
          message: "Failed to copy password",
          type: "error",
        });
        console.error("Failed to copy password:", data.error);
        return;
      }

      const { password } = await res.json();

      if (!navigator.clipboard) {
        setToast({ message: "Clipboard not supported", type: "error" });
        return;
      }

      try {
        await navigator.clipboard.writeText(password);
        setCopied((prev) => ({ ...prev, [id]: true }));
        setTimeout(() => setCopied((prev) => ({ ...prev, [id]: false })), 1000);
        setToast({
          message: "Password copied to clipboard!",
          type: "success",
        });
      } catch (error) {
        console.error("Failed to write to clipboard:", error);
        setToast({ message: "Failed to copy password", type: "error" });
        return;
      }
    } catch (error) {
      console.error("Failed to copy password:", error);
      setToast({ message: "Failed to copy password", type: "error" });
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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <h2 className="text-xl font-semibold mb-4">Your Credentials</h2>
      {credentials.map((cred) => (
        <CredentialCard
          key={cred.id}
          cred={cred}
          handleCopy={handleCopy}
          toggleReveal={toggleReveal}
          revealed={revealed}
          copied={copied}
        />
      ))}
    </div>
  );
}
