import { pdf, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { MarketReportDocument, type MarketReportBadgeTone, type MarketReportData } from "../components/market/report/MarketReportDocument";
import { mockCommercialArguments } from "../data/mockCommercialArguments";
import { mockMarketIndicators } from "../data/mockMarket";
import { mockProductsAttention } from "../data/mockMarketIndicators";
import { mockInternalMarketAlerts } from "../data/mockMarketNews";
import { mockWeeklyTable } from "../data/mockProducts";
import type { GeneratedMarketReport, MarketReportConfig, ReportAudience } from "../types";

type ReportBlockId =
  | "resumo_geral"
  | "tendencia_produto"
  | "impacto_cultura"
  | "precos"
  | "fretes"
  | "argumentos_venda"
  | "recomendacao"
  | "alertas_internos";

type ReportBlock<T> = {
  id: ReportBlockId;
  content: T;
};

const fallback = "Informação não disponível nesta atualização.";
const clientSensitiveTerms = ["margem", "custo", "comissão", "comissao", "aprovação", "aprovacao", "interno", "alerta interno"];

const productCatalog = ["Ureia", "Sulfato de Amônio", "MAP", "KCl", "SSP/TSP", "Yara Especialidades"];
const cropCatalog = ["Café", "Alho", "Cenoura", "HF geral", "Milho", "Soja"];

export function getDefaultMarketReportConfig(): MarketReportConfig {
  return {
    reportAudience: "consultant",
    period: "Últimos 7 dias",
    type: "Relatório completo",
    crops: cropCatalog,
    fertilizers: productCatalog,
    includeExchangeRatio: true,
    includeNews: true,
    includeOpportunities: true,
    includeRecommendations: true,
    includeSources: false
  };
}

export function validateMarketReportConfig(config: MarketReportConfig): string[] {
  const errors: string[] = [];
  if (!config.period) errors.push("Selecione o período do relatório.");
  if (!config.type) errors.push("Selecione o tipo de relatório.");
  if (!config.reportAudience) errors.push("Selecione o público do relatório.");
  if (!config.crops.length) errors.push("Selecione pelo menos uma cultura.");
  if (!config.fertilizers.length) errors.push("Selecione pelo menos um fertilizante.");
  return errors;
}

export function generateMarketReportFileName(audience: ReportAudience = "consultant", date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const label = audience === "client" ? "Cliente" : "Consultor";
  return `Relatorio_${label}_Mercado_PADAP_${yyyy}-${mm}-${dd}.pdf`;
}

export function createGeneratedMarketReport(config: MarketReportConfig): GeneratedMarketReport {
  const generatedAt = new Date();
  const title = config.reportAudience === "client" ? "Relatório de Mercado para Produtor" : "Relatório de Mercado para Consultores";

  return {
    id: `report-${config.reportAudience}-${generatedAt.getTime()}`,
    title,
    period: config.period,
    generatedAt: generatedAt.toISOString(),
    generatedBy: "PADAP Intelligence",
    config,
    fileName: generateMarketReportFileName(config.reportAudience, generatedAt)
  };
}

export function buildStructuredMarketReportData(report: GeneratedMarketReport): MarketReportData {
  const audience = report.config.reportAudience;
  const generatedDate = new Date(report.generatedAt);
  const reportDate = generatedDate.toLocaleDateString("pt-BR");
  const generatedAt = generatedDate.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  const normalizedBlocks = normalizeReportBlocks(createReportBlocks(report), audience);
  const block = <T,>(id: ReportBlockId) => normalizedBlocks.find((item) => item.id === id)?.content as T;

  return {
    audience,
    title: audience === "client" ? "Relatório de Mercado para Produtor" : "Relatório de Mercado para Consultores",
    subtitle: audience === "client"
      ? "Leitura simples, comercial e objetiva para decisão de compra."
      : "Visão técnica, comercial e operacional para orientar a equipe.",
    reportDate,
    generatedAt,
    period: report.period,
    generatedBy: report.generatedBy,
    trendCards: buildTrendCards(),
    summary: block<MarketReportData["summary"]>("resumo_geral"),
    productTrends: block<MarketReportData["productTrends"]>("tendencia_produto"),
    cultureImpacts: block<MarketReportData["cultureImpacts"]>("impacto_cultura"),
    productFamilies: buildProductFamilies(),
    priceReferences: block<MarketReportData["priceReferences"]>("precos"),
    freightLogistics: block<MarketReportData["freightLogistics"]>("fretes"),
    salesArguments: block<MarketReportData["salesArguments"]>("argumentos_venda"),
    internalAlerts: audience === "client" ? [] : block<MarketReportData["internalAlerts"]>("alertas_internos"),
    recommendation: block<MarketReportData["recommendation"]>("recomendacao"),
    footerNote: audience === "client"
      ? "Relatório externo com leitura comercial objetiva para o produtor."
      : "Uso interno comercial e operacional. Não enviar esta versão ao cliente."
  };
}

export function buildMarketReportData(report: GeneratedMarketReport) {
  return buildStructuredMarketReportData(report);
}

export function normalizeReportBlocks(blocks: ReportBlock<unknown>[], audience: ReportAudience): ReportBlock<unknown>[] {
  const seen = new Set<string>();
  const blockPriority: ReportBlockId[] = ["precos", "fretes", "tendencia_produto", "impacto_cultura", "recomendacao", "argumentos_venda", "alertas_internos", "resumo_geral"];
  const ordered = [...blocks].sort((a, b) => blockPriority.indexOf(a.id) - blockPriority.indexOf(b.id));
  const normalized = ordered.map((block) => ({
    id: block.id,
    content: normalizeValue(block.content, block.id, audience, seen)
  }));

  return blocks.map((block) => normalized.find((item) => item.id === block.id) ?? block);
}

export async function createMarketReportPdfBlob(report: GeneratedMarketReport) {
  const data = buildStructuredMarketReportData(report);
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
  anchor.download = report.fileName || generateMarketReportFileName(report.config.reportAudience);
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const downloadMarketReport = downloadMarketReportPdf;

function createReportBlocks(report: GeneratedMarketReport): ReportBlock<unknown>[] {
  const audience = report.config.reportAudience;
  return [
    { id: "resumo_geral", content: buildSummary(audience) },
    { id: "tendencia_produto", content: buildProductTrends(report.config.fertilizers, audience) },
    { id: "impacto_cultura", content: buildCultureImpacts(report.config.crops) },
    { id: "precos", content: buildPriceReferences(report.config.fertilizers) },
    { id: "fretes", content: buildFreightLogistics() },
    { id: "argumentos_venda", content: buildSalesArguments(report.config.fertilizers) },
    { id: "recomendacao", content: buildRecommendation(audience) },
    { id: "alertas_internos", content: buildInternalAlerts() }
  ];
}

function buildSummary(audience: ReportAudience): MarketReportData["summary"] {
  const text = audience === "client"
    ? "A semana segue com mercado seletivo. Nitrogenados pedem atenção, potássio mostra janela comercial e o câmbio continua relevante para a decisão."
    : "Cenário volátil com câmbio pressionando importados, nitrogenados sensíveis e oportunidade tática em potássicos. A rotina comercial exige validade curta e checagem de disponibilidade.";

  return {
    title: audience === "client" ? "Resumo executivo da semana" : "Resumo comercial interno",
    text,
    bullets: audience === "client"
      ? ["Nitrogenados em atenção.", "Potássio com janela favorável.", "Frete deve ser confirmado antes do fechamento.", "PTAX segue como fator de decisão."]
      : ["Recalcular propostas antigas antes do envio.", "Confirmar disponibilidade em itens críticos.", "Priorizar KCl em clientes com demanda ativa.", "Usar validade curta em importados."],
    producerReading: "Para compras com necessidade próxima, vale priorizar produtos em oportunidade e evitar alongar decisão nos itens mais sensíveis ao câmbio.",
    consultantAction: "Revisar propostas abertas, confirmar tabela vigente e trabalhar KCl com clientes de café, HF e soja antes da próxima atualização."
  };
}

function buildTrendCards(): MarketReportData["trendCards"] {
  return [
    card("Nitrogenados", "Alta seletiva", "Atenção", "red", "Ureia permanece mais sensível no curto prazo."),
    card("Fosfatados", "Alta moderada", "Monitorar", "amber", "MAP exige cuidado em pacotes maiores."),
    card("Potássio", "Recuo pontual", "Oportunidade", "green", "KCl abre janela comercial para demanda ativa."),
    card("Frete", `R$ ${formatNumber(mockWeeklyTable.freight)}/t`, "Sensível", "amber", "Rotas CIF precisam de reconfirmação."),
    card("Dólar/PTAX", ptaxLabel(), "Atenção", "blue", "Câmbio ainda pesa em produtos importados."),
    card("Disponibilidade", "Mista", "Checar", "gray", "Alguns itens exigem confirmação antes da oferta.")
  ];
}

function card(label: string, value: string, trend: string, tone: MarketReportBadgeTone, note: string) {
  return { label, value, trend, tone, note };
}

function buildProductTrends(selected: string[], audience: ReportAudience): MarketReportData["productTrends"] {
  const defaults: Record<string, Omit<MarketReportData["productTrends"][number], "product">> = {
    Ureia: { trend: "Atenção", tone: "red", reason: "Nitrogenados seguem voláteis.", commercialAttention: audience === "client" ? "Comprar apenas com condição confirmada." : "Reconfirmar preço e validade antes de cotar." },
    "Sulfato de Amônio": { trend: "Estável", tone: "blue", reason: "Mercado lateral na semana.", commercialAttention: "Monitorar disponibilidade regional." },
    MAP: { trend: "Monitorar", tone: "amber", reason: "Fosfatados com alta moderada.", commercialAttention: audience === "client" ? "Avaliar trava em compras maiores." : "Defender urgência em pacotes fosfatados." },
    KCl: { trend: "Oportunidade", tone: "green", reason: "Potássicos com recuo pontual.", commercialAttention: "Priorizar demanda ativa de potássio." },
    "SSP/TSP": { trend: "Estável", tone: "blue", reason: "Sem choque relevante na semana.", commercialAttention: "Acompanhar prazo e oferta local." },
    "Yara Especialidades": { trend: "Monitorar", tone: "amber", reason: "Mix premium sensível ao câmbio.", commercialAttention: audience === "client" ? "Planejar compra conforme necessidade técnica." : "Usar argumento de segurança nutricional." }
  };

  return selected.map((product) => ({ product, ...(defaults[product] ?? defaults["Yara Especialidades"]) }));
}

function buildCultureImpacts(selected: string[]): MarketReportData["cultureImpacts"] {
  const defaults: Record<string, MarketReportData["cultureImpacts"][number]> = {
    Café: { culture: "Café", nutrients: "K e P", weeklyReading: "Relação de troca melhora em potássio.", suggestedAction: "Avaliar compra de KCl e monitorar MAP." },
    Alho: { culture: "Alho", nutrients: "N, K e especiais", weeklyReading: "Demanda técnica segue estável.", suggestedAction: "Manter planejamento e confirmar disponibilidade." },
    Cenoura: { culture: "Cenoura", nutrients: "K e foliares", weeklyReading: "Cultura com janela favorável para pacote.", suggestedAction: "Antecipar volumes de maior giro." },
    "HF geral": { culture: "HF geral", nutrients: "N, K e micronutrientes", weeklyReading: "Frete e disponibilidade pesam na decisão.", suggestedAction: "Comprar itens críticos com validade confirmada." },
    Milho: { culture: "Milho", nutrients: "N", weeklyReading: "Ureia segue como ponto de atenção.", suggestedAction: "Evitar postergar nitrogenados essenciais." },
    Soja: { culture: "Soja", nutrients: "P e K", weeklyReading: "Fosfatados exigem monitoramento.", suggestedAction: "Monitorar MAP e aproveitar KCl se houver necessidade." }
  };

  return selected.map((culture) => defaults[culture] ?? { culture, nutrients: "NPK", weeklyReading: fallback, suggestedAction: "Manter acompanhamento comercial." });
}

function buildProductFamilies(): MarketReportData["productFamilies"] {
  return [
    { family: "Nitrogenados", trend: "Alta", tone: "red", reason: "Ureia volátil.", risk: "Proposta defasada.", affectedRegions: "Milho e HF", commercialAction: "Reconfirmar tabela e validade." },
    { family: "Fosfatados", trend: "Atenção", tone: "amber", reason: "MAP pressionado.", risk: "Pacotes grandes.", affectedRegions: "Café e soja", commercialAction: "Defender trava de preço." },
    { family: "Potássicos", trend: "Oportunidade", tone: "green", reason: "KCl recuou.", risk: "Janela curta.", affectedRegions: "Café, HF e soja", commercialAction: "Ativar clientes com demanda." },
    { family: "Especialidades/Foliares", trend: "Estável", tone: "blue", reason: "Demanda técnica.", risk: "Câmbio e disponibilidade.", affectedRegions: "HF e café", commercialAction: "Defender valor técnico." }
  ];
}

function buildPriceReferences(selected: string[]): MarketReportData["priceReferences"] {
  const products = selected.map((name) => findProductPrice(name));
  return products.map(({ product, current }) => {
    const previous = Math.round(current * previousFactor(product));
    const variation = current - previous;
    return {
      product,
      currentPrice: money(current),
      previousPrice: money(previous),
      variation: `${variation >= 0 ? "+" : ""}${formatNumber((variation / previous) * 100)}%`,
      trend: trendFromVariation(variation),
      tone: toneFromVariation(variation),
      observation: observationForProduct(product)
    };
  });
}

function buildFreightLogistics(): MarketReportData["freightLogistics"] {
  return [
    { origin: "Dólar/PTAX", destination: "Importados", currentFreight: ptaxLabel(), previousFreight: "R$ 5,13", variation: "Alta leve", impact: "Pode alterar condição de produtos importados." },
    { origin: "Frete Alto Paranaíba", destination: "PADAP e região", currentFreight: money(mockWeeklyTable.freight), previousFreight: money(78), variation: "+5,1%", impact: "Confirmar CIF antes de fechar." },
    { origin: "Porto / misturadora", destination: "Café", currentFreight: money(96), previousFreight: money(92), variation: "+4,3%", impact: "Atenção em entregas de curto prazo." },
    { origin: "Indústria local", destination: "HF geral", currentFreight: money(72), previousFreight: money(74), variation: "-2,7%", impact: "Rota com condição mais controlada." },
    { origin: "Base regional", destination: "Milho", currentFreight: money(84), previousFreight: money(82), variation: "+2,4%", impact: "Sem choque, mas exige agenda de carregamento." }
  ];
}

function buildSalesArguments(selected: string[]): MarketReportData["salesArguments"] {
  const argumentByProduct: Record<string, MarketReportData["salesArguments"][number]> = {
    Ureia: { product: "Ureia", objection: "Cliente quer esperar preço cair.", suggestedAnswer: argumentText("Ureia em alta") },
    "Sulfato de Amônio": { product: "Sulfato de Amônio", objection: "Cliente compara apenas preço por tonelada.", suggestedAnswer: "Comparar também disponibilidade, prazo e encaixe técnico no manejo de nitrogênio." },
    MAP: { product: "MAP", objection: "Cliente acha o fosfatado caro.", suggestedAnswer: "Mostrar risco de alta e avaliar trava parcial para preservar planejamento." },
    KCl: { product: "KCl", objection: "Cliente quer adiar compra de potássio.", suggestedAnswer: argumentText("KCl em oportunidade") },
    "SSP/TSP": { product: "SSP/TSP", objection: "Cliente pede alternativa mais barata.", suggestedAnswer: "Comparar entrega nutricional, disponibilidade local e custo por hectare." },
    "Yara Especialidades": { product: "Yara Especialidades", objection: "Cliente vê especialidade como item caro.", suggestedAnswer: argumentText("Especialidade x commodity") }
  };

  return selected.map((product) => argumentByProduct[product] ?? argumentByProduct["Yara Especialidades"]);
}

function buildInternalAlerts(): MarketReportData["internalAlerts"] {
  return [
    { type: "Cotação vencendo", priority: "Alta", description: "Tabela semanal próxima do vencimento.", action: "Confirmar validade antes de enviar proposta." },
    { type: "Dólar/PTAX alterado", priority: "Alta", description: "Câmbio mudou desde propostas antigas.", action: "Recalcular importados antes do reenvio." },
    { type: "Baixa disponibilidade", priority: "Média", description: "MAP e especialidades exigem checagem.", action: "Validar estoque antes de prometer entrega." },
    { type: "Margem abaixo do mínimo", priority: "Crítica", description: "Algumas propostas podem exigir revisão gerencial.", action: "Acionar gestor antes de fechar." },
    { type: "Cliente estratégico", priority: "Alta", description: "Contas de café e HF têm demanda ativa.", action: "Priorizar contato consultivo." },
    { type: "Frete fora do padrão", priority: "Média", description: "Rotas CIF sensíveis no curto prazo.", action: "Reconfirmar frete antes da proposta final." },
    ...mockInternalMarketAlerts.slice(0, 1).map((alert) => ({ type: cleanText(alert.title), priority: cleanText(alert.priority), description: cleanText(alert.message), action: "Tratar no painel de mercado." }))
  ].slice(0, 7);
}

function buildRecommendation(audience: ReportAudience): MarketReportData["recommendation"] {
  return {
    buyNow: ["KCl", "Pacotes com demanda imediata de potássio", audience === "client" ? "Itens com necessidade de curto prazo" : "Clientes de café com relação de troca favorável"],
    monitor: ["Ureia", "MAP", "Frete CIF em rotas sensíveis"],
    wait: ["SSP/TSP sem urgência", "Compras sem demanda definida", "Itens com disponibilidade incerta"],
    finalText: audience === "client"
      ? "Comprar agora apenas o que tem necessidade clara ou oportunidade confirmada. Monitorar nitrogenados e fosfatados antes de ampliar volume."
      : "Trabalhar KCl com prioridade, revisar propostas antigas e confirmar preço, frete e disponibilidade antes de qualquer compromisso comercial."
  };
}

function normalizeValue(value: unknown, blockId: ReportBlockId, audience: ReportAudience, seen: Set<string>): unknown {
  if (typeof value === "string") return normalizeSentence(value, blockId, audience, seen);
  if (Array.isArray(value)) return value.map((item) => normalizeValue(item, blockId, audience, seen)).filter((item) => item !== "");
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeValue(item, blockId, audience, seen)]));
  }
  return value;
}

function normalizeSentence(value: string, blockId: ReportBlockId, audience: ReportAudience, seen: Set<string>) {
  const clean = cleanText(value);
  if (audience === "client" && containsSensitiveTerm(clean)) return "";
  if (blockId === "resumo_geral" && seen.has(signature(clean))) return "";

  const parts = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
  const unique = parts.filter((part) => {
    const key = signature(part);
    if (!key || seen.has(key)) return false;
    if (part.length > 18) seen.add(key);
    return true;
  });

  const result = unique.join(" ").trim();
  return result || clean;
}

function signature(value: string) {
  return stripAccents(value)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .slice(0, 8)
    .join(" ");
}

function containsSensitiveTerm(value: string) {
  const normalized = stripAccents(value).toLowerCase();
  return clientSensitiveTerms.some((term) => normalized.includes(stripAccents(term).toLowerCase()));
}

function cleanText(value: string) {
  try {
    const decoded = decodeURIComponent(escape(value));
    return fixCommonEncoding(decoded);
  } catch {
    return fixCommonEncoding(value);
  }
}

function fixCommonEncoding(value: string) {
  return value
    .replaceAll("Amonio", "Amônio")
    .replaceAll("potassico", "potássico")
    .replaceAll("potassicos", "potássicos")
    .replaceAll("preco", "preço")
    .replaceAll("urgencia", "urgência")
    .replaceAll("acessiveis", "acessíveis")
    .replaceAll("Revisao", "Revisão")
    .replaceAll("pendencias", "pendências")
    .replaceAll("volatilidade", "volatilidade");
}

function stripAccents(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function findProductPrice(product: string) {
  const normalized = stripAccents(product).toLowerCase();
  const match = mockWeeklyTable.products.find((item) => {
    const haystack = stripAccents(`${item.description} ${item.reference} ${item.group}`).toLowerCase();
    return haystack.includes(normalized) || normalized.includes(stripAccents(item.reference).toLowerCase());
  });

  if (match) return { product, current: match.finalPrice };
  if (product === "Sulfato de Amônio") return { product, current: 2720 };
  if (product === "SSP/TSP") return { product, current: 2380 };
  return { product, current: 2140 };
}

function previousFactor(product: string) {
  if (product === "KCl") return 1.04;
  if (product === "Ureia") return 0.96;
  if (product === "MAP") return 0.985;
  return 0.99;
}

function trendFromVariation(variation: number) {
  if (variation > 50) return "Alta";
  if (variation < -50) return "Baixa";
  return "Estável";
}

function toneFromVariation(variation: number): MarketReportBadgeTone {
  if (variation > 50) return "amber";
  if (variation < -50) return "green";
  return "blue";
}

function observationForProduct(product: string) {
  const attention = mockProductsAttention.find((item) => item.product === product);
  return cleanText(attention?.movement ?? "Referência comercial da semana.");
}

function argumentText(category: string) {
  return cleanText(mockCommercialArguments.find((item) => item.category === category)?.argument ?? fallback);
}

function ptaxLabel() {
  const ptax = mockMarketIndicators.find((item) => item.name === "PTAX")?.value ?? mockWeeklyTable.ptax;
  return `R$ ${ptax.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function money(value: number) {
  return `R$ ${Math.round(value).toLocaleString("pt-BR")}`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value);
}
