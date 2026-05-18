import { Eye, MessageSquare, RotateCcw, ShieldCheck } from "lucide-react";
import type { ImpactedProposal } from "../../types";
import { formatCurrency, priorityTone } from "../../utils/marketFormatting";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Table } from "../ui/Table";
import { SectionHeader } from "./MarketPrimitives";

export function ImpactedProposalsTable({ proposals, onAction }: { proposals: ImpactedProposal[]; onAction: (message: string) => void }) {
  return (
    <Card>
      <SectionHeader title="Propostas impactadas pelo mercado" subtitle="Propostas abertas que podem ter sido impactadas por PTAX, fertilizantes, culturas, relação de troca, notícias ou validade." action={<Button variant="ghost" onClick={() => onAction("Lista completa de propostas impactadas aberta.")}>Ver todas</Button>} />
      <Table
        headers={["Proposta", "Cliente", "Consultor", "Produto", "Valor", "Margem atual", "Margem simulada", "Motivo", "Prioridade", "Ação recomendada", "Ações"]}
        rows={proposals.map((proposal) => [
          proposal.id,
          proposal.client,
          proposal.consultant,
          proposal.product,
          formatCurrency(proposal.value),
          `${proposal.currentMargin}%`,
          `${proposal.simulatedMargin}%`,
          proposal.impactReason,
          <Badge tone={priorityTone(proposal.priority)}>{proposal.priority}</Badge>,
          proposal.recommendedAction,
          <div className="flex gap-2">
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => onAction(`${proposal.id} recalculada.`)}><RotateCcw size={14} /></Button>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => onAction(`Abrindo ${proposal.id}.`)}><Eye size={14} /></Button>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => onAction(`Mensagem gerada para ${proposal.client}.`)}><MessageSquare size={14} /></Button>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => onAction(`${proposal.id} marcada como revisada.`)}><ShieldCheck size={14} /></Button>
          </div>
        ])}
      />
    </Card>
  );
}
