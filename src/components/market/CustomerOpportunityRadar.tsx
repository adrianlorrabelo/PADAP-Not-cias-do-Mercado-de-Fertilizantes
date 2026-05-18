import type { CustomerOpportunity } from "../../types";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Table } from "../ui/Table";
import { SectionHeader } from "./MarketPrimitives";

export function CustomerOpportunityRadar({ customers }: { customers: CustomerOpportunity[] }) {
  return (
    <Card>
      <SectionHeader title="Radar de Clientes" subtitle="Oportunidade detectada: KCl em queda. Radar geral para o setor comercial, sem briefing individual por consultor." />
      <Table
        headers={["Cliente", "Perfil", "Produto relacionado", "Motivo", "Potencial", "Ação sugerida"]}
        rows={customers.map((item) => [item.client, <Badge tone="cyan">{item.profile}</Badge>, item.relatedProduct, item.reason, item.potential, item.suggestedAction])}
      />
    </Card>
  );
}
