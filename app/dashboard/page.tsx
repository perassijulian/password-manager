"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CredentialDrawer from "@/components/CredentialDrawer";
import CredentialsList from "@/components/CredentialsList";
import { DoorOpen, Moon, Sun } from "lucide-react";
import Toast from "@/components/Toast";
import Modal from "@/components/Modal";
import TwoFAVerification from "@/components/TwoFAVerification";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDeviceId } from "@/lib/hooks/useDeviceId";

type Credential = {
  id: string;
  service: string;
  username: string;
  password: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success" | "info";
  } | null>(null);
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

      setToast({ message: "2FA verified successfully!", type: "success" });
      setIsModalOpen(false);
      reset();
    } catch (error: any) {
      setToast({ message: "2FA verification error", type: "error" });
      console.error("2FA verification error:", error);
    } finally {
      setIsVerifying(false);
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
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Dashboard</h1>
        {toast && (
          <Toast
            message="{toast.message}"
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="p-2 rounded-full transition"
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full transition text-red-500 hover:text-red-700"
            title="Log Out"
          >
            <DoorOpen size={20} />
          </button>
        </div>
      </div>
      <CredentialsList
        credentials={credentials}
        setCredentials={setCredentials}
        setIsModalOpen={setIsModalOpen}
      />
      <CredentialDrawer setCredentials={setCredentials} />
    </div>
  );
}
