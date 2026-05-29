import { AlertTriangle, ArrowRight, CheckCircle2, Clock, DollarSign, ListChecks, PackageCheck, PackageX, RefreshCw, TrendingUp } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkline } from "../components/charts/Sparkline";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";
import { getCockpitSnapshot, type CockpitMetric, type CockpitPriority, type CockpitRecommendedAction, type CockpitTarget, type CockpitTone, type CommercialSemaphoreItem, type MarketPulseItem } from "../services/cockpitService";
import { formatarPercentual } from "../utils/currency";

const metricIcons: Record<string, ReactNode> = {
  "expiring-proposals": <AlertTriangle size={18} />,
  "pending-approvals": <TrendingUp size={18} />,
  "open-volume": <DollarSign size={18} />,
  "average-margin": <PackageX size={18} />,
  "critical-stock": <PackageCheck size={18} />,
  "today-tasks": <ListChecks size={18} />
};

const dotTone: Record<CommercialSemaphoreItem["tone"], string> = {
  green: "bg-padap-green",
  amber: "bg-padap-amber",
  orange: "bg-orange-400",
  red: "bg-red-500",
  cyan: "bg-padap-cyan",
  neutral: "bg-slate-400"
};

export default function Cockpit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [updatedAt, setUpdatedAt] = useState(() => new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refreshKey is intentionally used to force re-read from storage
  const snapshot = useMemo(() => getCockpitSnapshot(), [refreshKey]);
  const userName = user?.name?.trim();
  const greeting = userName
    ? `Bom dia, ${userName}. Existem ${snapshot.summary.actionsCount} ações comerciais que precisam da sua atenção hoje.`
    : `Bom dia. Existem ${snapshot.summary.actionsCount} ações comerciais que precisam da sua atenção hoje.`;

  function goTo(path: CockpitTarget) {
    navigate(path);
  }

  function refreshPanel() {
    setRefreshKey((current) => current + 1);
    setUpdatedAt(new Date());
  }

  return (
    <div>
      <div className="page-title rounded-xl border border-padap-line bg-white p-4 shadow-panel lg:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-padap-green/25 bg-padap-green/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-padap-emerald">
              <span className="h-1.5 w-1.5 rounded-full bg-padap-green" />
              Modo executivo
            </div>
            <h1>{greeting}</h1>
            <p>Painel diário para revisar propostas, margens, estoque, vencimentos e ações comerciais prioritárias.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-padap-line bg-padap-field px-3 py-2 text-xs font-semibold text-padap-muted">
              <Clock size={14} className="text-padap-green" />
              Última atualização: {updatedAt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
            </div>
            <Button onClick={refreshPanel} className="min-h-10">
              <RefreshCw size={16} />
              Atualizar painel
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {snapshot.metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} icon={metricIcons[metric.id]} onClick={() => goTo(metric.targetPath)} />
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <PriorityPanel priorities={snapshot.priorities} onNavigate={goTo} />
        <Card>
          <SectionHeader title="Planner e rotinas" />
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniStat label="Tarefas de hoje" value={snapshot.planner.today} tone="cyan" />
            <MiniStat label="Atrasadas" value={snapshot.planner.overdue} tone={snapshot.planner.overdue ? "amber" : "green"} />
            <MiniStat label="Concluídas hoje" value={snapshot.planner.completedToday} tone="green" />
          </div>
          <button type="button" onClick={() => goTo(snapshot.planner.targetPath)} className="mt-4 w-full rounded-lg border border-padap-line bg-padap-field p-3 text-left transition hover:border-padap-green/35 hover:bg-padap-green/10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-padap-muted">Próxima tarefa</p>
            <p className="mt-1 text-sm font-semibold text-padap-ink">{snapshot.planner.nextTask}</p>
          </button>
        </Card>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeader title="Semáforo comercial" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {snapshot.semaphore.map((item) => (
              <SemaphoreButton key={item.id} item={item} onClick={() => goTo(item.targetPath)} />
            ))}
          </div>
        </Card>
        <Card>
          <SectionHeader title="Lista Yara e pacotes" />
          <button type="button" onClick={() => goTo(snapshot.yara.targetPath)} className="w-full rounded-lg border border-padap-line bg-padap-field p-3 text-left transition hover:border-padap-green/35 hover:bg-padap-green/10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-padap-ink">{snapshot.yara.label}</p>
                <p className="mt-1 text-xs leading-5 text-padap-muted">{snapshot.yara.detail}</p>
              </div>
              <Badge tone={statusTone(snapshot.yara.status)}>{snapshot.yara.status === "sem-lista" ? "sem lista" : snapshot.yara.status}</Badge>
            </div>
            <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-padap-green">{snapshot.yara.actionLabel}<ArrowRight size={14} /></span>
          </button>
          <button type="button" onClick={() => goTo(snapshot.packages.targetPath)} className="mt-3 w-full rounded-lg border border-padap-line bg-padap-field p-3 text-left transition hover:border-padap-green/35 hover:bg-padap-green/10">
            <p className="text-sm font-semibold text-padap-ink">{snapshot.packages.belowTarget} pacotes abaixo da meta</p>
            <p className="mt-1 text-xs leading-5 text-padap-muted">
              {snapshot.packages.mostCriticalId
                ? `${snapshot.packages.mostCriticalId}: margem ${formatarPercentual(snapshot.packages.margin || 0)} contra meta de ${formatarPercentual(snapshot.packages.targetMargin)}.`
                : "Nenhum pacote abaixo da meta neste momento."}
            </p>
            <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-padap-green">Abrir Pacotes<ArrowRight size={14} /></span>
          </button>
        </Card>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeader title="Pulso do mercado" />
          <div className="grid gap-3 md:grid-cols-3">
            {snapshot.marketPulse.map((item) => (
              <MarketPulseCard key={item.id} item={item} />
            ))}
          </div>
        </Card>
        <Card>
          <SectionHeader title="Estoque crítico" />
          <div className="grid gap-3 sm:grid-cols-2">
            <MiniStat label="Negativos" value={snapshot.stock.negative} tone={snapshot.stock.negative ? "red" : "green"} />
            <MiniStat label="Zerados" value={snapshot.stock.zero} tone={snapshot.stock.zero ? "red" : "green"} />
            <MiniStat label="Abaixo do mínimo" value={snapshot.stock.belowMinimum} tone={snapshot.stock.belowMinimum ? "amber" : "green"} />
            <MiniStat label="Sugestões de compra" value={snapshot.stock.purchaseSuggestions} tone={snapshot.stock.purchaseSuggestions ? "cyan" : "green"} />
          </div>
          <Button className="mt-4 w-full" onClick={() => goTo(snapshot.stock.targetPath)}>
            Conferir estoque
            <ArrowRight size={16} />
          </Button>
        </Card>
      </div>

      <div className="mb-4 mt-8 flex items-center gap-2">
        <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
        <h2 className="text-base font-bold text-padap-ink">Ações recomendadas</h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {snapshot.recommendedActions.map((action) => (
          <ActionCard key={action.id} action={action} onClick={() => goTo(action.targetPath)} />
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="inline-block h-3.5 w-1 rounded-full bg-padap-green" />
      <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-padap-emerald">{title}</h2>
    </div>
  );
}

function MetricCard({ metric, icon, onClick }: { metric: CockpitMetric; icon: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="group rounded-xl border border-padap-line bg-white p-4 text-left shadow-panel ring-1 ring-black/[0.02] transition duration-200 hover:-translate-y-0.5 hover:border-padap-green/40 hover:shadow-lift focus:outline-none focus:ring-2 focus:ring-padap-green/25">
      <div className="flex h-full min-h-[112px] flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase leading-5 tracking-[0.12em] text-padap-muted">{metric.title}</p>
          <Badge tone={metric.tone}>{icon}</Badge>
        </div>
        <div>
          <p className="text-2xl font-bold text-padap-ink">{metric.value}</p>
          <p className="mt-2 text-xs leading-5 text-padap-muted">{metric.description}</p>
        </div>
      </div>
    </button>
  );
}

function PriorityPanel({ priorities, onNavigate }: { priorities: CockpitPriority[]; onNavigate: (path: CockpitTarget) => void }) {
  return (
    <Card>
      <SectionHeader title="Prioridade de hoje" />
      <div className="space-y-3">
        {priorities.length ? priorities.map((priority, index) => (
          <div key={priority.id} className="flex flex-col gap-3 rounded-lg border border-padap-line bg-padap-field p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-padap-green/20 bg-padap-green/10 text-xs font-semibold text-padap-emerald">{index + 1}</span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-padap-ink">{priority.title}</p>
                  <Badge tone={priorityTone(priority.priority)}>{priority.priority}</Badge>
                </div>
                <p className="mt-1 text-xs leading-5 text-padap-muted">{priority.reason}</p>
              </div>
            </div>
            <Button variant="ghost" className="shrink-0 px-3 text-xs" onClick={() => onNavigate(priority.targetPath)}>
              {priority.actionLabel}
              <ArrowRight size={14} />
            </Button>
          </div>
        )) : (
          <div className="rounded-lg border border-padap-green/20 bg-padap-green/10 p-4 text-sm text-padap-emerald">
            <CheckCircle2 size={18} className="mb-2" />
            Nenhuma prioridade crítica no momento.
          </div>
        )}
      </div>
    </Card>
  );
}

function SemaphoreButton({ item, onClick }: { item: CommercialSemaphoreItem; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-xl border border-padap-line bg-white p-3 text-left transition hover:border-padap-green/40 hover:bg-padap-green/10 focus:outline-none focus:ring-2 focus:ring-padap-green/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-padap-ink">
            <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${dotTone[item.tone]}`} />
            {item.label}
          </p>
          <p className="mt-1 text-xs leading-5 text-padap-muted">{item.description}</p>
        </div>
        <span className="text-2xl font-bold text-padap-ink">{item.count}</span>
      </div>
    </button>
  );
}

function MarketPulseCard({ item }: { item: MarketPulseItem }) {
  return (
    <div className="rounded-xl border border-padap-line bg-white p-3 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-padap-ink">{item.name}</p>
          <p className="mt-1 text-lg font-bold text-padap-ink">{item.value}</p>
        </div>
        <Badge tone={item.tone}>{item.variation}</Badge>
      </div>
      <div className="mt-3">
        <Sparkline data={item.history} />
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-padap-muted">Tendência: {item.trend}</p>
      <p className="mt-1 text-xs leading-5 text-padap-muted">Impacto: {item.impact}</p>
    </div>
  );
}

function ActionCard({ action, onClick }: { action: CockpitRecommendedAction; onClick: () => void }) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-padap-amber/30 bg-padap-amber/10 text-padap-amber">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-padap-ink">{action.problem}</p>
            <p className="mt-1 text-xs leading-5 text-padap-muted">{action.why}</p>
          </div>
        </div>
        <Badge tone={priorityTone(action.priority)}>{action.priority}</Badge>
      </div>
      <div className="rounded-lg border border-padap-line bg-padap-field p-3 text-sm leading-6 text-padap-ink">{action.action}</div>
      <Button className="self-start" onClick={onClick}>
        {action.actionLabel}
        <ArrowRight size={16} />
      </Button>
    </Card>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone: CockpitTone }) {
  return (
    <div className="rounded-lg border border-padap-line bg-padap-field p-3">
      <p className="text-xs leading-5 text-padap-muted">{label}</p>
      <p className={`mt-1 text-xl font-bold ${toneText(tone)}`}>{value}</p>
    </div>
  );
}

function priorityTone(priority: CockpitPriority["priority"] | CockpitRecommendedAction["priority"]): CockpitTone {
  if (priority === "Critica") return "red";
  if (priority === "Alta") return "amber";
  return "cyan";
}

function statusTone(status: "valida" | "vencendo" | "vencida" | "sem-lista"): CockpitTone {
  if (status === "valida") return "green";
  if (status === "vencendo") return "amber";
  return "red";
}

function toneText(tone: CockpitTone) {
  const tones: Record<CockpitTone, string> = {
    green: "text-padap-green",
    amber: "text-padap-amber",
    red: "text-red-600",
    cyan: "text-padap-emerald",
    neutral: "text-padap-muted"
  };
  return tones[tone];
}
