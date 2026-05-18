"use client";

import dynamic from "next/dynamic";

const PerformanceChart = dynamic(() => import("./PerformanceChart"), {
  ssr: false,
  loading: () => (
    <div className="card flex h-[308px] items-center justify-center text-sm text-[#4a5568]">
      Grafiek laden…
    </div>
  ),
});

export default function PerformanceChartWrapper() {
  return <PerformanceChart />;
}
