import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import Button from "./Button";
import { Credential } from "@/types";

interface CredentialFormProps {
  onClick: () => void;
  setToast: (
    toast: { message: string; type: "error" | "success" | "info" } | null
  ) => void;
  setCredentials: React.Dispatch<React.SetStateAction<Credential[]>>;
}

export default function CredentialForm({
  onClick,
  setToast,
  setCredentials,
}: CredentialFormProps) {
  const [form, setForm] = useState({ service: "", username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/credentials/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setToast({ message: "Credential saved successfully", type: "success" });
        setCredentials((prev) => [
          ...prev,
          {
            id: data.id,
            service: form.service,
            username: form.username,
            password: form.password,
          },
        ]);
        setTimeout(() => {
          setForm({ service: "", username: "", password: "" });
          onClick();
        }, 500);
      } else {
        setToast({
          message: data.error || "Error saving credential",
          type: "error",
        });
      }
    } catch (err) {
      setToast({
        message: "An unexpected error occurred",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-gradient-to-t from-gray-50 to-white backdrop-blur-sm border-t border-gray-200 space-y-4"
    >
      <h2 className="text-xl font-semibold">Add Credential</h2>
      <input
        type="text"
        placeholder="Service (e.g. GitHub)"
        value={form.service}
        onChange={(e) => setForm({ ...form, service: e.target.value })}
        required
        className="w-full border rounded-xl p-2 focus:outline-none focus:ring focus:border-blue-300"
      />

      <input
        type="text"
        placeholder="Username or Email"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
        required
        className="w-full border rounded-xl p-2 focus:outline-none focus:ring focus:border-blue-300"
      />

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          className="w-full border rounded-xl p-2 pr-10 focus:outline-none focus:ring focus:border-blue-300"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600"
        >
          {showPassword ? <EyeClosed /> : <Eye />}
        </button>
      </div>

      <Button type="submit" disabled={isLoading} isLoading={isLoading}>
        {isLoading ? "Saving..." : "Save Credential"}
      </Button>
    </form>
  );
}
