import type { CommercialOpportunity, MarketAnalysis, MarketAnalystInsight, MarketIntelligenceIndicator, MarketSource, MarketStatus, MarketUpdateResult, ProductAttention, ProductMarketScore, WeeklyTable } from "../types";
import type { MarketRealitySnapshot } from "./marketRealityService";
import { calculateGeneralMarketScore } from "../utils/marketScores";

export const latestMarketAnalysisStorageKey = "padap_market_latest_analysis";

export type GenerateMarketAnalysisInput = {
  result: MarketUpdateResult;
  sources: MarketSource[];
  activeSources: MarketSource[];
  indicators: MarketIntelligenceIndicator[];
  snapshot: MarketRealitySnapshot;
  warnings: string[];
};

export function getExecutiveMarketStatus(scores: ProductMarketScore[]): MarketStatus {
  const score = calculateGeneralMarketScore(scores);
  if (score >= 78) return "Volátil";
  if (scores.some((item) => item.tone === "green" && item.score >= 74)) return "Oportunidade";
  if (score >= 68) return "Atenção";
  return "Neutro";
}

export function generateMarketAnalysis(input: GenerateMarketAnalysisInput): MarketAnalysis {
  const ptax = findIndicator(input.indicators, "ptax");
  const urea = findIndicator(input.indicators, "urea", "nitrogen");
  const map = findIndicator(input.indicators, "map", "fosfat");
  const kcl = findIndicator(input.indicators, "kcl", "potass");
  const specialties = findIndicator(input.indicators, "especial");
  const listStatus = getWeeklyTableStatus(input.snapshot.weeklyTable);

  const ptaxUnavailable = input.snapshot.ptax.confidence === "unavailable" || isUnavailable(ptax);
  const ptaxInternal = input.snapshot.ptax.confidence === "internal" || Boolean(ptax?.sourceType === "Interna" && input.warnings.some((warning) => normalize(warning).includes("ptax")));
  const internalAvailable = input.result.internalSourcesUsed > 0 || input.indicators.some((indicator) => indicator.sourceType === "Interna" && !isUnavailable(indicator));
  const externalAvailable = input.result.externalSourcesAvailable > 0 || input.indicators.some((indicator) => indicator.sourceType === "Externa" && !isUnavailable(indicator));
  const manySourceErrors = input.result.status === "Com falhas" || input.result.sourcesFailed > input.result.sourcesSucceeded || input.result.sourcesFailed >= 2;
  const kclOpportunity = Boolean(kcl && !isUnavailable(kcl));
  const nitrogenRisk = Boolean(urea && !isUnavailable(urea));
  const mapAttention = Boolean(map && !isUnavailable(map));
  const yaraExpiring = listStatus === "vencendo" || listStatus === "vencida";

  const score = clampScore(
    70 +
    (internalAvailable ? 5 : 0) +
    (externalAvailable ? 5 : 0) +
    (ptaxUnavailable || ptaxInternal ? -5 : 0) +
    (manySourceErrors ? -10 : 0) +
    (kclOpportunity ? 5 : 0) +
    (nitrogenRisk ? -5 : 0) +
    (yaraExpiring ? -10 : 0)
  );

  const confidence = reduceConfidence(input.result.confidence, [
    ptaxUnavailable || ptaxInternal,
    manySourceErrors,
    yaraExpiring || !input.snapshot.weeklyTable
  ]);

  const productsInAttention = buildProductsInAttention({ urea, map, kcl, specialties, table: input.snapshot.weeklyTable, listStatus });
  const opportunities = buildCommercialOpportunities({ ptaxUnavailable, ptaxInternal, kclOpportunity, nitrogenRisk, map, listStatus });
  const affectedProducts = productsInAttention.map((item) => item.product);
  const sourcesUsed = buildSourcesUsed(input, ptaxInternal);
  const summaryTitle = buildSummaryTitle({ ptaxUnavailable, ptaxInternal, kclOpportunity, nitrogenRisk, mapAttention });
  const whatChanged = buildWhatChanged({ ptaxUnavailable, ptaxInternal, kclOpportunity, nitrogenRisk, mapAttention, yaraExpiring });
  const impactPadap = buildImpactPadap({ ptaxUnavailable, ptaxInternal, nitrogenRisk, yaraExpiring });
  const whatToWatch = buildWhatToWatch({ kclOpportunity, mapAttention, yaraExpiring });
  const horizon = "Proximos 7 dias, com validacao antes de propostas de maior valor.";
  const recommendedAction = buildRecommendedAction({ ptaxUnavailable, ptaxInternal, nitrogenRisk, kclOpportunity, yaraExpiring });

  const analysis: MarketAnalysis = {
    id: makeAnalysisId(),
    generatedAt: input.result.updatedAt,
    summaryTitle,
    whatChanged,
    impactPadap,
    whatToWatch,
    horizon,
    confidence,
    thermometer: {
      score,
      risk: score < 60 || nitrogenRisk || ptaxUnavailable ? "Alto" : score < 80 ? "Médio" : "Baixo",
      opportunity: kclOpportunity && score >= 60 ? "Alta" : score >= 60 ? "Média" : "Baixa",
      trend: classifyThermometerTrend(score),
      horizon,
      confidence
    },
    productsInAttention,
    opportunities,
    briefing: {
      summary: summaryTitle,
      impactPadap,
      affectedProducts,
      recommendedAction,
      sourcesUsed,
      confidence,
      whatsappText: ""
    }
  };

  analysis.briefing.whatsappText = buildMarketBriefingWhatsApp(analysis);
  return analysis;
}

export function saveLatestMarketAnalysis(analysis: MarketAnalysis) {
  if (typeof window !== "undefined") {
    localStorage.setItem(latestMarketAnalysisStorageKey, JSON.stringify(analysis));
  }
  return analysis;
}

export function getLatestMarketAnalysis(): MarketAnalysis | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(latestMarketAnalysisStorageKey);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as MarketAnalysis;
    return parsed?.id && parsed?.briefing?.whatsappText ? parsed : null;
  } catch {
    return null;
  }
}

export function buildMarketBriefingWhatsApp(analysis: MarketAnalysis) {
  const date = new Date(analysis.generatedAt).toLocaleDateString("pt-BR");
  return `Briefing comercial - ${date}

Resumo:
${analysis.briefing.summary}

Impacto PADAP:
${analysis.briefing.impactPadap}

Produtos afetados:
${analysis.briefing.affectedProducts.join(", ")}

Acao recomendada:
${analysis.briefing.recommendedAction}

Fontes consideradas:
${analysis.briefing.sourcesUsed.join(", ")}

Observacao:
Validar disponibilidade, validade da lista e condicao comercial antes de enviar proposta.`;
}

export function generateBriefingWhatsApp(insight: MarketAnalystInsight) {
  return `Bom dia, equipe.

Resumo do mercado:
- PTAX em atencao, cuidado com propostas antigas.
- Ureia segue volatil, revisar nitrogenados.
- KCl apresenta oportunidade para clientes com demanda de potassio.
- Cafe e milho exigem atencao na relacao de troca.

Orientacao:
${insight.recommendedAction}

Antes de prometer preco ao produtor, confirmem validade, disponibilidade e condicao atualizada com compras.

Equipe PADAP.`;
}

function makeAnalysisId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `market-analysis-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function findIndicator(indicators: MarketIntelligenceIndicator[], ...terms: string[]) {
  return indicators.find((indicator) => {
    const text = normalize([indicator.id, indicator.name, indicator.trend, indicator.source].join(" "));
    return terms.some((term) => text.includes(normalize(term)));
  });
}

function isUnavailable(indicator?: MarketIntelligenceIndicator | null) {
  if (!indicator) return true;
  const text = normalize([indicator.value, indicator.trend, indicator.impactPadap].join(" "));
  return text.includes("indisponivel") || text.includes("sem referencia");
}

function clampScore(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function reduceConfidence(confidence: string, reducers: boolean[]) {
  const levels = ["Baixa", "Média", "Alta"];
  const current = Math.max(0, levels.findIndex((item) => normalize(item) === normalize(confidence)));
  const next = Math.max(0, current - reducers.filter(Boolean).length);
  const percent = next === 2 ? 85 : next === 1 ? 65 : 45;
  return `${levels[next]} - ${percent}%`;
}

function getWeeklyTableStatus(table: WeeklyTable | null) {
  if (!table?.expiresAt) return "indisponivel";
  const expiresAt = new Date(table.expiresAt);
  if (Number.isNaN(expiresAt.getTime())) return "vencida";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiresAt.setHours(0, 0, 0, 0);
  const daysToExpire = Math.ceil((expiresAt.getTime() - today.getTime()) / 86400000);
  if (daysToExpire < 0) return "vencida";
  if (daysToExpire <= 3) return "vencendo";
  return "ativa";
}

function parsePercent(value?: string) {
  return Number(value?.replace("%", "").replace("+", "").replace(",", ".") || 0) || 0;
}

function productScore(indicator: MarketIntelligenceIndicator | undefined, fallback: number) {
  if (isUnavailable(indicator)) return Math.max(35, fallback - 20);
  return fallback;
}

function buildProductsInAttention(input: {
  urea?: MarketIntelligenceIndicator;
  map?: MarketIntelligenceIndicator;
  kcl?: MarketIntelligenceIndicator;
  specialties?: MarketIntelligenceIndicator;
  table: WeeklyTable | null;
  listStatus: string;
}): ProductAttention[] {
  const listInAttention = input.listStatus === "vencendo" || input.listStatus === "vencida";

  return [
    {
      id: "pa-urea",
      product: "Ureia",
      movement: isUnavailable(input.urea) ? "Sem referencia interna" : "Atencao em nitrogenados",
      dailyVariation: parsePercent(input.urea?.dailyChange),
      weeklyVariation: parsePercent(input.urea?.weeklyChange),
      impact: "Alto",
      reason: "Nitrogenados exigem revisao comercial e validade curta.",
      recommendedAction: "Revisar nitrogenados antes de enviar proposta.",
      source: input.urea?.source ?? "Lista Yara / Fonte interna",
      score: productScore(input.urea, 82)
    },
    {
      id: "pa-map",
      product: "MAP",
      movement: isUnavailable(input.map) ? "Sem referencia interna" : "Cautela em fosfatados",
      dailyVariation: parsePercent(input.map?.dailyChange),
      weeklyVariation: parsePercent(input.map?.weeklyChange),
      impact: "Médio",
      reason: "Fosfatados podem pressionar pacotes grandes.",
      recommendedAction: "Defender validade curta em pacotes com MAP.",
      source: input.map?.source ?? "Lista Yara / Fonte interna",
      score: productScore(input.map, 68)
    },
    {
      id: "pa-kcl",
      product: "KCl",
      movement: isUnavailable(input.kcl) ? "Sem referencia interna" : "Janela tatica em potassicos",
      dailyVariation: parsePercent(input.kcl?.dailyChange),
      weeklyVariation: parsePercent(input.kcl?.weeklyChange),
      impact: isUnavailable(input.kcl) ? "Médio" : "Oportunidade",
      reason: "Potassicos favorecem abordagem para clientes com demanda de K.",
      recommendedAction: "Trabalhar clientes com demanda de potassio.",
      source: input.kcl?.source ?? "Lista Yara / Fonte interna",
      score: productScore(input.kcl, 76)
    },
    {
      id: "pa-sulfato",
      product: "Sulfato de Amonio",
      movement: "Monitoramento em nitrogenados",
      dailyVariation: 0,
      weeklyVariation: 0,
      impact: "Médio",
      reason: "Produto sensivel a leitura geral de nitrogenados.",
      recommendedAction: "Confirmar disponibilidade e validade antes de cotar.",
      source: input.urea?.source ?? "Lista Yara / Fonte interna",
      score: productScore(input.urea, 64)
    },
    {
      id: "pa-nitrato",
      product: "Nitrato",
      movement: "Atencao em nitrogenados",
      dailyVariation: 0,
      weeklyVariation: 0,
      impact: "Médio",
      reason: "Validade comercial deve acompanhar pressao em nitrogenados.",
      recommendedAction: "Usar validade curta e reconfirmar tabela.",
      source: input.urea?.source ?? "Lista Yara / Fonte interna",
      score: productScore(input.urea, 66)
    },
    {
      id: "pa-yara-especialidades",
      product: "Yara Especialidades",
      movement: listInAttention ? "Lista em atencao" : "Defesa tecnica",
      dailyVariation: parsePercent(input.specialties?.dailyChange),
      weeklyVariation: parsePercent(input.specialties?.weeklyChange),
      impact: listInAttention ? "Alto" : "Médio",
      reason: listInAttention ? "Lista Yara proxima do vencimento ou vencida." : "Mix premium deve preservar margem e valor tecnico.",
      recommendedAction: "Confirmar validade da lista antes de cotar especialidades.",
      source: input.specialties?.source ?? (input.table ? "Lista Yara / Fonte interna" : "Fonte interna indisponivel"),
      score: listInAttention ? 58 : productScore(input.specialties, 71)
    }
  ];
}

function buildCommercialOpportunities(input: {
  ptaxUnavailable: boolean;
  ptaxInternal: boolean;
  kclOpportunity: boolean;
  nitrogenRisk: boolean;
  map?: MarketIntelligenceIndicator;
  listStatus: string;
}): CommercialOpportunity[] {
  const opportunities: CommercialOpportunity[] = [];

  if (input.kclOpportunity) {
    opportunities.push(makeOpportunity("analysis-kcl", "KCl em oportunidade", "KCl / Cafe", "Janela tatica em potassicos e relacao de troca favoravel.", "Clientes com demanda de K e produtores de cafe.", "Trabalhar clientes com demanda de potassio.", "Alta"));
  }

  opportunities.push(makeOpportunity("analysis-cafe-kcl", "Cafe melhora conversa de potassicos", "Cafe x KCl", "Relacao de troca favorece abordagem consultiva para planejamento de compra.", "Clientes cafe Alto Paranaiba.", "Revisar planejamento de compra e simular pacote com KCl.", input.kclOpportunity ? "Alta" : "Média"));

  if (input.ptaxUnavailable || input.ptaxInternal) {
    opportunities.push(makeOpportunity("analysis-ptax", "PTAX em atencao", "Fertilizantes importados", "Cambio aumenta risco de propostas antigas indexadas ao dolar.", "Propostas abertas e pacotes de maior valor.", "Usar validade curta e validar preco antes de enviar.", "Crítica"));
  }

  if (input.nitrogenRisk) {
    opportunities.push(makeOpportunity("analysis-nitrogen", "Revisao de nitrogenados", "Ureia / Sulfato / Nitrato", "Oscilacao em nitrogenados pode comprimir margem em propostas abertas.", "Clientes milho, HF e propostas com nitrogenados.", "Recalcular nitrogenados e evitar validade longa.", "Alta"));
  }

  if (input.map && !isUnavailable(input.map)) {
    opportunities.push(makeOpportunity("analysis-map", "Cautela em fosfatados", "MAP / Fosfatados", "MAP exige defesa de validade curta e revisao de pacotes grandes.", "Clientes com pacotes fosfatados ou proposta MAP.", "Evitar alongar validade em pacotes grandes.", "Média"));
  }

  if (input.listStatus === "vencendo" || input.listStatus === "vencida") {
    opportunities.push(makeOpportunity("analysis-yara-validity", "Validade da Lista Yara", "Yara Especialidades / Tabela interna", "Risco de preco desatualizado em cotacoes com base interna.", "Cotacoes ainda nao enviadas.", "Confirmar validade antes de enviar proposta.", input.listStatus === "vencida" ? "Crítica" : "Alta"));
  }

  return opportunities.slice(0, 5);
}

function makeOpportunity(id: string, title: string, productOrCrop: string, reason: string, suggestedClients: string, recommendedAction: string, priority: CommercialOpportunity["priority"]): CommercialOpportunity {
  return {
    id,
    title,
    reason,
    opportunity: title,
    productOrCrop,
    justification: reason,
    suggestedClients,
    recommendedAction,
    priority
  };
}

function buildSourcesUsed(input: GenerateMarketAnalysisInput, ptaxInternal: boolean) {
  const sources = new Set<string>();
  input.indicators.forEach((indicator) => {
    if (!isUnavailable(indicator)) sources.add(indicator.source);
  });
  input.activeSources
    .filter((source) => source.useInBriefing && source.lastStatus !== "Erro" && source.lastStatus !== "Indisponível")
    .forEach((source) => sources.add(source.name));
  if (ptaxInternal) sources.add("PTAX online indisponivel; referencia interna usada");
  input.warnings.forEach((warning) => {
    if (normalize(warning).includes("ptax")) sources.add("Banco Central / PTAX");
    if (normalize(warning).includes("lista yara")) sources.add("Lista Yara");
  });
  return Array.from(sources).filter(Boolean).slice(0, 6);
}

function buildSummaryTitle(input: { ptaxUnavailable: boolean; ptaxInternal: boolean; kclOpportunity: boolean; nitrogenRisk: boolean; mapAttention: boolean }) {
  if (input.nitrogenRisk && input.kclOpportunity) return "Mercado volatil, com pressao em nitrogenados e oportunidade em potassicos.";
  if (input.ptaxUnavailable || input.ptaxInternal) return "Mercado exige validacao cambial antes de novas propostas.";
  if (input.kclOpportunity) return "Potassicos abrem janela comercial para clientes com demanda de K.";
  if (input.mapAttention) return "Fosfatados pedem cautela e validade curta em pacotes grandes.";
  return "Mercado em monitoramento, com foco em validade e disponibilidade.";
}

function buildWhatChanged(input: { ptaxUnavailable: boolean; ptaxInternal: boolean; kclOpportunity: boolean; nitrogenRisk: boolean; mapAttention: boolean; yaraExpiring: boolean }) {
  const changes: string[] = [];
  if (input.ptaxUnavailable || input.ptaxInternal) changes.push("PTAX online ficou indisponivel ou entrou em referencia interna");
  if (input.nitrogenRisk) changes.push("ureia e nitrogenados seguem em atencao");
  if (input.kclOpportunity) changes.push("KCl abriu janela tatica de negociacao");
  if (input.mapAttention) changes.push("MAP exige cautela em pacotes grandes");
  if (input.yaraExpiring) changes.push("Lista Yara precisa de confirmacao de validade");
  return changes.length ? `${changes.join(", ")}.` : "Sem mudanca critica; manter monitoramento das fontes e validade comercial.";
}

function buildImpactPadap(input: { ptaxUnavailable: boolean; ptaxInternal: boolean; nitrogenRisk: boolean; yaraExpiring: boolean }) {
  const impacts: string[] = [];
  if (input.ptaxUnavailable || input.ptaxInternal) impacts.push("propostas antigas e pacotes indexados ao dolar precisam de revisao");
  if (input.nitrogenRisk) impacts.push("nitrogenados devem ser recalculados antes do envio");
  if (input.yaraExpiring) impacts.push("validade da Lista Yara deve ser confirmada para evitar preco desatualizado");
  return impacts.length ? `${impacts.join("; ")}.` : "Manter rotina de validacao de disponibilidade, margem e validade antes de enviar condicao comercial.";
}

function buildWhatToWatch(input: { kclOpportunity: boolean; mapAttention: boolean; yaraExpiring: boolean }) {
  const watch: string[] = [];
  if (input.kclOpportunity) watch.push("KCl pode favorecer clientes de cafe e demanda de potassio");
  if (input.mapAttention) watch.push("MAP pede cautela em pacotes grandes");
  if (input.yaraExpiring) watch.push("validade da Lista Yara deve ser checada antes de cotar");
  return watch.length ? `${watch.join("; ")}.` : "Observar PTAX, disponibilidade interna e resposta das fontes monitoradas.";
}

function buildRecommendedAction(input: { ptaxUnavailable: boolean; ptaxInternal: boolean; nitrogenRisk: boolean; kclOpportunity: boolean; yaraExpiring: boolean }) {
  const actions: string[] = [];
  if (input.ptaxUnavailable || input.ptaxInternal) actions.push("validar PTAX e usar validade curta");
  if (input.nitrogenRisk) actions.push("revisar nitrogenados");
  if (input.kclOpportunity) actions.push("trabalhar clientes com demanda de K");
  if (input.yaraExpiring) actions.push("confirmar validade da Lista Yara antes de cotar");
  return actions.length ? `${actions.join("; ")}.` : "Manter monitoramento e validar disponibilidade antes de enviar proposta.";
}

function classifyThermometerTrend(score: number) {
  if (score <= 39) return "Atencao critica";
  if (score <= 59) return "Atencao";
  if (score <= 79) return "Atencao positiva";
  return "Oportunidade forte";
}
