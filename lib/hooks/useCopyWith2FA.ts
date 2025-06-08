import safeClipboardWrite from "@/utils/safeClipboardWrite";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ToastProps } from "@/types";

export function useCopyWith2FA({
  deviceId,
  setToast,
  copied,
  setCopied,
  setIsModalOpen,
  setIsVerifying,
}: {
  deviceId: string | null;
  setToast: (toast: ToastProps | null) => void;
  copied: { [key: string]: boolean };
  setCopied: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  setIsModalOpen: (isOpen: boolean) => void;
  setIsVerifying: (isVerifying: boolean) => void;
}) {
  const [pendingAction, setPendingAction] = useState<null | {
    type: "copy_password";
    credentialId: string;
  }>(null);
  const formSchema = z.object({
    code: z
      .string()
      .length(6, "Code must be 6 digits")
      .regex(/^\d+$/, "Only numbers allowed"),
  });
  type FormData = z.infer<typeof formSchema>;
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(formSchema) });

  const handleCopy = async (id: string) => {
    try {
      if (!deviceId) {
        setToast({
          message: "Device not ready yet. Try again in a second.",
          type: "error",
        });
        return;
      }
      const res = await fetch(`/api/credentials/${id}/copy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-id": deviceId,
        },
      });
      const data = await res.json();

      if (res.status === 401 && data.error === "2FA required") {
        setPendingAction({
          type: "copy_password",
          credentialId: id,
        });
        setIsModalOpen(true); // open modal to perform 2FA
        return;
      }
      if (!res.ok) {
        setToast({
          message: "Failed to copy password",
          type: "error",
        });
        console.error("Failed to copy password:", data.error);
        return;
      }

      const { password } = data;

      const result = await safeClipboardWrite(password);
      if (result === "unsupported") {
        setToast({ message: "Clipboard not supported", type: "error" });
        return;
      }
      if (result === "error") {
        setToast({ message: "Failed to copy password", type: "error" });
        return;
      }
      // If we reach here, the password was successfully copied
      // Update copied state to show success
      setCopied((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => setCopied((prev) => ({ ...prev, [id]: false })), 1000);
      setToast({
        message: "Password copied to clipboard!",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to copy password:", error);
      setToast({ message: "Failed to copy password", type: "error" });
      return;
    }
  };

  const handle2FASuccess = async () => {
    try {
      if (!pendingAction || !deviceId) return;

      if (pendingAction.type === "copy_password") {
        const res = await fetch(
          `/api/credentials/${pendingAction.credentialId}/copy`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-device-id": deviceId,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setToast({ message: "Copy failed after 2FA", type: "error" });
          return;
        }

        const { password } = data;

        const result = await safeClipboardWrite(password);
        if (result === "unsupported") {
          setToast({ message: "Clipboard not supported", type: "error" });
          return;
        }
        if (result === "error") {
          setToast({ message: "Failed to copy password", type: "error" });
          return;
        }
        // If we reach here, the password was successfully copied
        // Update copied state to show success
        setCopied((prev: { [key: string]: boolean }) => ({
          ...prev,
          [pendingAction.credentialId ?? ""]: true,
        }));
        setTimeout(
          () =>
            setCopied((prev: { [key: string]: boolean }) => ({
              ...prev,
              [pendingAction.credentialId ?? ""]: false,
            })),
          1000
        );
        setToast({
          message: "Password copied to clipboard!",
          type: "success",
        });
        setPendingAction(null);
      }
    } catch (error) {
      console.error("Error handling 2FA success:", error);
      setToast({ message: "Failed to handle 2FA success", type: "error" });
    }
  };

  const onSubmit = async (data: FormData) => {
    setToast(null);
    setIsVerifying(true);
    try {
      const res = await fetch("/api/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: data.code,
          deviceId,
          actionType: "copy_password",
          context: "sensitive",
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setToast({
          message: "Verification failed",
          type: "error",
        });
        console.error("2FA verification error:", result.error);
        return;
      }

      handle2FASuccess();
      setIsModalOpen(false);
      reset();
    } catch (error: any) {
      setToast({ message: "2FA verification error", type: "error" });
      console.error("2FA verification error:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    handleCopy,
    handleSubmit,
    onSubmit,
    register,
    errors,
  };
}
