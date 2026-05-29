import { AlertTriangle, CheckCircle2, DollarSign, Users } from "lucide-react";
import { formatCurrency } from "../../utils/marketFormatting";
import { Card } from "../ui/Card";
import { MetricTile, SectionHeader } from "./MarketPrimitives";

type Summary = {
  affectedProposals: number;
  impactedValue: number;
  opportunityClients: number;
  packagesAttention: number;
  urgentActions: number;
  currentMargin: number;
  simulatedMargin: number;
  recommendedAction: string;
};

export function CommercialImpactEngine({ summary }: { summary: Summary }) {
  return (
    <Card>
      <SectionHeader title="Impacto Comercial PADAP" subtitle="Cruzamento mockado de mercado, fertilizantes, culturas, propostas e clientes." />
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <ImpactLine label="PTAX" value="+0,73%" />
        <ImpactLine label="Ureia" value="+2,30%" />
        <ImpactLine label="Café" value="+3,12%" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <MetricTile label="Propostas afetadas" value={summary.affectedProposals} tone="amber" detail="Abertas e sensíveis ao mercado" />
        <MetricTile label="Valor impactado" value={formatCurrency(summary.impactedValue)} tone="cyan" detail="Negociacoes em revisão" />
        <MetricTile label="Clientes oportunidade" value={summary.opportunityClients} tone="green" detail="Radar comercial ativo" />
        <MetricTile label="Pacotes em atenção" value={summary.packagesAttention} tone="amber" detail="Abaixo ou perto da meta" />
        <MetricTile label="Risco de margem" value={`${summary.currentMargin}% -> ${summary.simulatedMargin}%`} tone="red" detail="Média simulada" />
        <MetricTile label="Ações urgentes" value={summary.urgentActions} tone="red" detail="Prioridade alta/crítica" />
      </div>
      <div className="mt-4 flex items-start gap-3 rounded-lg border border-padap-green/20 bg-padap-green/[0.06] p-4">
        <CheckCircle2 className="mt-0.5 text-padap-emerald" size={18} />
        <p className="text-sm leading-6 text-padap-ink"><span className="font-semibold text-padap-ink">Ação recomendada:</span> {summary.recommendedAction}</p>
      </div>
    </Card>
  );
}

function ImpactLine({ label, value }: { label: string; value: string }) {
  const Icon = label === "Café" ? Users : label === "PTAX" ? DollarSign : AlertTriangle;
  return <div className="flex items-center gap-3 rounded-lg border border-padap-line bg-padap-field p-3"><Icon size={17} className="text-padap-cyan" /><span className="text-sm text-padap-muted">{label}</span><strong className="ml-auto text-padap-ink">{value}</strong></div>;
}
