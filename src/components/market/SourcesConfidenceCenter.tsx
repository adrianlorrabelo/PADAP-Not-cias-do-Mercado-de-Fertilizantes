import type { MarketSource } from "../../types";
import { formatDateTime, statusTone } from "../../utils/marketFormatting";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Table } from "../ui/Table";
import { SectionHeader } from "./MarketPrimitives";

export function SourcesConfidenceCenter({ sources }: { sources: MarketSource[] }) {
  return (
    <Card>
      <SectionHeader title="Fontes e Confiança" subtitle="Fontes cadastradas por nível, categoria e confiabilidade." />
      <Table
        headers={["Nome", "Nível", "Tipo", "Categoria", "Confiança", "Última atualização", "Status", "Observação", "Link"]}
        rows={sources.map((source) => [
          source.name,
          source.tier,
          source.type,
          source.category,
          `${source.confidence}%`,
          formatDateTime(source.lastUpdate),
          <Badge tone={statusTone(source.status)}>{source.status}</Badge>,
          source.note,
          <a href={source.link} target="_blank" rel="noopener noreferrer" className="text-padap-cyan hover:underline">Abrir</a>
        ])}
      />
    </Card>
  );
}
