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
  "expiring-proposals": <AlertTriangle size={16} />,
  "pending-approvals": <TrendingUp size={16} />,
  "open-volume": <DollarSign size={16} />,
  "average-margin": <PackageX size={16} />,
  "critical-stock": <PackageCheck size={16} />,
  "today-tasks": <ListChecks size={16} />
};

const metricIconStyle: Record<string, { bg: string; color: string }> = {
  "expiring-proposals": { bg: "bg-red-50",     color: "text-red-500" },
  "pending-approvals":  { bg: "bg-amber-50",   color: "text-amber-600" },
  "open-volume":        { bg: "bg-emerald-50", color: "text-emerald-600" },
  "average-margin":     { bg: "bg-blue-50",    color: "text-blue-500" },
  "critical-stock":     { bg: "bg-purple-50",  color: "text-purple-500" },
  "today-tasks":        { bg: "bg-orange-50",  color: "text-orange-500" },
};

const metricHistoryData: Record<string, { value: number }[]> = {
  "expiring-proposals": [{value:3},{value:2},{value:4},{value:3},{value:5},{value:4},{value:6}],
  "pending-approvals":  [{value:1},{value:1},{value:2},{value:1},{value:1},{value:2},{value:1}],
  "open-volume":        [{value:320},{value:340},{value:355},{value:370},{value:360},{value:385},{value:384}],
  "average-margin":     [{value:10},{value:11},{value:11},{value:12},{value:11},{value:11.5},{value:11.55}],
  "critical-stock":     [{value:1},{value:0},{value:1},{value:0},{value:0},{value:0},{value:0}],
  "today-tasks":        [{value:4},{value:3},{value:2},{value:3},{value:2},{value:2},{value:2}],
};

const dotTone: Record<CommercialSemaphoreItem["tone"], string> = {
  green: "bg-padap-green",
  amber: "bg-padap-amber",
  orange: "bg-orange-400",
  red: "bg-red-500",
  cyan: "bg-padap-cyan",
  neutral: "bg-slate-400"
};

function sparklineColor(tone: CockpitTone): string {
  const map: Record<CockpitTone, string> = {
    green: "#1dba2c", amber: "#c98200", red: "#ef4444",
    cyan: "#0f4c4f", neutral: "#9ca3af",
  };
  return map[tone];
}

export default function Cockpit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [updatedAt, setUpdatedAt] = useState(() => new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refreshKey is intentionally used to force re-read from storage
  const snapshot = useMemo(() => getCockpitSnapshot(), [refreshKey]);
  const userName = user?.name?.trim();
  const firstName = userName?.split(" ")[0] ?? "";
  const actionsCount = snapshot.summary.actionsCount;

  function goTo(path: CockpitTarget) {
    navigate(path);
  }

  function refreshPanel() {
    setRefreshKey((current) => current + 1);
    setUpdatedAt(new Date());
  }

  return (
    <div>
      {/* ── Banner executivo ── */}
      <div className="relative mb-7 overflow-hidden rounded-2xl border border-padap-line bg-white shadow-panel ring-1 ring-black/[0.02]">

        {/* Conteúdo esquerdo */}
        <div className="relative z-10 p-6 lg:max-w-[calc(100%-300px)]">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-padap-green/25 bg-padap-green/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-padap-emerald">
            <span className="h-1.5 w-1.5 rounded-full bg-padap-green" />
            Modo executivo
          </div>
          <h1 className="max-w-2xl text-2xl font-bold leading-tight tracking-tight text-padap-ink lg:text-3xl">
            {firstName ? `Bom dia, ${firstName} PADAP.` : "Bom dia."}
          </h1>
          <p className="mt-1 max-w-xl text-base font-semibold text-padap-ink">
            {actionsCount > 0
              ? `Existem ${actionsCount} ações comerciais que precisam da sua atenção hoje.`
              : "Nenhuma ação crítica pendente no momento."}
          </p>
          <p className="mt-2 max-w-lg text-sm font-medium leading-relaxed text-padap-muted">
            Painel diário para revisar propostas, margens, estoque, vencimentos e ações comerciais prioritárias.
          </p>
        </div>

        {/* Painel direito — composição agrícola sobreposta */}
        <div
          className="absolute inset-y-0 right-0 hidden w-[320px] overflow-hidden lg:block"
          style={{ background: "linear-gradient(150deg, #fdfaf3 0%, #f4f9f0 55%, #eaf5ec 100%)" }}
        >
          {/* Café — fundo, canto superior direito */}
          <img
            src="/images/banner-coffee.jpg" alt="" aria-hidden="true"
            style={{
              position: "absolute", top: "-10px", right: "-20px",
              width: "180px", height: "220px",
              objectFit: "cover", objectPosition: "center",
              transform: "rotate(-4deg)",
              WebkitMaskImage: "radial-gradient(ellipse 82% 80% at 52% 44%, black 36%, transparent 72%)",
              maskImage: "radial-gradient(ellipse 82% 80% at 52% 44%, black 36%, transparent 72%)",
              opacity: 0.88,
            }}
          />
          {/* Alho — canto inferior esquerdo, visível com máscara */}
          <img
            src="/images/banner-garlic.jpg" alt="" aria-hidden="true"
            style={{
              position: "absolute", bottom: "-22px", left: "-12px",
              width: "200px", height: "200px",
              objectFit: "cover", objectPosition: "center 40%",
              transform: "rotate(-8deg)",
              WebkitMaskImage: "radial-gradient(ellipse 82% 78% at 48% 46%, black 40%, transparent 76%)",
              maskImage: "radial-gradient(ellipse 82% 78% at 48% 46%, black 40%, transparent 76%)",
              opacity: 0.95,
            }}
          />
          {/* Cenoura — centro, elemento principal, inclinada */}
          <img
            src="/images/banner-carrot.jpg" alt="" aria-hidden="true"
            style={{
              position: "absolute", top: "-15px", left: "55px",
              width: "215px", height: "300px",
              objectFit: "cover", objectPosition: "center top",
              transform: "rotate(6deg)",
              WebkitMaskImage: "radial-gradient(ellipse 78% 82% at 50% 46%, black 40%, transparent 76%)",
              maskImage: "radial-gradient(ellipse 78% 82% at 50% 46%, black 40%, transparent 76%)",
              opacity: 0.96,
            }}
          />
          {/* Gradiente de fusão — borda esquerda */}
          <div className="absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-white to-transparent" />
          {/* Gradiente de fusão — base */}
          <div className="absolute inset-x-0 bottom-0 z-10 h-14 bg-gradient-to-t from-white/65 to-transparent" />
          {/* Botões sobrepostos */}
          <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2">
            <div className="inline-flex items-center gap-2 rounded-lg border border-padap-line bg-white/92 px-3 py-2 text-xs font-semibold text-padap-muted shadow-sm backdrop-blur-sm">
              <Clock size={13} className="text-padap-green" />
              Última atualização: {updatedAt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
            </div>
            <Button onClick={refreshPanel} className="min-h-9 text-xs shadow-glow">
              <RefreshCw size={14} />
              Atualizar painel
            </Button>
          </div>
        </div>

        {/* Botões mobile — visíveis apenas abaixo de lg */}
        <div className="relative z-10 flex flex-col gap-2 border-t border-padap-line px-6 py-4 sm:flex-row sm:items-center lg:hidden">
          <div className="inline-flex items-center gap-2 rounded-lg border border-padap-line bg-padap-field px-3 py-2 text-xs font-semibold text-padap-muted">
            <Clock size={13} className="text-padap-green" />
            Última atualização: {updatedAt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
          </div>
          <Button onClick={refreshPanel} className="min-h-9 text-xs">
            <RefreshCw size={14} />
            Atualizar painel
          </Button>
        </div>

      </div>

      {/* ── Indicadores ── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {snapshot.metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} icon={metricIcons[metric.id]} onClick={() => goTo(metric.targetPath)} />
        ))}
      </div>

      {/* ── Prioridade + Planner ── */}
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

      {/* ── Semáforo + Yara ── */}
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

      {/* ── Mercado + Estoque ── */}
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

      {/* ── Ações recomendadas ── */}
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
  const iconStyle = metricIconStyle[metric.id] ?? { bg: "bg-padap-field", color: "text-padap-muted" };
  const history = metricHistoryData[metric.id];
  return (
    <button type="button" onClick={onClick} className="group rounded-xl border border-padap-line bg-white p-4 text-left shadow-panel ring-1 ring-black/[0.02] transition duration-200 hover:-translate-y-0.5 hover:border-padap-green/40 hover:shadow-lift focus:outline-none focus:ring-2 focus:ring-padap-green/25">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase leading-5 tracking-[0.12em] text-padap-muted">{metric.title}</p>
          <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${iconStyle.bg} ${iconStyle.color}`}>
            {icon}
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-padap-ink">{metric.value}</p>
          <p className="mt-1 text-xs leading-5 text-padap-muted">{metric.description}</p>
        </div>
        {history && (
          <div className="mt-1">
            <Sparkline data={history} color={sparklineColor(metric.tone)} />
          </div>
        )}
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
