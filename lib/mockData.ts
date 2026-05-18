export const funds = [
  { id: "strategisch-btc", name: "Strategisch — Bitcoin Focused" },
  { id: "balanced", name: "Balanced — Multi Asset" },
];

export const fundSummary = {
  totalInleg: 136120,
  fondswaarde: 184320,
  rendement: 35.4,
  winst: 48200,
  rendementPeriode: 8.4,
  btcWaarde: 2.2108,
  winstPeriode: 14320,
};

export const holdings = [
  {
    name: "Bitcoin",
    ticker: "BTC",
    color: "#f7931a",
    amount: 1.0,
    buyPrice: 75779,
    currentPrice: 78400,
    value: 78400,
    pl: 7060,
    plPct: 10.1,
    alloc: 42.6,
  },
  {
    name: "Ethereum",
    ticker: "ETH",
    color: "#627eea",
    amount: 12.5,
    buyPrice: 30625,
    currentPrice: 29000,
    value: 29000,
    pl: -1625,
    plPct: -5.3,
    alloc: 15.7,
  },
  {
    name: "Solana",
    ticker: "SOL",
    color: "#14f195",
    amount: 85.0,
    buyPrice: 7225,
    currentPrice: 7260,
    value: 7260,
    pl: 95,
    plPct: 1.3,
    alloc: 3.9,
  },
  {
    name: "Cash",
    ticker: "USDT",
    color: "#26a17b",
    amount: 5520.0,
    buyPrice: 5070,
    currentPrice: 5070,
    value: 5070,
    pl: null,
    plPct: null,
    alloc: 2.7,
  },
];

export const chartData = [
  { date: "1 apr", fonds: 168200, btc: 169000 },
  { date: "5 apr", fonds: 170500, btc: 170200 },
  { date: "8 apr", fonds: 173800, btc: 172500 },
  { date: "12 apr", fonds: 175200, btc: 173800 },
  { date: "15 apr", fonds: 177100, btc: 175000 },
  { date: "19 apr", fonds: 179400, btc: 176500 },
  { date: "22 apr", fonds: 181300, btc: 178200 },
  { date: "26 apr", fonds: 182900, btc: 179800 },
  { date: "29 apr", fonds: 184320, btc: 181100 },
];

export const periodReturns = [
  { label: "Vandaag", fonds: 2.1, benchmark: 0.4 },
  { label: "Deze week", fonds: 5.3, benchmark: 1.1 },
  { label: "Deze maand", fonds: 8.4, benchmark: 2.2 },
  { label: "Dit jaar", fonds: 31.7, benchmark: 9.6 },
  { label: "All-time", fonds: 35.4, benchmark: 11.3 },
];

export type TransactionType = "Koop" | "Verkoop" | "Inleg";

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  asset: string | null;
  ticker: string | null;
  amount: number | null;
  price: number | null;
  currency: "USD" | "EUR";
  total: number;
  exchange: string;
}

export const transactions: Transaction[] = [];
