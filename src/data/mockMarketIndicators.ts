import type { MarketUpdateStatus, MarketVsPadapItem, ProductAttention, ProductMarketScore, RiskOpportunityItem } from "../types";

const now = new Date();
const minutesFromNow = (minutes: number) => new Date(now.getTime() + minutes * 60000).toISOString();

export const mockMarketUpdateStatuses: MarketUpdateStatus[] = [
  { id: "ptax", label: "PTAX", lastUpdate: minutesFromNow(-18), nextManual: minutesFromNow(12), nextAutomatic: minutesFromNow(30), status: "atualizado" },
  { id: "fertilizers", label: "Fertilizantes", lastUpdate: minutesFromNow(-42), nextManual: minutesFromNow(18), nextAutomatic: new Date(now.setHours(16, 30, 0, 0)).toISOString(), status: "monitorando" },
  { id: "crops", label: "Culturas", lastUpdate: minutesFromNow(-36), nextManual: minutesFromNow(24), nextAutomatic: new Date(new Date().setHours(16, 30, 0, 0)).toISOString(), status: "atualizado" },
  { id: "news", label: "Notícias", lastUpdate: minutesFromNow(-25), nextManual: minutesFromNow(35), nextAutomatic: minutesFromNow(60), status: "monitorando" },
  { id: "exchange", label: "Relação de troca", lastUpdate: minutesFromNow(-14), nextManual: minutesFromNow(16), nextAutomatic: "Apos mercado", status: "atualizado" },
  { id: "proposals", label: "Propostas impactadas", lastUpdate: minutesFromNow(-10), nextManual: minutesFromNow(20), nextAutomatic: "Apos PTAX", status: "atenção" },
  { id: "opportunities", label: "Oportunidades comerciais", lastUpdate: minutesFromNow(-9), nextManual: minutesFromNow(21), nextAutomatic: "Apos scores", status: "atualizado" }
];

export const mockProductsAttention: ProductAttention[] = [
  { product: "Ureia", movement: "Alta forte", dailyVariation: 2.3, weeklyVariation: 5.8, impact: "Alto", reason: "Pressao internacional e frete sensível", recommendedAction: "Revisar nitrogenados", score: 82 },
  { product: "MAP", movement: "Alta moderada", dailyVariation: 1.1, weeklyVariation: 3.6, impact: "Médio", reason: "Demanda aquecida em fosfatados", recommendedAction: "Travar preço em propostas grandes", score: 68 },
  { product: "KCl", movement: "Queda tática", dailyVariation: -1.8, weeklyVariation: -4.2, impact: "Alto", reason: "Oferta pontual melhorou", recommendedAction: "Trabalhar clientes com demanda de K", score: 76 },
  { product: "Sulfato de Amonio", movement: "Estável", dailyVariation: 0.2, weeklyVariation: 0.9, impact: "Baixo", reason: "Mercado lateral", recommendedAction: "Monitorar disponibilidade", score: 54 },
  { product: "Nitrato", movement: "Atenção", dailyVariation: 0.8, weeklyVariation: 2.1, impact: "Médio", reason: "Validade curta na industria", recommendedAction: "Confirmar tabela antes de cotar", score: 64 },
  { product: "Yara Especialidades", movement: "Alta seletiva", dailyVariation: 0.9, weeklyVariation: 2.8, impact: "Médio", reason: "Mix premium com câmbio sensível", recommendedAction: "Defender valor técnico", score: 71 },
  { product: "Café", movement: "Alta", dailyVariation: 3.1, weeklyVariation: 4.4, impact: "Alto", reason: "Bolsa e físico positivos", recommendedAction: "Explorar melhora na relação de troca", score: 74 },
  { product: "Milho", movement: "Baixa leve", dailyVariation: -0.7, weeklyVariation: -1.9, impact: "Médio", reason: "Oferta regional pressiona", recommendedAction: "Cuidado com relação milho x ureia", score: 59 },
  { product: "Soja", movement: "Estável positiva", dailyVariation: 1.2, weeklyVariation: 1.6, impact: "Médio", reason: "Câmbio sustenta preço", recommendedAction: "Monitorar MAP e KCl", score: 67 },
  { product: "Cenoura", movement: "Alta", dailyVariation: 4.1, weeklyVariation: 6.2, impact: "Médio", reason: "Oferta curta regional", recommendedAction: "Reabrir conversas de pacote", score: 72 },
  { product: "Alho", movement: "Estável", dailyVariation: 0.4, weeklyVariation: 1.1, impact: "Baixo", reason: "Demanda previsivel", recommendedAction: "Manter especialidades no radar", score: 62 },
  { product: "Cebola", movement: "Volátil", dailyVariation: -1.2, weeklyVariation: 2.4, impact: "Médio", reason: "Oscilação de oferta", recommendedAction: "Simular pacote antes de negociar", score: 61 }
];

export const mockProductScores: ProductMarketScore[] = [
  { product: "PTAX", score: 88, situation: "alto impacto comercial", risk: "Alto", opportunity: "Média", recommendedAction: "Usar validade curta e revisar propostas antigas", tone: "red" },
  { product: "Ureia", score: 82, situation: "risco de alta", risk: "Alto", opportunity: "Média", recommendedAction: "Recalcular nitrogenados", tone: "red" },
  { product: "KCl", score: 76, situation: "oportunidade", risk: "Médio", opportunity: "Alta", recommendedAction: "Ativar clientes de potássio", tone: "green" },
  { product: "Café", score: 71, situation: "pressão comercial positiva", risk: "Médio", opportunity: "Alta", recommendedAction: "Argumentar relação de troca", tone: "green" },
  { product: "MAP", score: 68, situation: "atenção", risk: "Médio", opportunity: "Média", recommendedAction: "Travar preço em pacotes fosfatados", tone: "amber" },
  { product: "Milho", score: 59, situation: "monitoramento", risk: "Médio", opportunity: "Baixa", recommendedAction: "Evitar alongar validade", tone: "cyan" }
];

export const mockRiskOpportunityItems: RiskOpportunityItem[] = [
  { id: "risk-urea", label: "Ureia", quadrant: "highRisk", summary: "Alta em nitrogenados pode comprimir margem em propostas abertas.", recommendedAction: "Recalcular propostas e limitar validade." },
  { id: "risk-ptax", label: "PTAX", quadrant: "highRisk", summary: "Câmbio subiu e cria risco em tabela com base anterior.", recommendedAction: "Reconfirmar condição antes de enviar preço." },
  { id: "opp-kcl", label: "KCl", quadrant: "highOpportunity", summary: "Queda abriu janela para clientes com demanda de potássio.", recommendedAction: "Trabalhar pacote com maior participação de K." },
  { id: "opp-café", label: "Café", quadrant: "highOpportunity", summary: "Café melhorou e favorece conversa de relação de troca.", recommendedAction: "Usar argumento de janela comercial." },
  { id: "mon-map", label: "MAP", quadrant: "monitoring", summary: "Fosfatados em alta moderada, sem choque imediato.", recommendedAction: "Monitorar tabela e disponibilidade." },
  { id: "low-corn", label: "Milho", quadrant: "lowRisk", summary: "Milho segue lateral com baixa leve.", recommendedAction: "Aguardar novo fechamento." }
];

export const mockMarketVsPadap: MarketVsPadapItem[] = [
  { product: "YaraBela", padapPrice: 4620, marketTrend: "Nitrogenados em alta", currentPtax: 5.18, estimatedVariation: 1.4, status: "Proteger validade curta", recommendedAction: "Reconfirmar antes de enviar proposta" },
  { product: "KCl", padapPrice: 2850, marketTrend: "Potássicos em queda", currentPtax: 5.18, estimatedVariation: -1.8, status: "Oportunidade para negociar pacote", recommendedAction: "Trabalhar clientes com demanda de potássio" },
  { product: "MAP", padapPrice: 5110, marketTrend: "Fosfatados em alta", currentPtax: 5.18, estimatedVariation: 1.1, status: "Atenção em pacotes grandes", recommendedAction: "Travar preço e validade" },
  { product: "YaraVita", padapPrice: 2140, marketTrend: "Especialidades estáveis", currentPtax: 5.18, estimatedVariation: 0.6, status: "Defesa técnica", recommendedAction: "Usar argumento de segurança nutricional" }
];
