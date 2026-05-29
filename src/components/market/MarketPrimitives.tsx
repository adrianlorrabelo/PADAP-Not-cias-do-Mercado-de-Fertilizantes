import type { ReactNode } from "react";
import { Badge } from "../ui/Badge";

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 -mx-5 -mt-5 border-b border-padap-green/20 bg-padap-green/[0.07] px-5 py-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
            <h2 className="text-base font-bold text-padap-ink">{title}</h2>
          </div>
          {subtitle && <p className="mt-1 max-w-3xl pl-3 text-xs leading-5 text-padap-muted">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

export function MetricTile({ label, value, tone = "neutral", detail }: { label: string; value: ReactNode; tone?: "green" | "amber" | "red" | "cyan" | "neutral"; detail?: string }) {
  return (
    <div className="rounded-lg border border-padap-line bg-padap-field p-4">
      <div className="mb-3"><Badge tone={tone}>{label}</Badge></div>
      <p className="text-2xl font-semibold text-padap-ink">{value}</p>
      {detail && <p className="mt-1 text-xs leading-5 text-padap-muted">{detail}</p>}
    </div>
  );
}
