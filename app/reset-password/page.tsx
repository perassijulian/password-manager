"use client";

import Button from "@/components/UI/Button";
import { useToast } from "@/contexts/ToastContext";
import { ToastMessages } from "@/lib/toastMessages";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email(),
});
type FormData = z.infer<typeof emailSchema>;

export default function ResetPassword() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(emailSchema) });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showToast } = useToast();

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        showToast(ToastMessages.resetPassword.success, "success");
        reset();
      } else {
        showToast(ToastMessages.resetPassword.error, "error");
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error when posting to /api/reset-password: ", error);
      showToast(ToastMessages.server.generic, "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-background-secondary rounded-xl p-6 space-y-4 w-full max-w-md shadow-xl"
      >
        <h1 className="text-foreground text-2xl font-bold text-center">
          Reset your password
        </h1>
        <p className="text-foreground-secondary text-sm">
          You will receive an email with instructions on how to reset your
          password
        </p>
        <div>
          <label className="text-foreground-secondary">Email</label>
          <input
            className="bg-background w-full border px-3 py-2 rounded my-2 focus:ring-2 focus:ring-offset-1 focus:ring-primary focus:outline-none"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>
        <Button isLoading={isLoading}>Send email</Button>
      </form>
    </div>
  );
}
