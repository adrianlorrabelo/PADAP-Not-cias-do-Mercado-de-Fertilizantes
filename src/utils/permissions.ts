import { Roles, type Role, type User } from "../types";

const permissions: Record<Role, string[]> = {
  [Roles.Admin]: ["*"],
  [Roles.Manager]: ["view:costs", "view:margins", "approve", "reports", "clients", "market"],
  [Roles.Purchasing]: ["import:table", "create:proposal", "create:package", "whatsapp", "clients", "market"],
  [Roles.Consultant]: ["own:proposals", "own:clients", "whatsapp"],
  [Roles.Viewer]: ["dashboard", "reports", "market"],
};

export function verificarPermissaoUsuario(user: User | null, permission: string): boolean {
  if (!user || user.status === "Desativado") return false;
  const rolePermissions = permissions[user.role] || [];
  return rolePermissions.includes("*") || rolePermissions.includes(permission);
}

export function canSeeSensitiveCommercials(user: User | null): boolean {
  return verificarPermissaoUsuario(user, "view:costs") || user?.role === "Compras / Precificação";
}
