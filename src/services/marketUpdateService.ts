import { getMarketSources, saveMarketSources } from "./marketSourcesService";
import { appendMarketUpdateHistory } from "./marketUpdateHistoryService";
import { getActiveWeeklyTable } from "./weeklyTableService";
import { generateMarketAnalysis, saveLatestMarketAnalysis } from "./marketAnalysisService";
import type { MarketAnalysis, MarketIntelligenceIndicator, MarketSource, MarketSourceResult, MarketSourceStatus, MarketUpdateHistory, MarketUpdateResult, MarketUpdateStatus, MarketUpdateTrigger, WeeklyTable } from "../types";
import type { MarketRealityIndicator, MarketRealitySnapshot } from "./marketRealityService";

export const marketUpdateTimes = ["08:30", "12:30", "16:30"] as const;

function dateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function slotDate(day: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(day);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function getMarketUpdateSlots(day = new Date()) {
  return marketUpdateTimes.map((time, index) => {
    const date = slotDate(day, time);
    return {
      id: `${dateKey(date)}-${time}`,
      label: `${index + 1}ª atualização`,
      time,
      date
    };
  });
}

export function getCurrentMarketUpdateSlot(now = new Date()) {
  return getMarketUpdateSlots(now).filter((slot) => slot.date.getTime() <= now.getTime()).at(-1) ?? null;
}

export function getNextMarketUpdateSlot(now = new Date()) {
  const todayNext = getMarketUpdateSlots(now).find((slot) => slot.date.getTime() > now.getTime());
  if (todayNext) return todayNext;
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  return getMarketUpdateSlots(tomorrow)[0];
}

export function canRunManualMarketUpdate(statuses: MarketUpdateStatus[]) {
  const currentSlot = getCurrentMarketUpdateSlot();
  const latestStatusUpdate = statuses
    .map((status) => status.lastUpdate)
    .filter((value) => value.includes("T"))
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const alreadyUpdatedThisSlot = Boolean(
    currentSlot &&
    latestStatusUpdate &&
    latestStatusUpdate.getTime() >= currentSlot.date.getTime()
  );

  const nextSlot = alreadyUpdatedThisSlot || !currentSlot ? getNextMarketUpdateSlot() : currentSlot;

  return {
    allowed: Boolean(currentSlot && !alreadyUpdatedThisSlot),
    nextManual: nextSlot.date.toISOString()
  };
}

export function simulateMarketUpdate(statuses: MarketUpdateStatus[]): MarketUpdateStatus[] {
  const now = new Date();
  const nextSlot = getNextMarketUpdateSlot(now);
  return statuses.map((status) => ({
    ...status,
    lastUpdate: now.toISOString(),
    nextManual: nextSlot.date.toISOString(),
    nextAutomatic: nextSlot.date.toISOString(),
    status: status.id === "news" || status.id === "fertilizers" ? "monitorando" : "atualizado"
  }));
}

export function getNextAutomaticUpdate() {
  return getNextMarketUpdateSlot().date.toISOString();
}

export type MarketIntelligenceUpdate = {
  result: MarketUpdateResult;
  sources: MarketSource[];
  activeSources: MarketSource[];
  indicators: MarketIntelligenceIndicator[];
  snapshot: MarketRealitySnapshot;
  warnings: string[];
  analysis: MarketAnalysis;
};

export type MarketIntelligenceUpdateOptions = {
  trigger?: MarketUpdateTrigger;
};

type PtaxRead = {
  value: number;
  date: string;
  previousValue: number;
  history: number[];
} | null;

const bcbPtaxUrl = "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)";

function makeUpdateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `market-update-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatBcbDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day}-${date.getFullYear()}`;
}

function formatCurrency(value: number, maximumFractionDigits = 2) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits });
}

function formatPercentValue(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1).replace(".", ",")}%`;
}

function formatTime(value: string | null) {
  if (!value) return "--:--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function variation(current: number, previous: number) {
  if (!previous) return 0;
  return Number((((current - previous) / previous) * 100).toFixed(2));
}

function classifyVariation(value: number) {
  if (value >= 1) return "Alta";
  if (value <= -1) return "Queda";
  return "Estável";
}

function sourceRequiresUrl(source: MarketSource) {
  return source.sourceType === "API" || source.sourceType === "Link monitorado";
}

function isInternalSource(source: MarketSource) {
  return source.sourceType === "Fonte interna" || source.category === "Interna";
}

function combineSignals(parentSignal?: AbortSignal, timeoutMs = 4500) {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  const abort = () => controller.abort();
  parentSignal?.addEventListener("abort", abort, { once: true });

  return {
    signal: controller.signal,
    cleanup: () => {
      globalThis.clearTimeout(timeout);
      parentSignal?.removeEventListener("abort", abort);
    }
  };
}

function productMatches(product: string, terms: string[]) {
  const normalized = product.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  return terms.some((term) => normalized.includes(term));
}

function averageVisiblePrice(table: WeeklyTable, terms: string[]) {
  const prices = table.products
    .filter((product) => product.available && productMatches([product.description, product.group, product.reference].join(" "), terms))
    .map((product) => product.finalPrice || product.calculatedFinalPrice || 0)
    .filter((price) => price > 0);

  if (!prices.length) return null;
  return prices.reduce((sum, price) => sum + price, 0) / prices.length;
}

function buildPtaxUrl() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 10);

  const params = new URLSearchParams({
    "@dataInicial": `'${formatBcbDate(start)}'`,
    "@dataFinalCotacao": `'${formatBcbDate(end)}'`,
    "$top": "100",
    "$format": "json",
    "$orderby": "dataHoraCotacao asc"
  });

  return `${bcbPtaxUrl}?${params.toString()}`;
}

async function fetchPtax(signal?: AbortSignal): Promise<PtaxRead> {
  const response = await fetch(buildPtaxUrl(), { signal });
  if (!response.ok) throw new Error("Banco Central indisponível.");

  const data = await response.json() as {
    value?: Array<{ cotacaoVenda?: number; dataHoraCotacao?: string }>;
  };

  const dailyRows = (data.value || [])
    .filter((row) => row.cotacaoVenda && row.dataHoraCotacao)
    .sort((a, b) => new Date(a.dataHoraCotacao || "").getTime() - new Date(b.dataHoraCotacao || "").getTime());

  const byDate = new Map<string, (typeof dailyRows)[number]>();
  dailyRows.forEach((row) => byDate.set(String(row.dataHoraCotacao).slice(0, 10), row));
  const rows = [...byDate.values()];
  const latest = rows.at(-1);
  const previous = rows.at(-2);

  if (!latest?.cotacaoVenda || !latest.dataHoraCotacao) throw new Error("PTAX inválida.");

  return {
    value: latest.cotacaoVenda,
    date: latest.dataHoraCotacao,
    previousValue: previous?.cotacaoVenda || latest.cotacaoVenda,
    history: rows.slice(-5).map((row) => Number(row.cotacaoVenda || 0)).filter(Boolean)
  };
}

async function validateExternalSource(source: MarketSource, signal?: AbortSignal): Promise<MarketSourceStatus> {
  if (!source.url) return "Pendente";

  try {
    const timeout = combineSignals(signal);
    try {
      const response = await fetch(source.url, { method: "HEAD", mode: "no-cors", signal: timeout.signal });
      if (response.type === "opaque") return "Atualizada";
      return response.ok ? "Atualizada" : "Indisponível";
    } finally {
      timeout.cleanup();
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return "Indisponível";
    return "Indisponível";
  }
}

function unavailableIndicator(id: string, name: string, source = "Lista Yara / Fonte interna"): MarketIntelligenceIndicator {
  return {
    id,
    name,
    value: "Referência interna indisponível",
    unit: "Lista Yara",
    dailyChange: "0,0%",
    weeklyChange: "0,0%",
    trend: "Pendente",
    source,
    sourceType: "Interna",
    impactPadap: "Cadastre ou atualize a Lista Yara para usar referência interna segura.",
    lastUpdatedAt: new Date().toISOString()
  };
}

function buildPtaxIndicator(ptax: PtaxRead, table: WeeklyTable | null, updatedAt: string): MarketIntelligenceIndicator {
  if (ptax) {
    const daily = variation(ptax.value, ptax.previousValue);
    return {
      id: "ptax",
      name: "PTAX",
      value: formatCurrency(ptax.value),
      unit: "R$/US$ venda",
      dailyChange: formatPercentValue(daily),
      weeklyChange: formatPercentValue(daily),
      trend: classifyVariation(daily),
      source: "Banco Central",
      sourceType: "Externa",
      impactPadap: "Atenção em propostas antigas indexadas ao dólar.",
      lastUpdatedAt: ptax.date
    };
  }

  if (table?.ptax) {
    return {
      id: "ptax",
      name: "PTAX",
      value: formatCurrency(table.ptax),
      unit: "R$/US$ referência interna",
      dailyChange: "0,0%",
      weeklyChange: "0,0%",
      trend: "Lista Yara",
      source: "Lista Yara / Fonte interna",
      sourceType: "Interna",
      impactPadap: "PTAX online indisponível; usando referência interna para proteger cotações.",
      lastUpdatedAt: table.importedAt || updatedAt
    };
  }

  return {
    id: "ptax",
    name: "PTAX",
    value: "Sem referência disponível",
    unit: "R$/US$",
    dailyChange: "0,0%",
    weeklyChange: "0,0%",
    trend: "Indisponível",
    source: "Banco Central",
    sourceType: "Externa",
    impactPadap: "Importe a Lista Yara ou tente atualizar novamente antes de enviar condições indexadas ao dólar.",
    lastUpdatedAt: updatedAt
  };
}

function buildFertilizerIndicator(table: WeeklyTable | null, id: string, name: string, terms: string[], impactPadap: string, updatedAt: string): MarketIntelligenceIndicator {
  if (!table) return unavailableIndicator(id, name);

  const price = averageVisiblePrice(table, terms);
  if (!price) return unavailableIndicator(id, name);

  return {
    id,
    name,
    value: formatCurrency(price, 0),
    unit: "preço médio interno",
    dailyChange: "0,0%",
    weeklyChange: "0,0%",
    trend: "Referência interna",
    source: "Lista Yara / Fonte interna",
    sourceType: "Interna",
    impactPadap,
    lastUpdatedAt: table.importedAt || updatedAt
  };
}

function toRealityIndicator(indicator: MarketIntelligenceIndicator): MarketRealityIndicator {
  const numericValue = Number(indicator.value.replace(/[^\d,-]/g, "").replace(".", "").replace(",", ".")) || 0;
  const daily = Number(indicator.dailyChange?.replace("%", "").replace("+", "").replace(",", ".")) || 0;
  const weekly = Number(indicator.weeklyChange?.replace("%", "").replace("+", "").replace(",", ".")) || 0;

  return {
    name: indicator.name,
    value: indicator.value,
    day: daily,
    week: weekly,
    trend: indicator.trend,
    source: indicator.source,
    updated: formatTime(indicator.lastUpdatedAt),
    history: [numericValue],
    confidence: indicator.sourceType === "Externa" ? "verified" : indicator.value.includes("indisponível") || indicator.value.includes("Sem referência") ? "unavailable" : "internal",
    note: `${indicator.unit || "Referência"} - ${indicator.impactPadap}`
  };
}

function buildIndicators(table: WeeklyTable | null, ptax: PtaxRead, updatedAt: string): MarketIntelligenceIndicator[] {
  return [
    buildPtaxIndicator(ptax, table, updatedAt),
    buildFertilizerIndicator(table, "urea-nitrogenados", "Ureia / Nitrogenados", ["ureia", "yarabela", "yara bela", "nitrogen"], "Revisar nitrogenados e evitar validade longa.", updatedAt),
    buildFertilizerIndicator(table, "map-fosfatados", "MAP / Fosfatados", ["map", "fosfat"], "Cautela em pacotes grandes com fosfatados.", updatedAt),
    buildFertilizerIndicator(table, "kcl-potassicos", "KCl / Potássicos", ["kcl", "potass", "cloreto"], "Oportunidade para clientes com demanda de potássio.", updatedAt),
    buildFertilizerIndicator(table, "especialidades", "Especialidades", ["yaravita", "yaratera", "especial"], "Defender valor técnico e margem em especialidades.", updatedAt)
  ];
}

function buildUpdateStatuses(statuses: MarketUpdateStatus[], result: MarketUpdateResult): MarketUpdateStatus[] {
  const nextSlot = getNextMarketUpdateSlot(new Date(result.updatedAt));
  const state = result.status === "Completa" ? "atualizado" : result.status === "Parcial" ? "parcial" : "com falhas";

  return statuses.map((status) => ({
    ...status,
    lastUpdate: result.updatedAt,
    nextManual: nextSlot.date.toISOString(),
    nextAutomatic: nextSlot.date.toISOString(),
    status: state
  }));
}

export function applyMarketUpdateResultToStatuses(statuses: MarketUpdateStatus[], result: MarketUpdateResult) {
  return buildUpdateStatuses(statuses, result);
}

export function recordMarketUpdateFailure(trigger: MarketUpdateTrigger = "Manual") {
  const updatedAt = new Date().toISOString();
  const historyEntry: MarketUpdateHistory = {
    id: makeUpdateId(),
    updatedAt,
    trigger,
    status: "Com falhas",
    sourcesChecked: 0,
    sourcesSucceeded: 0,
    sourcesFailed: 0,
    internalSourcesUsed: 0,
    externalSourcesAvailable: 0,
    confidence: "Baixa",
    summary: trigger === "Automática"
      ? "Última atualização automática apresentou falhas. Dados internos permanecem disponíveis."
      : "Não foi possível atualizar as fontes agora. Dados internos permanecem disponíveis.",
    sourceResults: []
  };

  appendMarketUpdateHistory(historyEntry);
  return historyEntry;
}

function sourceResultMessage(status: MarketSourceResult["status"]) {
  if (status === "Atualizada") return "Fonte verificada com sucesso.";
  if (status === "Manual") return "Fonte manual disponível para consulta.";
  if (status === "Indisponível") return "Fonte não respondeu nesta leitura.";
  if (status === "Erro") return "Erro ao verificar a fonte nesta leitura.";
  return "Fonte pendente ou sem condição de validação.";
}

function toHistorySourceResult(source: MarketSource, checkedAt: string): MarketSourceResult {
  const status = source.lastStatus === "Atualizada" || source.lastStatus === "Manual" || source.lastStatus === "Indisponível" || source.lastStatus === "Erro"
    ? source.lastStatus
    : "Pendente";

  return {
    sourceId: source.id,
    sourceName: source.name,
    category: source.category,
    status,
    message: sourceResultMessage(status),
    checkedAt
  };
}

function calculateUpdateConfidence(status: MarketUpdateResult["status"], sourcesSucceeded: number, sourcesFailed: number) {
  if (status === "Com falhas" || sourcesSucceeded === 0 || sourcesFailed > sourcesSucceeded) return "Baixa";
  if (status === "Parcial" || sourcesFailed > 0) return "Média";
  return "Alta";
}

function buildHistorySummary(history: MarketUpdateHistory) {
  const statusLabel = history.status === "Completa" ? "completa" : history.status === "Parcial" ? "parcial" : "com falhas";
  const unavailable = history.sourceResults.filter((source) => source.status === "Indisponível" || source.status === "Erro").length;
  const internalReference = history.internalSourcesUsed > 0 ? " Fonte interna Lista Yara usada como referência." : "";

  return `Atualização ${statusLabel}: ${history.sourcesChecked} fontes verificadas, ${history.sourcesSucceeded} atualizadas e ${unavailable} indisponíveis.${internalReference}`;
}

export async function updateMarketIntelligence(signal?: AbortSignal, options: MarketIntelligenceUpdateOptions = {}): Promise<MarketIntelligenceUpdate> {
  const trigger = options.trigger ?? "Manual";
  const updatedAt = new Date().toISOString();
  const allSources = getMarketSources();
  const activeSources = allSources.filter((source) => source.isActive);
  const weeklyTable = getActiveWeeklyTable();
  const warnings: string[] = [];

  if (!activeSources.length) {
    warnings.push("Nenhuma fonte ativa cadastrada. Cadastre fontes para atualizar a Central de Mercado.");
  }

  let ptax: PtaxRead = null;
  try {
    ptax = await fetchPtax(signal);
  } catch {
    warnings.push("PTAX online indisponível; usando referência interna quando houver Lista Yara.");
  }

  if (!weeklyTable) {
    warnings.push("Nenhuma Lista Yara ativa encontrada; referências internas de fertilizantes permanecem indisponíveis.");
  }

  const checkedSources = await Promise.all(activeSources.map(async (source) => {
    let lastStatus: MarketSourceStatus = "Pendente";

    if (source.sourceType === "Entrada manual") {
      lastStatus = "Manual";
    } else if (isInternalSource(source)) {
      lastStatus = weeklyTable ? "Atualizada" : "Pendente";
    } else if (sourceRequiresUrl(source)) {
      lastStatus = await validateExternalSource(source, signal);
    }

    return {
      ...source,
      lastStatus,
      lastCheckedAt: updatedAt,
      updatedAt
    };
  }));

  const updatedSources = allSources.map((source) => checkedSources.find((item) => item.id === source.id) ?? source);
  saveMarketSources(updatedSources);

  const internalSourcesUsed = checkedSources.filter((source) => isInternalSource(source) && source.lastStatus === "Atualizada").length;
  const externalSourcesAvailable = checkedSources.filter((source) => !isInternalSource(source) && source.lastStatus === "Atualizada").length;
  const sourcesSucceeded = checkedSources.filter((source) => ["Atualizada", "Manual"].includes(source.lastStatus || "")).length;
  const sourcesFailed = checkedSources.filter((source) => ["Indisponível", "Erro"].includes(source.lastStatus || "")).length;

  if (sourcesFailed > 0) {
    warnings.push("Algumas fontes externas não responderam. A análise continuará com fontes internas.");
  }

  const status: MarketUpdateResult["status"] = checkedSources.length === 0 || sourcesFailed > sourcesSucceeded
    ? "Com falhas"
    : sourcesFailed > 0 || warnings.length > 0
      ? "Parcial"
      : "Completa";
  const confidence = calculateUpdateConfidence(status, sourcesSucceeded, sourcesFailed);

  const message = checkedSources.length === 0
    ? "Nenhuma fonte ativa cadastrada. Cadastre fontes para atualizar a Central de Mercado."
    : status === "Completa"
      ? "Central de Mercado atualizada com sucesso."
      : status === "Parcial"
        ? "Atualização parcial concluída. Algumas fontes não responderam."
        : "Não foi possível atualizar as fontes agora. Usando dados internos disponíveis.";

  const indicators = buildIndicators(weeklyTable, ptax, updatedAt);
  const nextSlot = getNextMarketUpdateSlot();

  const snapshot: MarketRealitySnapshot = {
    indicators: indicators.map(toRealityIndicator),
    weeklyTable,
    ptax: {
      value: ptax?.value ?? weeklyTable?.ptax ?? null,
      date: ptax?.date ?? weeklyTable?.importedAt ?? null,
      source: ptax ? "Banco Central" : weeklyTable ? "Lista Yara / Fonte interna" : "Banco Central",
      confidence: ptax ? "verified" : weeklyTable ? "internal" : "unavailable"
    },
    warnings,
    updatedAt,
    nextAllowedUpdate: nextSlot.date.toISOString(),
    updateSlot: getCurrentMarketUpdateSlot()?.id ?? null,
    fromCache: false
  };

  const updateResult: MarketUpdateResult = {
    id: "",
    updatedAt,
    status,
    sourcesChecked: checkedSources.length,
    sourcesSucceeded,
    sourcesFailed,
    internalSourcesUsed,
    externalSourcesAvailable,
    confidence,
    message
  };
  const analysis = generateMarketAnalysis({
    result: updateResult,
    sources: updatedSources,
    activeSources: checkedSources,
    indicators,
    snapshot,
    warnings
  });
  saveLatestMarketAnalysis(analysis);

  const sourceResults = checkedSources.map((source) => toHistorySourceResult(source, updatedAt));
  const historyEntry: MarketUpdateHistory = {
    id: makeUpdateId(),
    updatedAt,
    trigger,
    status,
    sourcesChecked: checkedSources.length,
    sourcesSucceeded,
    sourcesFailed,
    internalSourcesUsed,
    externalSourcesAvailable,
    confidence,
    summary: "",
    sourceResults,
    analysisId: analysis.id,
    analysisSummary: analysis.summaryTitle,
    analysisScore: analysis.thermometer.score
  };
  updateResult.id = historyEntry.id;
  historyEntry.summary = buildHistorySummary(historyEntry);
  appendMarketUpdateHistory(historyEntry);

  return {
    result: updateResult,
    sources: updatedSources,
    activeSources: checkedSources,
    indicators,
    snapshot,
    warnings,
    analysis
  };
}
