import type { ClosingSummaryData, CommercialOpportunity, CustomerOpportunity, ExchangeRatioItem, MarketAnalystInsight, MarketTimelineEvent } from "../types";

const hist = (values: number[]) => ["Seg", "Ter", "Qua", "Qui", "Sex"].map((label, index) => ({ label, value: values[index] }));

export const mockCustomerOpportunities: CustomerOpportunity[] = [
  { client: "Fazenda Boa Vista", profile: "Cliente estratégico", relatedProduct: "KCl", reason: "Comprou potassico na ultima safra.", potential: "R$ 240 mil", suggestedAction: "Trabalhar condição de potássicos." },
  { client: "São Bento Agro", profile: "Cliente grande", relatedProduct: "20-00-20", reason: "Cotou formulado recentemente.", potential: "R$ 180 mil", suggestedAction: "Oferecer pacote com maior participação de K." },
  { client: "Grupo Santa Clara", profile: "Cliente estratégico", relatedProduct: "Café x KCl", reason: "Histórico de pacotes recorrentes para café.", potential: "R$ 320 mil", suggestedAction: "Revisar demanda da próxima safra." },
  { client: "Diamante Agro", profile: "Especialidades", relatedProduct: "Yara Especialidades", reason: "Baixa sensibilidade a preço e foco em qualidade.", potential: "R$ 95 mil", suggestedAction: "Defender valor técnico do pacote premium." }
];

export const mockCommercialOpportunities: CommercialOpportunity[] = [
  { id: "co-kcl", opportunity: "KCl em queda", productOrCrop: "KCl / Café", justification: "Preço recuou enquanto café melhorou.", suggestedClients: "Boa Vista, Santa Clara, São Bento", recommendedAction: "Gerar ação comercial para potássicos", priority: "Alta" },
  { id: "co-coffee", opportunity: "Café melhorou relação de troca", productOrCrop: "Café", justification: "Produtor precisa de menos café para comprar KCl.", suggestedClients: "Clientes café Alto Paranaíba", recommendedAction: "Revisar planejamento de compra", priority: "Alta" },
  { id: "co-ptax", opportunity: "PTAX subiu", productOrCrop: "Importados", justification: "Câmbio aumenta risco de proposta antiga.", suggestedClients: "Propostas abertas ontem", recommendedAction: "Usar validade curta", priority: "Crítica" },
  { id: "co-urea", opportunity: "Ureia volátil", productOrCrop: "Nitrogenados", justification: "Oscilação exige reconfirmação.", suggestedClients: "Clientes milho e HF", recommendedAction: "Evitar prometer preço antigo", priority: "Alta" },
  { id: "co-map", opportunity: "MAP em alta", productOrCrop: "Fosfatados", justification: "Tendência pode encarecer pacotes.", suggestedClients: "Clientes com proposta MAP", recommendedAction: "Recomendar trava de preço", priority: "Média" }
];

export const mockExchangeRatios: ExchangeRatioItem[] = [
  { id: "coffee-kcl", pair: "Café x KCl", current: 2.6, previous: 2.8, variation: -7.1, unit: "sc/t", status: "Favorável", interpretation: "O produtor precisa de menos café para comprar KCl. Momento comercial mais favorável.", history: hist([2.9, 2.8, 2.75, 2.7, 2.6]) },
  { id: "coffee-map", pair: "Café x MAP", current: 3.9, previous: 3.8, variation: 2.6, unit: "sc/t", status: "Desfavorável", interpretation: "MAP subiu mais que o café; defender urgencia para travar preço.", history: hist([3.6, 3.7, 3.75, 3.8, 3.9]) },
  { id: "coffee-yara", pair: "Café x Yara Especialidades", current: 1.62, previous: 1.66, variation: -2.4, unit: "sc/emb", status: "Favorável", interpretation: "Especialidades ficaram mais acessiveis na troca com café.", history: hist([1.7, 1.68, 1.66, 1.64, 1.62]) },
  { id: "soy-map", pair: "Soja x MAP", current: 39.9, previous: 39.1, variation: 2.0, unit: "sc/t", status: "Desfavorável", interpretation: "Fosfatado exige cautela em pacotes de soja.", history: hist([38.7, 38.9, 39.2, 39.5, 39.9]) },
  { id: "soy-kcl", pair: "Soja x KCl", current: 22.3, previous: 23.2, variation: -3.9, unit: "sc/t", status: "Favorável", interpretation: "KCl em queda melhora troca para soja.", history: hist([23.8, 23.5, 23.1, 22.8, 22.3]) },
  { id: "corn-urea", pair: "Milho x Ureia", current: 53.1, previous: 50.2, variation: 5.8, unit: "sc/t", status: "Desfavorável", interpretation: "Ureia subiu e milho recuou; cuidado com nitrogenados.", history: hist([49.8, 50.2, 51.1, 52.4, 53.1]) },
  { id: "garlic-package", pair: "Alho x pacote nutricional", current: 0.84, previous: 0.83, variation: 1.2, unit: "cx/kit", status: "Estável", interpretation: "Relação sem alteração relevante; argumentar qualidade.", history: hist([0.82, 0.84, 0.83, 0.83, 0.84]) },
  { id: "carrot-fert", pair: "Cenoura x fertilizante", current: 36.8, previous: 38.1, variation: -3.4, unit: "cx/t", status: "Favorável", interpretation: "Cenoura valorizada melhora janela de pacote.", history: hist([39.2, 38.7, 38.1, 37.4, 36.8]) },
  { id: "onion-fert", pair: "Cebola x fertilizante", current: 44.1, previous: 43.8, variation: 0.7, unit: "sc/t", status: "Estável", interpretation: "Sem urgencia, manter monitoramento.", history: hist([43.2, 43.5, 43.8, 44, 44.1]) }
];

export const mockMarketAnalystInsight: MarketAnalystInsight = {
  summary: "Cenário volátil com pressão cambial, nitrogenados sensíveis e oportunidade tática em potássicos.",
  padapImpact: "Revisao necessária em propostas de nitrogenados e atenção a margem em pacotes com base cambial anterior.",
  affectedProducts: ["Ureia", "MAP", "KCl", "Yara Especialidades"],
  affectedProposals: "16 propostas abertas com risco ou oportunidade de revisão.",
  affectedCustomers: "Clientes de café, HF e milho com histórico recente de cotação.",
  recommendedAction: "Recalcular propostas de nitrogenados, monitorar PTAX e trabalhar oportunidade em KCl.",
  horizon: "Curto prazo, próximas 24 a 48 horas",
  confidence: 80,
  sources: ["Banco Central", "CEPEA", "GlobalFert", "CONAB"]
};

export const mockMarketTimeline: MarketTimelineEvent[] = [
  { id: "tl-0800", time: "08:00", type: "Atualização", description: "Atualização geral da manhã", impact: "Base do dia definida", relatedAction: "Revisar painel executivo" },
  { id: "tl-0910", time: "09:10", type: "Notícia", description: "Notícia sobre ureia", impact: "Nitrogenados em atenção", relatedAction: "Recalcular propostas" },
  { id: "tl-1030", time: "10:30", type: "Alerta", description: "Alerta em propostas abertas", impact: "Margem pode cair", relatedAction: "Ver propostas impactadas" },
  { id: "tl-1200", time: "12:00", type: "Atualização", description: "Atualização de culturas", impact: "Café melhora", relatedAction: "Usar relação de troca" },
  { id: "tl-1400", time: "14:00", type: "Oportunidade", description: "KCl entrou em oportunidade", impact: "Clientes de potássio no radar", relatedAction: "Gerar ação comercial" },
  { id: "tl-1630", time: "16:30", type: "Fechamento", description: "Fechamento comercial", impact: "Revisar pendencias", relatedAction: "Preparar briefing" },
  { id: "tl-1700", time: "17:00", type: "Resumo", description: "Resumo de fechamento do dia", impact: "Plano para amanhã", relatedAction: "Enviar WhatsApp" }
];

export const mockClosingSummary: ClosingSummaryData = {
  changedToday: ["PTAX subiu 0,73%", "Ureia manteve volátilidade", "KCl abriu oportunidade", "Café melhorou relação de troca"],
  impactedProposals: ["16 propostas afetadas", "R$ 428.000 em revisão potencial", "2 pacotes abaixo da meta"],
  attentionProducts: ["Ureia", "MAP", "PTAX", "Yara Especialidades"],
  newOpportunities: ["Clientes com demanda de potássio", "Café com troca favorável", "Cenoura com janela para pacote"],
  openAlerts: ["Risco cambial", "Risco de margem", "Validade curta em propostas antigas"],
  tomorrowActions: ["Revisar nitrogenados cedo", "Checar PTAX antes das 9h", "Ativar clientes de KCl", "Atualizar briefing comercial"]
};
