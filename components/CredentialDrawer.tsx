"use client";

import { useState } from "react";
import CredentialForm from "./CredentialForm";
import CredentialToggleButton from "./CredentialToggleButton";
import Toast from "./Toast";
import { Credential } from "@/types";
import { useDeviceId } from "@/lib/hooks/useDeviceId";

interface CredentialDrawerProps {
  setCredentials: React.Dispatch<React.SetStateAction<Credential[]>>;
}

export default function CredentialDrawer({
  setCredentials,
}: CredentialDrawerProps) {
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success" | "info";
  } | null>(null);
  const deviceId = useDeviceId();

  return (
    <div className="w-full max-w-md mx-auto">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Add New Credential Tab */}
      {!showForm && (
        <div className="fixed bottom-0 inset-x-0 mx-auto w-full max-w-md sm:max-w-lg md:max-w-xl z-30">
          <CredentialToggleButton
            onClick={() => setShowForm((prev) => !prev)}
            isOpen={showForm}
            className="transition transition-transform hover:scale-[1.02]"
          />
        </div>
      )}

      {/* Backdrop Blur */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-10 transition transition-transform duration-300 ease-out"
          onClick={() => setShowForm(false)}
        />
      )}

      {/* Sliding Form */}
      <div
        className={`fixed bottom-0 inset-x-0 w-full max-w-md mx-auto z-20 bg-background-secondary transition-transform duration-300 ease-out rounded-t-3xl ${
          showForm ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <CredentialToggleButton
          onClick={() => setShowForm((prev) => !prev)}
          isOpen={showForm}
        />
        <CredentialForm
          setToast={setToast}
          onClick={() => setShowForm((prev) => !prev)}
          setCredentials={setCredentials}
          deviceId={deviceId}
        />
      </div>
    </div>
  );
}
