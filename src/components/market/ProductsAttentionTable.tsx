import type { ProductAttention } from "../../types";
import { formatPercent, priorityTone } from "../../utils/marketFormatting";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Table } from "../ui/Table";
import { SectionHeader } from "./MarketPrimitives";

export function ProductsAttentionTable({ products }: { products: ProductAttention[] }) {
  return (
    <Card>
      <SectionHeader title="Produtos em atenção" subtitle="Movimentos relevantes para fertilizantes, culturas e especialidades." />
      <Table
        headers={["Produto", "Movimento", "Variação diária", "Variação semanal", "Impacto", "Motivo", "Ação recomendada", "Score"]}
        rows={products.map((item) => [
          item.product,
          item.movement,
          <span className={item.dailyVariation >= 0 ? "text-padap-emerald" : "text-amber-700"}>{formatPercent(item.dailyVariation)}</span>,
          formatPercent(item.weeklyVariation),
          <Badge tone={priorityTone(item.impact === "Oportunidade" ? "Alta" : item.impact === "Alto" ? "Alta" : item.impact === "Médio" ? "Média" : "Baixa")}>{item.impact}</Badge>,
          item.reason,
          item.recommendedAction,
          `${item.score}/100`
        ])}
      />
    </Card>
  );
}
