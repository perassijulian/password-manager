"use client";

import Button from "@/components/UI/Button";
import { useForm } from "react-hook-form";

export default function ResetPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    console.log(data);
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
        <Button>Send email</Button>
      </form>
    </div>
  );
}
