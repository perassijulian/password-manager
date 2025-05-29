"use client";

import { useState } from "react";
import { EyeOff, Plus } from "lucide-react";
import CredentialForm from "./CredentialForm";

export default function CredentialDrawer() {
  const [showForm, setShowForm] = useState(false);

  function ToggleFormButton({
    onClick,
    isOpen,
  }: {
    onClick?: () => void;
    isOpen?: boolean;
  }) {
    return (
      <button
        onClick={() => setShowForm((prev) => !prev)}
        className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-6 pt-2 pb-4 rounded-t-2xl hover:bg-blue-700 transition"
      >
        {isOpen ? <EyeOff size={18} /> : <Plus size={18} />}
        {isOpen ? "Close Form" : "Add New Credential"}
      </button>
    );
  }

  return (
    <>
      {/* Add New Credential Tab */}
      {!showForm && (
        <div className="fixed bottom-0 left-0 z-30 w-full">
          <ToggleFormButton
            onClick={() => setShowForm((prev) => !prev)}
            isOpen={showForm}
          />
        </div>
      )}

      {/* Sliding Form */}
      <div
        className={`fixed bottom-0 left-0 w-full z-20 bg-white border-t shadow-xl transition-transform duration-300 ${
          showForm ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <ToggleFormButton
          onClick={() => setShowForm((prev) => !prev)}
          isOpen={showForm}
        />
        <CredentialForm />
      </div>
    </>
  );
}
