"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signupSchema } from "@/schemas/userSchema";
import Button from "@/components/UI/Button";
import { useToast } from "@/contexts/ToastContext";
import { usePasswordStrength } from "@/lib/hooks/usePasswordStrength";
import { cn } from "@/lib/cn";
import { ToastMessages } from "@/lib/toastMessages";

type FormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(signupSchema) });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const { score, feedback, checkStrength, isStrongEnough } =
    usePasswordStrength();

  const onSubmit = async (data: FormData) => {
    console.log("submit");
    if (!isStrongEnough) {
      showToast(ToastMessages.auth.passwordNotStrongEnough, "error");
      setIsLoading(false);
      return;
    }
    const { password, secondPassword, email } = data;
    if (password !== secondPassword) {
      showToast(ToastMessages.auth.passwordDoesNotMatch, "error");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, email }),
      });
      if (res.ok) {
        setIsLoading(false);
        showToast(ToastMessages.auth.signupSuccess, "success");
        setTimeout(() => {
          router.push("/");
        }, 2500);
      } else {
        const result = await res.json();
        showToast(ToastMessages.auth.signupFailed, "error");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Signup error:", error);
      showToast(ToastMessages.server.generic, "error");
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
            {...register("password", {
              required: true,
              onChange: (e) => checkStrength(e.target.value),
            })}
            className="bg-background w-full border px-3 py-2 rounded mt-1 focus:ring-2 focus:ring-offset-1 focus:ring-primary focus:outline-none"
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
        </div>
        <Button isLoading={isLoading} type="submit">
          Sign Up
        </Button>
      </form>
    </div>
  );
}
