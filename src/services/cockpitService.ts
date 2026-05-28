import { mockMarketIndicators } from "../data/mockMarket";
import { mockApprovals, mockPackages, mockProposals } from "../data/mockProposals";
import type { MarketIndicator } from "../types";
import { formatarMoedaBRL, formatarPercentual } from "../utils/currency";
import { calcularMargemPercentual, packageTotals } from "../utils/marginCalculations";
import { loadPlannerTasks, isPlannerTaskOverdue } from "./plannerService";
import { consolidateStock, getPurchaseSuggestions, loadMinimumRules, loadStockItems } from "./stockService";
import { getActiveWeeklyTable } from "./weeklyTableService";

export type CockpitTone = "green" | "amber" | "red" | "cyan" | "neutral";

export type CockpitTarget =
  | "/compras/propostas"
  | "/compras/pacotes"
  | "/compras/estoque"
  | "/compras/tabela-da-semana"
  | "/compras/planner";

export interface CockpitMetric {
  id: string;
  title: string;
  value: string;
  description: string;
  tone: CockpitTone;
  targetPath: CockpitTarget;
}

export interface CockpitPriority {
  id: string;
  title: string;
  reason: string;
  priority: "Critica" | "Alta" | "Media";
  actionLabel: string;
  targetPath: CockpitTarget;
}

export interface CockpitRecommendedAction {
  id: string;
  problem: string;
  why: string;
  action: string;
  priority: "Critica" | "Alta" | "Media";
  actionLabel: string;
  targetPath: CockpitTarget;
}

export interface CommercialSemaphoreItem {
  id: string;
  label: string;
  count: number;
  description: string;
  tone: CockpitTone | "orange";
  targetPath: CockpitTarget;
}

export interface MarketPulseItem {
  id: string;
  name: string;
  value: string;
  variation: string;
  trend: string;
  impact: string;
  tone: CockpitTone;
  history: MarketIndicator["history"];
}

export interface CockpitSnapshot {
  metrics: CockpitMetric[];
  priorities: CockpitPriority[];
  recommendedActions: CockpitRecommendedAction[];
  semaphore: CommercialSemaphoreItem[];
  marketPulse: MarketPulseItem[];
  summary: {
    actionsCount: number;
    expiringProposals: number;
    pendingApprovals: number;
    openValue: number;
    averageMargin: number;
    criticalStock: number;
    todayTasks: number;
  };
  yara: {
    label: string;
    status: "valida" | "vencendo" | "vencida" | "sem-lista";
    expiresAt: string | null;
    detail: string;
    actionLabel: string;
    targetPath: CockpitTarget;
  };
  packages: {
    belowTarget: number;
    mostCriticalId: string | null;
    margin: number | null;
    targetMargin: number;
    targetPath: CockpitTarget;
  };
  stock: {
    negative: number;
    zero: number;
    belowMinimum: number;
    purchaseSuggestions: number;
    targetPath: CockpitTarget;
  };
  planner: {
    today: number;
    overdue: number;
    completedToday: number;
    nextTask: string;
    targetPath: CockpitTarget;
  };
}

const targetMargin = 10;

function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isToday(value: string, reference = todayKey()) {
  return value.slice(0, 10) === reference;
}

function isProposalOpen(status: string) {
  return !["Cancelada", "Perdida", "Vencida", "Inativa"].includes(status);
}

function getProposalMargin(proposal: (typeof mockProposals)[number]) {
  return calcularMargemPercentual(
    proposal.salePrice,
    proposal.productCost + proposal.freight + proposal.taxes + proposal.commission + proposal.otherExpenses
  );
}

function getProposalCommercialGroup(proposal: (typeof mockProposals)[number]) {
  const margin = getProposalMargin(proposal);
  const expired = new Date(proposal.validity).getTime() < Date.now();
  const status = proposal.status.toLowerCase();

  if (expired) return "expired";
  if (status.includes("aprova")) return "approval";
  if (proposal.assistantAvailability === "Aguardando fornecedor") return "supplier";
  if (proposal.assistantAvailability === "Indisponível") return "blocked";
  if (margin < 0) return "blocked";
  if (margin < targetMargin) return "approval";
  if (margin < targetMargin + 1.5 || status.includes("precifica")) return "review";
  return "ready";
}

function getWeeklyListSummary(): CockpitSnapshot["yara"] {
  const table = getActiveWeeklyTable();
  if (!table?.expiresAt) {
    return {
      label: "Nenhuma Lista Yara ativa",
      status: "sem-lista",
      expiresAt: null,
      detail: "Importe ou confirme uma lista antes de novas propostas Yara.",
      actionLabel: "Importar Lista Yara",
      targetPath: "/compras/tabela-da-semana"
    };
  }

  const expiresAt = new Date(table.expiresAt);
  const diffHours = (expiresAt.getTime() - Date.now()) / 3600000;
  const status = diffHours < 0 ? "vencida" : diffHours <= 48 ? "vencendo" : "valida";
  const absoluteDate = expiresAt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  const remaining = Math.abs(diffHours) < 48
    ? `${Math.ceil(Math.abs(diffHours))} horas`
    : `${Math.ceil(Math.abs(diffHours) / 24)} dias`;

  return {
    label: status === "vencida" ? "Lista Yara vencida" : status === "vencendo" ? `Lista Yara vence em ${remaining}` : "Lista Yara valida",
    status,
    expiresAt: table.expiresAt,
    detail: `Vencimento: ${absoluteDate}.`,
    actionLabel: "Abrir Lista Yara",
    targetPath: "/compras/tabela-da-semana"
  };
}

function getStockSummary(): CockpitSnapshot["stock"] {
  const consolidated = consolidateStock(loadStockItems(), loadMinimumRules());
  const suggestions = getPurchaseSuggestions(consolidated);

  return {
    negative: consolidated.filter((item) => item.status === "Crítico / Negativo").length,
    zero: consolidated.filter((item) => item.status === "Zerado").length,
    belowMinimum: consolidated.filter((item) => item.status === "Baixo estoque").length,
    purchaseSuggestions: suggestions.length,
    targetPath: "/compras/estoque"
  };
}

function getPlannerSummary(): CockpitSnapshot["planner"] {
  const tasks = loadPlannerTasks();
  const today = todayKey();
  const activeTasks = tasks.filter((task) => task.status !== "Concluída");
  const todayTasks = tasks.filter((task) => task.dueDate === today && task.status !== "Concluída");
  const overdueTasks = tasks.filter((task) => isPlannerTaskOverdue(task, today));
  const completedToday = tasks.filter((task) => task.status === "Concluída" && task.completedAt && isToday(task.completedAt, today));
  const nextTask = [...overdueTasks, ...todayTasks, ...activeTasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  return {
    today: todayTasks.length,
    overdue: overdueTasks.length,
    completedToday: completedToday.length,
    nextTask: nextTask?.title ?? "Nenhuma tarefa operacional pendente",
    targetPath: "/compras/planner"
  };
}

function getPackageSummary(): CockpitSnapshot["packages"] {
  const packagesWithMargin = mockPackages.map((pkg) => ({ pkg, totals: packageTotals(pkg) }));
  const belowTarget = packagesWithMargin.filter((item) => item.totals.margin < targetMargin);
  const mostCritical = belowTarget.sort((a, b) => a.totals.margin - b.totals.margin)[0];

  return {
    belowTarget: belowTarget.length,
    mostCriticalId: mostCritical?.pkg.id ?? null,
    margin: mostCritical?.totals.margin ?? null,
    targetMargin,
    targetPath: "/compras/pacotes"
  };
}

export function getCommercialSemaphore(): CommercialSemaphoreItem[] {
  const groups = mockProposals.reduce<Record<string, number>>((acc, proposal) => {
    const group = getProposalCommercialGroup(proposal);
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {});

  return [
    { id: "ready", label: "Prontas para enviar", count: groups.ready || 0, description: "Margem e validade sem bloqueios", tone: "green", targetPath: "/compras/propostas" },
    { id: "review", label: "Precisam revisão", count: groups.review || 0, description: "Margem, preço ou validade pedem conferencia", tone: "amber", targetPath: "/compras/propostas" },
    { id: "approval", label: "Requerem aprovação", count: groups.approval || 0, description: "Aguardando decisao comercial", tone: "orange", targetPath: "/compras/propostas" },
    { id: "blocked", label: "Bloqueadas", count: groups.blocked || 0, description: "Margem negativa ou indisponibilidade", tone: "red", targetPath: "/compras/propostas" },
    { id: "supplier", label: "Aguardando fornecedor", count: groups.supplier || 0, description: "Disponibilidade ainda nao confirmada", tone: "cyan", targetPath: "/compras/propostas" },
    { id: "expired", label: "Vencidas/inativas", count: groups.expired || 0, description: "Validade expirada ou fora de uso", tone: "neutral", targetPath: "/compras/propostas" }
  ];
}

export function getMarketPulse(): MarketPulseItem[] {
  return mockMarketIndicators.slice(0, 3).map((indicator) => {
    const trend = indicator.variation > 1 ? "leve alta" : indicator.variation < -1 ? "queda" : "estavel";
    const tone: CockpitTone = indicator.variation > 1 ? "amber" : indicator.variation < -1 ? "green" : "cyan";
    const impactByName: Record<string, string> = {
      PTAX: "Revisar propostas abertas em dolar.",
      Ureia: "Atencao em nitrogenados e validade curta.",
      MAP: "Revisar relacao de troca e pacotes fosfatados."
    };

    return {
      id: indicator.name.toLowerCase(),
      name: indicator.name,
      value: `${indicator.name === "PTAX" ? indicator.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : formatarMoedaBRL(indicator.value)} ${indicator.unit}`,
      variation: `${indicator.variation > 0 ? "+" : ""}${formatarPercentual(indicator.variation)}`,
      trend,
      impact: impactByName[indicator.name] ?? "Acompanhar impactos comerciais.",
      tone,
      history: indicator.history
    };
  });
}

export function getCockpitMetrics(): CockpitSnapshot["summary"] & { metrics: CockpitMetric[] } {
  const today = todayKey();
  const openProposals = mockProposals.filter((proposal) => isProposalOpen(proposal.status));
  const expiringProposals = openProposals.filter((proposal) => proposal.validity.slice(0, 10) <= today).length;
  const pendingApprovals = mockApprovals.filter((approval) => approval.decision === "Pendente").length;
  const openValue = openProposals.reduce((sum, proposal) => sum + proposal.salePrice * proposal.quantity, 0);
  const averageMargin = openProposals.length
    ? openProposals.reduce((sum, proposal) => sum + getProposalMargin(proposal), 0) / openProposals.length
    : 0;
  const stock = getStockSummary();
  const planner = getPlannerSummary();
  const criticalStock = stock.negative + stock.zero + stock.belowMinimum;

  return {
    expiringProposals,
    pendingApprovals,
    openValue,
    averageMargin,
    criticalStock,
    todayTasks: planner.today,
    actionsCount: expiringProposals + pendingApprovals + criticalStock + planner.today + planner.overdue,
    metrics: [
      { id: "expiring-proposals", title: "Propostas vencendo hoje", value: String(expiringProposals), description: "Abrir propostas com validade critica", tone: "amber", targetPath: "/compras/propostas" },
      { id: "pending-approvals", title: "Aprovações pendentes", value: String(pendingApprovals), description: "Decisoes comerciais aguardando aprovacao", tone: "cyan", targetPath: "/compras/propostas" },
      { id: "open-volume", title: "Volume em propostas abertas", value: formatarMoedaBRL(openValue), description: "Valor total em negociacao ativa", tone: "green", targetPath: "/compras/propostas" },
      { id: "average-margin", title: "Margem média das propostas", value: formatarPercentual(averageMargin), description: "Media das propostas abertas", tone: averageMargin < targetMargin ? "amber" : "green", targetPath: "/compras/propostas" },
      { id: "critical-stock", title: "Estoque crítico", value: String(criticalStock), description: "Negativos, zerados ou abaixo do minimo", tone: criticalStock ? "red" : "green", targetPath: "/compras/estoque" },
      { id: "today-tasks", title: "Tarefas de hoje", value: String(planner.today), description: `${planner.overdue} atrasadas no Planner`, tone: planner.overdue ? "amber" : "cyan", targetPath: "/compras/planner" }
    ]
  };
}

export function getTodayPriorities(): CockpitPriority[] {
  const metrics = getCockpitMetrics();
  const packages = getPackageSummary();
  const yara = getWeeklyListSummary();
  const stock = getStockSummary();
  const planner = getPlannerSummary();
  const priorities: CockpitPriority[] = [];

  if (metrics.pendingApprovals) priorities.push({ id: "approvals", title: `Aprovar ${metrics.pendingApprovals} solicitações pendentes`, reason: "Ha propostas aguardando decisao comercial.", priority: "Alta", actionLabel: "Revisar propostas", targetPath: "/compras/propostas" });
  if (metrics.expiringProposals) priorities.push({ id: "expiring", title: `Revisar ${metrics.expiringProposals} propostas vencendo`, reason: "Validade curta pode exigir recalculo ou reenvio.", priority: "Alta", actionLabel: "Revisar propostas", targetPath: "/compras/propostas" });
  if (packages.belowTarget) priorities.push({ id: "packages", title: `Revisar pacote ${packages.mostCriticalId} abaixo da meta`, reason: packages.margin === null ? "Margem do pacote precisa de conferencia." : `Margem atual ${formatarPercentual(packages.margin)} contra meta de ${formatarPercentual(packages.targetMargin)}.`, priority: "Critica", actionLabel: "Abrir pacote", targetPath: "/compras/pacotes" });
  if (yara.status !== "valida") priorities.push({ id: "yara", title: yara.label, reason: yara.detail, priority: yara.status === "vencida" || yara.status === "sem-lista" ? "Critica" : "Alta", actionLabel: yara.actionLabel, targetPath: yara.targetPath });
  if (stock.purchaseSuggestions) priorities.push({ id: "stock", title: `Conferir ${stock.purchaseSuggestions} sugestões de compra`, reason: `${stock.negative} negativos, ${stock.zero} zerados e ${stock.belowMinimum} abaixo do minimo.`, priority: stock.negative || stock.zero ? "Critica" : "Alta", actionLabel: "Conferir estoque", targetPath: "/compras/estoque" });
  if (planner.overdue || planner.today) priorities.push({ id: "planner", title: planner.overdue ? `Executar ${planner.overdue} tarefas atrasadas` : `Executar ${planner.today} tarefas de hoje`, reason: `Proxima tarefa: ${planner.nextTask}.`, priority: planner.overdue ? "Alta" : "Media", actionLabel: "Ver tarefas", targetPath: "/compras/planner" });

  return priorities.slice(0, 5);
}

export function getRecommendedActions(): CockpitRecommendedAction[] {
  const packages = getPackageSummary();
  const yara = getWeeklyListSummary();
  const stock = getStockSummary();
  const planner = getPlannerSummary();
  const ptax = mockMarketIndicators.find((indicator) => indicator.name === "PTAX");

  return [
    {
      id: "ptax",
      problem: `PTAX ${ptax && ptax.variation >= 0 ? "subiu" : "variou"} ${ptax ? formatarPercentual(Math.abs(ptax.variation)) : "0,00%"} desde a ultima cotacao.`,
      why: "Pode reduzir margem em propostas abertas de adubos importados.",
      action: "Recalcular propostas sensiveis ao dolar antes de reenviar ao consultor.",
      priority: "Alta",
      actionLabel: "Revisar propostas",
      targetPath: "/compras/propostas"
    },
    {
      id: "package",
      problem: packages.belowTarget ? "Pacote estrategico abaixo da meta." : "Pacotes dentro da rotina de acompanhamento.",
      why: packages.margin === null ? "Nenhum pacote abaixo da meta neste momento." : `Pacote ${packages.mostCriticalId} com margem ${formatarPercentual(packages.margin)}.`,
      action: packages.belowTarget ? "Solicitar aprovacao ou redistribuir margem entre itens." : "Manter acompanhamento dos pacotes comerciais ativos.",
      priority: packages.belowTarget ? "Critica" : "Media",
      actionLabel: "Abrir pacote",
      targetPath: "/compras/pacotes"
    },
    {
      id: "yara",
      problem: yara.label,
      why: yara.detail,
      action: yara.status === "valida" ? "Usar lista ativa como base para novas cotacoes." : "Confirmar validade ou importar a proxima tabela Yara.",
      priority: yara.status === "vencida" || yara.status === "sem-lista" ? "Critica" : yara.status === "vencendo" ? "Alta" : "Media",
      actionLabel: yara.actionLabel,
      targetPath: yara.targetPath
    },
    {
      id: "stock",
      problem: stock.purchaseSuggestions ? "Estoque critico em produtos com demanda." : "Estoque sem sugestoes criticas no momento.",
      why: `${stock.negative} negativos, ${stock.zero} zerados, ${stock.belowMinimum} abaixo do minimo.`,
      action: "Conferir disponibilidade antes de prometer produtos vendidos.",
      priority: stock.negative || stock.zero ? "Critica" : stock.belowMinimum ? "Alta" : "Media",
      actionLabel: "Conferir estoque",
      targetPath: "/compras/estoque"
    },
    {
      id: "planner",
      problem: planner.overdue ? "Tarefas atrasadas no Planner." : "Planner com rotina do dia.",
      why: `${planner.today} tarefas de hoje, ${planner.overdue} atrasadas e ${planner.completedToday} concluidas hoje.`,
      action: `Proxima tarefa importante: ${planner.nextTask}.`,
      priority: planner.overdue ? "Alta" : "Media",
      actionLabel: "Ver tarefas",
      targetPath: "/compras/planner"
    }
  ];
}

export function getCockpitSnapshot(): CockpitSnapshot {
  const metrics = getCockpitMetrics();
  const priorities = getTodayPriorities();
  const recommendedActions = getRecommendedActions();
  const semaphore = getCommercialSemaphore();
  const marketPulse = getMarketPulse();
  const yara = getWeeklyListSummary();
  const packages = getPackageSummary();
  const stock = getStockSummary();
  const planner = getPlannerSummary();
  const actionsCount = Math.max(metrics.actionsCount, priorities.length + recommendedActions.filter((item) => item.priority !== "Media").length);

  return {
    metrics: metrics.metrics,
    priorities,
    recommendedActions,
    semaphore,
    marketPulse,
    summary: { ...metrics, actionsCount },
    yara,
    packages,
    stock,
    planner
  };
}
