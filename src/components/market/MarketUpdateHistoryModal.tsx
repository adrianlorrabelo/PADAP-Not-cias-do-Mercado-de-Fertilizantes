import { Copy, Eye, Trash2 } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { HistoryMetric, sourceStatusTone } from "./MarketUI";
import type { MarketUpdateHistory, MarketUpdateTrigger } from "../../types";
import { formatDateTime, formatTime, statusTone } from "../../utils/marketFormatting";

export function getHistoryTrigger(history: MarketUpdateHistory): MarketUpdateTrigger {
  return history.trigger ?? "Manual";
}

interface MarketUpdateHistoryModalProps {
  open: boolean;
  history: MarketUpdateHistory[];
  selected: MarketUpdateHistory | null;
  onClose: () => void;
  onSelect: (history: MarketUpdateHistory | null) => void;
  onCopy: (summary: string) => void;
  onClear: () => void;
}

export function MarketUpdateHistoryModal({ open, history, selected, onClose, onSelect, onCopy, onClear }: MarketUpdateHistoryModalProps) {
  const selectedTrigger = selected ? getHistoryTrigger(selected) : "Manual";

  return (
    <Modal title="Histórico de leituras" open={open} onClose={onClose}>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm leading-6 text-padap-muted">Leituras geradas por atualização manual ou automática enquanto a Central está aberta no navegador.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="cyan">{history.length} leituras salvas</Badge>
              {history[0] && <Badge tone={statusTone(history[0].status)}>Última: {history[0].status}</Badge>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {selected && <Button variant="ghost" onClick={() => onSelect(null)}>Voltar ao histórico</Button>}
            <Button variant="danger" onClick={onClear} disabled={!history.length}>
              <Trash2 size={16} />
              Limpar histórico
            </Button>
          </div>
        </div>

        {!history.length && (
          <div className="rounded-lg border border-padap-line bg-padap-field p-5 text-sm leading-6 text-padap-muted">
            Nenhuma leitura registrada ainda. Clique em Atualizar mercado agora para criar o primeiro histórico da Central de Mercado.
          </div>
        )}

        {selected ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-padap-line bg-padap-field p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-padap-ink">Leitura de {formatDateTime(selected.updatedAt)}</h3>
                  <p className="mt-2 text-sm leading-6 text-padap-muted">{selected.summary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={selectedTrigger === "Automática" ? "cyan" : "neutral"}>{selectedTrigger}</Badge>
                  <Badge tone={statusTone(selected.status)}>{selected.status}</Badge>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
                <HistoryMetric label="Fontes verificadas" value={selected.sourcesChecked} />
                <HistoryMetric label="Sucesso" value={selected.sourcesSucceeded} />
                <HistoryMetric label="Com erro" value={selected.sourcesFailed} />
                <HistoryMetric label="Internas usadas" value={selected.internalSourcesUsed} />
                <HistoryMetric label="Confiança" value={selected.confidence} />
                <HistoryMetric label="Score análise" value={selected.analysisScore ?? "--"} />
                <HistoryMetric label="Origem" value={selectedTrigger} />
              </div>
              {selected.analysisSummary && (
                <p className="mt-3 text-sm leading-6 text-padap-emerald">Análise: {selected.analysisSummary}</p>
              )}
              <div className="mt-4">
                <Button variant="ghost" onClick={() => onCopy(selected.summary)}>
                  <Copy size={14} />
                  Copiar resumo
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-padap-line">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="bg-padap-green/[0.08] text-xs uppercase tracking-[0.12em] text-padap-emerald">
                  <tr>
                    <th className="px-4 py-3">Fonte</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Mensagem</th>
                    <th className="px-4 py-3">Horário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-padap-line">
                  {selected.sourceResults.map((source) => (
                    <tr key={`${selected.id}-${source.sourceId}`}>
                      <td className="px-4 py-3 font-semibold text-padap-ink">{source.sourceName}</td>
                      <td className="px-4 py-3 text-padap-muted">{source.category}</td>
                      <td className="px-4 py-3">
                        <Badge tone={sourceStatusTone(source.status as Parameters<typeof sourceStatusTone>[0])}>{source.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-padap-muted">{source.message ?? "Sem mensagem adicional."}</td>
                      <td className="px-4 py-3 text-padap-muted">{formatTime(source.checkedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <article key={item.id} className="rounded-lg border border-padap-line bg-padap-field p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-padap-ink">{formatDateTime(item.updatedAt)}</h3>
                      <Badge tone={getHistoryTrigger(item) === "Automática" ? "cyan" : "neutral"}>{getHistoryTrigger(item)}</Badge>
                      <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                      <Badge tone="neutral">Confiança {item.confidence}</Badge>
                      {item.analysisScore !== undefined && <Badge tone="cyan">Score {item.analysisScore}</Badge>}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-padap-muted">{item.summary}</p>
                    {item.analysisSummary && (
                      <p className="mt-1 text-sm leading-6 text-padap-emerald">{item.analysisSummary}</p>
                    )}
                    <p className="mt-2 text-xs leading-5 text-padap-muted">
                      {item.sourcesChecked} fontes lidas, {item.sourcesSucceeded} com sucesso e {item.sourcesFailed} com erro.
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button variant="ghost" onClick={() => onSelect(item)}><Eye size={14} />Ver detalhes</Button>
                    <Button variant="ghost" onClick={() => onCopy(item.summary)}><Copy size={14} />Copiar resumo</Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
