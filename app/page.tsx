import Button from "@/components/UI/Button";
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

        <div className="flex items-center justify-center gap-2">
          <Link href="/dashboard" className="w-full">
            <Button asChild>Go to Dashboard</Button>
          </Link>

          <a
            href="https://github.com/perassijulian/password-manager"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button asChild variant="terciary">
              View on GitHub
            </Button>
          </a>
        </div>
      </div>
    </main>
  );
}
