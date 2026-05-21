import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0,
    serviceRoleKeyFirstChar: process.env.SUPABASE_SERVICE_ROLE_KEY?.[0] ?? "empty",
    cronSecret: !!process.env.CRON_SECRET,
    coingeckoKey: !!process.env.COINGECKO_API_KEY,
  });
}
