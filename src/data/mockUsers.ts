import type { User } from "../types";

export const mockUsers: User[] = [
  { id: "u-admin", name: "Mariana PADAP", email: "admin@padap.com.br", role: "Administrador Geral", position: "Diretoria", status: "Ativo", lastAccess: new Date().toISOString() },
  { id: "u-gestor", name: "Rafael Costa", email: "gestor@padap.com.br", role: "Gestor / Gerente", position: "Gerente Comercial", status: "Ativo", lastAccess: new Date().toISOString() },
  { id: "u-compras", name: "Bruna Oliveira", email: "compras@padap.com.br", role: "Compras / Precificação", position: "Compras e Precificação", status: "Ativo", lastAccess: new Date().toISOString() },
  { id: "u-consultor", name: "Lucas Almeida", email: "consultor@padap.com.br", role: "Consultor", position: "Consultor Agro", status: "Ativo", lastAccess: new Date().toISOString() },
  { id: "u-viewer", name: "Ana Paula", email: "visualizador@padap.com.br", role: "Visualizador", position: "Controladoria", status: "Ativo", lastAccess: new Date().toISOString() },
  { id: "u-off", name: "Usuário Inativo", email: "inativo@padap.com.br", role: "Consultor", position: "Consultor", status: "Desativado", lastAccess: "2026-04-20T10:00:00.000Z" }
];

// Credenciais separadas dos dados de usuário — nunca incluídas na sessão
export const mockCredentials: Record<string, string> = {
  "admin@padap.com.br": "admin123",
  "gestor@padap.com.br": "gestor123",
  "compras@padap.com.br": "compras123",
  "consultor@padap.com.br": "consultor123",
  "visualizador@padap.com.br": "viewer123",
  "inativo@padap.com.br": "inativo123",
};
