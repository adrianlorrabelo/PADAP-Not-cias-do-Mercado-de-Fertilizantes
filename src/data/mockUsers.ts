import type { User } from "../types";

export const mockUsers: User[] = [
  { id: "u-admin", name: "Mariana PADAP", email: "admin@padap.com.br", password: "admin123", role: "Administrador Geral", position: "Diretoria", status: "Ativo", lastAccess: new Date().toISOString() },
  { id: "u-gestor", name: "Rafael Costa", email: "gestor@padap.com.br", password: "gestor123", role: "Gestor / Gerente", position: "Gerente Comercial", status: "Ativo", lastAccess: new Date().toISOString() },
  { id: "u-compras", name: "Bruna Oliveira", email: "compras@padap.com.br", password: "compras123", role: "Compras / Precificação", position: "Compras e Precificação", status: "Ativo", lastAccess: new Date().toISOString() },
  { id: "u-consultor", name: "Lucas Almeida", email: "consultor@padap.com.br", password: "consultor123", role: "Consultor", position: "Consultor Agro", status: "Ativo", lastAccess: new Date().toISOString() },
  { id: "u-viewer", name: "Ana Paula", email: "visualizador@padap.com.br", password: "viewer123", role: "Visualizador", position: "Controladoria", status: "Ativo", lastAccess: new Date().toISOString() },
  { id: "u-off", name: "Usuário Inativo", email: "inativo@padap.com.br", password: "inativo123", role: "Consultor", position: "Consultor", status: "Desativado", lastAccess: "2026-04-20T10:00:00.000Z" }
];
