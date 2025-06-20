"use client";

import Button from "@/components/UI/Button";
import { useToast } from "@/contexts/ToastContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const emailSchema = z.object({
  password: z.string(),
  secondPassword: z.string(),
});

{
  /**
   * 
   * for dev we keep it simple
   * 
const emailSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    secondPassword: z.string(),
  })
  .refine((data) => data.password === data.secondPassword, {
    message: "Passwords do not match",
    path: ["secondPassword"],
  });
     */
}

type FormData = z.infer<typeof emailSchema>;

export default function ChangePassword() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(emailSchema) });
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const { password, secondPassword } = data;
    if (password === "") {
      showToast("Password is empty, please fill up the form", "error");
      setIsLoading(false);
      return;
    }
    if (password !== secondPassword) {
      showToast("Both passwords are not matching", "error");
      setIsLoading(false);
      return;
    }
    const token = searchParams.get("token");

    if (!token) {
      showToast("Invalid request. Token is missing", "error");
      setIsLoading(false);
      return;
    }

    const res = await fetch("/api/reset-password/change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, token }),
    });

    if (res.ok) {
      showToast("Your password has been updated!", "success");
      setTimeout(() => router.push("/login"), 3000);
    } else {
      showToast("Something went wrong, please try again", "error");
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
            {...register("password")}
          />
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
