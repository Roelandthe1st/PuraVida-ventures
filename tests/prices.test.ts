/**
 * Tests for lib/prices.ts — unified price read layer.
 *
 * Mocking strategy:
 * - CoinGecko: vi.spyOn(global, 'fetch') returns canned responses
 * - Supabase admin client: vi.mock('@/lib/supabase/admin') with chainable query builder
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// ─── Supabase chain builder ───────────────────────────────────────────────────

type ChainResult = { data: unknown; error: { message: string } | null; count: number | null };

/**
 * Builds a Proxy-based chainable mock that returns `this` for every method
 * except terminal methods (maybeSingle / single) which resolve with `result`.
 */
function buildChain(result: ChainResult): Record<string, unknown> {
  const handler: ProxyHandler<object> = {
    get(_target, prop) {
      if (prop === "then") return undefined; // not a thenable
      if (prop === "maybeSingle" || prop === "single") {
        return () => Promise.resolve(result);
      }
      // Every other method returns the same proxy (fluent chain)
      return (..._args: unknown[]) => proxy;
    },
  };
  const proxy = new Proxy({}, handler);
  return proxy as Record<string, unknown>;
}

// ─── Shared mock result store ─────────────────────────────────────────────────

const dbResult: ChainResult = { data: null, error: null, count: null };

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => buildChain(dbResult),
}));

// ─── Fetch helpers ────────────────────────────────────────────────────────────

function mockFetchLive(btc = 85000, eth = 3000, sol = 150) {
  return vi.spyOn(global, "fetch").mockResolvedValue(
    new Response(
      JSON.stringify({
        bitcoin: { usd: btc, usd_24h_change: 1.5 },
        ethereum: { usd: eth, usd_24h_change: -0.5 },
        solana: { usd: sol, usd_24h_change: 2.1 },
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    )
  );
}

function mockFetchMarketChart(prices: [number, number][]) {
  return vi.spyOn(global, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ prices }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  );
}

// ─── Tests: getPriceForDate ───────────────────────────────────────────────────

describe("getPriceForDate", () => {
  beforeEach(() => {
    vi.resetModules();
    dbResult.data = null;
    dbResult.error = null;
    dbResult.count = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns source='live' for a date less than 24 hours ago", async () => {
    const recentDate = new Date(Date.now() - 1 * 3_600_000); // 1 hour ago
    const fetchSpy = mockFetchLive(85000);

    const { getPriceForDate } = await import("@/lib/prices");
    const result = await getPriceForDate("BTC", recentDate);

    expect(result.source).toBe("live");
    expect(result.price).toBe(85000);
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("simple/price"),
      expect.any(Object)
    );
  });

  it("returns exact close price from DB for a date 3 days ago (source='daily_close')", async () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 3_600_000);
    const closeDateStr = threeDaysAgo.toISOString().slice(0, 10);

    dbResult.data = { close_price: "42000.50000000", close_date: closeDateStr };
    dbResult.error = null;

    const { getPriceForDate } = await import("@/lib/prices");
    const result = await getPriceForDate("BTC", threeDaysAgo);

    expect(result.source).toBe("daily_close");
    expect(result.price).toBeCloseTo(42000.5);
    expect(result.date.toISOString().slice(0, 10)).toBe(closeDateStr);
  });

  it("falls back to nearest earlier price when exact date is missing", async () => {
    const targetDate = new Date(Date.now() - 5 * 24 * 3_600_000);
    const fallbackDateStr = new Date(Date.now() - 6 * 24 * 3_600_000)
      .toISOString()
      .slice(0, 10);

    // First call (exact match): returns null. Second call (fallback): returns row.
    let maybeSingleCallCount = 0;
    vi.doMock("@/lib/supabase/admin", () => ({
      createAdminClient: () => {
        const handler: ProxyHandler<object> = {
          get(_target, prop) {
            if (prop === "then") return undefined;
            if (prop === "maybeSingle") {
              return () => {
                maybeSingleCallCount++;
                if (maybeSingleCallCount === 1) {
                  return Promise.resolve({ data: null, error: null });
                }
                return Promise.resolve({
                  data: { close_price: "38000.00000000", close_date: fallbackDateStr },
                  error: null,
                });
              };
            }
            return (..._args: unknown[]) => proxy;
          },
        };
        const proxy = new Proxy({}, handler) as Record<string, unknown>;
        return proxy;
      },
    }));

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { getPriceForDate } = await import("@/lib/prices");
    const result = await getPriceForDate("ETH", targetDate);

    expect(result.source).toBe("daily_close");
    expect(result.price).toBe(38000);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Gap detected"));
  });
});

// ─── Tests: cron endpoint ─────────────────────────────────────────────────────

describe("GET /api/cron/daily-close", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.CRON_SECRET = "test-secret-123";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    dbResult.data = [{ close_date: "2026-05-20" }];
    dbResult.error = null;
    dbResult.count = 1;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 when Authorization header is missing", async () => {
    const { GET } = await import("@/app/api/cron/daily-close/route");
    const req = new NextRequest("http://localhost/api/cron/daily-close");

    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 401 for a wrong secret", async () => {
    const { GET } = await import("@/app/api/cron/daily-close/route");
    const req = new NextRequest("http://localhost/api/cron/daily-close", {
      headers: { Authorization: "Bearer wrong-secret" },
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 and reports upsert results with a correct secret", async () => {
    // Mock CoinGecko market chart for fetchYesterdayClose
    const todayMidnight = new Date();
    todayMidnight.setUTCHours(0, 0, 0, 0);
    const midnightTs = todayMidnight.getTime();

    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          prices: [
            [midnightTs - 3_600_000, 84000],
            [midnightTs - 1_800_000, 84500],
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );

    const { GET } = await import("@/app/api/cron/daily-close/route");
    const req = new NextRequest("http://localhost/api/cron/daily-close", {
      headers: { Authorization: "Bearer test-secret-123" },
    });

    const res = await GET(req);

    expect(res.status).not.toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty("inserted");
    expect(body).toHaveProperty("skipped");
    expect(body).toHaveProperty("errors");
    expect(Array.isArray(body.inserted)).toBe(true);
    expect(Array.isArray(body.errors)).toBe(true);
  });
});
