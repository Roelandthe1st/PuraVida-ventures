import { createClient } from "@/lib/supabase/client";
import type { Transaction } from "./mockData";

export { createClient };

export async function fetchTransactions(): Promise<Transaction[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Transaction[];
}

export async function insertTransaction(
  tx: Omit<Transaction, "id">
): Promise<Transaction> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Niet ingelogd");

  const { data, error } = await supabase
    .from("transactions")
    .insert({ ...tx, user_id: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}
