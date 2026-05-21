import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchPriceRange, sleep, toUTCDateString, type Asset } from "@/lib/prices";

const ASSETS: Asset[] = ["BTC", "ETH", "SOL"];
const BATCH_SIZE = 100;

/**
 * GET /api/admin/backfill-prices
 *
 * Backfills historical daily close prices from CoinGecko for a given date range.
 * Use this once to seed the database with historical data.
 *
 * Secured via Authorization: Bearer <CRON_SECRET> (same secret as the cron job).
 *
 * Query params:
 *   asset  - 'BTC' | 'ETH' | 'SOL' | 'ALL'  (default: 'ALL')
 *   from   - YYYY-MM-DD  (required)
 *   to     - YYYY-MM-DD  (default: yesterday UTC)
 *
 * Examples:
 *   GET /api/admin/backfill-prices?from=2023-01-01&to=2026-05-20
 *   GET /api/admin/backfill-prices?asset=BTC&from=2024-01-01
 */
export async function GET(req: NextRequest) {
  const start = Date.now();

  // ── Auth ─────────────────────────────────────────────────────────────────────
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parse params ─────────────────────────────────────────────────────────────
  const { searchParams } = req.nextUrl;
  const assetParam = (searchParams.get("asset") ?? "ALL").toUpperCase();
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  if (!fromParam) {
    return NextResponse.json(
      { error: "Missing required query param: from (YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  const fromDate = new Date(`${fromParam}T00:00:00Z`);
  const now = new Date();
  const yesterday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - 86_400_000
  );
  const toDate = toParam ? new Date(`${toParam}T23:59:59Z`) : yesterday;

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
  }
  if (fromDate > toDate) {
    return NextResponse.json({ error: "'from' must be before 'to'" }, { status: 400 });
  }

  const assetsToProcess: Asset[] =
    assetParam === "ALL"
      ? ASSETS
      : ASSETS.includes(assetParam as Asset)
      ? [assetParam as Asset]
      : [];

  if (assetsToProcess.length === 0) {
    return NextResponse.json(
      { error: `Invalid asset: ${assetParam}. Use BTC, ETH, SOL, or ALL.` },
      { status: 400 }
    );
  }

  console.log(
    `[backfill] Starting: assets=${assetsToProcess.join(",")} from=${toUTCDateString(fromDate)} to=${toUTCDateString(toDate)}`
  );

  // ── Backfill ─────────────────────────────────────────────────────────────────
  const supabase = createAdminClient();
  const summary: Record<string, { added: number; skipped: number; error?: string }> = {};

  for (const asset of assetsToProcess) {
    summary[asset] = { added: 0, skipped: 0 };

    try {
      // Fetch full range from CoinGecko (1.5s delay between assets for rate limit safety)
      if (assetsToProcess.indexOf(asset) > 0) await sleep(1500);

      const priceMap = await fetchPriceRange(asset, fromDate, toDate);
      console.log(`[backfill] ${asset}: fetched ${priceMap.size} days from CoinGecko`);

      // Build rows to upsert
      const rows = [...priceMap.entries()].map(([date, price]) => ({
        asset,
        close_date: date,
        close_price: price,
        source: "coingecko",
        fetched_at: new Date().toISOString(),
      }));

      // Upsert in batches of BATCH_SIZE
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);

        const { error, count } = await supabase
          .from("daily_close_prices")
          .upsert(batch, {
            onConflict: "asset,close_date",
            ignoreDuplicates: false,
            count: "exact",
          });

        if (error) throw new Error(error.message);

        summary[asset].added += count ?? batch.length;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[backfill] Error for ${asset}:`, err);
      summary[asset].error = message;
    }
  }

  const duration = Date.now() - start;
  console.log(`[backfill] Done in ${duration}ms`, summary);

  return NextResponse.json({
    summary,
    from: toUTCDateString(fromDate),
    to: toUTCDateString(toDate),
    durationMs: duration,
  });
}
