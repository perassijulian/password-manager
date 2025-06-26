"use client";

import Button from "@/components/UI/Button";
import { useToast } from "@/contexts/ToastContext";
import { cn } from "@/lib/cn";
import { usePasswordStrength } from "@/lib/hooks/usePasswordStrength";
import { ToastMessages } from "@/lib/toastMessages";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(10, "Password must be at least 10 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(/[^a-zA-Z0-9]/, "Password must contain special character"),
    secondPassword: z.string(),
  })
  .refine((data) => data.password === data.secondPassword, {
    message: "Passwords do not match",
    path: ["secondPassword"],
  });

type FormData = z.infer<typeof passwordSchema>;

export default function ChangePassword() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(passwordSchema) });
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { score, feedback, checkStrength, isStrongEnough } =
    usePasswordStrength();

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const { password, secondPassword } = data;
    if (password === "") {
      showToast(ToastMessages.auth.missingFields, "error");
      setIsLoading(false);
      return;
    }
    if (password !== secondPassword) {
      showToast(ToastMessages.auth.passwordDoesNotMatch, "error");
      setIsLoading(false);
      return;
    }
    const token = searchParams.get("token");

    if (!token) {
      showToast(ToastMessages.resetPassword.missingToken, "error");
      setIsLoading(false);
      return;
    }

    const res = await fetch("/api/reset-password/change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, token }),
    });

    if (res.ok) {
      showToast(ToastMessages.resetPassword.passwordUpdated, "success");
      setTimeout(() => router.push("/login"), 3000);
    } else {
      showToast(ToastMessages.server.generic, "error");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-background-secondary p-6 rounded-xl shadow-xl w-full max-w-md space-y-4"
      >
        <h1 className="text-foreground text-2xl font-bold text-center">
          Reset your password
        </h1>
        <div>
          <label className="text-foreground-secondary">
            Create new password
          </label>
          <input
            type="password"
            className="bg-background w-full border px-3 py-2 rounded mt-1 focus:ring-2 focus:ring-offset-1 focus:ring-primary focus:outline-none"
            {...register("password", {
              required: true,
              onChange: (e) => checkStrength(e.target.value),
            })}
          />
          {feedback && <p className="text-sm text-red-500 mt-1">{feedback}</p>}
          <p
            className={cn(
              "text-sm mt-1",
              isStrongEnough ? "text-green-600" : "text-red-500"
            )}
          >
            {["Too weak", "Weak", "Okay", "Strong", "Very strong"][score]}{" "}
            password
          </p>
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="text-foreground-secondary">
            Confirm your password
          </label>
          <input
            type="password"
            className="bg-background w-full border px-3 py-2 rounded mt-1 focus:ring-2 focus:ring-offset-1 focus:ring-primary focus:outline-none"
            {...register("secondPassword")}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>
        <Button isLoading={isLoading}>Update password</Button>
      </form>
    </div>
  );
}
