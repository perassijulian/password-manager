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

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const deviceId = useDeviceId();

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
    setToast,
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
        if (!res.ok) console.error("Failed to load credentials: ", data.error);
        setToast({
          message: "Failed to load credentials",
          type: "error",
        });
        setCredentials(data.credentials);
      } catch (err: any) {
        setToast({
          message: "Failed to load credentials",
          type: "error",
        });
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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="relative min-h-screen bg-gray-50 p-4 pb-28 w-full">
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
