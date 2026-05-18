"use client";

import { useState } from "react";
import { useTransactions } from "@/lib/context/TransactionsContext";
import type { TransactionType } from "@/lib/mockData";

const badgeStyles: Record<TransactionType, string> = {
  Koop:    "bg-[#14532d] text-[#22c55e]",
  Verkoop: "bg-[#450a0a] text-[#ef4444]",
  Inleg:   "bg-[#451a03] text-[#d4a843]",
};

export default function TransactionTable() {
  const { transactions, loading, error, removeTransaction } = useTransactions();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await removeTransaction(id);
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="card flex items-center justify-center py-16 text-sm text-[#4a5568]">
        Transacties laden…
      </div>
    );
  }

  if (error) {
    return (
      <div className="card flex items-center justify-center py-16 text-sm text-[#ef4444]">
        Fout bij laden: {error}
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-6 pt-5 pb-4">
        <p className="section-label">Transactiehistorie</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-b border-[#1e2230]">
              {["Datum", "Type", "Asset", "Hoeveelheid", "Prijs", "Totaal", "Exchange", ""].map((h, i) => (
                <th
                  key={i}
                  className="px-6 py-3 text-left"
                  style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a5568" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-sm text-[#4a5568]">
                  Geen transacties — voer er een in via het formulier hierboven.
                </td>
              </tr>
            ) : (
              transactions.map((tx, i) => (
                <tr
                  key={tx.id}
                  className={`border-b border-[#1a1e2a] transition-colors hover:bg-[#1a1e2a] ${
                    i === transactions.length - 1 ? "border-transparent" : ""
                  }`}
                >
                  <td className="px-6 py-4 text-sm text-[#94a3b8]">{tx.date}</td>

                  <td className="px-6 py-4">
                    <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${badgeStyles[tx.type]}`}>
                      {tx.type}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-medium text-[#f1f5f9]">
                    {tx.asset ? (
                      <>
                        {tx.asset}
                        <span className="ml-1.5 text-xs text-[#4a5568]">({tx.ticker})</span>
                      </>
                    ) : (
                      <span className="text-[#4a5568]">—</span>
                    )}
                  </td>

                  <td className="px-6 py-4 tabular-nums text-sm text-[#94a3b8]">
                    {tx.amount !== null && tx.ticker
                      ? `${Number(tx.amount).toLocaleString("nl-NL", { minimumFractionDigits: 4 })} ${tx.ticker}`
                      : <span className="text-[#4a5568]">—</span>}
                  </td>

                  <td className="px-6 py-4 tabular-nums text-sm text-[#94a3b8]">
                    {tx.price !== null
                      ? `$${Number(tx.price).toLocaleString("nl-NL")}`
                      : <span className="text-[#4a5568]">—</span>}
                  </td>

                  <td className="px-6 py-4 tabular-nums font-medium text-[#f1f5f9]">
                    {tx.currency === "EUR" ? "€" : "$"}
                    {Number(tx.total).toLocaleString("nl-NL")}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#94a3b8]">{tx.exchange}</td>

                  {/* Verwijder knop */}
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleDelete(tx.id)}
                      disabled={deleting === tx.id}
                      className="rounded p-1.5 text-[#4a5568] transition-colors hover:bg-[#450a0a] hover:text-[#ef4444] disabled:opacity-40"
                      title="Verwijder transactie"
                    >
                      {deleting === tx.id ? (
                        <span className="text-xs">…</span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
