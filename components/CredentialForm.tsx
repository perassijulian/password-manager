"use client";

import { useState } from "react";

export default function CredentialForm() {
  const [form, setForm] = useState({ service: "", username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/credentials/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Credential saved successfully");
        setForm({ service: "", username: "", password: "" });
      } else {
        setMessage(data.error || "Error saving credential");
      }
    } catch (err) {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg space-y-4"
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
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white rounded-xl py-2 font-medium hover:bg-blue-700 transition"
      >
        {loading ? "Saving..." : "Save Credential"}
      </button>

      {message && (
        <p className="text-sm text-center text-gray-700">{message}</p>
      )}
    </form>
  );
}
