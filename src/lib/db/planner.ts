import { supabase } from "../supabaseClient";
import type { PlannerTask, PlannerTaskTemplate } from "../../types";

// ── Tasks ──────────────────────────────────────────────────────

export async function fetchPlannerTasks(): Promise<PlannerTask[]> {
  const { data, error } = await supabase
    .from("planner_tasks")
    .select("*")
    .order("due_date", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToTask);
}

export async function upsertPlannerTasks(tasks: PlannerTask[]): Promise<void> {
  if (!tasks.length) return;
  const { error } = await supabase
    .from("planner_tasks")
    .upsert(tasks.map(taskToRow), { onConflict: "id" });
  if (error) throw error;
}

export async function deletePlannerTask(id: string): Promise<void> {
  const { error } = await supabase.from("planner_tasks").delete().eq("id", id);
  if (error) throw error;
}

// ── Templates ─────────────────────────────────────────────────

export async function fetchPlannerTemplates(): Promise<PlannerTaskTemplate[]> {
  const { data, error } = await supabase
    .from("planner_templates")
    .select("*")
    .order("title", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToTemplate);
}

export async function upsertPlannerTemplates(templates: PlannerTaskTemplate[]): Promise<void> {
  if (!templates.length) return;
  const { error } = await supabase
    .from("planner_templates")
    .upsert(templates.map(templateToRow), { onConflict: "id" });
  if (error) throw error;
}

export async function deletePlannerTemplate(id: string): Promise<void> {
  const { error } = await supabase.from("planner_templates").delete().eq("id", id);
  if (error) throw error;
}

// ── Mappers ───────────────────────────────────────────────────

function taskToRow(t: PlannerTask) {
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? null,
    category: t.category,
    responsible: t.responsible ?? null,
    due_date: t.dueDate,
    priority: t.priority,
    status: t.status,
    recurrence: t.recurrence,
    template_id: (t as unknown as Record<string, unknown>).templateId ?? null,
    completed_at: t.status === "Concluída" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
}

function rowToTask(r: Record<string, unknown>): PlannerTask {
  return {
    id: r.id as string,
    title: r.title as string,
    description: (r.description as string) ?? undefined,
    category: r.category as string,
    responsible: (r.responsible as string) ?? undefined,
    dueDate: r.due_date as string,
    priority: r.priority as PlannerTask["priority"],
    status: r.status as PlannerTask["status"],
    recurrence: r.recurrence as PlannerTask["recurrence"],
  };
}

function templateToRow(t: PlannerTaskTemplate) {
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? null,
    category: t.category,
    priority: t.priority,
    recurrence: t.recurrence,
    suggested_responsible: t.suggestedResponsible ?? null,
    updated_at: new Date().toISOString(),
  };
}

function rowToTemplate(r: Record<string, unknown>): PlannerTaskTemplate {
  return {
    id: r.id as string,
    title: r.title as string,
    description: (r.description as string) ?? undefined,
    category: r.category as string,
    priority: r.priority as PlannerTaskTemplate["priority"],
    recurrence: r.recurrence as PlannerTaskTemplate["recurrence"],
    suggestedResponsible: (r.suggested_responsible as string) ?? undefined,
  };
}
