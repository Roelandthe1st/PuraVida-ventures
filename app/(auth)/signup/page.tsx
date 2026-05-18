"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Wachtwoord moet minimaal 8 tekens bevatten.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || email.split("@")[0] },
      },
    });

    if (error) {
      setError(error.message === "User already registered"
        ? "Dit e-mailadres is al in gebruik."
        : "Er ging iets mis. Probeer het opnieuw.");
      setLoading(false);
      return;
    }

    router.push("/overview");
    router.refresh();
  }

  return (
    <div className="card p-8">
      <h1 className="mb-1 text-xl font-semibold text-[#f1f5f9]">Account aanmaken</h1>
      <p className="mb-6 text-sm text-[#6b7280]">Start met tracken</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm text-[#94a3b8]">Naam (optioneel)</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Jouw naam"
            className="w-full rounded-lg border border-[#2a2d3e] bg-[#1a1e2a] px-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[#4a5568] outline-none transition-colors focus:border-[#d4a843]"
          />
        </div>

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
          <label className="mb-1.5 block text-sm text-[#94a3b8]">Wachtwoord</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimaal 8 tekens"
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
          {loading ? "Bezig…" : "Account aanmaken"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#6b7280]">
        Al een account?{" "}
        <Link href="/login" className="text-[#d4a843] hover:underline">
          Inloggen
        </Link>
      </p>
    </div>
  );
}
