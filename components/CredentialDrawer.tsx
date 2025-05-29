"use client";

import { useState } from "react";
import CredentialForm from "./CredentialForm";
import CredentialToggleButton from "./CredentialToggleButton";

export default function CredentialDrawer() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      {/* Add New Credential Tab */}
      {!showForm && (
        <div className="fixed bottom-0 left-0 z-30 w-full">
          <CredentialToggleButton
            onClick={() => setShowForm((prev) => !prev)}
            isOpen={showForm}
          />
        </div>
      )}

      {/* Sliding Form */}
      <div
        className={`fixed bottom-0 left-0 w-full z-20 bg-white border-t transition-transform duration-300 ${
          showForm ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <CredentialToggleButton
          onClick={() => setShowForm((prev) => !prev)}
          isOpen={showForm}
        />
        <CredentialForm />
      </div>
    </>
  );
}
