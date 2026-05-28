import type { ReactNode } from "react";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "green" | "amber" | "red" | "cyan" | "neutral" }) {
  const tones = {
    green: "border-padap-green/35 bg-padap-green/10 text-padap-emerald",
    amber: "border-amber-300 bg-amber-50 text-amber-800",
    red: "border-red-200 bg-red-50 text-red-700",
    cyan: "border-padap-emerald/25 bg-padap-emerald/10 text-padap-emerald",
    neutral: "border-padap-line bg-padap-field text-padap-ink"
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}
