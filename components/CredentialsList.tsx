"use client";

import { useState } from "react";
import Toast from "./Toast";
import CredentialCard from "./CredentialCard";
import { Credential } from "@/types";
import { useDeviceId } from "@/lib/hooks/useDeviceId";

interface CredentialProps {
  credentials: Credential[];
  setCredentials: (credentials: Credential[]) => void;
  setIsModalOpen: (isOpen: boolean) => void;
}

export default function CredentialsList({
  credentials,
  setCredentials,
  setIsModalOpen,
}: CredentialProps) {
  const [revealed, setRevealed] = useState<{ [key: string]: boolean }>({});
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success" | "info";
  } | null>(null);

  const deviceId = useDeviceId();

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
      const res = await fetch(`/api/credentials/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      if (!res.ok) {
        setToast({
          message: "Failed to delete credential",
          type: "error",
        });
        console.error("Failed to delete credential:", data.error);
        return;
      }

      setCredentials(credentials.filter((cred: Credential) => cred.id !== id));
      setToast({
        message: "Credential deleted successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to delete credential:", error);
      setToast({ message: "Failed to delete credential", type: "error" });
      return;
    }
  };

  // Copy password to clipboard
  const handleCopy = async (id: string) => {
    try {
      if (!deviceId) {
        setToast({
          message: "Device not ready yet. Try again in a second.",
          type: "error",
        });
        return;
      }
      const checkRes = await fetch("/api/2fa/check-action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actionType: "copy_password",
          context: "sensitive",
          deviceId,
        }),
      });

      const checkData = await checkRes.json();

      console.log("2FA check response:", checkData);

      if (!checkRes.ok || !checkData.allowed) {
        setIsModalOpen(true); // open modal to perform 2FA
        return;
      }
      const res = await fetch(`/api/credentials/${id}/copy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({
          message: "Failed to copy password",
          type: "error",
        });
        console.error("Failed to copy password:", data.error);
        return;
      }

      const { password } = data;

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
          handleDelete={handleDelete}
          revealed={revealed}
          copied={copied}
        />
      ))}
    </div>
  );
}
