"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CredentialDrawer from "@/components/dashboard/CredentialDrawer";
import CredentialsList from "@/components/dashboard/CredentialsList";
import Modal from "@/components/UI/Modal";
import TwoFAVerification from "@/components/TwoFAVerification";
import { useDeviceId } from "@/lib/hooks/useDeviceId";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Credential } from "@/types";
import { useCopyWith2FA } from "@/lib/hooks/useCopyWith2FA";
import { secureFetch } from "@/lib/security/secureFetch";
import { useToast } from "@/contexts/ToastContext";
import { ToastMessages } from "@/lib/toastMessages";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const deviceId = useDeviceId();
  const { showToast } = useToast();

  const {
    handleCopy,
    handleSubmit,
    onSubmit,
    register,
    errors,
    reset,
    setPendingAction,
  } = useCopyWith2FA({
    deviceId,
    showToast,
    setCopied,
    setIsModalOpen,
    setIsVerifying,
  });

  useEffect(() => {
    async function fetchCredentials() {
      try {
        const res = await secureFetch(
          "/api/credentials",
          { method: "GET" },
          deviceId
        );
        const data = await res.json();
        if (!res.ok) {
          console.error("Failed to load credentials: ", data.error);
          showToast(ToastMessages.server.generic, "error");
        }
        setCredentials(data.credentials);
      } catch (err: any) {
        showToast(ToastMessages.server.generic, "error");
        console.error("Error fetching credentials:", err);
      } finally {
        setLoading(false);
      }
    }

    if (deviceId) {
      fetchCredentials();
    }
  }, [deviceId]);

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

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
      });
      if (res.ok) {
        router.push("/login");
      } else {
        showToast(ToastMessages.server.generic, "error");
      }
    } catch (error) {
      showToast(ToastMessages.server.generic, "error");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="bg-background relative min-h-screen p-4 pb-28 w-full">
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          reset();
          setPendingAction(null);
          setIsVerifying(false);
          setIsModalOpen(false);
        }}
      >
        <TwoFAVerification
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          register={register}
          errors={errors}
          isLoading={isVerifying}
        />
      </Modal>
      <DashboardHeader handleLogout={handleLogout} />
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
