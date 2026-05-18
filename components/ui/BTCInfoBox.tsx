export default function BTCInfoBox() {
  return (
    <div className="rounded-lg border border-[#d4a843]/30 bg-[#d4a843]/5 p-5">
      <div className="flex gap-4">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#d4a843]/50 text-sm font-bold text-[#d4a843]">
          ₿
        </div>
        <div>
          <p className="mb-2 font-semibold text-[#d4a843]">Fondswaarde in Bitcoin</p>
          <p className="text-sm leading-relaxed text-[#94a3b8]">
            Je fonds is momenteel{" "}
            <span className="font-semibold text-[#22d3ee]">2,2108 BTC</span> waard tegen de
            huidige koers van{" "}
            <span className="font-semibold text-[#f1f5f9]">$83.400</span>.
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[#94a3b8]">
            Bij instap was dat{" "}
            <span className="font-semibold text-[#f1f5f9]">1,7930 BTC</span> waard. Je hebt
            effectief{" "}
            <span className="font-semibold text-[#22c55e]">+0,4178 BTC</span> gewonnen ten
            opzichte van gewoon Bitcoin houden — een outperformance van{" "}
            <span className="font-semibold text-[#22c55e]">+23,3%</span> in BTC-termen.
          </p>
        </div>
      </div>
    </div>
  );
}
