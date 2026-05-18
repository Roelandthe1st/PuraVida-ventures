"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useTransactions } from "./TransactionsContext";
import { computePortfolio, type PortfolioState } from "@/lib/portfolio";
import { currentPrices } from "@/lib/currentPrices";

const PortfolioContext = createContext<PortfolioState | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const { transactions } = useTransactions();

  const portfolio = useMemo(
    () => computePortfolio(transactions, currentPrices),
    [transactions]
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
