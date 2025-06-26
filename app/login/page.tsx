"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/schemas/userSchema";
import { useToast } from "@/contexts/ToastContext";
import Button from "@/components/UI/Button";
import Link from "next/link";
import { ToastMessages } from "@/lib/toastMessages";

type FormData = z.infer<typeof loginSchema>;

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(loginSchema) });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const onSubmit = async (data: FormData) => {
    console.log("submiting");
    try {
      setIsLoading(true);
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
        showToast(ToastMessages.auth.loginFailed, "error");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast(ToastMessages.server.generic, "error");
      setIsLoading(false);
      return;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-background-secondary p-6 rounded-xl shadow-xl w-full max-w-sm space-y-4"
      >
        <h1 className="text-foreground text-2xl font-bold text-center">
          Login
        </h1>
        <div>
          <label className="text-foreground-secondary">Email</label>
          <input
            {...register("email")}
            className="bg-background w-full border px-3 py-2 rounded mt-1 focus:ring-2 focus:ring-offset-1 focus:ring-primary focus:outline-none"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="text-foreground-secondary">Password</label>
          <input
            type="password"
            {...register("password")}
            className="bg-background w-full border px-3 py-2 rounded mt-1 focus:ring-2 focus:ring-offset-1 focus:ring-primary focus:outline-none"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>
        <Button isLoading={isLoading} type="submit">
          Login
        </Button>
        <p className="text-center text-sm text-gray-500">
          By logging in, you agree to our{" "}
          <button
            type="button"
            onClick={() =>
              showToast(
                "Coming Soon. Please ALWAYS read Terms of Service and Privacy Policy.",
                "info"
              )
            }
            className="text-blue-500 hover:underline"
          >
            Terms of Service
          </button>{" "}
          and{" "}
          <button
            type="button"
            onClick={() =>
              showToast(
                "Coming Soon. Please ALWAYS read Terms of Service and Privacy Policy.",
                "success"
              )
            }
            className="text-blue-500 hover:underline"
          >
            Privacy Policy
          </button>
          .
        </p>
        <p className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
        <p className="text-center text-sm text-gray-500">
          If you forgot your password{" "}
          <Link
            href="/reset-password"
            className="text-blue-500 hover:underline"
          >
            click here
          </Link>
        </p>
      </form>
    </div>
  );
}
