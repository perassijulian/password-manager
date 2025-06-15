import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import Button from "@/components/UI/Button";
import { Credential, ToastType } from "@/types";
import { secureFetch } from "@/lib/security/secureFetch";

interface CredentialFormProps {
  onClick: () => void;
  showToast: (message: string, type: ToastType) => void;
  setCredentials: React.Dispatch<React.SetStateAction<Credential[]>>;
  deviceId: string | undefined; // Optional for testing
}

export default function CredentialForm({
  onClick,
  showToast,
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
        showToast("Credential saved successfully", "success");
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
        showToast("Error saving credential", "error");
        console.error("Error saving credential:", data.error);
      }
    } catch (err) {
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="border border-border max-w-md mx-auto p-6 backdrop-blur-sm space-y-4"
    >
      <h2 className="text-foreground text-xl font-semibold">Add Credential</h2>
      <input
        type="text"
        placeholder="Service (e.g. GitHub)"
        value={form.service}
        onChange={(e) => setForm({ ...form, service: e.target.value })}
        required
        className="bg-background-secondary text-foreground w-full py-2 px-4 border border-border rounded-xl focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:outline-none"
      />

      <input
        type="text"
        placeholder="Username or Email"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
        required
        className="bg-background-secondary text-foreground w-full py-2 px-4 border border-border rounded-xl focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:outline-none"
      />

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          className="bg-background-secondary text-foreground w-full py-2 px-4 border border-border rounded-xl focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-foreground"
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
