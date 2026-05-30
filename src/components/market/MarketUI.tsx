import { type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "../ui/Badge";
import type { MarketSourceStatus } from "../../types";

export function marketTabClass(isActive: boolean) {
  return `inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? "border-padap-green/35 bg-padap-green/10 text-padap-emerald shadow-[0_4px_16px_rgba(29,186,44,.12)]"
      : "border-padap-line bg-white text-padap-muted hover:border-padap-green/35 hover:bg-padap-green/10 hover:text-padap-ink"
  }`;
}

export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function sourceStatusTone(status?: MarketSourceStatus): "green" | "amber" | "red" | "cyan" | "neutral" {
  if (status === "Atualizada" || status === "Manual" || status === "Ativa") return "green";
  if (status === "Indisponível" || status === "Pendente") return "amber";
  if (status === "Erro") return "red";
  return "neutral";
}

export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-padap-green/25" />
      <span className="rounded-full border border-padap-green/30 bg-padap-green/[0.08] px-4 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-padap-emerald">
        {label}
      </span>
      <div className="h-px flex-1 bg-padap-green/25" />
    </div>
  );
}

export function SectionTop({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 -mx-5 -mt-5 flex items-center justify-between gap-3 border-b border-padap-green/20 bg-padap-green/[0.07] px-5 py-4">
      <div className="flex items-center gap-2">
        <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
        <h2 className="text-base font-bold text-padap-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function MiniMetric({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="rounded-lg border border-padap-line bg-padap-field p-3">
      <p className="text-lg font-semibold text-padap-ink">{value}</p>
      <p className="text-xs leading-5 text-padap-muted">{label}</p>
    </div>
  );
}

export function IndicatorMini({ label, value, tone }: { label: string; value: string; tone: "green" | "amber" }) {
  return (
    <div className="rounded-md border border-padap-line bg-padap-field px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-[0.12em] text-padap-muted">{label}</p>
      <p className={tone === "amber" ? "font-semibold text-amber-700" : "font-semibold text-padap-emerald"}>{value}</p>
    </div>
  );
}

export function StripItem({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-padap-muted">{icon}</span>}
        <p className="text-[11px] uppercase leading-4 tracking-[0.12em] text-padap-muted">{label}</p>
      </div>
      <div className="text-sm font-medium leading-5 text-padap-ink">{value}</div>
    </div>
  );
}

export function SummaryPill({ label, value, tone }: { label: string; value: string; tone: "green" | "amber" | "cyan" }) {
  return (
    <div className="rounded-lg border border-padap-line bg-padap-field p-3">
      <p className="text-xs text-padap-muted">{label}</p>
      <div className="mt-1"><Badge tone={tone}>{value}</Badge></div>
    </div>
  );
}

export function MenuButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-padap-ink transition hover:bg-padap-field hover:text-padap-ink">
      {icon}
      {label}
      <ChevronRight size={14} className="ml-auto text-padap-muted" />
    </button>
  );
}

export function ShortBlock({ label, value }: { label: string; value: string }) {
  return <p><span className="font-semibold text-padap-ink">{label}:</span> {value}</p>;
}

export function HistoryMetric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-padap-line bg-padap-field px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-[0.12em] text-padap-muted">{label}</p>
      <p className="mt-1 font-semibold text-padap-ink">{value}</p>
    </div>
  );
}
