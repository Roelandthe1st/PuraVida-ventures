import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchYesterdayClose, type Asset } from "@/lib/prices";

const ASSETS: Asset[] = ["BTC", "ETH", "SOL"];

/**
 * GET /api/cron/daily-close
 *
 * Fetches yesterday's UTC close price for BTC, ETH, SOL from CoinGecko
 * and upserts into daily_close_prices. Idempotent via (asset, close_date) unique constraint.
 *
 * Secured via Authorization: Bearer <CRON_SECRET>.
 * Configured to run at 00:05 UTC daily (5 min after candle close for data stability).
 */
export async function GET(req: NextRequest) {
  const start = Date.now();
  console.log("[cron:daily-close] start");

  // ── Auth check ──────────────────────────────────────────────────────────────
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron:daily-close] CRON_SECRET not configured");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    console.warn("[cron:daily-close] Unauthorized request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Process each asset ───────────────────────────────────────────────────────
  const supabase = createAdminClient();
  const inserted: string[] = [];
  const skipped: string[] = [];
  const errors: { asset: string; error: string }[] = [];

  for (const asset of ASSETS) {
    try {
      const { date, price } = await fetchYesterdayClose(asset);

      const { error: upsertError, data } = await supabase
        .from("daily_close_prices")
        .upsert(
          { asset, close_date: date, close_price: price, source: "coingecko", fetched_at: new Date().toISOString() },
          { onConflict: "asset,close_date", ignoreDuplicates: false }
        )
        .select("close_date");

      if (upsertError) throw new Error(upsertError.message);

      if (data && data.length > 0) {
        inserted.push(`${asset}:${date}@${price}`);
      } else {
        skipped.push(`${asset}:${date}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[cron:daily-close] Error for ${asset}:`, err);
      errors.push({ asset, error: message });

      // Log to price_fetch_errors table — don't let this crash the cron
      try {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 3_600_000);
        const dateStr = yesterday.toISOString().slice(0, 10);

        await supabase.from("price_fetch_errors").insert({
          asset,
          close_date: dateStr,
          error: message,
          occurred_at: now.toISOString(),
        });
      } catch (logErr) {
        console.error("[cron:daily-close] Failed to log error:", logErr);
      }
    }
  }

  const duration = Date.now() - start;
  console.log(
    `[cron:daily-close] done | inserted ${inserted.length} | skipped ${skipped.length} | errors ${errors.length} | duration ${duration}ms`
  );

  return NextResponse.json(
    { inserted, skipped, errors },
    { status: errors.length === ASSETS.length ? 502 : 200 }
  );
}
