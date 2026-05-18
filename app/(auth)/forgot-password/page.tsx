"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="card p-8 text-center">
        <div className="mb-4 text-4xl">📬</div>
        <h1 className="mb-2 text-xl font-semibold text-[#f1f5f9]">Check je inbox</h1>
        <p className="mb-6 text-sm text-[#6b7280]">
          Als dit e-mailadres bekend is, ontvang je een resetlink.
        </p>
        <Link href="/login" className="text-sm text-[#d4a843] hover:underline">
          Terug naar inloggen
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-8">
      <h1 className="mb-1 text-xl font-semibold text-[#f1f5f9]">Wachtwoord vergeten</h1>
      <p className="mb-6 text-sm text-[#6b7280]">We sturen je een resetlink</p>

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

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#d4a843] py-2.5 text-sm font-semibold text-[#0c0e14] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Versturen…" : "Stuur resetlink"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#6b7280]">
        <Link href="/login" className="text-[#d4a843] hover:underline">
          Terug naar inloggen
        </Link>
      </p>
    </div>
  );
}
