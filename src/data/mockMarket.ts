import type { Alert, MarketIndicator, MarketNews, Settings } from "../types";

const hist = (base: number) => ["Seg", "Ter", "Qua", "Qui", "Sex"].map((label, i) => ({ label, value: Number((base + Math.sin(i) * base * 0.04 + i * 0.7).toFixed(2)) }));

export const mockMarketIndicators: MarketIndicator[] = [
  { name: "PTAX", value: 5.18, variation: 0.95, unit: "R$/US$", history: hist(5.08) },
  { name: "Ureia", value: 3290, variation: 2.4, unit: "R$/t", history: hist(3180) },
  { name: "MAP", value: 5110, variation: 1.1, unit: "R$/t", history: hist(5020) },
  { name: "KCl", value: 3010, variation: -1.8, unit: "R$/t", history: hist(3090) },
  { name: "Café", value: 1320, variation: 3.2, unit: "R$/sc", history: hist(1280) },
  { name: "Milho", value: 62, variation: -0.7, unit: "R$/sc", history: hist(64) },
  { name: "Soja", value: 128, variation: 1.6, unit: "R$/sc", history: hist(125) },
  { name: "Cenoura", value: 82, variation: 4.1, unit: "R$/cx", history: hist(77) }
];

export const mockNews: MarketNews[] = [
  { id: "n-1", title: "PTAX avança e pressiona cotações abertas", summary: "Movimento recomenda revisar propostas emitidas ontem para químicos importados.", tag: "Câmbio", date: new Date().toISOString() },
  { id: "n-2", title: "KCl abre janela de compra", summary: "Queda semanal sugere oportunidade para travar volume em clientes estratégicos.", tag: "Fertilizantes", date: new Date().toISOString() },
  { id: "n-3", title: "Frete segue sensível no Alto Paranaíba", summary: "Disponibilidade logística exige reconfirmação para entregas CIF de curto prazo.", tag: "Logística", date: new Date().toISOString() }
];

export const mockAlerts: Alert[] = [
  { id: "a-1", title: "PTAX alterado", description: "Recalcular propostas abertas com base cambial anterior.", priority: "Risco cambial", date: new Date().toISOString(), module: "Propostas", action: "Atualizar cotação com novo PTAX" },
  { id: "a-2", title: "Lista semanal vence hoje", description: "Tabela Yara precisa de conferência antes de novas propostas.", priority: "Risco de validade", date: new Date().toISOString(), module: "Tabela da Semana", action: "Importar ou reconfirmar tabela" },
  { id: "a-3", title: "KCl em queda", description: "Avaliar oportunidade de compra para pacotes de café.", priority: "Oportunidade", date: new Date().toISOString(), module: "Inteligência de Mercado", action: "Simular pacote com KCl" }
];

export const defaultSettings: Settings = {
  minFertilizerMargin: 10,
  desiredFoliarMargin: 30,
  strategicClientMargin: 9,
  defaultCommission: 1.2,
  defaultTax: 7,
  defaultFreight: 82,
  defaultValidityHours: 24,
  manualPtax: 5.18,
  alerts: {
    ptax: true,
    quoteExpiring: true,
    lowMargin: true,
    expiredProposal: true,
    unavailableProduct: true,
    pendingApproval: true
  }
};
