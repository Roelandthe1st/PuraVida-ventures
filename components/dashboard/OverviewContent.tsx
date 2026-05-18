"use client";

import { usePortfolio } from "@/lib/context/PortfolioContext";
import StatCard from "@/components/ui/StatCard";
import HoldingsTable from "@/components/ui/HoldingsTable";
import PeriodTable from "@/components/ui/PeriodTable";
import PerformanceChartWrapper from "@/components/charts/PerformanceChartWrapper";

export default function OverviewContent() {
  const p = usePortfolio();

  if (!p.hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="mb-4 text-4xl">📊</div>
        <h2 className="mb-2 text-xl font-semibold text-[#f1f5f9]">Geen data</h2>
        <p className="text-sm text-[#6b7280]">
          Voeg een transactie toe op de{" "}
          <span className="text-[#d4a843]">Transacties</span>-pagina om je portfolio te zien.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fondssamenvatting — 4 KPI's */}
      <div>
        <p className="section-label mb-3">Fondssamenvatting</p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Totale inleg"    usdValue={p.totalInleg} />
          <StatCard label="Fondswaarde"     usdValue={p.fondswaarde} />
          <StatCard label="Cashpositie"     usdValue={p.cashPosition} />
          <StatCard label="Positiewaarden"  usdValue={p.positionValues} />
        </div>
      </div>

      {/* Holdings tabel */}
      <HoldingsTable />

      {/* Grafiek */}
      <PerformanceChartWrapper />

      {/* Periode rendement */}
      <PeriodTable rendement={p.rendement} />
    </div>
  );
}
