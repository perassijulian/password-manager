"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { codeFormSchema, type CodeFormData } from "@/schemas/codeSchema";
import { useDeviceId } from "@/lib/hooks/useDeviceId";
import TwoFAVerification from "@/components/TwoFAVerification";
import { useToast } from "@/contexts/ToastContext";
import { ToastMessages } from "@/lib/toastMessages";

export default function Verify2FA() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const deviceId = useDeviceId();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CodeFormData>({ resolver: zodResolver(codeFormSchema) });

  const onSubmit = async (data: CodeFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: data.code,
          deviceId,
          actionType: "login",
          context: "login",
        }),
      });

      const result = await res.json();

      if (res.ok) {
        router.push("/dashboard");
      } else {
        showToast(ToastMessages.auth.invalid2FA, "error");
        console.error("2FA verification error:", result.error);
        return;
      }
    } catch (err) {
      console.error("2FA verify error:", err);
      showToast(ToastMessages.server.generic, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-background-secondary p-6 rounded-xl shadow-xl w-full max-w-sm space-y-4">
        <TwoFAVerification
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          register={register}
          errors={errors}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
