"use client";

import { useEffect, useState } from "react";
import { ToastProps } from "@/types";
import { cn } from "@/lib/cn";
import { CheckCircle, Info, XCircle } from "lucide-react";

const toastResources = {
  success: {
    border: "border-green-500",
    background: "bg-green-100 dark:bg-green-900",
    text: "text-green-800 dark:text-green-200",
    icon: <CheckCircle className="w-10 h-10" />,
  },
  error: {
    border: "border-red-500",
    background: "bg-red-100 dark:bg-red-900",
    text: "text-red-800 dark:text-red-200",
    icon: <XCircle className="w-10 h-10" />,
  },
  info: {
    border: "border-blue-500",
    background: "bg-blue-100 dark:bg-blue-900",
    text: "text-blue-800 dark:text-blue-200",
    icon: <Info className="w-10 h-10" />,
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

  const { border, background, text, icon } = toastResources[type];
  return (
    <div className="fixed inset-x-0 top-6 z-50 flex justify-center pointer-events-none w-full">
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className={cn(
          border,
          background,
          text,
          "flex items-center gap-4 max-w-md w-full pointer-events-auto border border text-sm font-medium",
          "backdrop-blur-md rounded-2xl mx-6 px-4 py-3 shadow-xl transition-all duration-300 transform",
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-90 -translate-y-4"
        )}
      >
        {icon}
        <p className="font-medium">{message}</p>
      </div>
    </div>
  );
}
