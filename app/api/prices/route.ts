import { NextResponse } from "next/server";

// CoinGecko coin IDs
const COINS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
};

// Cache 5 minuten — voorkomt rate limiting bij CoinGecko
export const revalidate = 300;

export async function GET() {
  try {
    const results = await Promise.all(
      Object.entries(COINS).map(async ([ticker, id]) => {
        const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=1&precision=2`;
        const res = await fetch(url, {
          headers: { Accept: "application/json" },
          next: { revalidate: 300 },
        });

        if (!res.ok) {
          throw new Error(`CoinGecko fout voor ${ticker}: ${res.status}`);
        }

        const data = await res.json();
        // data.prices = [[timestamp_ms, price], ...]
        return [ticker, data.prices as [number, number][]] as const;
      })
    );

    const prices = Object.fromEntries(results);
    return NextResponse.json(prices);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Ophalen mislukt" },
      { status: 500 }
    );
  }
}
