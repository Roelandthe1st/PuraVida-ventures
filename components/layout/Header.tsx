"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { funds } from "@/lib/mockData";
import { useCurrency, type Currency } from "@/lib/context/CurrencyContext";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/overview",     label: "Dashboard" },
  { href: "/transactions", label: "Transacties" },
  { href: "/fund-info",    label: "Fonds Info" },
  { href: "/reports",      label: "Rapporten" },
  { href: "/settings",     label: "Instellingen" },
];

const currencies: Currency[] = ["USD", "BTC"];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedFund, setSelectedFund] = useState(funds[0].id);
  const { currency, setCurrency } = useCurrency();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#1e2230] bg-[#0c0e14]">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="flex h-16 items-center justify-between">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-white">PURA VIDA </span>
            <span className="text-[#d4a843]">VENTURES</span>
          </span>

          <div className="flex items-center gap-4">
            {/* Valuta switcher */}
            <div className="flex overflow-hidden rounded-md border border-[#2a2d3e]">
              {currencies.map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                    currency === c
                      ? "bg-[#d4a843] text-[#0c0e14]"
                      : "text-[#6b7280] hover:bg-[#1a1e2a] hover:text-[#f1f5f9]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Fund selector */}
            <select
              value={selectedFund}
              onChange={(e) => setSelectedFund(e.target.value)}
              className="rounded-md border border-[#2a2d3e] bg-[#1a1e2a] px-4 py-2 text-sm text-[#f1f5f9] outline-none focus:border-[#d4a843]"
            >
              {funds.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="rounded-md border border-[#2a2d3e] px-3 py-2 text-xs text-[#6b7280] transition-colors hover:border-[#ef4444] hover:text-[#ef4444]"
            >
              Uitloggen
            </button>
          </div>
        </div>

        <nav className="flex gap-1">
          {navItems.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "border-[#d4a843] text-[#d4a843]"
                    : "border-transparent text-[#6b7280] hover:text-[#f1f5f9]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
