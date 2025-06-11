"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";
import Button from "@/components/Button";
import { useDeviceId } from "@/lib/hooks/useDeviceId";

const formSchema = z.object({
  code: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d+$/, "Only numbers allowed"),
});
type FormData = z.infer<typeof formSchema>;

export default function Setup() {
  const [qrCode, setQrCode] = useState("");
  const [setupUrl, setSetupUrl] = useState("");
  const [renderError, setRenderError] = useState("");
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
          setToast({ message: "Failed to get QR code", type: "error" });
          return;
        }
        setQrCode(data.qrCode);
        setSetupUrl(data.otpauth);
      } catch (err) {
        console.error(err);
        setToast({
          message: "Unable to load QR code. Please try again.",
          type: "error",
        });
        setRenderError("Failed to load QR code. Please try again later.");
      }
    };

    fetchQrCode();
  }, []);

  const onSubmit = async (data: FormData) => {
    setToast(null);
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
        setToast({
          message: result.error || "Verification failed",
          type: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "An unexpected error occurred", type: "error" });
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
                setToast({
                  message: "Setup link copied to clipboard",
                  type: "info",
                });
                window.open(setupUrl, "_blank");
              }}
              className="text-sm text-blue-500 hover:underline mx-auto block"
            >
              Can't scan? Tap to open or copy link
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
            className="bg-background text-foreground w-full p-1 border border-border rounded-xl text-center text-lg tracking-widest focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:outline-none"
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
            {isLoading ? "Verifying..." : "Activate 2FA"}
          </Button>
        </form>
      </div>
    </div>
  );
}
