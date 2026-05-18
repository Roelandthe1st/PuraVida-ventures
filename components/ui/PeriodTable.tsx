interface PeriodTableProps {
  rendement: number;
}

const placeholder = "—";

export default function PeriodTable({ rendement }: PeriodTableProps) {
  const fmt = (v: number) =>
    `${v >= 0 ? "+" : ""}${v.toFixed(1).replace(".", ",")}%`;

  const periods = [
    { label: "Vandaag",      fonds: null, benchmark: null },
    { label: "Deze week",    fonds: null, benchmark: null },
    { label: "Deze maand",   fonds: null, benchmark: null },
    { label: "Dit jaar",     fonds: null, benchmark: null },
    { label: "All-time",     fonds: rendement, benchmark: null },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="card p-6">
        <p className="section-label mb-4">Rendement per periode</p>
        <table className="w-full">
          <tbody>
            {periods.map((row, i) => (
              <tr key={row.label} className={i < periods.length - 1 ? "border-b border-[#1e2230]" : ""}>
                <td className="py-3 text-sm text-[#94a3b8]">{row.label}</td>
                <td className="py-3 text-right text-sm font-semibold tabular-nums">
                  {row.fonds === null ? (
                    <span className="text-[#4a5568]">{placeholder}</span>
                  ) : (
                    <span className={row.fonds >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}>
                      {fmt(row.fonds)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-6">
        <p className="section-label mb-4">Fonds vs. BTC Benchmark</p>
        <table className="w-full">
          <tbody>
            {periods.map((row, i) => (
              <tr key={row.label} className={i < periods.length - 1 ? "border-b border-[#1e2230]" : ""}>
                <td className="py-3 text-sm text-[#94a3b8]">{row.label}</td>
                <td className="py-3 text-right text-sm font-semibold tabular-nums">
                  <span className="text-[#4a5568]">{placeholder}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-[#4a5568]">Vereist historische prijsdata</p>
      </div>
    </div>
  );
}
