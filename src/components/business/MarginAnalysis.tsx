import type { Proposal } from "../../types";
import { formatarMoedaBRL, formatarPercentual } from "../../utils/currency";
import { calcularCustoFinal, calcularMargemPercentual, calcularMargemValor, calcularPrecoMinimo, calcularPrecoSugerido, calcularStatusProposta } from "../../utils/marginCalculations";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

export function MarginAnalysis({ proposal, currentPtax, showSensitive = true }: { proposal: Proposal; currentPtax: number; showSensitive?: boolean }) {
  const cost = calcularCustoFinal(proposal.productCost, proposal.freight, proposal.taxes, proposal.commission, proposal.otherExpenses);
  const marginValue = calcularMargemValor(proposal.salePrice, cost);
  const marginPercent = calcularMargemPercentual(proposal.salePrice, cost);
  const status = calcularStatusProposta(proposal, currentPtax);
  const tone = status === "Aprovado" ? "green" : status === "Bloqueado" ? "red" : "amber";
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Análise de Margem</h3>
        <Badge tone={tone}>{status}</Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {showSensitive && <Metric label="Custo final" value={formatarMoedaBRL(cost)} />}
        {showSensitive && <Metric label="Preço mínimo" value={formatarMoedaBRL(calcularPrecoMinimo(cost, 10))} />}
        {showSensitive && <Metric label="Preço sugerido" value={formatarMoedaBRL(calcularPrecoSugerido(cost, 12))} />}
        {showSensitive && <Metric label="Margem R$" value={formatarMoedaBRL(marginValue)} />}
        {showSensitive && <Metric label="Margem %" value={formatarPercentual(marginPercent)} />}
        <Metric label="Ação recomendada" value={status === "Aprovado" ? "Pode enviar" : "Revisar antes de enviar"} />
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-white/[0.08] bg-black/20 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-white">{value}</p></div>;
}
