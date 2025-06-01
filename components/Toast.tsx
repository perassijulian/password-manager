"use client";

import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number; // ms
}

const toastColors = {
  success: "bg-green-500/90 text-white",
  error: "bg-red-500/90 text-white",
  info: "bg-blue-500/90 text-white",
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
      setTimeout(onClose, 300); // wait for animation to finish
    }, duration);

    return () => {
      clearTimeout(enterTimeout);
      clearTimeout(exitTimeout);
    };
  }, [duration, onClose]);

  return (
    <div className="fixed inset-x-0 top-6 z-50 flex justify-center pointer-events-none">
      <div
        role="alert"
        className={`
          px-4 py-3 rounded-2xl backdrop-blur-md shadow-xl transition-all duration-300
          transform ${toastColors[type]}
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
        `}
      >
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
