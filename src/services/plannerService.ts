import type { PlannerRecurrence, PlannerTask, PlannerTaskTemplate } from "../types";

const tasksKey = "padap.planner.tasks";
const templatesKey = "padap.planner.templates";

export const plannerCategories = [
  "Preços",
  "Estoque",
  "Cotação",
  "Pedido",
  "Relatório",
  "Follow-up",
  "Compra",
  "Aprovação",
  "Lista Yara",
  "Geral"
];

export const plannerPriorities = ["Baixa", "Média", "Alta", "Urgente"] as const;
export const plannerStatuses = ["Não iniciada", "Em andamento", "Concluída"] as const;
export const plannerRecurrences = ["Nenhuma", "Diária", "Semanal", "Quinzenal", "Mensal"] as const;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(date: string, days: number) {
  const next = new Date(`${date}T00:00:00`);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

function addMonths(date: string, months: number) {
  const [year, month, day] = date.split("-").map(Number);
  const target = new Date(year, month - 1 + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, lastDay));
  return target.toISOString().slice(0, 10);
}

function readStorage<T>(key: string): T[] | null {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T[] : null;
  } catch {
    return null;
  }
}

function writeStorage<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value));
}

function taskSeed(): PlannerTask[] {
  const now = new Date().toISOString();
  const due = today();
  return [
    buildTaskSeed("Análise de preços", "Preços", "Alta", "Semanal", due),
    buildTaskSeed("Envio das cotações", "Cotação", "Média", "Semanal", due),
    buildTaskSeed("Conferência de pedidos", "Pedido", "Média", "Semanal", addDays(due, 1)),
    buildTaskSeed("Atualizar estoque", "Estoque", "Alta", "Semanal", addDays(due, 1)),
    buildTaskSeed("Relatório semanal de mercado", "Relatório", "Média", "Semanal", addDays(due, 2)),
    buildTaskSeed("Conferir propostas vencendo", "Follow-up", "Alta", "Diária", due)
  ].map((task) => ({ ...task, createdAt: now, updatedAt: now }));
}

function buildTaskSeed(title: string, category: string, priority: PlannerTask["priority"], recurrence: PlannerRecurrence, dueDate: string): PlannerTask {
  return {
    id: crypto.randomUUID(),
    title,
    description: "Tarefa inicial sugerida para rotina de compras.",
    category,
    dueDate,
    priority,
    status: "Não iniciada",
    recurrence,
    isRecurring: recurrence !== "Nenhuma",
    createdAt: "",
    updatedAt: ""
  };
}

function templateSeed(): PlannerTaskTemplate[] {
  const now = new Date().toISOString();
  return [
    ["Análise de preços", "Preços", "Alta", "Semanal"],
    ["Envio das cotações", "Cotação", "Média", "Semanal"],
    ["Conferência de pedidos", "Pedido", "Média", "Semanal"],
    ["Relatório semanal de mercado", "Relatório", "Média", "Semanal"],
    ["Atualizar estoque", "Estoque", "Alta", "Semanal"],
    ["Conferir propostas vencendo", "Follow-up", "Alta", "Semanal"],
    ["Atualizar tabela de precificação do estoque", "Estoque", "Alta", "Mensal"],
    ["Revisar estoque mínimo", "Estoque", "Média", "Mensal"],
    ["Conferir produtos parados", "Estoque", "Média", "Mensal"],
    ["Revisar fornecedores", "Compra", "Média", "Mensal"],
    ["Conferir vencimentos", "Lista Yara", "Alta", "Mensal"],
    ["Fechar relatório mensal de compras", "Relatório", "Alta", "Mensal"]
  ].map(([title, category, priority, recurrence]) => ({
    id: crypto.randomUUID(),
    title,
    description: recurrence === "Semanal" ? "Modelo de rotina semanal de compras." : "Modelo de rotina mensal de compras.",
    category,
    priority: priority as PlannerTaskTemplate["priority"],
    recurrence: recurrence as PlannerRecurrence,
    createdAt: now,
    updatedAt: now
  }));
}

export function loadPlannerTasks() {
  const stored = readStorage<PlannerTask>(tasksKey);
  if (stored) return stored;
  const seeded = taskSeed();
  writeStorage(tasksKey, seeded);
  return seeded;
}

export function savePlannerTasks(tasks: PlannerTask[]) {
  writeStorage(tasksKey, tasks);
}

export function loadPlannerTemplates() {
  const stored = readStorage<PlannerTaskTemplate>(templatesKey);
  if (stored) return stored;
  const seeded = templateSeed();
  writeStorage(templatesKey, seeded);
  return seeded;
}

export function savePlannerTemplates(templates: PlannerTaskTemplate[]) {
  writeStorage(templatesKey, templates);
}

export function isPlannerTaskOverdue(task: PlannerTask, referenceDate = today()) {
  return task.dueDate < referenceDate && task.status !== "Concluída";
}

export function getNextPlannerDueDate(dueDate: string, recurrence: PlannerRecurrence) {
  if (recurrence === "Diária") return addDays(dueDate, 1);
  if (recurrence === "Semanal") return addDays(dueDate, 7);
  if (recurrence === "Quinzenal") return addDays(dueDate, 14);
  if (recurrence === "Mensal") return addMonths(dueDate, 1);
  return dueDate;
}

export function duplicatePlannerTask(task: PlannerTask): PlannerTask {
  const now = new Date().toISOString();
  return {
    ...task,
    id: crypto.randomUUID(),
    title: `${task.title} (cópia)`,
    status: "Não iniciada",
    completedAt: undefined,
    recurrenceAnchor: undefined,
    createdAt: now,
    updatedAt: now
  };
}

export function createTaskFromTemplate(template: PlannerTaskTemplate, dueDate = today()): PlannerTask {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: template.title,
    description: template.description,
    category: template.category,
    responsible: template.suggestedResponsible,
    dueDate,
    priority: template.priority,
    status: "Não iniciada",
    recurrence: template.recurrence,
    isRecurring: template.recurrence !== "Nenhuma",
    originTemplateId: template.id,
    createdAt: now,
    updatedAt: now
  };
}

export function buildNextRecurringTask(task: PlannerTask): PlannerTask | null {
  if (task.recurrence === "Nenhuma") return null;
  const now = new Date().toISOString();
  const anchor = task.recurrenceAnchor || task.id;
  return {
    ...task,
    id: crypto.randomUUID(),
    dueDate: getNextPlannerDueDate(task.dueDate, task.recurrence),
    status: "Não iniciada",
    recurrenceAnchor: anchor,
    completedAt: undefined,
    createdAt: now,
    updatedAt: now,
    isRecurring: true
  };
}
