"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Ongeldig e-mailadres of wachtwoord.");
      setLoading(false);
      return;
    }

    router.push("/overview");
    router.refresh();
  }

  return (
    <div className="card p-8">
      <h1 className="mb-1 text-xl font-semibold text-[#f1f5f9]">Inloggen</h1>
      <p className="mb-6 text-sm text-[#6b7280]">Welkom terug</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm text-[#94a3b8]">E-mailadres</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jij@voorbeeld.nl"
            className="w-full rounded-lg border border-[#2a2d3e] bg-[#1a1e2a] px-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[#4a5568] outline-none transition-colors focus:border-[#d4a843]"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm text-[#94a3b8]">Wachtwoord</label>
            <Link href="/forgot-password" className="text-xs text-[#d4a843] hover:underline">
              Vergeten?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-[#2a2d3e] bg-[#1a1e2a] px-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[#4a5568] outline-none transition-colors focus:border-[#d4a843]"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-[#450a0a] px-4 py-2.5 text-sm text-[#ef4444]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#d4a843] py-2.5 text-sm font-semibold text-[#0c0e14] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Bezig…" : "Inloggen"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#6b7280]">
        Nog geen account?{" "}
        <Link href="/signup" className="text-[#d4a843] hover:underline">
          Aanmaken
        </Link>
      </p>
    </div>
  );
}
