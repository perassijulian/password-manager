import { ToastType } from "@/types";
import { useCallback, useState } from "react";

export function useToast(duration = 4000) {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      setToast({ message, type });

      setTimeout(() => {
        setToast(null);
      }, duration + 300);
    },
    [duration]
  );

  return { toast, showToast };
}
