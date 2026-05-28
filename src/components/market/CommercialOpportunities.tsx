import { Copy, FilePlus, Send, Users } from "lucide-react";
import type { CommercialOpportunity } from "../../types";
import { priorityTone } from "../../utils/marketFormatting";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Table } from "../ui/Table";
import { SectionHeader } from "./MarketPrimitives";

export function CommercialOpportunities({ opportunities, onAction }: { opportunities: CommercialOpportunity[]; onAction: (message: string) => void }) {
  return (
    <Card>
      <SectionHeader title="Oportunidades Comerciais" subtitle="Janelas detectadas para orientar a equipe comercial." />
      <Table
        headers={["Oportunidade", "Produto/cultura", "Justificativa", "Clientes sugeridos", "Ação recomendada", "Prioridade", "Ações"]}
        rows={opportunities.map((item) => [
          item.title ?? item.opportunity,
          item.productOrCrop,
          item.reason ?? item.justification,
          item.suggestedClients ?? "Clientes a definir",
          item.recommendedAction,
          <Badge tone={priorityTone(item.priority)}>{item.priority}</Badge>,
          <div className="flex gap-2">
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => onAction("Ação comercial gerada.")}><Send size={14} /></Button>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => onAction("Orientação copiada.")}><Copy size={14} /></Button>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => onAction("Clientes filtrados.")}><Users size={14} /></Button>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => onAction("Fluxo de proposta iniciado.")}><FilePlus size={14} /></Button>
          </div>
        ])}
      />
    </Card>
  );
}
