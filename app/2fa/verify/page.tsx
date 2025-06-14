"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import TwoFAVerification from "@/components/TwoFAVerification";
import { useDeviceId } from "@/lib/hooks/useDeviceId";
import { useToast } from "@/lib/hooks/useToast";

const formSchema = z.object({
  code: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d+$/, "Only numbers allowed"),
});
type FormData = z.infer<typeof formSchema>;

export default function Verify2FA() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const deviceId = useDeviceId();
  const { toast, showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(formSchema) });

  const onSubmit = async (data: FormData) => {
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
        showToast("Verification failed", "error");
        console.error("2FA verification error:", result.error);
        return;
      }
    } catch (err) {
      console.error("2FA verify error:", err);
      showToast("An unexpected error occurred", "error");
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
          toast={toast}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
