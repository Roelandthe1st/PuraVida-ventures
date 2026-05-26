import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Asset = "BTC" | "ETH" | "SOL";
export type PriceSource = "live" | "daily_close";

export interface PriceResult {
  price: number;
  source: PriceSource;
  /** The date the price is valid for */
  date: Date;
}

export interface LivePrices {
  btc: { price: number; change24h: number };
  eth: { price: number; change24h: number };
  sol: { price: number; change24h: number };
  fetchedAt: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

export const COIN_IDS: Record<Asset, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
};

/** Threshold in hours: dates older than this use stored close prices */
const LIVE_THRESHOLD_HOURS = 24;

// ─── Utilities ───────────────────────────────────────────────────────────────

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Convert a Date to a UTC date string (YYYY-MM-DD).
 * This is the key used for close_date in Supabase.
 */
export function toUTCDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// ─── CoinGecko fetch with exponential backoff ─────────────────────────────

/**
 * Fetch from CoinGecko with up to 3 retries (1s, 3s, 9s backoff).
 * Adds the API key header if COINGECKO_API_KEY is set.
 */
export async function cgFetch(path: string): Promise<unknown> {
  const key = process.env.COINGECKO_API_KEY;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (key) headers["x-cg-demo-api-key"] = key;

  const url = `${COINGECKO_BASE}${path}`;
  const delays = [1000, 3000, 9000];

  let lastError: Error = new Error("Unknown error");

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers, cache: "no-store" });

      if (res.ok) return res.json();

      // Rate limit or server error: retry
      if ((res.status === 429 || res.status >= 500) && attempt < 2) {
        await sleep(delays[attempt]);
        continue;
      }

      lastError = new Error(`CoinGecko HTTP ${res.status} for ${path}`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < 2) await sleep(delays[attempt]);
    }
  }

  throw lastError;
}

// ─── Live prices (< 24h) ─────────────────────────────────────────────────────

/**
 * Fetch current prices for all three assets from CoinGecko.
 * Cached for 60 seconds via Next.js fetch cache.
 */
export async function fetchLivePrices(): Promise<LivePrices> {
  const key = process.env.COINGECKO_API_KEY;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (key) headers["x-cg-demo-api-key"] = key;

  const url = `${COINGECKO_BASE}/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true`;

  const res = await fetch(url, {
    headers,
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`CoinGecko live price fetch failed: ${res.status}`);
  }

  const data = (await res.json()) as Record<
    string,
    { usd: number; usd_24h_change: number }
  >;

  return {
    btc: {
      price: data.bitcoin?.usd ?? 0,
      change24h: data.bitcoin?.usd_24h_change ?? 0,
    },
    eth: {
      price: data.ethereum?.usd ?? 0,
      change24h: data.ethereum?.usd_24h_change ?? 0,
    },
    sol: {
      price: data.solana?.usd ?? 0,
      change24h: data.solana?.usd_24h_change ?? 0,
    },
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Get the current price for a specific asset.
 * Extracted from fetchLivePrices for convenience.
 */
async function getLivePrice(asset: Asset): Promise<number> {
  const prices = await fetchLivePrices();
  const map: Record<Asset, number> = {
    BTC: prices.btc.price,
    ETH: prices.eth.price,
    SOL: prices.sol.price,
  };
  return map[asset];
}

// ─── Historical close price fetch (for cron & backfill) ──────────────────────

/**
 * Fetch yesterday's UTC close price from CoinGecko.
 *
 * Strategy: request the last 2 days of data (hourly granularity).
 * The "close" of yesterday UTC = the last data point at or before
 * 00:00 UTC today (i.e., the highest timestamp <= todayMidnightUTC).
 *
 * Comment: CoinGecko does not always return an exact 00:00 UTC point.
 * We therefore take the last available point before midnight UTC as the
 * close price — this is accurate to within one hour for the free tier.
 */
export async function fetchYesterdayClose(
  asset: Asset
): Promise<{ date: string; price: number }> {
  const coinId = COIN_IDS[asset];
  const data = (await cgFetch(
    `/coins/${coinId}/market_chart?vs_currency=usd&days=2`
  )) as { prices: [number, number][] };

  const now = new Date();
  const todayMidnightUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  const yesterdayDate = new Date(todayMidnightUTC - 24 * 3_600_000);
  const yesterdayStr = toUTCDateString(yesterdayDate);

  // Sort ascending and find the last point at or before today midnight UTC
  const sorted = [...data.prices].sort(([a], [b]) => a - b);
  let closePrice: number | null = null;
  for (const [ts, price] of sorted) {
    if (ts <= todayMidnightUTC) {
      closePrice = price;
    } else {
      break;
    }
  }

  if (closePrice === null) {
    throw new Error(
      `[prices] No close price found for ${asset} on ${yesterdayStr}`
    );
  }

  return { date: yesterdayStr, price: closePrice };
}

/**
 * Fetch daily close prices for a date range via CoinGecko market_chart.
 *
 * NOTE: /market_chart/range requires a paid CoinGecko plan. Instead we use
 * /market_chart?days=X which is available on the demo (free) tier.
 * For ranges > 90 days CoinGecko automatically returns daily granularity.
 * For ranges ≤ 90 days it returns hourly data — we group by UTC date and take
 * the last price per day as the close price.
 *
 * Limitation: the `days` parameter counts back from TODAY, so we fetch the
 * full range and then filter to the requested [from, to] window.
 *
 * Returns a map of YYYY-MM-DD → price in USD.
 */
export async function fetchPriceRange(
  asset: Asset,
  from: Date,
  to: Date
): Promise<Map<string, number>> {
  const coinId = COIN_IDS[asset];
  const now = new Date();
  const daysBack = Math.ceil((now.getTime() - from.getTime()) / 86_400_000) + 1;

  // Note: interval=daily is a paid-only param. For >90 days CoinGecko
  // automatically returns daily granularity, so we omit it.
  const data = (await cgFetch(
    `/coins/${coinId}/market_chart?vs_currency=usd&days=${daysBack}`
  )) as { prices: [number, number][] };

  const fromStr = toUTCDateString(from);
  const toStr   = toUTCDateString(to);

  // Group by UTC date, take the latest timestamp per day, filter to requested range
  const byDate = new Map<string, { ts: number; price: number }>();
  for (const [ts, price] of data.prices) {
    const dateStr = toUTCDateString(new Date(ts));
    if (dateStr < fromStr || dateStr > toStr) continue;
    const existing = byDate.get(dateStr);
    if (!existing || ts > existing.ts) {
      byDate.set(dateStr, { ts, price });
    }
  }

  return new Map([...byDate.entries()].map(([d, v]) => [d, v.price]));
}

// ─── Unified read layer ───────────────────────────────────────────────────────

/**
 * Get the price of an asset on a given date.
 *
 * - date < 24h ago → fetch from CoinGecko live API (source: 'live')
 * - date >= 24h ago → read from Supabase daily_close_prices (source: 'daily_close')
 *   - If exact date is missing, fall back to the nearest earlier close price
 *     and log a warning (gap in historical data).
 */
export async function getPriceForDate(
  asset: Asset,
  date: Date
): Promise<PriceResult> {
  const hoursAgo = (Date.now() - date.getTime()) / 3_600_000;

  if (hoursAgo < LIVE_THRESHOLD_HOURS) {
    const price = await getLivePrice(asset);
    return { price, source: "live", date: new Date() };
  }

  const closeDate = toUTCDateString(date);
  const supabase = createAdminClient();

  // Try exact date first
  const { data: exact } = await supabase
    .from("daily_close_prices")
    .select("close_price, close_date")
    .eq("asset", asset)
    .eq("close_date", closeDate)
    .maybeSingle();

  if (exact) {
    return {
      price: Number(exact.close_price),
      source: "daily_close",
      date: new Date(exact.close_date),
    };
  }

  // Fallback: nearest earlier close price
  console.warn(
    `[prices] Gap detected: no close price for ${asset} on ${closeDate}. Using nearest earlier price.`
  );

  const { data: fallback } = await supabase
    .from("daily_close_prices")
    .select("close_price, close_date")
    .eq("asset", asset)
    .lte("close_date", closeDate)
    .order("close_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!fallback) {
    throw new Error(
      `[prices] No price data available for ${asset} on or before ${closeDate}`
    );
  }

  return {
    price: Number(fallback.close_price),
    source: "daily_close",
    date: new Date(fallback.close_date),
  };
}

/**
 * Batch-fetch prices for multiple dates of one asset.
 * Much more efficient than calling getPriceForDate() in a loop —
 * historical dates are fetched in one Supabase query.
 *
 * Returns a Map keyed by YYYY-MM-DD date string.
 */
export async function getPricesForDates(
  asset: Asset,
  dates: Date[]
): Promise<Map<string, PriceResult>> {
  const now = Date.now();
  const threshold = now - LIVE_THRESHOLD_HOURS * 3_600_000;
  const result = new Map<string, PriceResult>();

  const historicalDates = dates.filter((d) => d.getTime() < threshold);
  const liveDates = dates.filter((d) => d.getTime() >= threshold);

  // Single Supabase query for all historical dates
  if (historicalDates.length > 0) {
    const closeDates = historicalDates.map(toUTCDateString);
    const supabase = createAdminClient();

    const { data } = await supabase
      .from("daily_close_prices")
      .select("close_price, close_date")
      .eq("asset", asset)
      .in("close_date", closeDates);

    for (const row of data ?? []) {
      result.set(row.close_date, {
        price: Number(row.close_price),
        source: "daily_close",
        date: new Date(row.close_date),
      });
    }

    // Warn about any missing dates
    const found = new Set((data ?? []).map((r) => r.close_date));
    for (const d of closeDates) {
      if (!found.has(d)) {
        console.warn(`[prices] Batch: no close price for ${asset} on ${d}`);
      }
    }
  }

  // Live price for all recent dates (single fetch, same price)
  if (liveDates.length > 0) {
    const price = await getLivePrice(asset);
    for (const date of liveDates) {
      result.set(toUTCDateString(date), {
        price,
        source: "live",
        date: new Date(),
      });
    }
  }

  return result;
}
