import type { ExchangeRatioItem, ImpactedProposal, ProductAttention } from "../../types";
import { formatCurrency } from "../../utils/marketFormatting";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { MetricTile } from "./MarketPrimitives";

export function MeetingMode({ open, onClose, score, products, proposals, mainRatio, onPdf, onCopy }: { open: boolean; onClose: () => void; score: number; products: ProductAttention[]; proposals: ImpactedProposal[]; mainRatio: ExchangeRatioItem; onPdf: () => void; onCopy: () => void }) {
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
          <Panel title="Resumo executivo" items={["Mercado volátil, com pressão em nitrogenados e oportunidade em potássicos."]} />
          <Panel title="O que fazer agora" items={["Recalcular nitrogenados", "Ativar clientes de KCl", "Usar validade curta", "Enviar briefing aos consultores"]} />
          <Panel title="Produtos em atenção" items={products.slice(0, 5).map((item) => `${item.product} - ${item.movement}`)} />
          <Panel title="Relação de troca" items={[`${mainRatio.pair}: ${mainRatio.interpretation}`]} />
        </div>

        <div className="rounded-lg border border-padap-green/20 bg-padap-green/[0.06] p-4 text-sm leading-6 text-slate-200">
          <strong className="text-white">Recomendação final:</strong> confirmar validade, disponibilidade e condição atualizada com compras antes de prometer preço ao produtor.
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
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  );
}
