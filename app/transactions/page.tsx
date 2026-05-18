import TransactionForm from "@/components/ui/TransactionForm";
import TransactionTable from "@/components/ui/TransactionTable";

export const metadata = { title: "Transacties — Pura Vida Ventures" };

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <TransactionForm />
      <TransactionTable />
    </div>
  );
}
