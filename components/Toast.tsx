"use client";

import { useEffect, useState } from "react";
import { ToastProps } from "@/types";

const toastColors = {
  success: {
    border: "border-green-500",
  },
  error: {
    border: "border-red-500",
  },
  info: {
    border: "border-blue-500",
  },
};

export default function Toast({
  message,
  type = "info",
  onClose,
  duration = 4000,
}: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const enterTimeout = setTimeout(() => setVisible(true), 10);
    const exitTimeout = setTimeout(() => {
      setVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // wait for animation to finish
      }
    }, duration);

    return () => {
      clearTimeout(enterTimeout);
      clearTimeout(exitTimeout);
    };
  }, [duration, onClose]);

  const { border } = toastColors[type];
  return (
    <div className="fixed inset-x-0 top-6 z-50 flex justify-center pointer-events-none w-full">
      <div
        role="alert"
        className={`
          max-w-md w-full mx-6 pointer-events-auto border ${border}
          border-2 bg-background/40 text-foreground
          backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl
          shadow-xl ring-1 ring-black/5 dark:ring-white/10
          transition-all duration-300 transform
          ${
            visible
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-90 -translate-y-4"
          }
        `}
      >
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
