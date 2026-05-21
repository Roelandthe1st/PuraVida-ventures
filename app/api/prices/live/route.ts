import { NextResponse } from "next/server";
import { fetchLivePrices } from "@/lib/prices";

/**
 * GET /api/prices/live
 *
 * Returns current prices for BTC, ETH, SOL from CoinGecko.
 * Cached for 60 seconds via Next.js fetch revalidation.
 * No auth required — prices are public data.
 */
export const revalidate = 60;

export async function GET() {
  try {
    const prices = await fetchLivePrices();
    return NextResponse.json(prices);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Live price fetch failed";
    console.error("[api/prices/live] Error:", error);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
