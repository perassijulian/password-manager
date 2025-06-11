import { useForm } from "react-hook-form";
import { UseFormRegister, FieldErrors, SubmitHandler } from "react-hook-form";
import Toast from "./Toast";
import Button from "./Button";

type TwoFAFormValues = {
  code: string;
};

interface TwoFAVerificationProps {
  handleSubmit: (
    onSubmit: SubmitHandler<TwoFAFormValues>
  ) => (event?: React.BaseSyntheticEvent) => Promise<void>;
  onSubmit: SubmitHandler<TwoFAFormValues>;
  register: UseFormRegister<TwoFAFormValues>;
  errors: FieldErrors<TwoFAFormValues>;
  toast: { message: string; type: "error" | "success" | "info" } | null;
  setToast: React.Dispatch<
    React.SetStateAction<{
      message: string;
      type: "error" | "success" | "info";
    } | null>
  >;
  isLoading: boolean;
}

export default function TwoFAVerification({
  handleSubmit,
  onSubmit,
  register,
  errors,
  toast,
  setToast,
  isLoading,
}: TwoFAVerificationProps) {
  return (
    <>
      <h1 className="text-foreground text-2xl font-semibold mb-2 text-center">
        2FA Verification
      </h1>
      <p className="text-sm text-foreground-secondary mb-6 text-center">
        Enter the 6-digit code from your authenticator app
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          maxLength={6}
          {...register("code")}
          className="bg-background-terciary text-foreground w-full p-1 border border-border rounded-xl text-center text-lg tracking-widest focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:outline-none"
        />
        {errors.code && (
          <p className="text-red-500 text-sm">{errors.code.message}</p>
        )}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <Button type="submit" disabled={isLoading} isLoading={isLoading}>
          {isLoading ? "Verifying..." : "Verify"}
        </Button>
      </form>
    </>
  );
}
