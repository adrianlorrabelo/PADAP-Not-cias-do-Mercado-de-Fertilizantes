import type { Client, Consultant } from "../types";

export const mockConsultants: Consultant[] = [
  { id: "c-1", name: "Lucas Almeida", email: "lucas@padap.com.br", phone: "+55 34 99999-1201", region: "Alto Paranaíba", status: "Ativo" },
  { id: "c-2", name: "Fernanda Ribeiro", email: "fernanda@padap.com.br", phone: "+55 34 99999-3320", region: "Triângulo Mineiro", status: "Ativo" },
  { id: "c-3", name: "Thiago Martins", email: "thiago@padap.com.br", phone: "+55 34 99999-8810", region: "Cerrado Mineiro", status: "Ativo" }
];

export const mockClients: Client[] = [
  { id: "cl-1", name: "Grupo Santa Clara", company: "Fazenda Santa Clara", consultantId: "c-1", region: "Rio Paranaíba", mainCrop: "Café", profile: "Cliente estratégico", brandPreference: "YaraMila", commonTerm: "Mês 11", priceSensitivity: "Média", notes: "Alta recorrência em químicos.", status: "Ativo", financialStatusFuture: "Liberado" },
  { id: "cl-2", name: "Agro Vale Verde", company: "Vale Verde Agrícola", consultantId: "c-2", region: "São Gotardo", mainCrop: "Cenoura", profile: "Cliente grande", brandPreference: "YaraBasa", commonTerm: "Safra", priceSensitivity: "Alta", notes: "Negocia pacotes por cultura.", status: "Ativo", financialStatusFuture: "Atenção" },
  { id: "cl-3", name: "Irmãos Prado", company: "Prado Alimentos", consultantId: "c-3", region: "Patos de Minas", mainCrop: "Milho", profile: "Cliente comum", brandPreference: "Fertipar", commonTerm: "60 dias", priceSensitivity: "Média", notes: "Prefere frete CIF.", status: "Ativo", financialStatusFuture: "Liberado" },
  { id: "cl-4", name: "Diamante Agro", company: "Diamante Specialty", consultantId: "c-1", region: "Campos Altos", mainCrop: "Alho", profile: "Cliente especialidade/diamante", brandPreference: "YaraVita", commonTerm: "90 dias", priceSensitivity: "Baixa", notes: "Foco em qualidade e disponibilidade.", status: "Ativo", financialStatusFuture: "Liberado" }
];
