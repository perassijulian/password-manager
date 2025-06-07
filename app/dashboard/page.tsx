"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CredentialDrawer from "@/components/CredentialDrawer";
import CredentialsList from "@/components/CredentialsList";
import Modal from "@/components/Modal";
import TwoFAVerification from "@/components/TwoFAVerification";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDeviceId } from "@/lib/hooks/useDeviceId";
import safeClipboardWrite from "@/utils/safeClipboardWrite";
import DashboardHeader from "@/components/DashboardHeader";
import { ToastProps } from "@/types";
import { Credential } from "@/types";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const formSchema = z.object({
    code: z
      .string()
      .length(6, "Code must be 6 digits")
      .regex(/^\d+$/, "Only numbers allowed"),
  });
  type FormData = z.infer<typeof formSchema>;
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(formSchema) });
  const [pendingAction, setPendingAction] = useState<null | {
    type: "copy_password";
    credentialId: string;
  }>(null);
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const deviceId = useDeviceId();

  useEffect(() => {
    async function fetchCredentials() {
      try {
        const res = await fetch("/api/credentials");
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Failed to load credentials");
        setCredentials(data.credentials);
      } catch (err: any) {
        setToast({
          message: err.message || "Failed to load credentials",
          type: "error",
        });
        console.error("Error fetching credentials:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCredentials();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/me");
      if (res.ok) {
        const data = await res.json();
        setUserId(data.userId);
      } else {
        router.push("/login");
      }
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
      });
      if (res.ok) {
        router.push("/login");
      } else {
        setToast({ message: "Logout failed", type: "error" });
      }
    } catch (error) {
      setToast({
        message: "An unexpected error occurred. Please try again later.",
        type: "error",
      });
    }
  };

  const handleCopy = async (id: string) => {
    try {
      if (!deviceId) {
        setToast({
          message: "Device not ready yet. Try again in a second.",
          type: "error",
        });
        return;
      }
      const res = await fetch(`/api/credentials/${id}/copy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-id": deviceId,
        },
      });
      const data = await res.json();

      if (res.status === 401 && data.error === "2FA required") {
        setPendingAction({
          type: "copy_password",
          credentialId: id,
        });
        setIsModalOpen(true); // open modal to perform 2FA
        return;
      }
      if (!res.ok) {
        setToast({
          message: "Failed to copy password",
          type: "error",
        });
        console.error("Failed to copy password:", data.error);
        return;
      }

      const { password } = data;

      const result = await safeClipboardWrite(password);
      if (result === "unsupported") {
        setToast({ message: "Clipboard not supported", type: "error" });
        return;
      }
      if (result === "error") {
        setToast({ message: "Failed to copy password", type: "error" });
        return;
      }
      // If we reach here, the password was successfully copied
      // Update copied state to show success
      setCopied((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => setCopied((prev) => ({ ...prev, [id]: false })), 1000);
      setToast({
        message: "Password copied to clipboard!",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to copy password:", error);
      setToast({ message: "Failed to copy password", type: "error" });
      return;
    }
  };

  const onSubmit = async (data: FormData) => {
    setToast(null);
    setIsVerifying(true);
    try {
      const res = await fetch("/api/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: data.code,
          deviceId,
          actionType: "copy_password",
          context: "sensitive",
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setToast({
          message: "Verification failed",
          type: "error",
        });
        console.error("2FA verification error:", result.error);
        return;
      }

      handle2FASuccess();
      setIsModalOpen(false);
      reset();
    } catch (error: any) {
      setToast({ message: "2FA verification error", type: "error" });
      console.error("2FA verification error:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handle2FASuccess = async () => {
    try {
      if (!pendingAction || !deviceId) return;

      if (pendingAction.type === "copy_password") {
        const res = await fetch(
          `/api/credentials/${pendingAction.credentialId}/copy`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-device-id": deviceId,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setToast({ message: "Copy failed after 2FA", type: "error" });
          return;
        }

        const { password } = data;

        const result = await safeClipboardWrite(password);
        if (result === "unsupported") {
          setToast({ message: "Clipboard not supported", type: "error" });
          return;
        }
        if (result === "error") {
          setToast({ message: "Failed to copy password", type: "error" });
          return;
        }
        // If we reach here, the password was successfully copied
        // Update copied state to show success
        setCopied((prev) => ({ ...prev, [pendingAction.credentialId]: true }));
        setTimeout(
          () =>
            setCopied((prev) => ({
              ...prev,
              [pendingAction.credentialId]: false,
            })),
          1000
        );
        setToast({
          message: "Password copied to clipboard!",
          type: "success",
        });
        setPendingAction(null);
      }
    } catch (error) {
      console.error("Error handling 2FA success:", error);
      setToast({ message: "Failed to handle 2FA success", type: "error" });
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="relative min-h-screen bg-gray-50 p-4 pb-28 w-full">
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <TwoFAVerification
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          register={register}
          errors={errors}
          toast={toast}
          setToast={setToast}
          isLoading={isVerifying}
        />
      </Modal>
      <DashboardHeader
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        toast={toast}
        setToast={setToast}
        handleLogout={handleLogout}
      />
      <CredentialsList
        credentials={credentials}
        setCredentials={setCredentials}
        handleCopy={handleCopy}
        copied={copied}
      />
      <CredentialDrawer setCredentials={setCredentials} />
    </div>
  );
}
