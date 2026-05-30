import { type ReactNode } from "react";
import { Copy, Eye, ExternalLink, FileText, Send, ShieldCheck, Users } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { MiniMetric, SectionTop, SummaryPill, normalizeSearch, sourceStatusTone } from "./MarketUI";
import { MarketThermometer } from "./MarketThermometer";
import type { CommercialOpportunity, ImpactedProposal, MarketAlert, MarketAnalysis, MarketConfidenceSource, MarketSource, MarketSourceStatus, MarketUpdateHistory } from "../../types";
import { formatCurrency, formatDateTime, priorityTone } from "../../utils/marketFormatting";

// ─── Shared helpers ─────────────────────────────────────────────────────────

type SourceHealthType = "automática" | "manual" | "interna" | "licenciada";
type SourceHealthStatus = "atualizado" | "atrasado" | "erro" | "fallback" | "não configurada";

interface SourceHealthRow {
  id: string;
  name: string;
  type: SourceHealthType;
  status: SourceHealthStatus;
  lastUpdate: string;
  nextUpdate: string;
  confidence: number;
  observation: string;
}

function addTime(date: Date, amount: number, unit: "minute" | "hour" | "day") {
  const multipliers = { minute: 60000, hour: 3600000, day: 86400000 };
  return new Date(date.getTime() + amount * multipliers[unit]).toISOString();
}

function sourceHealthStatusTone(status: SourceHealthStatus): "green" | "amber" | "red" | "neutral" {
  if (status === "atualizado") return "green";
  if (status === "atrasado" || status === "fallback") return "amber";
  if (status === "erro") return "red";
  return "neutral";
}

function sourceTypeTone(type: SourceHealthType): "green" | "amber" | "cyan" | "neutral" {
  if (type === "interna") return "green";
  if (type === "automática") return "cyan";
  if (type === "manual") return "amber";
  return "neutral";
}

export function sourceImpact(source: MarketSource) {
  if (source.category === "Câmbio") return "referência para PTAX, propostas indexadas e validade comercial.";
  if (source.category === "Fertilizantes") return "apoio para leitura de nitrogenados, fosfatados, potássicos e especialidades.";
  if (source.category === "Interna") return "base segura para preços PADAP, Lista Yara e parâmetros comerciais.";
  if (source.category === "Café" || source.category === "Grãos") return "apoio para relação de troca e oportunidade por cultura.";
  return "apoio contextual para briefing e leitura comercial.";
}

export function toConfidenceSources(sources: MarketSource[]): MarketConfidenceSource[] {
  return sources.map((source) => ({
    id: source.id,
    name: source.name,
    tier: source.confidence === "Alta" ? "Nível 1" : source.confidence === "Média" ? "Nível 2" : "Nível 3",
    type: source.sourceType,
    category: source.category,
    confidence: source.confidence === "Alta" ? 95 : source.confidence === "Média" ? 80 : 60,
    lastUpdate: source.lastCheckedAt || source.updatedAt,
    link: source.url || "#",
    status: source.lastStatus === "Erro" || source.lastStatus === "Indisponível" ? "atenção" : source.lastStatus === "Pendente" ? "monitorando" : "ativa",
    note: source.observation || sourceImpact(source)
  }));
}

function buildSourceHealthRows(sources: MarketSource[], latestHistory: MarketUpdateHistory | null): SourceHealthRow[] {
  const now = latestHistory ? new Date(latestHistory.updatedAt) : new Date();
  const byName = new Map(sources.map((source) => [normalizeSearch(source.name), source]));
  const configured = (name: string) => byName.get(normalizeSearch(name));

  return [
    { id: "banco-central-ptax", name: "Banco Central/PTAX", type: "automática", status: "atualizado", confidence: 95, lastUpdate: configured("Banco Central")?.lastCheckedAt ?? addTime(now, -35, "minute"), nextUpdate: addTime(now, 25, "minute"), observation: "Normal. Referência para câmbio e propostas indexadas ao dólar." },
    { id: "comexstat-mdic", name: "ComexStat/MDIC", type: "automática", status: "atualizado", confidence: 90, lastUpdate: addTime(now, -2, "hour"), nextUpdate: addTime(now, 22, "hour"), observation: "Normal. Estrutura pronta para importações e leitura de fluxo futuro." },
    { id: "anda", name: "ANDA", type: "manual", status: "fallback", confidence: 75, lastUpdate: configured("ANDA")?.lastCheckedAt ?? addTime(now, -1, "day"), nextUpdate: addTime(now, 1, "day"), observation: "Depende de leitura manual; usar como apoio setorial até automação futura." },
    { id: "tabela-padap", name: "Tabela PADAP", type: "interna", status: "atualizado", confidence: 100, lastUpdate: configured("Lista Yara / Tabela PADAP")?.lastCheckedAt ?? addTime(now, -3, "hour"), nextUpdate: addTime(now, 21, "hour"), observation: "Fonte interna ativa para preços, listas e parâmetros comerciais." },
    { id: "world-bank", name: "World Bank", type: "licenciada", status: "atrasado", confidence: 80, lastUpdate: addTime(now, -32, "day"), nextUpdate: addTime(now, 5, "day"), observation: "Atualização mensal mais lenta; usar para tendência macro, não decisão diária." }
  ];
}

function getAlertPriorityBadge(alert: MarketAlert): { label: string; className: string } {
  if (alert.priority === "Alta" || alert.priority === "Crítica" || alert.type === "Alerta crítico") {
    return { label: "🔴 Urgente", className: "inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 border border-red-200/60" };
  }
  if (alert.priority === "Média") {
    return { label: "🟡 Esta semana", className: "inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/60" };
  }
  return { label: "🔵 Monitorar", className: "inline-flex items-center rounded-md bg-padap-field px-2 py-0.5 text-xs font-semibold text-padap-cyan border border-padap-line" };
}

// ─── DecisionSummary ─────────────────────────────────────────────────────────

interface DecisionSummaryProps {
  analysis: MarketAnalysis | null;
  status: string;
  confidence: number;
  onOpen: () => void;
}

export function DecisionSummary({ analysis, status, confidence, onOpen }: DecisionSummaryProps) {
  const fallbackItems = [
    { label: "O que mudou", value: "PTAX e ureia seguem em atenção, enquanto KCl abriu janela tática de negociação." },
    { label: "Impacto PADAP", value: "Propostas antigas e pacotes indexados ao dólar precisam de revisão antes do envio." },
    { label: "O que observar", value: "KCl pode favorecer clientes de café; MAP pede cautela em pacotes grandes." },
    { label: "Horizonte", value: "Próximos 7 dias, com checagem antes de propostas de maior valor." },
    { label: "Confiança", value: `Alta - ${confidence}% com leitura interna e fontes monitoradas.` }
  ];
  const decisionItems = analysis ? [
    { label: "O que mudou", value: analysis.whatChanged },
    { label: "Impacto PADAP", value: analysis.impactPadap },
    { label: "O que observar", value: analysis.whatToWatch },
    { label: "Horizonte", value: analysis.horizon },
    { label: "Confiança", value: analysis.confidence }
  ] : fallbackItems;

  return (
    <Card>
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-padap-cyan">Resumo de decisão</p>
          <h2 className="mt-3 max-w-3xl text-2xl font-semibold leading-tight text-padap-ink">
            {analysis?.summaryTitle ?? "Mercado volátil, com pressão em nitrogenados e oportunidade em potássicos."}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-padap-muted">
            Leitura comercial para decidir preço, validade, revisão de propostas e foco de abordagem dos consultores.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {decisionItems.map((item) => (
              <div key={item.label} className="rounded-lg border border-padap-line bg-padap-field px-3 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-padap-muted">{item.label}</p>
                <p className="mt-1 text-sm leading-6 text-padap-ink">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid min-w-56 gap-2">
          <SummaryPill label="Sentimento" value={status} tone="amber" />
          <SummaryPill label="Confiança" value={analysis?.confidence ?? `Alta - ${confidence}%`} tone="green" />
          <SummaryPill label="Horizonte" value={analysis?.horizon ?? "Próximos 7 dias"} tone="cyan" />
          <Button variant="ghost" onClick={onOpen}>Ver análise completa</Button>
        </div>
      </div>
    </Card>
  );
}

// ─── CommercialAlertsCard ────────────────────────────────────────────────────

interface CommercialAlertsCardProps {
  alerts: MarketAlert[];
  proposals: ImpactedProposal[];
  opportunities: CommercialOpportunity[];
  onAction: (message: string) => void;
  onDetails: () => void;
}

export function CommercialAlertsCard({ alerts, proposals, opportunities, onAction, onDetails }: CommercialAlertsCardProps) {
  return (
    <Card>
      <SectionTop title="Alertas comerciais" action={<Button variant="ghost" onClick={onDetails}>Ver detalhes</Button>} />
      <div className="grid gap-3 lg:grid-cols-2">
        {alerts.slice(0, 4).map((alert) => {
          const priorityBadge = getAlertPriorityBadge(alert);
          return (
            <div key={alert.id} className="rounded-lg border border-padap-line bg-padap-field p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge tone={priorityTone(alert.priority)}>{alert.type}</Badge>
                  <span className={priorityBadge.className}>{priorityBadge.label}</span>
                </div>
                <span className="text-xs text-padap-muted">{alert.relatedTo}</span>
              </div>
              <h3 className="mt-3 font-semibold text-padap-ink">{alert.title}</h3>
              <p className="mt-2 text-sm leading-6 text-padap-muted">{alert.message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="ghost" className="min-h-8 px-3 py-1.5 text-xs" onClick={() => onAction("Alerta comercial copiado.")}>
                  <Copy size={13} />Copiar alerta
                </Button>
                <Button variant="ghost" className="min-h-7 px-2 py-1 text-xs" onClick={() => onAction(`Transmissão preparada: ${alert.message}`)}>
                  <Send size={11} />Transmitir
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <MiniMetric value={proposals.length} label="propostas em atenção" />
        <MiniMetric value={opportunities.filter((item) => item.priority === "Alta" || item.priority === "Crítica").length} label="oportunidades prioritárias" />
      </div>
    </Card>
  );
}

// ─── SourcesHealthCard ───────────────────────────────────────────────────────

interface SourcesHealthCardProps {
  sources: MarketSource[];
  latestHistory: MarketUpdateHistory | null;
  onOpen: () => void;
  onManage: () => void;
}

export function SourcesHealthCard({ sources, latestHistory, onOpen, onManage }: SourcesHealthCardProps) {
  const rows = buildSourceHealthRows(sources, latestHistory);
  const updated = rows.filter((source) => source.status === "atualizado").length;
  const attention = rows.filter((source) => source.status === "atrasado" || source.status === "fallback").length;
  const errors = rows.filter((source) => source.status === "erro").length;
  const notConfigured = rows.filter((source) => source.status === "não configurada").length;
  const averageConfidence = Math.round(rows.reduce((total, source) => total + source.confidence, 0) / Math.max(rows.length, 1));

  return (
    <Card>
      <SectionTop
        title="Saúde das Fontes"
        action={<Badge tone={errors ? "red" : attention || notConfigured ? "amber" : "green"}>{errors ? "com erro" : attention ? "monitorar" : "operacional"}</Badge>}
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MiniMetric value={rows.length} label="fontes mapeadas" />
        <MiniMetric value={updated} label="atualizadas" />
        <MiniMetric value={attention + notConfigured} label="atenção/fallback" />
        <MiniMetric value={`${averageConfidence}%`} label="confiança média" />
      </div>
      <div className="mt-4 rounded-lg border border-padap-line bg-padap-field p-4">
        <p className="text-sm font-semibold text-padap-ink">Leitura operacional</p>
        <p className="mt-1 text-sm leading-6 text-padap-muted">
          Dados simulados para preparar a estrutura visual. {latestHistory ? `Última leitura do sistema: ${formatDateTime(latestHistory.updatedAt)} - ${latestHistory.summary}` : "Aguardando primeira leitura registrada nesta sessão."}
        </p>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[920px] w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-padap-muted">
            <tr>
              <th className="pb-2">Fonte</th>
              <th className="pb-2">Tipo</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Última atualização</th>
              <th className="pb-2">Próxima prevista</th>
              <th className="pb-2 text-right">Confiança</th>
              <th className="pb-2">Observação operacional</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-padap-line">
            {rows.map((source) => (
              <tr key={source.id}>
                <td className="py-3 pr-4 font-semibold text-padap-ink">{source.name}</td>
                <td className="py-3 pr-4"><Badge tone={sourceTypeTone(source.type)}>{source.type}</Badge></td>
                <td className="py-3 pr-4"><Badge tone={sourceHealthStatusTone(source.status)}>{source.status}</Badge></td>
                <td className="py-3 pr-4 text-padap-muted">{formatDateTime(source.lastUpdate)}</td>
                <td className="py-3 pr-4 text-padap-muted">{formatDateTime(source.nextUpdate)}</td>
                <td className="py-3 pr-4 text-right font-semibold text-padap-ink">{source.confidence}%</td>
                <td className="py-3 text-padap-muted">{source.observation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="ghost" onClick={onOpen}><Eye size={14} />Ver fontes</Button>
        <Button variant="ghost" onClick={onManage}><ShieldCheck size={14} />Gerenciar</Button>
      </div>
    </Card>
  );
}

// ─── ReportBriefingPanel ─────────────────────────────────────────────────────

interface ReportBriefingPanelProps {
  onReport: () => void;
  onBriefing: () => void;
  onWhatsApp: () => void;
  onRecipients: () => void;
  canManageRecipients: boolean;
}

export function ReportBriefingPanel({ onReport, onBriefing, onWhatsApp, onRecipients, canManageRecipients }: ReportBriefingPanelProps) {
  return (
    <Card>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
            <h2 className="text-base font-bold text-padap-ink">Relatório PDF e Briefing WhatsApp</h2>
          </div>
          <p className="mt-1 pl-3 text-sm leading-6 text-padap-muted">Gere materiais curtos para orientar consultores sem sobrecarregar a leitura.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onReport}><FileText size={16} />Gerar relatório PDF</Button>
          <Button variant="ghost" onClick={onBriefing}><Send size={16} />Gerar briefing WhatsApp</Button>
          <Button variant="ghost" onClick={onWhatsApp}><ExternalLink size={16} />Enviar relatório WhatsApp</Button>
          {canManageRecipients && <Button variant="ghost" onClick={onRecipients}><Users size={16} />Gerenciar destinatários</Button>}
        </div>
      </div>
    </Card>
  );
}

// ─── AdvancedArea ─────────────────────────────────────────────────────────────

export function AdvancedArea({ open, onToggle, children }: { open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
            <h2 className="text-base font-bold text-padap-ink">Recursos avançados</h2>
          </div>
          <p className="mt-1 pl-3 text-sm leading-6 text-padap-muted">Simulador, mapa de risco, fontes, histórico e análises completas ficam em segundo nível.</p>
        </div>
        <Button variant="ghost" onClick={onToggle}>{open ? "Ocultar recursos" : "Ver detalhes"}</Button>
      </div>
      {open && <div className="mt-5">{children}</div>}
    </Card>
  );
}

// ─── MarketThermometerWrapper (re-export used in this context) ────────────────
export { MarketThermometer };
