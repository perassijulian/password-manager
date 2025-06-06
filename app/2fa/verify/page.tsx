"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import TwoFAVerification from "@/components/TwoFAVerification";
import { useDeviceId } from "@/lib/hooks/useDeviceId";

const formSchema = z.object({
  code: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d+$/, "Only numbers allowed"),
});
type FormData = z.infer<typeof formSchema>;

export default function Verify2FA() {
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success" | "info";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const deviceId = useDeviceId();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(formSchema) });

  const onSubmit = async (data: FormData) => {
    setToast(null);
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
        setToast({
          message: "Verification failed",
          type: "error",
        });
        console.error("2FA verification error:", result.error);
        return;
      }
    } catch (err) {
      console.error("2FA verify error:", err);
      setToast({ message: "An unexpected error occurred", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <TwoFAVerification
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        register={register}
        errors={errors}
        toast={toast}
        setToast={setToast}
        isLoading={isLoading}
      />
    </div>
  );
}
