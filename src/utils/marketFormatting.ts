export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value: number, digits = 1) {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits).replace(".", ",")}%`;
}

export function formatDateTime(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value)) return value;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function formatTime(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value)) return value;
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function priorityTone(priority: string): "green" | "amber" | "red" | "cyan" | "neutral" {
  if (priority === "Crítica") return "red";
  if (priority === "Alta") return "amber";
  if (priority === "Média") return "cyan";
  return "green";
}

export function statusTone(status: string): "green" | "amber" | "red" | "cyan" | "neutral" {
  if (["atualizado", "Favorável", "ativa"].includes(status)) return "green";
  if (["atenção", "Desfavorável"].includes(status)) return "amber";
  if (status === "erro") return "red";
  if (["monitorando", "Estável"].includes(status)) return "cyan";
  return "neutral";
}
