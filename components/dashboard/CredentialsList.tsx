"use client";

import { useState } from "react";
import CredentialCard from "./CredentialCard";
import { Credential } from "@/types";
import { secureFetch } from "@/lib/security/secureFetch";
import { useDeviceId } from "@/lib/hooks/useDeviceId";
import { useToast } from "@/contexts/ToastContext";
import { ToastMessages } from "@/lib/toastMessages";

interface CredentialProps {
  credentials: Credential[];
  setCredentials: (credentials: Credential[]) => void;
  handleCopy: (id: string) => void;
  copied: { [key: string]: boolean };
}

export default function CredentialsList({
  credentials,
  setCredentials,
  handleCopy,
  copied,
}: CredentialProps) {
  const [revealed, setRevealed] = useState<{ [key: string]: boolean }>({});
  const deviceId = useDeviceId();
  const { showToast } = useToast();

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

  // Delete credential
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this credential?")) return;
    try {
      const res = await secureFetch(
        `/api/credentials/${id}`,
        {
          method: "DELETE",
        },
        deviceId
      );

      const data = await res.json();

      if (!res.ok) {
        showToast(ToastMessages.credentials.delete.error, "error");
        console.error("Failed to delete credential:", data.error);
        return;
      }

      setCredentials(credentials.filter((cred: Credential) => cred.id !== id));
      showToast(ToastMessages.credentials.delete.success, "success");
    } catch (error) {
      console.error("Failed to delete credential:", error);
      showToast(ToastMessages.server.generic, "error");
      return;
    }
  };

  if (credentials.length === 0)
    return (
      <p className="text-center mt-6 text-gray-500">No credentials saved.</p>
    );

  return (
    <div className="max-w-3xl mx-auto mt-2 space-y-4">
      <h2 className="text-foreground text-xl font-semibold mb-4">
        Your Credentials
      </h2>
      {credentials.map((cred) => (
        <CredentialCard
          key={cred.id}
          cred={cred}
          handleCopy={handleCopy}
          toggleReveal={toggleReveal}
          handleDelete={handleDelete}
          revealed={revealed}
          copied={copied}
        />
      ))}
    </div>
  );
}
