import PageHeader from "@/components/ui/PageHeader";

export const metadata = { title: "Settings — Pura Vida" };

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        subtitle="Configure your dashboard, integrations, and preferences"
      />

      <div className="space-y-6">
        {/* Supabase Connection */}
        <section className="card p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#94a3b8]">
            Supabase Connection
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-[#94a3b8]">
                Project URL
              </label>
              <input
                type="text"
                placeholder="https://xxxx.supabase.co"
                className="w-full rounded-lg border border-[#2a2d3e] bg-[#0f1117] px-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none transition-colors focus:border-[#6366f1]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#94a3b8]">
                Anon Key
              </label>
              <input
                type="password"
                placeholder="eyJ..."
                className="w-full rounded-lg border border-[#2a2d3e] bg-[#0f1117] px-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none transition-colors focus:border-[#6366f1]"
              />
            </div>
            <p className="text-xs text-[#475569]">
              Store these values in <code className="text-[#94a3b8]">.env.local</code> — never commit them to git.
            </p>
          </div>
        </section>

        {/* Display Preferences */}
        <section className="card p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#94a3b8]">
            Display Preferences
          </h2>
          <div className="space-y-3">
            {[
              { label: "Base currency", value: "EUR (€)" },
              { label: "Date format", value: "DD/MM/YYYY" },
              { label: "Number format", value: "1.234,56" },
            ].map((pref) => (
              <div key={pref.label} className="flex items-center justify-between">
                <span className="text-sm text-[#94a3b8]">{pref.label}</span>
                <span className="rounded-lg border border-[#2a2d3e] px-3 py-1 text-sm text-[#f1f5f9]">
                  {pref.value}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
