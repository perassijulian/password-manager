"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { codeFormSchema, type CodeFormData } from "@/schemas/codeSchema";
import { useDeviceId } from "@/lib/hooks/useDeviceId";
import Button from "@/components/UI/Button";
import { useToast } from "@/contexts/ToastContext";

export default function Setup() {
  const [qrCode, setQrCode] = useState("");
  const [setupUrl, setSetupUrl] = useState("");
  const [renderError, setRenderError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const deviceId = useDeviceId();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CodeFormData>({ resolver: zodResolver(codeFormSchema) });

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        const res = await fetch("/api/2fa/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (!res.ok) {
          console.error("Failed to get QR code: ", data.error);
          showToast("Failed to get QR code", "error");
          return;
        }
        setQrCode(data.qrCode);
        setSetupUrl(data.otpauth);
      } catch (err) {
        console.error(err);
        showToast("Unable to load QR code. Please try again.", "error");
        setRenderError("Failed to load QR code. Please try again later.");
      }
    };

    fetchQrCode();
  }, []);

  const onSubmit = async (data: CodeFormData) => {
    try {
      setIsLoading(true);
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
      }
    } catch (err) {
      console.error(err);
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-background-secondary p-6 rounded-xl shadow-xl w-full max-w-sm space-y-4">
        <h1 className="text-foreground text-2xl font-semibold mb-2 text-center">
          Set up 2FA
        </h1>

        {qrCode ? (
          <>
            <p className="text-foreground-secondary text-sm mb-6 text-center">
              Scan this QR code with your authenticator app:
            </p>
            <div className="flex justify-center mb-4">
              <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(setupUrl);
                showToast(
                  "Link copied! Paste it in your authenticator app if you can't scan the QR.",
                  "info"
                );
              }}
              className="text-sm text-blue-500 hover:underline mx-auto block"
            >
              Can't scan? Tap to copy the setup link
            </button>
          </>
        ) : renderError !== "" ? (
          <div className="text-sm text-red-500 mx-auto">{renderError}</div>
        ) : (
          <p className="text-foreground-secondary text-sm mb-6 text-center">
            Loading QR code...
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Enter 6-digit code"
            maxLength={6}
            {...register("code")}
            autoFocus
            className="bg-background text-foreground w-full p-1 border border-border rounded-xl text-center text-lg tracking-widest focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:outline-none"
          />
          {errors.code && (
            <p className="text-red-500 text-sm">{errors.code.message}</p>
          )}

          <Button type="submit" disabled={isLoading} isLoading={isLoading}>
            {isLoading ? "Verifying..." : "Activate 2FA"}
          </Button>
        </form>
      </div>
    </div>
  );
}
