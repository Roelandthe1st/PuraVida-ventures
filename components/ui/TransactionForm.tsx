"use client";

import { useState } from "react";
import { useTransactions } from "@/lib/context/TransactionsContext";
import type { TransactionType } from "@/lib/mockData";

const assets = [
  { value: "BTC", label: "Bitcoin (BTC)" },
  { value: "ETH", label: "Ethereum (ETH)" },
  { value: "SOL", label: "Solana (SOL)" },
  { value: "USDT", label: "Cash (USDT)" },
];

const assetNames: Record<string, string> = {
  BTC: "Bitcoin", ETH: "Ethereum", SOL: "Solana", USDT: "Cash",
};

const exchanges = ["Bitvavo", "OTC", "Bankoverschrijving", "Kraken", "Coinbase"];

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function formatDateNL(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" });
}

export default function TransactionForm() {
  const { addTransaction } = useTransactions();
  const [type, setType] = useState<TransactionType>("Koop");
  const [asset, setAsset] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(todayISO());
  const [exchange, setExchange] = useState("Bitvavo");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isInleg = type === "Inleg";
  const qty = parseFloat(amount || "0");
  const px = parseFloat(price || "0");
  const total = isInleg ? px : qty * px;

  async function handleSave() {
    if (total <= 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      await addTransaction({
        date: formatDateNL(date),
        type,
        asset: isInleg ? null : assetNames[asset],
        ticker: isInleg ? null : asset,
        amount: isInleg ? null : (qty || null),
        price: isInleg ? null : (px || null),
        currency: "USD",
        total,
        exchange,
      });
      // Reset form
      setAmount("");
      setPrice("");
      setDate(todayISO());
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setSaveError(e.message ?? "Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-6">
      <p className="section-label mb-5">Nieuwe transactie</p>

      {/* Type selector */}
      <div className="mb-6">
        <p className="mb-3 text-sm text-[#94a3b8]">Type</p>
        <div className="flex gap-2">
          {(["Koop", "Verkoop", "Inleg"] as TransactionType[]).map((t) => (
            <button
              key={t}
              onClick={() => { setType(t); setExchange(t === "Inleg" ? "" : "Bitvavo"); }}
              className={`rounded-md px-5 py-2 text-sm font-medium transition-colors ${
                type === t
                  ? t === "Koop"
                    ? "bg-[#14532d] text-[#22c55e]"
                    : t === "Verkoop"
                    ? "bg-[#450a0a] text-[#ef4444]"
                    : "bg-[#451a03] text-[#d4a843]"
                  : "bg-[#1a1e2a] text-[#6b7280] hover:text-[#94a3b8]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {!isInleg && (
          <div>
            <label className="mb-1.5 block text-sm text-[#94a3b8]">Asset</label>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="w-full rounded-md border border-[#2a2d3e] bg-[#1a1e2a] px-3 py-2.5 text-sm text-[#f1f5f9] outline-none focus:border-[#d4a843]"
            >
              {assets.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
        )}

        {!isInleg && (
          <div>
            <label className="mb-1.5 block text-sm text-[#94a3b8]">Hoeveelheid</label>
            <input
              type="number"
              step="0.0001"
              min="0"
              placeholder="0.0000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md border border-[#2a2d3e] bg-[#1a1e2a] px-3 py-2.5 text-sm text-[#f1f5f9] outline-none focus:border-[#d4a843] [appearance:textfield]"
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm text-[#94a3b8]">
            {isInleg ? "Bedrag (USD)" : "Prijs (USD)"}
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-md border border-[#2a2d3e] bg-[#1a1e2a] px-3 py-2.5 text-sm text-[#f1f5f9] outline-none focus:border-[#d4a843] [appearance:textfield]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-[#94a3b8]">Datum</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-[#2a2d3e] bg-[#1a1e2a] px-3 py-2.5 text-sm text-[#f1f5f9] outline-none focus:border-[#d4a843]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-[#94a3b8]">
            {isInleg ? "Omschrijving" : "Exchange"}
          </label>
          {isInleg ? (
            <input
              type="text"
              placeholder="bijv. Bankoverschrijving"
              value={exchange}
              onChange={(e) => setExchange(e.target.value)}
              className="w-full rounded-md border border-[#2a2d3e] bg-[#1a1e2a] px-3 py-2.5 text-sm text-[#f1f5f9] placeholder-[#4a5568] outline-none focus:border-[#d4a843]"
            />
          ) : (
            <select
              value={exchange}
              onChange={(e) => setExchange(e.target.value)}
              className="w-full rounded-md border border-[#2a2d3e] bg-[#1a1e2a] px-3 py-2.5 text-sm text-[#f1f5f9] outline-none focus:border-[#d4a843]"
            >
              {exchanges.map((ex) => (
                <option key={ex} value={ex}>{ex}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Totaal */}
      {total > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-md border border-[#d4a843]/20 bg-[#d4a843]/5 px-5 py-4">
          <div>
            <p className="text-sm text-[#94a3b8]">Totaalbedrag</p>
            <p className="text-xs text-[#4a5568]">
              {isInleg ? "Inleg" : "Hoeveelheid × prijs"}
            </p>
          </div>
          <p className="text-xl font-bold tabular-nums text-[#d4a843]">
            {isInleg ? "€" : "$"}
            {total.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      )}

      {/* Submit */}
      <div className="mt-5 flex items-center justify-end gap-4">
        {saved && (
          <span className="text-sm font-medium text-[#22c55e]">✓ Opgeslagen</span>
        )}
        {saveError && (
          <span className="text-sm text-[#ef4444]">{saveError}</span>
        )}
        <button
          onClick={handleSave}
          disabled={total <= 0 || saving}
          className="rounded-md bg-[#d4a843] px-6 py-2.5 text-sm font-semibold text-[#0c0e14] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Opslaan…" : "Transactie opslaan"}
        </button>
      </div>
    </div>
  );
}
