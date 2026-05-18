import { useState } from "react";
import type { RiskOpportunityItem } from "../../types";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { SectionHeader } from "./MarketPrimitives";

const quadrants = [
  { id: "highRisk", title: "Alto risco / alta probabilidade", tone: "red" as const },
  { id: "highOpportunity", title: "Alta oportunidade / alta probabilidade", tone: "green" as const },
  { id: "lowRisk", title: "Baixo risco / baixa oportunidade", tone: "neutral" as const },
  { id: "monitoring", title: "Monitoramento", tone: "cyan" as const }
];

export function RiskOpportunityMatrix({ items }: { items: RiskOpportunityItem[] }) {
  const [selected, setSelected] = useState<RiskOpportunityItem | null>(items[0] ?? null);
  return (
    <Card>
      <SectionHeader title="Mapa risco x oportunidade" subtitle="Matriz de impacto e probabilidade para produtos e indicadores." />
      <div className="grid gap-3 md:grid-cols-2">
        {quadrants.map((quadrant) => (
          <div key={quadrant.id} className="min-h-44 rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <Badge tone={quadrant.tone}>{quadrant.title}</Badge>
            <div className="mt-3 flex flex-wrap gap-2">
              {items.filter((item) => item.quadrant === quadrant.id).map((item) => (
                <button key={item.id} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm text-slate-100 transition hover:border-padap-green/30" onClick={() => setSelected(item)}>{item.label}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {selected && <div className="mt-4 rounded-lg border border-padap-cyan/20 bg-padap-cyan/[0.05] p-4 text-sm leading-6 text-slate-300"><strong className="text-white">{selected.label}:</strong> {selected.summary}<br /><span className="text-padap-mint">Ação: {selected.recommendedAction}</span></div>}
    </Card>
  );
}
