"use client";

import Button from "@/components/UI/Button";
import { useToast } from "@/contexts/ToastContext";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        showToast(
          "You will receive a mail with the instructions to reset your password",
          "success"
        );
      } else {
        showToast(
          "Reset password was not able to process, try again later",
          "error"
        );
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error when posting to /api/reset-password: ", error);
      showToast(
        "Reset password was not able to process, try again later",
        "error"
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-background-secondary rounded-xl border border-border p-4 space-y-2 max-w-md shadow-xl"
      >
        <h1 className="text-foreground">Reset your password</h1>
        <p>
          You will receive an email with instructions on how to reset your
          password
        </p>
        <div className="text-foreground-secondary flex flex-col space-y-2">
          <label className="text-foreground-secondary">Email</label>
          <input
            className="bg-background border border-border rounded-l p-2"
            {...register("email")}
          />
        </div>
        <Button isLoading={isLoading}>Send email</Button>
      </form>
    </div>
  );
}
