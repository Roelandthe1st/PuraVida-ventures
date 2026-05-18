"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { type Transaction } from "@/lib/mockData";
import {
  fetchTransactions,
  insertTransaction,
  deleteTransaction,
} from "@/lib/supabase";

interface TransactionsContextType {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  addTransaction: (tx: Omit<Transaction, "id">) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextType | null>(null);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Laad transacties uit Supabase bij opstarten
  useEffect(() => {
    fetchTransactions()
      .then(setTransactions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const addTransaction = useCallback(async (tx: Omit<Transaction, "id">) => {
    const saved = await insertTransaction(tx);
    setTransactions((prev) => [saved, ...prev]);
  }, []);

  const removeTransaction = useCallback(async (id: string) => {
    await deleteTransaction(id);
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  }, []);

  return (
    <TransactionsContext.Provider
      value={{ transactions, loading, error, addTransaction, removeTransaction }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext);
  if (!ctx) throw new Error("useTransactions vereist TransactionsProvider");
  return ctx;
}
