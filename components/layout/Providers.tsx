"use client";

import { CurrencyProvider } from "@/lib/context/CurrencyContext";
import { TransactionsProvider } from "@/lib/context/TransactionsContext";
import { PortfolioProvider } from "@/lib/context/PortfolioContext";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CurrencyProvider>
      <TransactionsProvider>
        <PortfolioProvider>
          {children}
        </PortfolioProvider>
      </TransactionsProvider>
    </CurrencyProvider>
  );
}
