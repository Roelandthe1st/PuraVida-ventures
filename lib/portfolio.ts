import type { Transaction } from "./mockData";
import { assetMeta } from "./assetMeta";

export interface HoldingState {
  ticker: string;
  name: string;
  color: string;
  units: number;
  avgBuyPriceUSD: number;   // gemiddelde aankoopprijs per unit in USD
  currentPriceUSD: number;  // huidige prijs per unit in USD
  valueUSD: number;         // totale waarde in USD
  costUSD: number;          // totale kostprijs in USD
  plUSD: number;            // winst/verlies in USD
  plPct: number | null;     // winst/verlies in %
  alloc: number;            // allocatie % van totale fondswaarde
}

export interface PortfolioState {
  totalInleg: number;       // USD — som van alle cash inleg
  fondswaarde: number;      // USD — cash + posities
  cashPosition: number;     // USD — niet-geïnvesteerd kapitaal
  positionValues: number;   // USD — waarde van crypto posities
  winst: number;            // USD
  rendement: number;        // %
  btcWaarde: number;        // BTC equivalent van fondswaarde
  holdings: HoldingState[];
  hasData: boolean;
}

export function computePortfolio(
  transactions: Transaction[],
  prices: Record<string, number>
): PortfolioState {
  const empty: PortfolioState = {
    totalInleg: 0, fondswaarde: 0, cashPosition: 0,
    positionValues: 0, winst: 0, rendement: 0,
    btcWaarde: 0, holdings: [], hasData: false,
  };

  if (transactions.length === 0) return empty;

  // Totale cash inleg in USD
  const totalInleg = transactions
    .filter((tx) => tx.type === "Inleg")
    .reduce((sum, tx) => sum + tx.total, 0);

  // Holdings opbouwen + kasboek bijhouden
  const map = new Map<string, { units: number; costUSD: number }>();
  let cashSpentUSD = 0;
  let cashReceivedUSD = 0;

  for (const tx of transactions) {
    if (tx.type === "Koop" && tx.ticker && tx.amount && tx.amount > 0) {
      const prev = map.get(tx.ticker) ?? { units: 0, costUSD: 0 };
      map.set(tx.ticker, {
        units: prev.units + tx.amount,
        costUSD: prev.costUSD + tx.total, // total is al in USD
      });
      cashSpentUSD += tx.total;
    }

    if (tx.type === "Verkoop" && tx.ticker && tx.amount && tx.amount > 0) {
      const prev = map.get(tx.ticker) ?? { units: 0, costUSD: 0 };
      const avgCost = prev.units > 0 ? prev.costUSD / prev.units : 0;
      map.set(tx.ticker, {
        units: Math.max(0, prev.units - tx.amount),
        costUSD: Math.max(0, prev.costUSD - avgCost * tx.amount),
      });
      cashReceivedUSD += tx.total;
    }
  }

  // Kasbalans
  const cashPosition = totalInleg - cashSpentUSD + cashReceivedUSD;

  // Bouw holdings array (alleen crypto, geen cash)
  const holdings: Omit<HoldingState, "alloc">[] = [];
  let positionValues = 0;

  for (const [ticker, { units, costUSD }] of map.entries()) {
    if (units < 0.000001) continue;
    const currentPriceUSD = prices[ticker] ?? 0;
    const valueUSD = units * currentPriceUSD;
    const avgBuyPriceUSD = costUSD > 0 ? costUSD / units : 0;
    const plUSD = valueUSD - costUSD;
    const plPct = costUSD > 0 ? (plUSD / costUSD) * 100 : null;
    const meta = assetMeta[ticker] ?? { name: ticker, color: "#94a3b8" };

    holdings.push({
      ticker, name: meta.name, color: meta.color,
      units, avgBuyPriceUSD, currentPriceUSD,
      valueUSD, costUSD, plUSD, plPct,
    });
    positionValues += valueUSD;
  }

  // Fondswaarde = cash + posities
  const fondswaarde = Math.max(0, cashPosition) + positionValues;
  const winst = fondswaarde - totalInleg;
  const rendement = totalInleg > 0 ? (winst / totalInleg) * 100 : 0;
  const btcWaarde = (prices["BTC"] ?? 1) > 0 ? fondswaarde / prices["BTC"] : 0;

  // Allocatie percentages (t.o.v. totale fondswaarde)
  const holdingsWithAlloc: HoldingState[] = holdings.map((h) => ({
    ...h,
    alloc: fondswaarde > 0 ? (h.valueUSD / fondswaarde) * 100 : 0,
  }));

  holdingsWithAlloc.sort((a, b) => b.valueUSD - a.valueUSD);

  return {
    totalInleg, fondswaarde, cashPosition: Math.max(0, cashPosition),
    positionValues, winst, rendement, btcWaarde,
    holdings: holdingsWithAlloc, hasData: true,
  };
}
