import { Copy, Trash2, Upload } from "lucide-react";
import type { KeyboardEvent } from "react";
import type { WeeklyTableLineDeviation } from "../types";
import { Button } from "../components/ui/Button";
import { numberInputValue } from "./weeklyTableUtils";

export function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`min-w-0 space-y-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 [&_select]:h-9 [&_select]:px-3 [&_select]:py-2 [&_select]:text-xs ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Cell({ children }: { children: React.ReactNode }) {
  return <td className="min-w-0 px-1.5 py-2">{children}</td>;
}

export function IconButton({ label, children, onClick, danger = false }: { label: string; children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition ${danger ? "border-red-400/20 text-red-200 hover:bg-red-500/10" : "border-white/10 text-slate-300 hover:bg-white/[0.06] hover:text-white"}`}
    >
      {children}
    </button>
  );
}

export function InlineInput({ value, onChange, onConfirm, type = "text", className = "", title }: { value: string | number; onChange: (value: string) => void; onConfirm?: () => void; type?: string; className?: string; title?: string }) {
  const displayValue = type === "number" && typeof value === "number" ? numberInputValue(value) : value;

  function confirmOnEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    event.currentTarget.blur();
    onConfirm?.();
  }

  return (
    <input
      type={type}
      value={displayValue}
      title={title}
      step={type === "number" ? "0.01" : undefined}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={confirmOnEnter}
      className={`h-8 w-full min-w-0 truncate rounded-md border border-white/10 bg-black/20 px-2 text-[11px] text-white outline-none transition placeholder:text-slate-600 focus:border-padap-green/60 focus:bg-[#071b18] ${className}`}
    />
  );
}

export function DeviationCard({
  item,
  onNameChange,
  onDeviationChange,
  onDuplicate,
  onRemove
}: {
  item: WeeklyTableLineDeviation;
  onNameChange: (value: string) => void;
  onDeviationChange: (value: string) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2 transition hover:border-padap-green/20 hover:bg-padap-green/[0.04]">
      <input
        value={item.line}
        onChange={(event) => onNameChange(event.target.value)}
        className="h-8 min-w-0 flex-1 rounded-md border border-white/10 bg-black/20 px-2 text-xs font-semibold text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-padap-green/60 focus:bg-[#071b18]"
        placeholder="Nome da linha"
        title={item.line}
      />
      <input
        type="number"
        step="0.01"
        value={numberInputValue(item.deviation)}
        onChange={(event) => onDeviationChange(event.target.value)}
        className="h-8 w-20 shrink-0 rounded-md border border-white/10 bg-black/20 px-2 text-right text-xs font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-padap-green/60 focus:bg-[#071b18]"
      />
      <IconButton label="Duplicar linha" onClick={onDuplicate}><Copy size={13} /></IconButton>
      <IconButton label="Remover linha" danger onClick={onRemove}><Trash2 size={13} /></IconButton>
    </div>
  );
}

export function SummaryTile({ label, value, title, strong = false }: { label: string; value: string; title?: string; strong?: boolean }) {
  return (
    <div className="min-w-0 rounded-md border border-white/10 bg-black/20 px-2 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</p>
      <p className={`mt-1 truncate ${strong ? "text-sm font-semibold text-white" : "text-xs text-slate-200"}`} title={title || value}>{value}</p>
    </div>
  );
}

export function EmptyProductsState({ onImport }: { onImport: () => void }) {
  return (
    <div className="grid min-h-72 place-items-center border-t border-white/[0.08] p-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-padap-green/20 bg-padap-green/[0.08] text-padap-mint">
          <Upload size={20} />
        </div>
        <h3 className="mt-4 text-base font-bold text-padap-ink">Nenhuma lista importada</h3>
        <p className="mt-2 text-sm leading-6 text-padap-muted">Importe uma planilha para carregar os produtos da semana.</p>
        <div className="mt-5 flex justify-center">
          <Button onClick={onImport}><Upload size={16} />Importar planilha</Button>
        </div>
      </div>
    </div>
  );
}

export function DetailInput({ label, value, onChange, type = "text" }: { label: string; value: string | number; onChange: (value: string) => void; type?: string }) {
  const displayValue = type === "number" && typeof value === "number" ? numberInputValue(value) : value;
  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
      {label}
      <input
        type={type}
        value={displayValue}
        title={String(value)}
        step={type === "number" ? "0.01" : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-10 w-full min-w-0 rounded-lg border border-white/10 bg-black/20 px-3 text-sm font-normal normal-case tracking-normal text-white outline-none transition focus:border-padap-green/60 focus:bg-[#071b18]"
      />
    </label>
  );
}

export function ReadOnlyDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
      {label}
      <div className="mt-1.5 flex h-10 items-center rounded-lg border border-white/10 bg-white/[0.035] px-3 text-sm font-semibold normal-case tracking-normal text-white">
        {value}
      </div>
    </div>
  );
}
