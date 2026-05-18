"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/overview", label: "Overview", icon: "▣" },
  { href: "/transactions", label: "Transactions", icon: "⇄" },
  { href: "/fund-info", label: "Fund Info", icon: "◈" },
  { href: "/reports", label: "Reports", icon: "◧" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-[#2a2d3e] bg-[#1a1d27]">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-[#2a2d3e] px-6 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366f1] text-sm font-bold text-white">
          PV
        </div>
        <span className="font-semibold text-[#f1f5f9]">Pura Vida</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#312e81] text-[#6366f1]"
                  : "text-[#94a3b8] hover:bg-[#1e2130] hover:text-[#f1f5f9]"
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#2a2d3e] px-6 py-4">
        <p className="text-xs text-[#475569]">Pura Vida Dashboard v0.1</p>
      </div>
    </aside>
  );
}
