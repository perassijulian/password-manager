"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";
import Button from "@/components/Button";

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
        body: JSON.stringify({ code: data.code }),
      });

      const result = await res.json();

      if (res.ok) {
        router.push("/dashboard");
      } else {
        setToast({
          message: result.error || "Verification failed",
          type: "error",
        });
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
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold mb-2 text-center">
          2FA Verification
        </h1>
        <p className="text-sm text-gray-400 mb-6 text-center">
          Enter the 6-digit code from your authenticator app
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            maxLength={6}
            {...register("code")}
            className="w-full p-2 border border-gray-700 rounded-xl text-center text-lg tracking-widest"
          />
          {errors.code && (
            <p className="text-red-500 text-sm">{errors.code.message}</p>
          )}
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}

          <Button type="submit" disabled={isLoading} isLoading={isLoading}>
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </form>
      </div>
    </div>
  );
}
