"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CredentialForm from "@/components/CredentialForm";
import CredentialsList from "@/components/CredentialsList";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/me");
      if (res.ok) {
        const data = await res.json();
        setUserId(data.userId);
      } else {
        router.push("/login");
      }
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="relative min-h-screen p-4 pb-28 w-full">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <CredentialsList />
      <CredentialForm />
    </div>
  );
}
