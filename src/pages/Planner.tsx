import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Copy, Edit3, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Select } from "../components/ui/Select";
import { mockUsers } from "../data/mockUsers";
import { mockConsultants } from "../data/mockClients";
import {
  buildNextRecurringTask,
  createTaskFromTemplate,
  duplicatePlannerTask,
  isPlannerTaskOverdue,
  loadPlannerTasks,
  loadPlannerTemplates,
  plannerCategories,
  plannerPriorities,
  plannerRecurrences,
  plannerStatuses,
  savePlannerTasks,
  savePlannerTemplates
} from "../services/plannerService";
import type { PlannerPriority, PlannerRecurrence, PlannerTask, PlannerTaskStatus, PlannerTaskTemplate } from "../types";
import { notify } from "../utils/uiActions";

type PlannerView = "day" | "tasks" | "board" | "calendar" | "templates";
type TaskForm = Pick<PlannerTask, "title" | "description" | "category" | "responsible" | "dueDate" | "priority" | "status" | "recurrence">;
type TemplateForm = Pick<PlannerTaskTemplate, "title" | "description" | "category" | "priority" | "recurrence" | "suggestedResponsible">;

const views: { id: PlannerView; label: string }[] = [
  { id: "day", label: "Meu Dia" },
  { id: "tasks", label: "Minhas Tarefas" },
  { id: "board", label: "Quadro" },
  { id: "calendar", label: "Calendário" },
  { id: "templates", label: "Modelos" }
];

const defaultTaskForm = (): TaskForm => ({
  title: "",
  description: "",
  category: "Geral",
  responsible: "",
  dueDate: todayString(),
  priority: "Média",
  status: "Não iniciada",
  recurrence: "Nenhuma"
});

const defaultTemplateForm = (): TemplateForm => ({
  title: "",
  description: "",
  category: "Geral",
  priority: "Média",
  recurrence: "Nenhuma",
  suggestedResponsible: ""
});

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function monthTitle(date: Date) {
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function priorityTone(priority: PlannerPriority): "green" | "amber" | "red" | "neutral" {
  if (priority === "Baixa") return "green";
  if (priority === "Média") return "amber";
  return "red";
}

function statusTone(status: PlannerTaskStatus, overdue = false): "green" | "amber" | "red" | "neutral" {
  if (overdue) return "red";
  if (status === "Concluída") return "green";
  if (status === "Em andamento") return "amber";
  return "neutral";
}

function tabClass(active: boolean) {
  return `inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition ${
    active
      ? "border-padap-green/35 bg-padap-green/12 text-padap-mint shadow-[0_10px_26px_rgba(29,186,44,.10)]"
      : "border-white/10 bg-white/[0.035] text-slate-300 hover:border-padap-green/20 hover:bg-white/[0.06] hover:text-white"
  }`;
}

export default function Planner() {
  const [tasks, setTasks] = useState<PlannerTask[]>(() => loadPlannerTasks());
  const [templates, setTemplates] = useState<PlannerTaskTemplate[]>(() => loadPlannerTemplates());
  const [activeView, setActiveView] = useState<PlannerView>("day");
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PlannerTask | null>(null);
  const [taskForm, setTaskForm] = useState<TaskForm>(() => defaultTaskForm());
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PlannerTaskTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState<TemplateForm>(() => defaultTemplateForm());
  const [month, setMonth] = useState(() => new Date());
  const [filters, setFilters] = useState({
    search: "",
    category: "Todas",
    status: "Todos",
    priority: "Todas",
    responsible: "Todos",
    dueDate: "Todas",
    recurrence: "Todas"
  });

  const responsibleOptions = useMemo(() => {
    const users = mockUsers.filter((user) => user.status === "Ativo").map((user) => user.name);
    const consultants = mockConsultants.filter((consultant) => consultant.status === "Ativo").map((consultant) => consultant.name);
    const taskResponsibles = tasks.map((task) => task.responsible || "").filter(Boolean);
    return [...new Set([...users, ...consultants, ...taskResponsibles])].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [tasks]);

  const today = todayString();
  const todayTasks = tasks.filter((task) => task.dueDate === today && task.status !== "Concluída");
  const completedToday = tasks.filter((task) => task.completedAt?.slice(0, 10) === today);
  const overdueTasks = tasks.filter((task) => isPlannerTaskOverdue(task, today));
  const highPriorityTasks = tasks.filter((task) => (task.priority === "Alta" || task.priority === "Urgente") && task.status !== "Concluída");

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const query = filters.search.trim().toLowerCase();
      if (query && ![task.title, task.description, task.category, task.responsible].join(" ").toLowerCase().includes(query)) return false;
      if (filters.category !== "Todas" && task.category !== filters.category) return false;
      if (filters.status !== "Todos" && task.status !== filters.status) return false;
      if (filters.priority !== "Todas" && task.priority !== filters.priority) return false;
      if (filters.responsible !== "Todos" && (task.responsible || "Sem responsável") !== filters.responsible) return false;
      if (filters.recurrence !== "Todas" && task.recurrence !== filters.recurrence) return false;
      if (filters.dueDate === "Hoje" && task.dueDate !== today) return false;
      if (filters.dueDate === "Atrasadas" && !isPlannerTaskOverdue(task, today)) return false;
      if (filters.dueDate === "Esta semana" && !isThisWeek(task.dueDate)) return false;
      return true;
    });
  }, [filters, tasks, today]);

  const commitTasks = (next: PlannerTask[]) => {
    setTasks(next);
    savePlannerTasks(next);
  };

  const commitTemplates = (next: PlannerTaskTemplate[]) => {
    setTemplates(next);
    savePlannerTemplates(next);
  };

  const openNewTask = (base?: Partial<TaskForm>) => {
    setEditingTask(null);
    setTaskForm({ ...defaultTaskForm(), ...base });
    setTaskModalOpen(true);
  };

  const openEditTask = (task: PlannerTask) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      category: task.category,
      responsible: task.responsible || "",
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      recurrence: task.recurrence
    });
    setTaskModalOpen(true);
  };

  const saveTask = () => {
    if (!taskForm.title.trim()) {
      notify("Informe o título da tarefa.");
      return;
    }
    if (!taskForm.dueDate) {
      notify("Informe o vencimento da tarefa.");
      return;
    }

    const now = new Date().toISOString();
    if (editingTask) {
      const updatedTask: PlannerTask = {
        ...editingTask,
        ...taskForm,
        title: taskForm.title.trim(),
        responsible: taskForm.responsible?.trim(),
        description: taskForm.description?.trim(),
        completedAt: taskForm.status === "Concluída" ? editingTask.completedAt || now : undefined,
        isRecurring: taskForm.recurrence !== "Nenhuma",
        updatedAt: now
      };
      let next = tasks.map((task) => task.id === editingTask.id ? updatedTask : task);
      const recurring = editingTask.status !== "Concluída" && updatedTask.status === "Concluída" ? buildNextRecurringTask(updatedTask) : null;
      if (recurring) {
        const anchor = recurring.recurrenceAnchor || updatedTask.id;
        const exists = next.some((task) => task.id !== updatedTask.id && task.recurrenceAnchor === anchor && task.dueDate === recurring.dueDate);
        if (!exists) next = [recurring, ...next];
      }
      commitTasks(next);
      notify(recurring ? "Tarefa atualizada. Próxima ocorrência criada." : "Tarefa atualizada.");
    } else {
      const nextTask: PlannerTask = {
        id: crypto.randomUUID(),
        ...taskForm,
        title: taskForm.title.trim(),
        responsible: taskForm.responsible?.trim(),
        description: taskForm.description?.trim(),
        completedAt: taskForm.status === "Concluída" ? now : undefined,
        isRecurring: taskForm.recurrence !== "Nenhuma",
        createdAt: now,
        updatedAt: now
      };
      commitTasks([nextTask, ...tasks]);
      notify("Tarefa criada.");
    }
    setTaskModalOpen(false);
  };

  const completeTask = (task: PlannerTask) => {
    const now = new Date().toISOString();
    const completed = { ...task, status: "Concluída" as PlannerTaskStatus, completedAt: now, updatedAt: now };
    let next = tasks.map((item) => item.id === task.id ? completed : item);
    const recurring = buildNextRecurringTask(completed);
    if (recurring) {
      const anchor = recurring.recurrenceAnchor || completed.id;
      const exists = next.some((item) => item.id !== completed.id && item.recurrenceAnchor === anchor && item.dueDate === recurring.dueDate);
      if (!exists) next = [recurring, ...next];
    }
    commitTasks(next);
    notify(recurring ? "Tarefa concluída. Próxima ocorrência criada." : "Tarefa concluída.");
  };

  const updateTaskStatus = (task: PlannerTask, status: PlannerTaskStatus) => {
    if (status === "Concluída") {
      completeTask(task);
      return;
    }
    const now = new Date().toISOString();
    commitTasks(tasks.map((item) => item.id === task.id ? { ...item, status, completedAt: undefined, updatedAt: now } : item));
  };

  const reopenTask = (task: PlannerTask) => {
    updateTaskStatus(task, "Não iniciada");
    notify("Tarefa reaberta.");
  };

  const deleteTask = (task: PlannerTask) => {
    if (!window.confirm("Tem certeza que deseja excluir esta tarefa?")) return;
    commitTasks(tasks.filter((item) => item.id !== task.id));
    notify("Tarefa excluída.");
  };

  const duplicateTask = (task: PlannerTask) => {
    commitTasks([duplicatePlannerTask(task), ...tasks]);
    notify("Tarefa duplicada.");
  };

  const openNewTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm(defaultTemplateForm());
    setTemplateModalOpen(true);
  };

  const openEditTemplate = (template: PlannerTaskTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      title: template.title,
      description: template.description || "",
      category: template.category,
      priority: template.priority,
      recurrence: template.recurrence,
      suggestedResponsible: template.suggestedResponsible || ""
    });
    setTemplateModalOpen(true);
  };

  const saveTemplate = () => {
    if (!templateForm.title.trim()) {
      notify("Informe o título do modelo.");
      return;
    }
    const now = new Date().toISOString();
    if (editingTemplate) {
      commitTemplates(templates.map((template) => template.id === editingTemplate.id ? { ...template, ...templateForm, title: templateForm.title.trim(), updatedAt: now } : template));
      notify("Modelo atualizado.");
    } else {
      commitTemplates([{ id: crypto.randomUUID(), ...templateForm, title: templateForm.title.trim(), createdAt: now, updatedAt: now }, ...templates]);
      notify("Modelo criado.");
    }
    setTemplateModalOpen(false);
  };

  const deleteTemplate = (template: PlannerTaskTemplate) => {
    if (!window.confirm("Excluir este modelo de tarefa?")) return;
    commitTemplates(templates.filter((item) => item.id !== template.id));
    notify("Modelo excluído.");
  };

  const useTemplate = (template: PlannerTaskTemplate) => {
    commitTasks([createTaskFromTemplate(template), ...tasks]);
    notify("Tarefa criada a partir do modelo.");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-padap-green/80">Compras &gt; Planner</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="inline-block h-6 w-1.5 rounded-full bg-padap-green" />
            <h2 className="text-2xl font-bold text-padap-ink">Planner</h2>
          </div>
          <p className="mt-1 pl-3 max-w-3xl text-sm leading-6 text-padap-muted">Organize suas atividades e rotina do setor de compras.</p>
        </div>
        <Button onClick={() => openNewTask()} className="shrink-0">
          <Plus size={16} /> Nova tarefa
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/[0.08] bg-[#061615]/70 p-2">
        <nav className="flex min-w-max gap-2" aria-label="Navegação do Planner">
          {views.map((view) => (
            <button key={view.id} type="button" onClick={() => setActiveView(view.id)} className={tabClass(activeView === view.id)}>
              {view.label}
            </button>
          ))}
        </nav>
      </div>

      {activeView === "day" && (
        <DayView
          todayTasks={todayTasks}
          completedToday={completedToday}
          overdueTasks={overdueTasks}
          highPriorityTasks={highPriorityTasks}
          tasks={tasks}
          templates={templates.slice(0, 4)}
          onNewTask={openNewTask}
          onEdit={openEditTask}
          onComplete={completeTask}
          onReopen={reopenTask}
          onDuplicate={duplicateTask}
          onDelete={deleteTask}
          onUseTemplate={useTemplate}
        />
      )}

      {activeView === "tasks" && (
        <TasksView
          tasks={filteredTasks}
          filters={filters}
          responsibleOptions={responsibleOptions}
          onFilters={setFilters}
          onClear={() => setFilters({ search: "", category: "Todas", status: "Todos", priority: "Todas", responsible: "Todos", dueDate: "Todas", recurrence: "Todas" })}
          onNewTask={() => openNewTask()}
          onEdit={openEditTask}
          onComplete={completeTask}
          onReopen={reopenTask}
          onDuplicate={duplicateTask}
          onDelete={deleteTask}
        />
      )}

      {activeView === "board" && (
        <BoardView tasks={tasks} onEdit={openEditTask} onStatus={updateTaskStatus} />
      )}

      {activeView === "calendar" && (
        <CalendarView month={month} tasks={tasks} onMonth={setMonth} onNewTask={openNewTask} onEdit={openEditTask} />
      )}

      {activeView === "templates" && (
        <TemplatesView templates={templates} onNew={openNewTemplate} onEdit={openEditTemplate} onDelete={deleteTemplate} onUse={useTemplate} />
      )}

      <TaskModal
        open={taskModalOpen}
        editing={!!editingTask}
        form={taskForm}
        responsibleOptions={responsibleOptions}
        onForm={setTaskForm}
        onClose={() => setTaskModalOpen(false)}
        onSave={saveTask}
        onDelete={editingTask ? () => { deleteTask(editingTask); setTaskModalOpen(false); } : undefined}
      />

      <TemplateModal
        open={templateModalOpen}
        editing={!!editingTemplate}
        form={templateForm}
        responsibleOptions={responsibleOptions}
        onForm={setTemplateForm}
        onClose={() => setTemplateModalOpen(false)}
        onSave={saveTemplate}
      />
    </div>
  );
}

function DayView({ todayTasks, completedToday, overdueTasks, highPriorityTasks, tasks, templates, onNewTask, onEdit, onComplete, onReopen, onDuplicate, onDelete, onUseTemplate }: {
  todayTasks: PlannerTask[];
  completedToday: PlannerTask[];
  overdueTasks: PlannerTask[];
  highPriorityTasks: PlannerTask[];
  tasks: PlannerTask[];
  templates: PlannerTaskTemplate[];
  onNewTask: (base?: Partial<TaskForm>) => void;
  onEdit: (task: PlannerTask) => void;
  onComplete: (task: PlannerTask) => void;
  onReopen: (task: PlannerTask) => void;
  onDuplicate: (task: PlannerTask) => void;
  onDelete: (task: PlannerTask) => void;
  onUseTemplate: (template: PlannerTaskTemplate) => void;
}) {
  const nextTasks = tasks.filter((task) => task.status !== "Concluída").sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5);
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Tarefas de hoje" value={todayTasks.length} tone="green" />
        <SummaryCard label="Concluídas hoje" value={completedToday.length} tone="cyan" />
        <SummaryCard label="Atrasadas" value={overdueTasks.length} tone="red" />
        <SummaryCard label="Alta prioridade" value={highPriorityTasks.length} tone="amber" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_420px]">
        <Card>
          <SectionTitle title="Tarefas de hoje" action={<Button variant="ghost" onClick={() => onNewTask({ dueDate: todayString() })}><Plus size={15} /> Nova</Button>} />
          <TaskList tasks={todayTasks} empty="Nenhuma tarefa para hoje." onEdit={onEdit} onComplete={onComplete} onReopen={onReopen} onDuplicate={onDuplicate} onDelete={onDelete} />
        </Card>

        <div className="space-y-5">
          <Card>
            <SectionTitle title="Atrasadas" />
            <TaskList tasks={overdueTasks.slice(0, 5)} empty="Sem tarefas atrasadas." compact onEdit={onEdit} onComplete={onComplete} onReopen={onReopen} onDuplicate={onDuplicate} onDelete={onDelete} />
          </Card>
          <Card>
            <SectionTitle title="Modelos recentes" />
            <div className="space-y-2">
              {templates.map((template) => (
                <div key={template.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{template.title}</p>
                    <p className="text-xs text-slate-500">{template.category} · {template.recurrence}</p>
                  </div>
                  <Button variant="ghost" className="h-8 min-h-8 px-3 py-1 text-xs" onClick={() => onUseTemplate(template)}>Usar</Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <SectionTitle title="Próximas tarefas" />
        <TaskList tasks={nextTasks} empty="Nenhuma tarefa futura." compact onEdit={onEdit} onComplete={onComplete} onReopen={onReopen} onDuplicate={onDuplicate} onDelete={onDelete} />
      </Card>
    </div>
  );
}

function TasksView({ tasks, filters, responsibleOptions, onFilters, onClear, onNewTask, onEdit, onComplete, onReopen, onDuplicate, onDelete }: {
  tasks: PlannerTask[];
  filters: Record<string, string>;
  responsibleOptions: string[];
  onFilters: (filters: any) => void;
  onClear: () => void;
  onNewTask: () => void;
  onEdit: (task: PlannerTask) => void;
  onComplete: (task: PlannerTask) => void;
  onReopen: (task: PlannerTask) => void;
  onDuplicate: (task: PlannerTask) => void;
  onDelete: (task: PlannerTask) => void;
}) {
  const setFilter = (key: string, value: string) => onFilters({ ...filters, [key]: value });
  return (
    <Card>
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <SectionTitle title="Minhas Tarefas" />
        <div className="flex flex-wrap gap-2">
          <Button onClick={onNewTask}><Plus size={15} /> Nova tarefa</Button>
          <Button variant="ghost" onClick={onClear}>Limpar filtros</Button>
        </div>
      </div>

      <div className="mb-4 grid gap-2 md:grid-cols-2 xl:grid-cols-7">
        <div className="relative xl:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <Input className="pl-9" placeholder="Buscar tarefa" value={filters.search} onChange={(event) => setFilter("search", event.target.value)} />
        </div>
        <FilterSelect value={filters.category} onChange={(value) => setFilter("category", value)} options={["Todas", ...plannerCategories]} />
        <FilterSelect value={filters.status} onChange={(value) => setFilter("status", value)} options={["Todos", ...plannerStatuses]} />
        <FilterSelect value={filters.priority} onChange={(value) => setFilter("priority", value)} options={["Todas", ...plannerPriorities]} />
        <FilterSelect value={filters.responsible} onChange={(value) => setFilter("responsible", value)} options={["Todos", "Sem responsável", ...responsibleOptions]} />
        <FilterSelect value={filters.dueDate} onChange={(value) => setFilter("dueDate", value)} options={["Todas", "Hoje", "Esta semana", "Atrasadas"]} />
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-white/[0.08] lg:block">
        <div className="grid grid-cols-[minmax(240px,1.4fr)_130px_150px_120px_110px_130px_120px_170px] gap-2 bg-white/[0.045] px-3 py-2 text-xs font-semibold uppercase text-slate-400">
          <span>Tarefa</span><span>Categoria</span><span>Responsável</span><span>Vencimento</span><span>Prioridade</span><span>Status</span><span>Recorrência</span><span>Ações</span>
        </div>
        {tasks.map((task) => (
          <div key={task.id} className="grid grid-cols-[minmax(240px,1.4fr)_130px_150px_120px_110px_130px_120px_170px] items-center gap-2 border-t border-white/[0.07] px-3 py-3 text-sm">
            <TaskTitle task={task} />
            <CategoryChip category={task.category} />
            <span className="truncate text-slate-300">{task.responsible || "Sem responsável"}</span>
            <span className="text-slate-300">{formatDate(task.dueDate)}</span>
            <Badge tone={priorityTone(task.priority)}>{task.priority}</Badge>
            <Badge tone={statusTone(task.status, isPlannerTaskOverdue(task))}>{isPlannerTaskOverdue(task) ? "Atrasada" : task.status}</Badge>
            <span className="text-slate-300">{task.recurrence}</span>
            <TaskActions task={task} onEdit={onEdit} onComplete={onComplete} onReopen={onReopen} onDuplicate={onDuplicate} onDelete={onDelete} />
          </div>
        ))}
      </div>

      <div className="space-y-3 lg:hidden">
        <TaskList tasks={tasks} empty="Nenhuma tarefa encontrada." onEdit={onEdit} onComplete={onComplete} onReopen={onReopen} onDuplicate={onDuplicate} onDelete={onDelete} />
      </div>
      {tasks.length === 0 && <EmptyState>Nenhuma tarefa encontrada.</EmptyState>}
    </Card>
  );
}

function BoardView({ tasks, onEdit, onStatus }: { tasks: PlannerTask[]; onEdit: (task: PlannerTask) => void; onStatus: (task: PlannerTask, status: PlannerTaskStatus) => void }) {
  const columns = [
    { title: "Não iniciada", tasks: tasks.filter((task) => task.status === "Não iniciada" && !isPlannerTaskOverdue(task)) },
    { title: "Em andamento", tasks: tasks.filter((task) => task.status === "Em andamento" && !isPlannerTaskOverdue(task)) },
    { title: "Concluída", tasks: tasks.filter((task) => task.status === "Concluída") },
    { title: "Atrasada", tasks: tasks.filter((task) => isPlannerTaskOverdue(task)) }
  ];
  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {columns.map((column) => (
        <Card key={column.title} className="min-h-[260px]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
              <h3 className="text-base font-bold text-padap-ink">{column.title}</h3>
            </div>
            <Badge tone={column.title === "Atrasada" ? "red" : "neutral"}>{column.tasks.length}</Badge>
          </div>
          <div className="space-y-3">
            {column.tasks.map((task) => (
              <button key={task.id} type="button" onClick={() => onEdit(task)} className="w-full rounded-lg border border-white/[0.08] bg-white/[0.035] p-3 text-left transition hover:border-padap-green/25 hover:bg-white/[0.055]">
                <p className="text-sm font-semibold leading-5 text-white">{task.title}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <CategoryChip category={task.category} />
                  <Badge tone={priorityTone(task.priority)}>{task.priority}</Badge>
                </div>
                <p className="mt-3 text-xs text-slate-500">Vence em {formatDate(task.dueDate)}</p>
                <p className="mt-1 text-xs text-slate-500">{task.responsible || "Sem responsável"} · {task.recurrence}</p>
                <div className="mt-3" onClick={(event) => event.stopPropagation()}>
                  <Select value={task.status} onChange={(event) => onStatus(task, event.target.value as PlannerTaskStatus)} className="h-9 py-1 text-xs">
                    {plannerStatuses.map((status) => <option key={status}>{status}</option>)}
                  </Select>
                </div>
              </button>
            ))}
            {column.tasks.length === 0 && <p className="rounded-lg border border-dashed border-white/[0.10] p-4 text-sm text-slate-500">Sem tarefas nesta coluna.</p>}
          </div>
        </Card>
      ))}
    </div>
  );
}

function CalendarView({ month, tasks, onMonth, onNewTask, onEdit }: { month: Date; tasks: PlannerTask[]; onMonth: (date: Date) => void; onNewTask: (base?: Partial<TaskForm>) => void; onEdit: (task: PlannerTask) => void }) {
  const days = useMemo(() => buildCalendarDays(month), [month]);
  const currentMonth = month.getMonth();
  const today = todayString();
  const moveMonth = (delta: number) => onMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
  return (
    <Card>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
            <h3 className="text-base font-bold capitalize text-padap-ink">{monthTitle(month)}</h3>
          </div>
          <p className="mt-1 pl-3 text-sm text-padap-muted">Veja vencimentos da semana e do mês.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" className="h-10 w-10 p-0" onClick={() => moveMonth(-1)} aria-label="Mês anterior"><ChevronLeft size={16} /></Button>
          <Button variant="ghost" onClick={() => onMonth(new Date())}><CalendarDays size={15} /> Hoje</Button>
          <Button variant="ghost" className="h-10 w-10 p-0" onClick={() => moveMonth(1)} aria-label="Próximo mês"><ChevronRight size={16} /></Button>
          <Button onClick={() => onNewTask()}><Plus size={15} /> Nova tarefa</Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-xs font-semibold uppercase text-slate-500">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-7">
        {days.map((day) => {
          const key = toDateKey(day);
          const dayTasks = tasks.filter((task) => task.dueDate === key);
          const muted = day.getMonth() !== currentMonth;
          return (
            <div key={key} className={`min-h-[118px] rounded-lg border p-2 ${key === today ? "border-padap-green/35 bg-padap-green/[0.06]" : "border-white/[0.08] bg-white/[0.025]"} ${muted ? "opacity-45" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{day.getDate()}</span>
                {dayTasks.length > 0 && <span className="text-xs text-slate-500">{dayTasks.length}</span>}
              </div>
              <div className="mt-2 space-y-1">
                {dayTasks.slice(0, 3).map((task) => (
                  <button key={task.id} type="button" onClick={() => onEdit(task)} className={`w-full truncate rounded border px-2 py-1 text-left text-xs ${task.status === "Concluída" ? "border-padap-green/25 bg-padap-green/10 text-padap-mint" : isPlannerTaskOverdue(task) ? "border-red-400/25 bg-red-500/10 text-red-100" : "border-white/10 bg-black/20 text-slate-200"}`}>
                    {task.title}
                  </button>
                ))}
                {dayTasks.length > 3 && <p className="text-xs text-slate-500">+{dayTasks.length - 3} tarefas</p>}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function TemplatesView({ templates, onNew, onEdit, onDelete, onUse }: { templates: PlannerTaskTemplate[]; onNew: () => void; onEdit: (template: PlannerTaskTemplate) => void; onDelete: (template: PlannerTaskTemplate) => void; onUse: (template: PlannerTaskTemplate) => void }) {
  return (
    <Card>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SectionTitle title="Modelos de tarefas" />
        <Button onClick={onNew}><Plus size={15} /> Novo modelo</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <div key={template.id} className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold leading-5 text-white">{template.title}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">{template.description || "Sem descrição."}</p>
              </div>
              <Badge tone={priorityTone(template.priority)}>{template.priority}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <CategoryChip category={template.category} />
              <Badge tone="neutral">{template.recurrence}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button className="min-h-9 px-3 py-1 text-xs" onClick={() => onUse(template)}>Criar tarefa</Button>
              <Button variant="ghost" className="min-h-9 px-3 py-1 text-xs" onClick={() => onEdit(template)}>Editar</Button>
              <Button variant="danger" className="min-h-9 px-3 py-1 text-xs" onClick={() => onDelete(template)}>Excluir</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TaskList({ tasks, empty, compact = false, onEdit, onComplete, onReopen, onDuplicate, onDelete }: {
  tasks: PlannerTask[];
  empty: string;
  compact?: boolean;
  onEdit: (task: PlannerTask) => void;
  onComplete: (task: PlannerTask) => void;
  onReopen: (task: PlannerTask) => void;
  onDuplicate: (task: PlannerTask) => void;
  onDelete: (task: PlannerTask) => void;
}) {
  if (tasks.length === 0) return <EmptyState>{empty}</EmptyState>;
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className={`rounded-lg border border-white/[0.08] bg-white/[0.03] ${compact ? "p-3" : "p-4"}`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex items-start gap-3">
                <button type="button" onClick={() => task.status === "Concluída" ? onReopen(task) : onComplete(task)} className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border ${task.status === "Concluída" ? "border-padap-green bg-padap-green text-[#03110d]" : "border-white/20 bg-white/[0.03] text-transparent hover:border-padap-green"}`} aria-label={task.status === "Concluída" ? "Reabrir tarefa" : "Concluir tarefa"}>
                  <CheckCircle2 size={14} />
                </button>
                <TaskTitle task={task} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <CategoryChip category={task.category} />
                <Badge tone={priorityTone(task.priority)}>{task.priority}</Badge>
                <Badge tone={statusTone(task.status, isPlannerTaskOverdue(task))}>{isPlannerTaskOverdue(task) ? "Atrasada" : task.status}</Badge>
                <Badge tone="neutral">{task.recurrence}</Badge>
              </div>
              <p className="mt-2 text-xs text-slate-500">Vencimento: {formatDate(task.dueDate)} · {task.responsible || "Sem responsável"}</p>
            </div>
            <TaskActions task={task} onEdit={onEdit} onComplete={onComplete} onReopen={onReopen} onDuplicate={onDuplicate} onDelete={onDelete} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskActions({ task, onEdit, onComplete, onReopen, onDuplicate, onDelete }: { task: PlannerTask; onEdit: (task: PlannerTask) => void; onComplete: (task: PlannerTask) => void; onReopen: (task: PlannerTask) => void; onDuplicate: (task: PlannerTask) => void; onDelete: (task: PlannerTask) => void }) {
  return (
    <div className="flex shrink-0 flex-wrap gap-2">
      <IconButton label="Editar" onClick={() => onEdit(task)}><Edit3 size={14} /></IconButton>
      <IconButton label="Duplicar" onClick={() => onDuplicate(task)}><Copy size={14} /></IconButton>
      {task.status === "Concluída"
        ? <IconButton label="Reabrir" onClick={() => onReopen(task)}><RotateCcw size={14} /></IconButton>
        : <IconButton label="Concluir" onClick={() => onComplete(task)}><CheckCircle2 size={14} /></IconButton>}
      <IconButton label="Excluir" danger onClick={() => onDelete(task)}><Trash2 size={14} /></IconButton>
    </div>
  );
}

function TaskModal({ open, editing, form, responsibleOptions, onForm, onClose, onSave, onDelete }: { open: boolean; editing: boolean; form: TaskForm; responsibleOptions: string[]; onForm: (form: TaskForm) => void; onClose: () => void; onSave: () => void; onDelete?: () => void }) {
  const update = <K extends keyof TaskForm>(key: K, value: TaskForm[K]) => onForm({ ...form, [key]: value });
  return (
    <Modal title={editing ? "Editar tarefa" : "Nova tarefa"} open={open} onClose={onClose}>
      <datalist id="planner-responsibles">
        {responsibleOptions.map((name) => <option key={name} value={name} />)}
      </datalist>
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Título da tarefa"><Input value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Ex.: Conferir propostas vencendo" /></Field>
        <Field label="Categoria"><Select value={form.category} onChange={(event) => update("category", event.target.value)}>{plannerCategories.map((item) => <option key={item}>{item}</option>)}</Select></Field>
        <Field label="Responsável"><Input list="planner-responsibles" value={form.responsible || ""} onChange={(event) => update("responsible", event.target.value)} placeholder="Nome do responsável" /></Field>
        <Field label="Data de vencimento"><Input type="date" value={form.dueDate} onChange={(event) => update("dueDate", event.target.value)} /></Field>
        <Field label="Prioridade"><Select value={form.priority} onChange={(event) => update("priority", event.target.value as PlannerPriority)}>{plannerPriorities.map((item) => <option key={item}>{item}</option>)}</Select></Field>
        <Field label="Status"><Select value={form.status} onChange={(event) => update("status", event.target.value as PlannerTaskStatus)}>{plannerStatuses.map((item) => <option key={item}>{item}</option>)}</Select></Field>
        <Field label="Recorrência"><Select value={form.recurrence} onChange={(event) => update("recurrence", event.target.value as PlannerRecurrence)}>{plannerRecurrences.map((item) => <option key={item}>{item}</option>)}</Select></Field>
        <Field label="Descrição / observações"><Textarea value={form.description || ""} onChange={(value) => update("description", value)} /></Field>
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        {onDelete && <Button variant="danger" onClick={onDelete}>Excluir</Button>}
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={onSave}>Salvar tarefa</Button>
      </div>
    </Modal>
  );
}

function TemplateModal({ open, editing, form, responsibleOptions, onForm, onClose, onSave }: { open: boolean; editing: boolean; form: TemplateForm; responsibleOptions: string[]; onForm: (form: TemplateForm) => void; onClose: () => void; onSave: () => void }) {
  const update = <K extends keyof TemplateForm>(key: K, value: TemplateForm[K]) => onForm({ ...form, [key]: value });
  return (
    <Modal title={editing ? "Editar modelo" : "Novo modelo"} open={open} onClose={onClose}>
      <datalist id="planner-template-responsibles">
        {responsibleOptions.map((name) => <option key={name} value={name} />)}
      </datalist>
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Título"><Input value={form.title} onChange={(event) => update("title", event.target.value)} /></Field>
        <Field label="Categoria"><Select value={form.category} onChange={(event) => update("category", event.target.value)}>{plannerCategories.map((item) => <option key={item}>{item}</option>)}</Select></Field>
        <Field label="Prioridade"><Select value={form.priority} onChange={(event) => update("priority", event.target.value as PlannerPriority)}>{plannerPriorities.map((item) => <option key={item}>{item}</option>)}</Select></Field>
        <Field label="Recorrência padrão"><Select value={form.recurrence} onChange={(event) => update("recurrence", event.target.value as PlannerRecurrence)}>{plannerRecurrences.map((item) => <option key={item}>{item}</option>)}</Select></Field>
        <Field label="Responsável sugerido"><Input list="planner-template-responsibles" value={form.suggestedResponsible || ""} onChange={(event) => update("suggestedResponsible", event.target.value)} /></Field>
        <Field label="Descrição"><Textarea value={form.description || ""} onChange={(value) => update("description", value)} /></Field>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={onSave}>Salvar modelo</Button>
      </div>
    </Modal>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: "green" | "cyan" | "red" | "amber" }) {
  const colors = {
    green: "text-padap-mint",
    cyan: "text-cyan-100",
    red: "text-red-200",
    amber: "text-amber-100"
  };
  return <Card className="p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className={`mt-2 text-3xl font-semibold ${colors[tone]}`}>{value}</p></Card>;
}

function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
        <h3 className="text-base font-bold text-padap-ink">{title}</h3>
      </div>
      {action}
    </div>
  );
}

function TaskTitle({ task }: { task: PlannerTask }) {
  return <div className="min-w-0"><p className={`truncate text-sm font-semibold leading-5 ${task.status === "Concluída" ? "text-slate-400 line-through" : "text-white"}`}>{task.title}</p>{task.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{task.description}</p>}</div>;
}

function CategoryChip({ category }: { category: string }) {
  return <span className="inline-flex items-center rounded-full border border-padap-cyan/20 bg-padap-cyan/[0.07] px-2.5 py-1 text-xs font-semibold text-cyan-100">{category}</span>;
}

function IconButton({ label, danger, onClick, children }: { label: string; danger?: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" title={label} aria-label={label} onClick={onClick} className={`grid h-8 w-8 place-items-center rounded-lg border transition ${danger ? "border-red-400/25 bg-red-500/10 text-red-100 hover:bg-red-500/20" : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-padap-green/25 hover:bg-padap-green/[0.08]"}`}>{children}</button>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-xs font-medium text-slate-400"><span className="mb-1.5 block">{label}</span>{children}</label>;
}

function Textarea({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="w-full rounded-lg border border-white/10 bg-[#061314]/80 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-padap-green/70 focus:bg-[#071b18] focus:shadow-[0_0_0_3px_rgba(29,186,44,.10)]" />;
}

function FilterSelect({ value, options, onChange }: { value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return <Select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</Select>;
}

function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed border-white/[0.10] p-4 text-sm text-slate-500">{children}</p>;
}

function isThisWeek(date: string) {
  const target = new Date(`${date}T00:00:00`);
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return target >= start && target <= end;
}

function buildCalendarDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}
