import { pdf, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { MarketReportDocument, type MarketReportBadgeTone, type MarketReportData } from "../components/market/report/MarketReportDocument";
import { mockInternalMarketAlerts } from "../data/mockMarketNews";
import { mockCommercialOpportunities, mockExchangeRatios } from "../data/mockMarketOpportunities";
import { mockMarketSources } from "../data/mockMarketSources";
import type { GeneratedMarketReport, MarketReportConfig } from "../types";

const fallback = "Informação não disponível nesta atualização.";

const fertilizerDefaults: Record<string, { trend: string; tone: MarketReportBadgeTone; impact: string; recommendedAction: string }> = {
  Ureia: {
    trend: "Atenção",
    tone: "amber",
    impact: "Pressão em nitrogenados e maior risco em propostas abertas.",
    recommendedAction: "Revisar propostas antigas antes do envio."
  },
  MAP: {
    trend: "Atenção",
    tone: "amber",
    impact: "Fosfatados exigem cautela em pacotes de soja e café.",
    recommendedAction: "Confirmar validade e defender trava de preço quando fizer sentido."
  },
  KCl: {
    trend: "Oportunidade",
    tone: "green",
    impact: "Condição mais favorável em potássicos.",
    recommendedAction: "Trabalhar clientes com histórico de compra de K."
  },
  Fosfatados: {
    trend: "Atenção",
    tone: "amber",
    impact: "Custo relativo pode pressionar pacotes com maior participação de fósforo.",
    recommendedAction: "Monitorar MAP e ajustar argumentação por cultura."
  },
  Potássicos: {
    trend: "Oportunidade",
    tone: "green",
    impact: "Janela comercial para culturas com demanda ativa de potássio.",
    recommendedAction: "Priorizar clientes de café, HF e soja com compra recorrente."
  },
  Nitrogenados: {
    trend: "Risco",
    tone: "red",
    impact: "Volatilidade em ureia pode reduzir margem se a proposta estiver defasada.",
    recommendedAction: "Confirmar preço, disponibilidade e validade antes de prometer condição."
  }
};

const cropDefaults: Record<string, { trend: string; tone: MarketReportBadgeTone; impact: string; observation: string }> = {
  Café: {
    trend: "Volátil",
    tone: "amber",
    impact: "Alto",
    observation: "Relação de troca deve ser usada na negociação."
  },
  Milho: {
    trend: "Atenção",
    tone: "amber",
    impact: "Médio",
    observation: "Acompanhar poder de compra do produtor antes de alongar prazo."
  },
  Soja: {
    trend: "Atenção",
    tone: "amber",
    impact: "Médio",
    observation: "Fosfatados podem exigir defesa comercial mais cuidadosa."
  },
  Cenoura: {
    trend: "Oportunidade",
    tone: "green",
    impact: "Médio",
    observation: "Janela positiva para pacotes nutricionais com compra planejada."
  },
  Alho: {
    trend: "Estável",
    tone: "blue",
    impact: "Médio",
    observation: "Manter monitoramento e reforçar disponibilidade antes do fechamento."
  },
  Cebola: {
    trend: "Estável",
    tone: "blue",
    impact: "Baixo",
    observation: "Sem alteração relevante; usar qualidade e prazo como apoio."
  }
};

export function getDefaultMarketReportConfig(): MarketReportConfig {
  return {
    period: "Últimos 7 dias",
    type: "Briefing comercial rápido",
    crops: ["Café", "Milho", "Soja", "Cenoura", "Alho", "Cebola"],
    fertilizers: ["Ureia", "MAP", "KCl", "Fosfatados", "Potássicos", "Nitrogenados"],
    includeExchangeRatio: true,
    includeNews: true,
    includeOpportunities: true,
    includeRecommendations: true,
    includeSources: true
  };
}

export function validateMarketReportConfig(config: MarketReportConfig): string[] {
  const errors: string[] = [];
  if (!config.period) errors.push("Selecione o período do relatório.");
  if (!config.type) errors.push("Selecione o tipo de relatório.");
  if (!config.crops.length) errors.push("Selecione pelo menos uma cultura.");
  if (!config.fertilizers.length) errors.push("Selecione pelo menos um fertilizante.");
  return errors;
}

export function generateMarketReportFileName(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `Relatorio_Estrategico_Mercado_PADAP_${yyyy}-${mm}-${dd}.pdf`;
}

export function createGeneratedMarketReport(config: MarketReportConfig): GeneratedMarketReport {
  const generatedAt = new Date();
  return {
    id: `report-${generatedAt.getTime()}`,
    title: "Relatório Estratégico de Mercado",
    period: config.period,
    generatedAt: generatedAt.toISOString(),
    generatedBy: "PADAP Intelligence",
    config,
    fileName: generateMarketReportFileName(generatedAt)
  };
}

export function buildMarketReportData(report: GeneratedMarketReport): MarketReportData {
  const generatedDate = new Date(report.generatedAt);
  const reportDate = generatedDate.toLocaleDateString("pt-BR");
  const reportTime = generatedDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const generatedAt = generatedDate.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  const sourceNames = ["Banco Central", "CEPEA", "Comex Stat", "GlobalFert", "Conab"];

  return {
    title: "Relatório Estratégico de Mercado",
    subtitle: "Inteligência para decisões comerciais mais seguras.",
    reportDate,
    reportTime,
    generatedAt,
    period: report.period,
    generatedBy: report.generatedBy,
    lastUpdate: reportTime,
    mainSources: sourceNames.join(", "),
    summary: "O mercado segue volátil, com atenção ao câmbio, aos nitrogenados e à disponibilidade de fertilizantes. O PTAX pode pressionar propostas antigas, enquanto o KCl apresenta oportunidade comercial em potássicos. O momento exige validade curta, revisão de propostas abertas e atenção à relação de troca das principais culturas.",
    bullets: [
      "PTAX em atenção.",
      "Ureia exige monitoramento.",
      "KCl apresenta oportunidade comercial.",
      "Relação de troca deve orientar a negociação."
    ],
    movements: [
      { indicator: "PTAX", movement: "Alta", movementTone: "red", impact: "Pressiona fertilizantes importados.", commercialAttention: "Revisar propostas antigas e usar validade curta." },
      { indicator: "Ureia", movement: "Atenção", movementTone: "amber", impact: "Risco em nitrogenados.", commercialAttention: "Confirmar validade antes de enviar." },
      { indicator: "KCl", movement: "Oportunidade", movementTone: "green", impact: "Melhora em potássicos.", commercialAttention: "Trabalhar clientes com demanda de K." },
      { indicator: "Café", movement: "Volátil", movementTone: "amber", impact: "Altera relação de troca.", commercialAttention: "Usar relação de troca na argumentação." }
    ],
    fertilizers: buildFertilizers(report.config.fertilizers),
    crops: buildCrops(report.config.crops),
    exchangeRatios: report.config.includeExchangeRatio ? buildExchangeRatios() : [emptyExchangeRatio()],
    opportunities: report.config.includeOpportunities ? buildOpportunities() : [{
      opportunity: "Oportunidades não incluídas",
      reason: "A opção foi desmarcada na configuração do relatório.",
      recommendedAction: "Gerar relatório completo quando necessário."
    }],
    alerts: buildAlerts(),
    recommendation: report.config.includeRecommendations ? [
      "Revisar propostas antigas antes de reenviar ao consultor.",
      "Usar validade curta em produtos impactados pelo câmbio.",
      "Trabalhar KCl como oportunidade comercial.",
      "Usar relação de troca na argumentação com produtores.",
      "Confirmar disponibilidade antes de fechar pedidos.",
      "Priorizar clientes estratégicos com demanda ativa."
    ] : [fallback],
    sources: report.config.includeSources ? buildSources(generatedAt) : [{
      name: "Fontes não incluídas",
      category: "Configuração",
      confidence: "-",
      lastUpdate: generatedAt
    }]
  };
}

export async function createMarketReportPdfBlob(report: GeneratedMarketReport) {
  const data = buildMarketReportData(report);
  const document = createElement(MarketReportDocument, { data }) as unknown as ReactElement<DocumentProps>;
  return pdf(document).toBlob();
}

export async function downloadMarketReportPdf(report: GeneratedMarketReport) {
  const blob = await createMarketReportPdfBlob(report);
  if (!blob || blob.size < 1500) {
    throw new Error("PDF vazio ou inválido.");
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = report.fileName || generateMarketReportFileName();
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const downloadMarketReport = downloadMarketReportPdf;

function buildFertilizers(selected: string[]) {
  return selected.map((name) => ({
    name,
    ...(fertilizerDefaults[name] ?? {
      trend: "Estável",
      tone: "gray" as const,
      impact: fallback,
      recommendedAction: "Manter monitoramento comercial."
    })
  }));
}

function buildCrops(selected: string[]) {
  return selected.map((name) => ({
    name,
    ...(cropDefaults[name] ?? {
      trend: "Estável",
      tone: "gray" as const,
      impact: "Baixo",
      observation: fallback
    })
  }));
}

function buildExchangeRatios() {
  const preferred = ["Café x KCl", "Café x MAP", "Soja x MAP", "Milho x Ureia"];
  const items = preferred
    .map((pair) => mockExchangeRatios.find((item) => normalizeText(item.pair) === normalizeText(pair)))
    .filter(Boolean);

  return (items.length ? items : mockExchangeRatios.slice(0, 4)).map((item) => ({
    pair: normalizeText(item!.pair),
    previous: `${formatNumber(item!.previous)} ${item!.unit}`,
    current: `${formatNumber(item!.current)} ${item!.unit}`,
    variation: `${item!.variation > 0 ? "+" : ""}${formatNumber(item!.variation)}%`,
    status: normalizeText(item!.status),
    tone: ratioTone(normalizeText(item!.status)),
    interpretation: normalizeText(item!.interpretation)
  }));
}

function emptyExchangeRatio() {
  return {
    pair: "Relação de troca",
    previous: "-",
    current: "-",
    variation: "-",
    status: "Não incluída",
    tone: "gray" as const,
    interpretation: "Relação de troca não incluída nesta configuração."
  };
}

function buildOpportunities() {
  const items = mockCommercialOpportunities.length ? mockCommercialOpportunities.slice(0, 4) : [];
  if (!items.length) {
    return [{ opportunity: "Oportunidade comercial", reason: fallback, recommendedAction: "Manter acompanhamento com a equipe comercial." }];
  }

  return items.map((item) => ({
    opportunity: normalizeOpportunityTitle(item.opportunity),
    reason: normalizeText(item.justification),
    recommendedAction: normalizeText(item.recommendedAction)
  }));
}

function buildAlerts() {
  const base = [
    "Não prometer preço sem confirmar validade.",
    "Propostas antigas podem estar desatualizadas pelo PTAX.",
    "Nitrogenados exigem revisão antes do envio.",
    "Confirmar disponibilidade de fábrica antes de fechar.",
    "Evitar alongar prazo sem validação interna."
  ];
  const marketAlerts = mockInternalMarketAlerts.slice(0, 1).map((alert) => normalizeText(alert.message));
  return [...base, ...marketAlerts].slice(0, 6);
}

function buildSources(generatedAt: string) {
  const preferred = ["bcb", "cepea", "comex", "globalfert", "conab", "world-bank", "fao"];
  const items = preferred
    .map((id) => mockMarketSources.find((source) => source.id === id))
    .filter(Boolean);

  return (items.length ? items : mockMarketSources.slice(0, 7)).map((source) => ({
    name: normalizeSourceName(source!.name),
    category: normalizeText(source!.category),
    confidence: source!.confidence ? `${source!.confidence}%` : "Alta",
    lastUpdate: formatSourceDate(source!.lastUpdate, generatedAt),
    link: compactDomain(source!.link)
  }));
}

function ratioTone(status: string): MarketReportBadgeTone {
  if (status === "Favorável") return "green";
  if (status === "Desfavorável") return "red";
  if (status === "Estável") return "blue";
  return "gray";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value);
}

function formatSourceDate(value: string, fallbackDate: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallbackDate;
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function compactDomain(link?: string) {
  if (!link) return undefined;
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

function normalizeOpportunityTitle(value: string) {
  const normalized = normalizeText(value);
  if (normalized === "KCl em queda") return "KCl em oportunidade";
  if (normalized === "PTAX subiu") return "PTAX em atenção";
  if (normalized === "Ureia volátil") return "Nitrogenados em atenção";
  return normalized;
}

function normalizeSourceName(value: string) {
  const normalized = normalizeText(value);
  if (normalized === "CONAB") return "Conab";
  if (normalized === "FAO / AMIS") return "World Bank / FAO / AMIS";
  if (normalized === "World Bank Pink Sheet") return "World Bank";
  return normalized;
}

function normalizeText(value: string) {
  return value
    .replaceAll("Ã¡", "á")
    .replaceAll("Ã¢", "â")
    .replaceAll("Ã£", "ã")
    .replaceAll("Ã©", "é")
    .replaceAll("Ãª", "ê")
    .replaceAll("Ã­", "í")
    .replaceAll("Ã³", "ó")
    .replaceAll("Ã´", "ô")
    .replaceAll("Ãµ", "õ")
    .replaceAll("Ãº", "ú")
    .replaceAll("Ã§", "ç")
    .replaceAll("Ã�", "Á")
    .replaceAll("Ã‰", "É")
    .replaceAll("Ã“", "Ó")
    .replaceAll("Ãš", "Ú")
    .replaceAll("Ã‡", "Ç")
    .replaceAll("MÃ©dia", "Média")
    .replaceAll("CrÃ­tica", "Crítica")
    .replaceAll("FavorÃ¡vel", "Favorável")
    .replaceAll("DesfavorÃ¡vel", "Desfavorável")
    .replaceAll("EstÃ¡vel", "Estável")
    .replaceAll("potÃ¡ssio", "potássio")
    .replaceAll("preÃ§o", "preço")
    .replaceAll("cafÃ©", "café")
    .replaceAll("urgencia", "urgência")
    .replaceAll("acessiveis", "acessíveis")
    .replaceAll("revisÃ£o", "revisão")
    .replaceAll("relaÃ§Ã£o", "relação")
    .replaceAll("Ãºltima", "última")
    .replaceAll("ImportaÃ§Ãµes", "Importações")
    .replaceAll("CÃ¢mbio", "Câmbio");
}
