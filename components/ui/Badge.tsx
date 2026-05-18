import { type ReactNode } from "react";

type BadgeVariant = "default" | "success" | "danger" | "warning";

const variants: Record<BadgeVariant, string> = {
  default: "bg-[#312e81] text-[#6366f1]",
  success: "bg-[#064e3b] text-[#10b981]",
  danger: "bg-[#450a0a] text-[#ef4444]",
  warning: "bg-[#451a03] text-[#f59e0b]",
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

export default function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
