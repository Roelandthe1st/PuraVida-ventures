"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Currency = "USD" | "BTC";

export const BTC_PRICE_USD = 83400; // fallback — wordt live bijgewerkt

export function formatCurrencyValue(usdValue: number, currency: Currency, btcPrice = BTC_PRICE_USD): string {
  if (currency === "BTC") {
    const btc = usdValue / btcPrice;
    return `${btc.toFixed(4).replace(".", ",")} BTC`;
  }
  return `$${usdValue.toLocaleString("nl-NL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function formatSmallValue(usdValue: number, currency: Currency, btcPrice = BTC_PRICE_USD): string {
  if (currency === "BTC") {
    const btc = usdValue / btcPrice;
    return `${btc.toFixed(6).replace(".", ",")} BTC`;
  }
  return `$${usdValue.toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (usdValue: number) => string;
  formatSmall: (usdValue: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("USD");

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      format: (v) => formatCurrencyValue(v, currency),
      formatSmall: (v) => formatSmallValue(v, currency),
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency vereist CurrencyProvider");
  return ctx;
}
