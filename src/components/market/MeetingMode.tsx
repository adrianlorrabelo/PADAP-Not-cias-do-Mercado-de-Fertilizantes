import type { CommercialOpportunity, ExchangeRatioItem, ImpactedProposal, ProductAttention } from "../../types";
import { formatCurrency } from "../../utils/marketFormatting";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { MetricTile } from "./MarketPrimitives";

export function MeetingMode({ open, onClose, score, products, proposals, mainRatio, opportunities, onPdf, onCopy }: { open: boolean; onClose: () => void; score: number; products: ProductAttention[]; proposals: ImpactedProposal[]; mainRatio: ExchangeRatioItem; opportunities: CommercialOpportunity[]; onPdf: () => void; onCopy: () => void }) {
  return (
    <Modal title="Modo reunião" open={open} onClose={onClose}>
      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          <MetricTile label="Mercado" value="Volátil" tone="amber" />
          <MetricTile label="Score" value={`${score}/100`} tone="cyan" />
          <MetricTile label="Propostas" value={proposals.length + 11} tone="amber" />
          <MetricTile label="Valor em revisão" value={formatCurrency(proposals.reduce((sum, proposal) => sum + proposal.value, 0))} tone="green" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="Resumo de decisão" items={["Mercado volátil exige validade curta, revisão de propostas antigas e foco comercial em KCl."]} />
          <Panel title="Termômetro do mercado" items={[`Score ${score}/100`, "Risco médio, oportunidade alta e confiança alta para os próximos 7 dias."]} />
          <Panel title="Produtos em atenção" items={products.slice(0, 5).map((item) => `${item.product} - ${item.movement}: ${item.recommendedAction}`)} />
          <Panel title="Propostas impactadas" items={proposals.slice(0, 4).map((item) => `${item.id} - ${item.client}: ${item.impactReason}`)} />
          <Panel title="Oportunidades comerciais" items={opportunities.slice(0, 3).map((item) => `${item.opportunity}: ${item.recommendedAction}`)} />
          <Panel title="Briefing final" items={[`${mainRatio.pair}: ${mainRatio.interpretation}`, "Confirmar validade, disponibilidade e condição atualizada com compras antes de prometer preço ao produtor."]} />
        </div>

        <div className="rounded-lg border border-padap-green/20 bg-padap-green/[0.06] p-4 text-sm leading-6 text-padap-ink">
          <strong className="text-padap-ink">Recomendação final:</strong> confirmar validade, disponibilidade e condição atualizada com compras antes de prometer preço ao produtor.
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Sair do modo reunião</Button>
          <Button variant="ghost" onClick={onPdf}>Gerar PDF</Button>
          <Button onClick={onCopy}>Copiar resumo</Button>
        </div>
      </div>
    </Modal>
  );
}

function Panel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-padap-line bg-padap-field p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-block h-3.5 w-1 rounded-full bg-padap-green" />
        <h3 className="text-base font-bold text-padap-ink">{title}</h3>
      </div>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-padap-muted">{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  );
}
