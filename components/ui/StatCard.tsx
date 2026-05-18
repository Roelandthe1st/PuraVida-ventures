"use client";

import { useCurrency } from "@/lib/context/CurrencyContext";

interface StatCardProps {
  label: string;
  usdValue?: number;
  value?: string;
  valueClass?: string;
  prefix?: string;
}

export default function StatCard({ label, usdValue, value, valueClass, prefix = "" }: StatCardProps) {
  const { format } = useCurrency();
  const display = usdValue !== undefined ? `${prefix}${format(usdValue)}` : (value ?? "—");

  return (
    <div className="card p-5">
      <p className="section-label mb-3">{label}</p>
      <p className={`text-[1.6rem] font-bold tabular-nums leading-none ${valueClass ?? "text-[#f1f5f9]"}`}>
        {display}
      </p>
    </div>
  );
}
