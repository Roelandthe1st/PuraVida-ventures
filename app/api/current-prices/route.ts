import { NextResponse } from "next/server";

export const revalidate = 300; // 5 minuten cache

const IDS = "bitcoin,ethereum,solana";
const TICKER_MAP: Record<string, string> = {
  bitcoin: "BTC",
  ethereum: "ETH",
  solana: "SOL",
};

export async function GET() {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${IDS}&vs_currencies=usd`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });

    if (!res.ok) throw new Error(`CoinGecko: ${res.status}`);

    const data = await res.json();

    // { bitcoin: { usd: 83400 }, ... } → { BTC: 83400, ETH: 2550, SOL: 144 }
    const prices: Record<string, number> = { USDT: 1 };
    for (const [id, val] of Object.entries(data as Record<string, { usd: number }>)) {
      const ticker = TICKER_MAP[id];
      if (ticker) prices[ticker] = val.usd;
    }

    return NextResponse.json(prices);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Ophalen mislukt" },
      { status: 500 }
    );
  }
}
