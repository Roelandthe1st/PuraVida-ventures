import PageHeader from "@/components/ui/PageHeader";

export const metadata = { title: "Fund Info — Pura Vida" };

export default function FundInfoPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Fund Information"
        subtitle="Details, factsheets, and metadata for your funds"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Fund cards will be rendered dynamically from Supabase */}
        <div className="card card-hover flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                Example Fund
              </p>
              <p className="mt-1 text-lg font-bold text-[#f1f5f9]">—</p>
            </div>
            <span className="rounded-full bg-[#312e81] px-2 py-1 text-xs font-medium text-[#6366f1]">
              Equity
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-[#475569]">ISIN</dt>
            <dd className="text-right text-[#f1f5f9]">—</dd>
            <dt className="text-[#475569]">Currency</dt>
            <dd className="text-right text-[#f1f5f9]">—</dd>
            <dt className="text-[#475569]">TER</dt>
            <dd className="text-right text-[#f1f5f9]">—</dd>
          </dl>
          <p className="mt-auto text-center text-xs text-[#475569]">
            Connect Supabase to load fund data
          </p>
        </div>
      </div>
    </div>
  );
}
