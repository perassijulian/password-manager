"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
});
type FormData = z.infer<typeof formSchema>;

export default function Setup() {
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        if (!res.ok) throw new Error("Failed to get QR code");
        const data = await res.json();
        setQrCode(data.qrCode);
      } catch (err) {
        console.error(err);
        setError("Unable to load QR code. Please try again.");
      }
    };

    fetchQrCode();
  }, []);

  const onSubmit = async (data: FormData) => {
    setError("");
    setLoading(true);
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
        setError(result.error || "Verification failed");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl">
      <h1 className="text-2xl font-semibold mb-4">Set up 2FA</h1>

      {qrCode ? (
        <>
          <p className="mb-2">Scan this QR code with your authenticator app:</p>
          <div className="flex justify-center mb-4">
            <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-600 mb-4">Loading QR code...</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          type="text"
          inputMode="numeric"
          placeholder="Enter 6-digit code"
          maxLength={6}
          {...register("code")}
          className="w-full p-2 border border-gray-300 rounded-xl"
        />
        {errors.code && (
          <p className="text-red-500 text-sm">{errors.code.message}</p>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
        >
          {loading ? "Verifying..." : "Activate 2FA"}
        </button>
      </form>
    </div>
  );
}
