import type { Quotation } from "../../types";
import { formatarMoedaBRL } from "../../utils/currency";
import { quotationSummary } from "../../utils/pricingCalculations";
import { Badge } from "../ui/Badge";

export function QuotationSummaryCard({ quotation, onPackageModeChange }: { quotation: Quotation; onPackageModeChange: (enabled: boolean, target: number) => void }) {
  const summary = quotationSummary(quotation);
  const tone: "green" | "amber" | "red" | "cyan" = summary.status === "Pode enviar" ? "green" : summary.status.includes("Aten") ? "amber" : summary.status.includes("Requer") ? "cyan" : "red";

  return (
    <section className="rounded-xl border border-padap-line bg-white p-4 shadow-panel">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-padap-emerald">Resumo comercial</p>
          <h2 className="mt-1 text-base font-bold text-padap-ink">Status geral</h2>
        </div>
        <Badge tone={tone}>{summary.status}</Badge>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <Highlight label="Valor total" value={formatarMoedaBRL(summary.revenueTotal)} />
        <Highlight label="Margem média" value={`${summary.averageMargin.toFixed(1)}%`} />
      </div>

      <div className="divide-y divide-padap-line rounded-lg border border-padap-line bg-white px-3">
        <Metric label="Itens" value={String(summary.itemCount)} />
        <Metric label="Custo estimado" value={formatarMoedaBRL(summary.costTotal)} />
        <Metric label="Lucro bruto" value={formatarMoedaBRL(summary.grossProfit)} />
        <Metric label="Margem mínima" value={`${summary.requiredMargin.toFixed(1)}%`} />
        <Metric label="Diferença meta" value={`${summary.differenceToTarget.toFixed(1)} p.p.`} />
        <Metric label="Falta para meta" value={formatarMoedaBRL(summary.missingToTarget)} />
      </div>

      <div className="mt-3 rounded-lg border border-padap-line bg-padap-field p-3">
        <label className="flex items-center justify-between gap-3 text-sm font-medium text-padap-ink">
          <span>Tratar como pacote</span>
          <input
            type="checkbox"
            checked={quotation.packageMode}
            onChange={(event) => onPackageModeChange(event.target.checked, quotation.packageTargetMargin)}
            className="h-4 w-4 accent-padap-green"
          />
        </label>
        {quotation.packageMode && (
          <label className="mt-3 block text-xs font-bold uppercase tracking-[0.12em] text-padap-muted">
            Meta do pacote
            <input
              type="number"
              value={quotation.packageTargetMargin}
              onChange={(event) => onPackageModeChange(true, Number(event.target.value))}
              className="mt-1 w-full rounded-md border border-padap-line bg-white px-2 py-2 text-sm font-medium text-padap-ink outline-none focus:border-padap-green"
            />
          </label>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
      <p className="font-medium text-padap-muted">{label}</p>
      <p className="shrink-0 text-right font-bold text-padap-ink">{value}</p>
    </div>
  );
}

function Highlight({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-padap-green/20 bg-padap-green/10 px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-padap-emerald">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-padap-ink">{value}</p>
    </div>
  );
}
