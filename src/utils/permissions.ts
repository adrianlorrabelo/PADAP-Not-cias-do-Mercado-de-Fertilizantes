import type { Role, User } from "../types";

const permissions: Record<Role, string[]> = {
  "Administrador Geral": ["*"],
  "Gestor / Gerente": ["view:costs", "view:margins", "approve", "reports", "clients", "market"],
  "Compras / Precificação": ["import:table", "create:proposal", "create:package", "whatsapp", "clients", "market"],
  Consultor: ["own:proposals", "own:clients", "whatsapp"],
  Visualizador: ["dashboard", "reports", "market"]
};

export function verificarPermissaoUsuario(user: User | null, permission: string): boolean {
  if (!user || user.status === "Desativado") return false;
  const rolePermissions = permissions[user.role] || [];
  return rolePermissions.includes("*") || rolePermissions.includes(permission);
}

export function canSeeSensitiveCommercials(user: User | null): boolean {
  return verificarPermissaoUsuario(user, "view:costs") || user?.role === "Compras / Precificação";
}
