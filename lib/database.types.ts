/**
 * Supabase database types — manually maintained.
 *
 * To regenerate after schema changes:
 *   npx supabase gen types typescript --project-id zvooaiytdkuxjnggdzsv > lib/database.types.ts
 *
 * Requires the Supabase CLI: npm install -g supabase
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string;
          created_at: string;
          date: string;
          type: "Inleg" | "Koop" | "Verkoop" | "Uitkering";
          asset: string | null;
          quantity: number | null;
          price_usd: number | null;
          total_usd: number;
          notes: string | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          date: string;
          type: "Inleg" | "Koop" | "Verkoop" | "Uitkering";
          asset?: string | null;
          quantity?: number | null;
          price_usd?: number | null;
          total_usd: number;
          notes?: string | null;
          user_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
      };
      daily_close_prices: {
        Row: {
          id: number;
          asset: "BTC" | "ETH" | "SOL";
          close_date: string; // YYYY-MM-DD
          close_price: string; // numeric — parse with Number()
          source: string;
          fetched_at: string;
        };
        Insert: {
          id?: number;
          asset: "BTC" | "ETH" | "SOL";
          close_date: string;
          close_price: number | string;
          source?: string;
          fetched_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["daily_close_prices"]["Insert"]>;
      };
      price_fetch_errors: {
        Row: {
          id: number;
          asset: string;
          close_date: string;
          error: string;
          occurred_at: string;
        };
        Insert: {
          id?: number;
          asset: string;
          close_date: string;
          error: string;
          occurred_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["price_fetch_errors"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
