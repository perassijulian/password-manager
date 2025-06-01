"use client";

import Button from "@/components/Button";
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
          <Button onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
          <Button asChild variant="tertiary">
            <a
              href="https://github.com/perassijulian/password-manager"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </Button>
        </div>
      </div>
    </main>
  );
}
