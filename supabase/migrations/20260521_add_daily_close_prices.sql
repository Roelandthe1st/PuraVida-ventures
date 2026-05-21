-- Migration: Add daily close prices table for historical crypto data
-- Date: 2026-05-21
-- Description: Stores daily UTC close prices for BTC, ETH, SOL.
--              Live data (<24h) is never stored here — fetched from CoinGecko directly.

-- Main price table
create table if not exists public.daily_close_prices (
  id            bigserial primary key,
  asset         text not null check (asset in ('BTC','ETH','SOL')),
  close_date    date not null,            -- UTC date of which this is the close price
  close_price   numeric(20, 8) not null,  -- Price in USD
  source        text not null default 'coingecko',
  fetched_at    timestamptz not null default now(),
  unique (asset, close_date)
);

create index if not exists idx_daily_close_prices_asset_date
  on public.daily_close_prices (asset, close_date desc);

-- Error log table: if CoinGecko fails after all retries, we log here
create table if not exists public.price_fetch_errors (
  id          bigserial primary key,
  asset       text not null,
  close_date  date not null,
  error       text not null,
  occurred_at timestamptz not null default now()
);

-- RLS: close prices are non-sensitive market data
alter table public.daily_close_prices enable row level security;
alter table public.price_fetch_errors enable row level security;

-- Authenticated users can read prices
create policy "Authenticated users can read close prices"
  on public.daily_close_prices for select
  using (auth.role() = 'authenticated');

-- Only service_role can write (cron job uses service role key)
-- No insert/update/delete policies for anon or authenticated roles.
-- The service_role bypasses RLS entirely, so no policy needed for it.

-- Grant read to authenticated role
grant select on public.daily_close_prices to authenticated;
grant select on public.price_fetch_errors to authenticated;
