import { Bot } from "lucide-react";
import type { MarketAnalystInsight } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function MarketAnalystCard({ insight, onAnalysis, onBriefing }: { insight: MarketAnalystInsight; onAnalysis: () => void; onBriefing: () => void }) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Bot className="text-padap-cyan" size={20} /><h2 className="text-lg font-semibold text-padap-ink">Analista de Mercado</h2><Badge tone="cyan">IA</Badge></div><Badge tone="green">Alta - {insight.confidence}%</Badge></div>
      <div className="space-y-3 text-sm leading-6 text-padap-muted">
        <Block label="Resumo" value={insight.summary} />
        <Block label="Impacto na PADAP" value={insight.padapImpact} />
        <Block label="Produtos afetados" value={insight.affectedProducts.join(", ")} />
        <Block label="Propostas afetadas" value={insight.affectedProposals} />
        <Block label="Clientes/oportunidades" value={insight.affectedCustomers} />
        <Block label="Ação recomendada" value={insight.recommendedAction} />
        <Block label="Horizonte" value={insight.horizon} />
        <Block label="Fontes usadas" value={insight.sources.join(", ")} />
      </div>
      <div className="mt-4 h-2 rounded-full bg-padap-field"><div className="h-full rounded-full bg-gradient-to-r from-padap-green to-padap-cyan" style={{ width: `${insight.confidence}%` }} /></div>
      <div className="mt-4 flex flex-wrap gap-2"><Button onClick={onAnalysis}>Ver analise completa</Button><Button variant="ghost" onClick={onBriefing}>Gerar briefing</Button></div>
    </Card>
  );
}

function Block({ label, value }: { label: string; value: string }) {
  return <p><span className="font-semibold text-padap-ink">{label}:</span> {value}</p>;
}
