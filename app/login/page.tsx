"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signupSchema } from "@/schemas/userSchema";

type FormData = z.infer<typeof signupSchema>;

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(signupSchema) });
  const router = useRouter();
  const [error, setError] = useState("");

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        result.requires2FA
          ? router.push("/2fa/verify")
          : router.push("/2fa/setup");
      } else {
        setError(result.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again later.");
      return;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Login</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div>
          <label>Email</label>
          <input
            {...register("email")}
            className="w-full border px-3 py-2 rounded mt-1"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            {...register("password")}
            className="w-full border px-3 py-2 rounded mt-1"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
        >
          Login
        </button>
        <p className="text-center text-sm text-gray-500">
          By logging in, you agree to our{" "}
          <a href="/terms" className="text-blue-500 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-blue-500 hover:underline">
            Privacy Policy
          </a>
          .
        </p>
        <p className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </a>
        </p>
      </form>
    </div>
  );
}
