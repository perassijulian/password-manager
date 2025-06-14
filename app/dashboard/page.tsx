"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CredentialDrawer from "@/components/CredentialDrawer";
import CredentialsList from "@/components/CredentialsList";
import Modal from "@/components/Modal";
import TwoFAVerification from "@/components/TwoFAVerification";
import { useDeviceId } from "@/lib/hooks/useDeviceId";
import DashboardHeader from "@/components/DashboardHeader";
import { ToastProps } from "@/types";
import { Credential } from "@/types";
import { useCopyWith2FA } from "@/lib/hooks/useCopyWith2FA";
import { secureFetch } from "@/lib/secureFetch";
import { useToast } from "@/lib/hooks/useToast";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const deviceId = useDeviceId();
  const { toast, showToast } = useToast();

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
          showToast("Failed to load credentials", "error");
        }
        setCredentials(data.credentials);
      } catch (err: any) {
        showToast("Failed to load credentials", "error");
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
        showToast("Logout failed", "error");
      }
    } catch (error) {
      showToast(
        "An unexpected error occurred. Please try again later.",
        "error"
      );
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
          toast={toast}
          isLoading={isVerifying}
        />
      </Modal>
      <DashboardHeader toast={toast} handleLogout={handleLogout} />
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
