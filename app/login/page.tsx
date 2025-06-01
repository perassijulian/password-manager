"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signupSchema } from "@/schemas/userSchema";
import Toast from "@/components/Toast";
import Button from "@/components/Button";

type FormData = z.infer<typeof signupSchema>;

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(signupSchema) });
  const router = useRouter();
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success" | "info";
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setToast(null);
    try {
      setLoading(true);
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        result.requires2FA
          ? router.push("/2fa/verify")
          : router.push("/2fa/setup");
      } else {
        setToast({ message: result.error || "Login failed", type: "error" });
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setToast({
        message: "An unexpected error occurred. Please try again later.",
        type: "error",
      });
      setLoading(false);
      return;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Login</h1>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <div>
          <label>Email</label>
          <input
            {...register("email")}
            className="w-full border px-3 py-2 rounded mt-1"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            {...register("password")}
            className="w-full border px-3 py-2 rounded mt-1"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>
        <Button isLoading={loading} type="submit">
          Login
        </Button>
        <p className="text-center text-sm text-gray-500">
          By logging in, you agree to our{" "}
          {/**
           * 
           <a href="/terms" className="text-blue-500 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-blue-500 hover:underline">
            Privacy Policy
          </a>
           * 
           */}
          <button
            type="button"
            onClick={() =>
              setToast({
                message:
                  "Coming Soon. Please ALWAYS read Terms of Service and Privacy Policy.",
                type: "info",
              })
            }
            className="text-blue-500 hover:underline"
          >
            Terms of Service
          </button>{" "}
          and{" "}
          <button
            type="button"
            onClick={() =>
              setToast({
                message:
                  "Coming Soon. Please ALWAYS read Terms of Service and Privacy Policy.",
                type: "info",
              })
            }
            className="text-blue-500 hover:underline"
          >
            Privacy Policy
          </button>
          .
        </p>
        <p className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </a>
        </p>
      </form>
    </div>
  );
}
