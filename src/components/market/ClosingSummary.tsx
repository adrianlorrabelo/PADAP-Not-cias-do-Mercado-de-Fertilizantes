import { Copy, History, MessageCircle, RefreshCw } from "lucide-react";
import type { ClosingSummaryData } from "../../types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { SectionHeader } from "./MarketPrimitives";

export function ClosingSummary({ summary, onAction }: { summary: ClosingSummaryData; onAction: (message: string) => void }) {
  const groups = [
    ["O que mudou hoje", summary.changedToday],
    ["Propostas impactadas", summary.impactedProposals],
    ["Produtos em atenção", summary.attentionProducts],
    ["Oportunidades", summary.newOpportunities],
    ["Alertas abertos", summary.openAlerts],
    ["Amanhã", summary.tomorrowActions]
  ];
  return (
    <Card>
      <SectionHeader title="Resumo de Fechamento" subtitle="Gerado automaticamente às 17:00 ou sob demanda." action={<div className="flex flex-wrap gap-2"><Button variant="ghost" onClick={() => onAction("Fechamento atualizado.")}><RefreshCw size={14} />Gerar agora</Button><Button variant="ghost" onClick={() => onAction("Resumo copiado.")}><Copy size={14} />Copiar</Button><Button variant="ghost" onClick={() => onAction("WhatsApp preparado.")}><MessageCircle size={14} />Enviar</Button><Button variant="ghost" onClick={() => onAction("Histórico salvo.")}><History size={14} />Salvar</Button></div>} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {groups.map(([title, items]) => (
          <div key={title as string} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <h3 className="font-semibold text-white">{title as string}</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">{(items as string[]).map((item) => <li key={item}>- {item}</li>)}</ul>
          </div>
        ))}
      </div>
    </Card>
  );
}
