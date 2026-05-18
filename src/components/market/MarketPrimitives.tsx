import type { ReactNode } from "react";
import { Badge } from "../ui/Badge";

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle && <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function MetricTile({ label, value, tone = "neutral", detail }: { label: string; value: ReactNode; tone?: "green" | "amber" | "red" | "cyan" | "neutral"; detail?: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-3"><Badge tone={tone}>{label}</Badge></div>
      <p className="text-2xl font-semibold text-white">{value}</p>
      {detail && <p className="mt-1 text-xs leading-5 text-slate-400">{detail}</p>}
    </div>
  );
}
