import { Roles, type User } from "../types";

export const mockUsers: User[] = [
  { id: "u-admin", name: "Mariana PADAP", email: "admin@padap.com.br", role: Roles.Admin, position: "Diretoria", status: "Ativo", lastAccess: new Date().toISOString() },
  { id: "u-gestor", name: "Rafael Costa", email: "gestor@padap.com.br", role: Roles.Manager, position: "Gerente Comercial", status: "Ativo", lastAccess: new Date().toISOString() },
  { id: "u-compras", name: "Bruna Oliveira", email: "compras@padap.com.br", role: Roles.Purchasing, position: "Compras e Precificação", status: "Ativo", lastAccess: new Date().toISOString() },
  { id: "u-consultor", name: "Lucas Almeida", email: "consultor@padap.com.br", role: Roles.Consultant, position: "Consultor Agro", status: "Ativo", lastAccess: new Date().toISOString() },
  { id: "u-viewer", name: "Ana Paula", email: "visualizador@padap.com.br", role: Roles.Viewer, position: "Controladoria", status: "Ativo", lastAccess: new Date().toISOString() },
  { id: "u-off", name: "Usuário Inativo", email: "inativo@padap.com.br", role: Roles.Consultant, position: "Consultor", status: "Desativado", lastAccess: "2026-04-20T10:00:00.000Z" },
];

// Credenciais lidas de variáveis de ambiente (definidas em .env.local, não versionadas)
export const mockCredentials: Record<string, string> = {
  "admin@padap.com.br": import.meta.env.VITE_DEMO_PW_ADMIN ?? "",
  "gestor@padap.com.br": import.meta.env.VITE_DEMO_PW_GESTOR ?? "",
  "compras@padap.com.br": import.meta.env.VITE_DEMO_PW_COMPRAS ?? "",
  "consultor@padap.com.br": import.meta.env.VITE_DEMO_PW_CONSULTOR ?? "",
  "visualizador@padap.com.br": import.meta.env.VITE_DEMO_PW_VIEWER ?? "",
  "inativo@padap.com.br": import.meta.env.VITE_DEMO_PW_INATIVO ?? "",
};
