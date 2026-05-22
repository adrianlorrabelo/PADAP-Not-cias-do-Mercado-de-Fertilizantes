import { Badge } from "../ui/Badge";
import type { QuotationDiagnosis } from "../../types";

export function QuotationDiagnosisCard({ diagnosis }: { diagnosis: QuotationDiagnosis }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">Diagnóstico da cotação</h3>
        <Badge tone={diagnosis.needsSupplierQuote ? "amber" : "green"}>{diagnosis.needsSupplierQuote ? "Cotar fornecedor" : "Fornecedor ok"}</Badge>
      </div>
      <dl className="grid gap-3 text-sm">
        <Info label="Tipo identificado" value={diagnosis.productType} />
        <Info label="Fornecedor sugerido" value={diagnosis.suggestedSupplier} />
        <Info label="Estratégia sugerida" value={diagnosis.strategy} />
        <Info label="Margem mínima sugerida" value={`${diagnosis.minimumMargin}%`} />
        <Info label="Precisa cotar fornecedor?" value={diagnosis.needsSupplierQuote ? "Sim" : "Não"} />
        {diagnosis.suggestedSuppliers?.length ? <Info label="Fornecedores sugeridos" value={diagnosis.suggestedSuppliers.join(", ")} /> : null}
        <Info label="Disponibilidade" value={diagnosis.availability || "Não verificada"} />
        <Info label="Próxima ação recomendada" value={diagnosis.nextAction} />
      </dl>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-white/[0.06] pb-2 last:border-0 last:pb-0">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</dt>
      <dd className="text-slate-100">{value || "-"}</dd>
    </div>
  );
}
