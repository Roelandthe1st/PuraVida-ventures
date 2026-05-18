import PageHeader from "@/components/ui/PageHeader";

export const metadata = { title: "Reports — Pura Vida" };

const reportTypes = [
  {
    title: "Annual Performance Report",
    description: "Full-year return breakdown per fund and overall portfolio",
    icon: "📊",
  },
  {
    title: "Transaction Summary",
    description: "Aggregated buy/sell activity for any date range",
    icon: "🧾",
  },
  {
    title: "Tax Report",
    description: "Capital gains/losses and dividend income for tax filing",
    icon: "🏛️",
  },
  {
    title: "Allocation Drift Report",
    description: "Comparison of target vs actual allocation over time",
    icon: "⚖️",
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        subtitle="Generate and export portfolio reports"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {reportTypes.map((r) => (
          <div key={r.title} className="card card-hover flex gap-4 p-6">
            <span className="text-3xl">{r.icon}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-[#f1f5f9]">{r.title}</h3>
              <p className="mt-1 text-sm text-[#94a3b8]">{r.description}</p>
            </div>
            <button
              disabled
              className="self-start rounded-lg border border-[#2a2d3e] px-3 py-1.5 text-sm text-[#475569] transition-colors hover:border-[#6366f1] hover:text-[#6366f1] disabled:cursor-not-allowed"
            >
              Generate
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
