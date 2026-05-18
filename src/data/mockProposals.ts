import type { Approval, CommercialPackage, Proposal } from "../types";
import { addHours } from "../utils/date";

export const mockProposals: Proposal[] = [
  { id: "PR-1024", clientId: "cl-1", consultantId: "c-1", productId: "p-1", quantity: 48, unit: "Tonelada", supplier: "Yara", productCost: 3560, salePrice: 4080, freight: 82, taxes: 110, commission: 45, otherExpenses: 12, term: "Mês 11", freightMode: "CIF", validity: addHours(10), notes: "Reconfirmar disponibilidade antes do pedido.", crop: "Café", status: "Aguardando aprovação", createdAt: new Date().toISOString(), createdBy: "Bruna Oliveira", ptaxUsed: 5.12, ptaxDate: "2026-05-14T12:00:00.000Z" },
  { id: "PR-1025", clientId: "cl-2", consultantId: "c-2", productId: "p-2", quantity: 32, unit: "Tonelada", supplier: "Yara", productCost: 4100, salePrice: 4680, freight: 95, taxes: 135, commission: 50, otherExpenses: 0, term: "Safra", freightMode: "FOB", validity: addHours(28), notes: "Cliente sensível a preço.", crop: "Cenoura", status: "Em precificação", createdAt: new Date().toISOString(), createdBy: "Bruna Oliveira", ptaxUsed: 5.18, ptaxDate: "2026-05-15T12:00:00.000Z" },
  { id: "PR-1026", clientId: "cl-4", consultantId: "c-1", productId: "p-3", quantity: 18, unit: "Galão", supplier: "Yara", productCost: 1480, salePrice: 2140, freight: 22, taxes: 88, commission: 80, otherExpenses: 8, term: "90 dias", freightMode: "CIF", validity: addHours(44), notes: "Foliares com margem desejada superior.", crop: "Alho", status: "Enviada ao consultor", createdAt: new Date().toISOString(), createdBy: "Mariana PADAP", ptaxUsed: 5.18, ptaxDate: "2026-05-15T12:00:00.000Z" }
];

export const mockPackages: CommercialPackage[] = [
  {
    id: "PK-2201",
    clientId: "cl-1",
    consultantId: "c-1",
    crop: "Café",
    term: "Mês 11",
    validity: addHours(16),
    notes: "Pacote para fechamento semanal.",
    status: "Rascunho",
    clientProfile: "Cliente estratégico",
    createdAt: new Date().toISOString(),
    createdBy: "Bruna Oliveira",
    items: [
      { id: "pi-1", productId: "p-1", productName: "YaraBasa 10-20-20", quantity: 36, unit: "Tonelada", unitCost: 3754, unitSale: 4145, supplier: "Yara", note: "Base" },
      { id: "pi-2", productId: "p-4", productName: "KCl Granulado", quantity: 18, unit: "Tonelada", unitCost: 2795, unitSale: 3045, supplier: "Fertipar", note: "Compensação de margem" },
      { id: "pi-3", productId: "p-3", productName: "YaraVita Caltrac", quantity: 10, unit: "Galão", unitCost: 1668, unitSale: 2220, supplier: "Yara", note: "Especialidade" }
    ]
  }
];

export const mockApprovals: Approval[] = [
  { id: "AP-501", targetType: "Proposta", targetId: "PR-1024", clientId: "cl-1", consultantId: "c-1", totalValue: 195840, expectedMargin: 8.9, term: "Mês 11", reason: "Cliente estratégico com margem próxima de 9% e PTAX alterado.", approver: "Rafael Costa", requestedBy: "Bruna Oliveira", requestedAt: new Date().toISOString(), decision: "Pendente", observation: "Aguardando validação de diretoria se o prazo for mantido.", history: [{ user: "Bruna Oliveira", date: new Date().toISOString(), text: "Solicitação aberta por margem abaixo da meta." }] }
];
