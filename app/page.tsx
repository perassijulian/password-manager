"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-white to-gray-100">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
          Secure. Simple. Modern. Password manager with 2FA
        </h1>
        <p className="text-lg text-gray-600 mb-10">
          We're implementing encrypted storage, Two-Factor Authentication, and
          current best practices to protect user data. Designed with clarity,
          privacy, and performance in mind — this app is both a security tool
          and a learning showcase.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </button>

          <a
            href="https://github.com/perassijulian/password-manager"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl border border-gray-300 text-gray-800 hover:bg-gray-100 transition"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </main>
  );
}
