import { Badge } from "../ui/Badge";
import type { QuotationDiagnosis } from "../../types";

export function QuotationDiagnosisCard({ diagnosis }: { diagnosis: QuotationDiagnosis }) {
  return (
    <div className="rounded-lg border border-padap-line bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3.5 w-1 rounded-full bg-padap-green" />
          <h3 className="text-sm font-bold text-padap-ink">Diagnóstico da cotação</h3>
        </div>
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
    <div className="grid gap-1 border-b border-padap-line pb-2 last:border-0 last:pb-0">
      <dt className="text-xs font-bold uppercase tracking-[0.12em] text-padap-muted">{label}</dt>
      <dd className="font-medium text-padap-ink">{value || "-"}</dd>
    </div>
  );
}
