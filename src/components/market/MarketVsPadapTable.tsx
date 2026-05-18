import type { MarketVsPadapItem } from "../../types";
import { formatCurrency, formatPercent } from "../../utils/marketFormatting";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Table } from "../ui/Table";
import { SectionHeader } from "./MarketPrimitives";

export function MarketVsPadapTable({ items }: { items: MarketVsPadapItem[] }) {
  return (
    <Card>
      <SectionHeader title="Mercado x Tabela PADAP" subtitle="Comparativo entre tendência de mercado e tabela interna PADAP/Yara." />
      <Table
        headers={["Produto", "Preço Tabela PADAP", "Tendência de mercado", "PTAX atual", "Variação estimada", "Status", "Ação recomendada"]}
        rows={items.map((item) => [item.product, formatCurrency(item.padapPrice), item.marketTrend, item.currentPtax.toFixed(2), formatPercent(item.estimatedVariation), <Badge tone={item.estimatedVariation < 0 ? "green" : "amber"}>{item.status}</Badge>, item.recommendedAction])}
      />
    </Card>
  );
}
