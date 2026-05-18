"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { usePortfolio } from "@/lib/context/PortfolioContext";
import type { HoldingState } from "@/lib/portfolio";

interface ChartPoint {
  time: string;
  fonds: number;
}

// Vind de dichtsbijzijnde prijs voor een gegeven timestamp
function closestPrice(prices: [number, number][], ts: number): number {
  let closest = prices[0];
  for (const p of prices) {
    if (Math.abs(p[0] - ts) < Math.abs(closest[0] - ts)) closest = p;
  }
  return closest[1];
}

function computeChartData(
  priceData: Record<string, [number, number][]>,
  holdings: HoldingState[]
): ChartPoint[] {
  const btcPrices = priceData["BTC"];
  if (!btcPrices || btcPrices.length === 0) return [];

  // Sample elk uur (CoinGecko geeft elke ~5 min een punt → elke 12e)
  const step = Math.max(1, Math.floor(btcPrices.length / 24));
  const sampled = btcPrices.filter((_, i) => i % step === 0).slice(-24);

  return sampled.map(([ts]) => {
    // Bereken fondswaarde op dit tijdstip
    const fondsValue = holdings.reduce((sum, h) => {
      if (h.ticker === "USDT") return sum + h.units; // cash = 1:1 USD
      const tickerPrices = priceData[h.ticker];
      if (!tickerPrices) return sum + h.units * h.currentPriceUSD;
      const price = closestPrice(tickerPrices, ts);
      return sum + h.units * price;
    }, 0);

    const time = new Date(ts).toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return { time, fonds: Math.round(fondsValue) };
  });
}

function formatY(value: number) {
  if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
  return `€${value}`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#2a2d3e] bg-[#141820] px-4 py-3 text-sm shadow-xl">
      <p className="mb-1 text-xs text-[#94a3b8]">{label}</p>
      <p className="font-bold tabular-nums text-[#d4a843]">
        €{payload[0].value.toLocaleString("nl-NL")}
      </p>
    </div>
  );
}

export default function PerformanceChart() {
  const { holdings, hasData } = usePortfolio();
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasData) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch("/api/prices")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setChartData(computeChartData(data, holdings));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [holdings, hasData]);

  if (!hasData) return null;

  if (loading) {
    return (
      <div className="card flex h-[280px] items-center justify-center text-sm text-[#4a5568]">
        Prijsdata ophalen…
      </div>
    );
  }

  if (error) {
    return (
      <div className="card flex h-[280px] items-center justify-center text-sm text-[#ef4444]">
        Fout: {error}
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="mb-6 flex items-center justify-between">
        <p className="section-label">Fondswaarde — laatste 24 uur</p>
        <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
          <span className="inline-block h-0.5 w-4 bg-[#d4a843]" />
          Fonds (EUR)
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#1e2230" />
          <XAxis
            dataKey="time"
            tick={{ fill: "#4a5568", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatY}
            tick={{ fill: "#4a5568", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={52}
            domain={["auto", "auto"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="fonds"
            stroke="#d4a843"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#d4a843", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
