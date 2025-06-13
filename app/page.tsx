import Button from "@/components/Button";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6">
      <div className="absolute top-4 right-4">
        <ThemeToggleButton />
      </div>
      <div className="max-w-2xl text-center">
        <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl mb-6">
          Secure. Simple. Modern. Password manager with 2FA
        </h1>
        <p className="text-foreground-secondary text-lg mb-10">
          We're implementing encrypted storage, Two-Factor Authentication, and
          current best practices to protect user data. Designed with clarity,
          privacy, and performance in mind — this app is both a security tool
          and a learning showcase.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="terciary">
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
