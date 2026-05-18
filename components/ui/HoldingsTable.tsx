"use client";

import { usePortfolio } from "@/lib/context/PortfolioContext";
import { useCurrency } from "@/lib/context/CurrencyContext";

function AllocationBar({ color, pct }: { color: string; pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#1e2230]">
        <div className="h-full rounded-full" style={{ width: `${Math.min(pct * 2, 100)}%`, backgroundColor: color }} />
      </div>
      <span className="w-10 text-right text-xs text-[#6b7280]">{pct.toFixed(1)}%</span>
    </div>
  );
}

export default function HoldingsTable() {
  const { holdings, cashPosition, fondswaarde } = usePortfolio();
  const { format, formatSmall } = useCurrency();
  const cashAlloc = fondswaarde > 0 ? (cashPosition / fondswaarde) * 100 : 0;

  return (
    <div className="card overflow-hidden">
      <div className="px-6 pt-5 pb-4">
        <p className="section-label">Holdings per munt</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-b border-[#1e2230]">
              {["Munt", "Hoeveelheid", "Aankoopprijs", "Huidige prijs", "Waarde", "P&L", "P&L %", "Allocatie"].map((h) => (
                <th key={h} className="px-6 py-3 text-left"
                  style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a5568" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {holdings.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-sm text-[#4a5568]">
                  Geen posities — voeg een Koop-transactie toe.
                </td>
              </tr>
            ) : (
              holdings.map((h, i) => (
                <tr key={h.ticker}
                  className={`border-b border-[#1a1e2a] transition-colors hover:bg-[#1a1e2a] ${i === holdings.length - 1 ? "border-transparent" : ""}`}>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: h.color }} />
                      <span className="font-medium text-[#f1f5f9]">{h.name}</span>
                      <span className="text-xs text-[#4a5568]">{h.ticker}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 tabular-nums text-[#f1f5f9]">
                    {h.units.toLocaleString("nl-NL", { minimumFractionDigits: 4, maximumFractionDigits: 8 })}
                  </td>

                  <td className="px-6 py-4 tabular-nums text-[#94a3b8]">
                    {formatSmall(h.avgBuyPriceUSD)}
                  </td>

                  <td className="px-6 py-4 tabular-nums text-[#94a3b8]">
                    {formatSmall(h.currentPriceUSD)}
                  </td>

                  <td className="px-6 py-4 tabular-nums font-medium text-[#f1f5f9]">
                    {format(h.valueUSD)}
                  </td>

                  <td className="px-6 py-4 tabular-nums">
                    {h.plUSD === 0 || h.plPct === null ? (
                      <span className="text-[#4a5568]">—</span>
                    ) : (
                      <span className={h.plUSD >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}>
                        {h.plUSD >= 0 ? "+" : ""}{format(h.plUSD)}
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 tabular-nums">
                    {h.plPct === null ? (
                      <span className="text-[#4a5568]">—</span>
                    ) : (
                      <span className={h.plPct >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}>
                        {h.plPct >= 0 ? "+" : ""}{h.plPct.toFixed(1).replace(".", ",")}%
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <AllocationBar color={h.color} pct={h.alloc} />
                  </td>
                </tr>
              ))
            )}

            {/* Cash / Inleg rij */}
            {cashPosition > 0 && (
              <tr className="border-t border-[#2a2d3e] transition-colors hover:bg-[#1a1e2a]">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#26a17b]" />
                    <span className="font-medium text-[#f1f5f9]">Cash</span>
                    <span className="text-xs text-[#4a5568]">USD</span>
                  </div>
                </td>
                <td className="px-6 py-4 tabular-nums text-[#f1f5f9]">
                  {format(cashPosition)}
                </td>
                <td className="px-6 py-4 text-[#4a5568]">—</td>
                <td className="px-6 py-4 text-[#4a5568]">—</td>
                <td className="px-6 py-4 tabular-nums font-medium text-[#f1f5f9]">
                  {format(cashPosition)}
                </td>
                <td className="px-6 py-4 text-[#4a5568]">—</td>
                <td className="px-6 py-4 text-[#4a5568]">—</td>
                <td className="px-6 py-4">
                  <AllocationBar color="#26a17b" pct={cashAlloc} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
