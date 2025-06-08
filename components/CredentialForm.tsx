import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import Button from "./Button";
import { Credential } from "@/types";
import { secureFetch } from "@/lib/secureFetch";

interface CredentialFormProps {
  onClick: () => void;
  setToast: (
    toast: { message: string; type: "error" | "success" | "info" } | null
  ) => void;
  setCredentials: React.Dispatch<React.SetStateAction<Credential[]>>;
  deviceId: string | undefined; // Optional for testing
}

export default function CredentialForm({
  onClick,
  setToast,
  setCredentials,
  deviceId,
}: CredentialFormProps) {
  const [form, setForm] = useState({ service: "", username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const { service, username, password } = form;

    try {
      const res = await secureFetch(
        "/api/credentials/add",
        {
          method: "POST",
          body: JSON.stringify({ service, username, password }),
        },
        deviceId
      );
      setForm({ service: "", username: "", password: "" }); // clear ASAP
      // May be better to clear after response
      // to avoid showing stale data in case of error.
      // But this gives better security
      const data = await res.json();
      if (res.ok) {
        setToast({ message: "Credential saved successfully", type: "success" });
        setCredentials((prev) => [
          ...prev,
          {
            id: data.credential.id,
            service,
            username,
            password:
              // Store obfuscated password for display only – avoid keeping plaintext in memory
              form.password.slice(0, 2) + "*****" + form.password.slice(-2),
          },
        ]);
        setTimeout(() => {
          onClick();
        }, 500);
      } else {
        setToast({
          message: "Error saving credential",
          type: "error",
        });
        console.error("Error saving credential:", data.error);
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
