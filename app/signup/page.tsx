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

export default function Signup() {
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
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setToast(null);
    try {
      setIsLoading(true);
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setIsLoading(false);
        setToast({
          message: "Signup successful! Redirecting to login...",
          type: "success",
        });
        setTimeout(() => {
          router.push("/login");
        }, 2500);
      } else {
        const result = await res.json();
        setToast({
          message: result.error || "Signup failed",
          type: "error",
        });
        setIsLoading(false);
      }
    } catch (error) {
      setToast({
        message: "An unexpected error occurred. Please try again later.",
        type: "error",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-background-secondary p-6 rounded-xl shadow-xl w-full max-w-sm space-y-4"
      >
        <h1 className="text-foreground text-2xl font-bold text-center">
          Sign Up
        </h1>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
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
          Sign Up
        </Button>
      </form>
    </div>
  );
}
