import type { Quotation } from "../../types";
import { formatarMoedaBRL } from "../../utils/currency";
import { quotationSummary } from "../../utils/pricingCalculations";
import { Badge } from "../ui/Badge";

export function QuotationSummaryCard({ quotation, onPackageModeChange }: { quotation: Quotation; onPackageModeChange: (enabled: boolean, target: number) => void }) {
  const summary = quotationSummary(quotation);
  const tone = summary.status === "Pode enviar" ? "green" : summary.status === "Atenção" ? "amber" : summary.status === "Requer aprovação" ? "cyan" : "red";

  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#071918]/80 p-4 xl:sticky xl:top-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">Resumo comercial</h2>
        <Badge tone={tone}>{summary.status}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Metric label="Itens" value={String(summary.itemCount)} />
        <Metric label="Valor total" value={formatarMoedaBRL(summary.revenueTotal)} />
        <Metric label="Custo estimado" value={formatarMoedaBRL(summary.costTotal)} />
        <Metric label="Lucro bruto" value={formatarMoedaBRL(summary.grossProfit)} />
        <Metric label="Margem média" value={`${summary.averageMargin.toFixed(1)}%`} />
        <Metric label="Margem mínima" value={`${summary.requiredMargin.toFixed(1)}%`} />
        <Metric label="Diferença meta" value={`${summary.differenceToTarget.toFixed(1)} p.p.`} />
        <Metric label="Falta meta" value={formatarMoedaBRL(summary.missingToTarget)} />
      </div>
      <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3">
        <label className="flex items-center justify-between gap-3 text-sm text-slate-200">
          <span>Tratar como pacote</span>
          <input type="checkbox" checked={quotation.packageMode} onChange={(event) => onPackageModeChange(event.target.checked, quotation.packageTargetMargin)} />
        </label>
        {quotation.packageMode && (
          <label className="mt-3 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Meta do pacote
            <input
              type="number"
              value={quotation.packageTargetMargin}
              onChange={(event) => onPackageModeChange(true, Number(event.target.value))}
              className="mt-1 w-full rounded-md border border-white/10 bg-black/20 px-2 py-2 text-sm text-white outline-none focus:border-padap-green/60"
            />
          </label>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.035] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
