"use client";

import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import { useTransactions } from "./TransactionsContext";
import { computePortfolio, type PortfolioState } from "@/lib/portfolio";
import { currentPrices as fallbackPrices } from "@/lib/currentPrices";

const PortfolioContext = createContext<PortfolioState | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const { transactions } = useTransactions();
  const [livePrices, setLivePrices] = useState<Record<string, number>>(fallbackPrices);

  useEffect(() => {
    fetch("/api/current-prices")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setLivePrices({ ...fallbackPrices, ...data });
      })
      .catch(() => {/* gebruik fallback bij fout */});
  }, []);

  const portfolio = useMemo(
    () => computePortfolio(transactions, livePrices),
    [transactions, livePrices]
  );

  return (
    <PortfolioContext.Provider value={portfolio}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio vereist PortfolioProvider");
  return ctx;
}
