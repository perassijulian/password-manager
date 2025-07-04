import safeClipboardWrite from "@/utils/safeClipboardWrite";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ToastType } from "@/types";
import { secureFetch } from "../security/secureFetch";
import { ToastMessages } from "../toastMessages";

export function useCopyWith2FA({
  deviceId,
  showToast,
  setCopied,
  setIsModalOpen,
  setIsVerifying,
}: {
  deviceId: string | undefined;
  showToast: (message: string, type: ToastType) => void;
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

  const copyPassword = async (id: string) => {
    const res = await secureFetch(
      `/api/credentials/${id}/copy`,
      {
        method: "POST",
      },
      deviceId
    );

    const data = await res.json();

    if (!res.ok) {
      if (data.error === "2FA required") {
        setPendingAction({
          type: "copy_password",
          credentialId: id,
        });
        setIsModalOpen(true); // open modal to perform 2FA
        return;
      } else {
        console.error("Failed to copy password:", data.error);
        showToast(ToastMessages.credentials.copy.error, "error");
        return;
      }
    }

    const { password } = data;

    const result = await safeClipboardWrite(password);
    if (result === "unsupported") {
      showToast(ToastMessages.credentials.copy.unsupported, "error");
      return;
    }
    if (result === "error") {
      showToast(ToastMessages.credentials.copy.error, "error");
      return;
    }
    // If we reach here, the password was successfully copied
    // Update copied state to show success
    setCopied((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [id]: false })), 1000);
    showToast(ToastMessages.credentials.copy.success, "success");
  };

  const handleCopy = async (id: string) => {
    if (!deviceId) {
      showToast(ToastMessages.device.notReady, "error");
      return;
    }

    try {
      await copyPassword(id);
    } catch (error: any) {
      if (error.message === "2FA required") {
        setPendingAction({
          type: "copy_password",
          credentialId: id,
        });
        setIsModalOpen(true); // open modal to perform 2FA
        return;
      } else {
        console.error("Failed to copy password:", error);
        showToast(ToastMessages.credentials.copy.error, "error");
        return;
      }
    }
  };

  const handle2FASuccess = async () => {
    if (!pendingAction || !deviceId) return;
    if (pendingAction.type === "copy_password") {
      try {
        await copyPassword(pendingAction.credentialId);
      } catch (error) {
        console.error("Error during 2FA copy action:", error);
        showToast(ToastMessages.credentials.copy.error, "error");
        return;
      }
    }
  };

  const onSubmit = async (data: FormData) => {
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
        showToast(ToastMessages.auth.verificationFailed, "error");
        console.error("2FA verification error:", result.error);
        return;
      }

      handle2FASuccess();
      setIsModalOpen(false);
      reset();
    } catch (error: any) {
      showToast(ToastMessages.server.generic, "error");
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
    reset,
    setPendingAction,
  };
}
