import type { ReactNode } from "react";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "green" | "amber" | "red" | "cyan" | "neutral" }) {
  const tones = {
    green: "border-padap-green/30 bg-padap-green/10 text-padap-mint",
    amber: "border-padap-amber/30 bg-padap-amber/10 text-amber-100",
    red: "border-red-400/30 bg-red-500/10 text-red-200",
    cyan: "border-padap-cyan/30 bg-padap-cyan/10 text-cyan-100",
    neutral: "border-white/10 bg-white/[0.05] text-slate-200"
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,.05)] ${tones[tone]}`}>{children}</span>;
}
