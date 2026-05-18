import type { ProductMarketScore as ProductMarketScoreType } from "../../types";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Table } from "../ui/Table";
import { SectionHeader } from "./MarketPrimitives";

export function ProductMarketScore({ scores }: { scores: ProductMarketScoreType[] }) {
  return (
    <Card>
      <SectionHeader title="Score de Mercado" subtitle="Ranking calculado por variação, tendência, PTAX, notícias, oferta, relação de troca e impacto comercial." />
      <Table
        headers={["Produto", "Score", "Situação", "Risco", "Oportunidade", "Ação recomendada"]}
        rows={scores.map((item) => [
          item.product,
          <div className="flex items-center gap-3"><div className="h-2 w-28 rounded-full bg-white/10"><div className="h-full rounded-full bg-padap-green" style={{ width: `${item.score}%` }} /></div><strong>{item.score}/100</strong></div>,
          <Badge tone={item.tone}>{item.situation}</Badge>,
          item.risk,
          item.opportunity,
          item.recommendedAction
        ])}
      />
    </Card>
  );
}
