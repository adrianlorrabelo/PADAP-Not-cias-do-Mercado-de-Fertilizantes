import { getActiveWeeklyTable } from "./weeklyTableService";
import { getCurrentMarketUpdateSlot, getNextMarketUpdateSlot } from "./marketUpdateService";
import type { WeeklyTable } from "../types";

export type MarketDataConfidence = "verified" | "internal" | "unavailable";

export interface MarketRealityIndicator {
  name: string;
  value: string;
  day: number;
  week: number;
  trend: string;
  source: string;
  updated: string;
  history: number[];
  confidence: MarketDataConfidence;
  note: string;
}

export interface MarketRealitySnapshot {
  indicators: MarketRealityIndicator[];
  weeklyTable: WeeklyTable | null;
  ptax: {
    value: number | null;
    date: string | null;
    source: string;
    confidence: MarketDataConfidence;
  };
  warnings: string[];
  updatedAt: string;
  nextAllowedUpdate: string;
  updateSlot: string | null;
  fromCache?: boolean;
}

type CachedMarketRealitySnapshot = {
  slotId: string | null;
  snapshot: MarketRealitySnapshot;
};

type BcbPtaxResponse = {
  value?: Array<{
    cotacaoCompra?: number;
    cotacaoVenda?: number;
    dataHoraCotacao?: string;
  }>;
};

const bcbPtaxUrl = "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)";
const cacheKey = "padap.marketReality.snapshot.v1";

function readCachedSnapshot(): CachedMarketRealitySnapshot | null {
  try {
    return JSON.parse(localStorage.getItem(cacheKey) || "null") as CachedMarketRealitySnapshot | null;
  } catch {
    return null;
  }
}

function writeCachedSnapshot(value: CachedMarketRealitySnapshot) {
  try {
    localStorage.setItem(cacheKey, JSON.stringify(value));
  } catch {
    // O cache evita chamadas repetidas; se falhar, a tela segue com os dados carregados.
  }
}

function formatBcbDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day}-${date.getFullYear()}`;
}

function formatTime(value: string | null) {
  if (!value) return "--:--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatCurrency(value: number, options: Intl.NumberFormatOptions = {}) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2, ...options });
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

function getLatestDistinctPtax(rows: NonNullable<BcbPtaxResponse["value"]>) {
  const validRows = rows
    .filter((row) => row.cotacaoVenda && row.dataHoraCotacao)
    .sort((a, b) => new Date(a.dataHoraCotacao || "").getTime() - new Date(b.dataHoraCotacao || "").getTime());

  const byDate = new Map<string, NonNullable<BcbPtaxResponse["value"]>[number]>();
  validRows.forEach((row) => {
    const dateKey = String(row.dataHoraCotacao).slice(0, 10);
    byDate.set(dateKey, row);
  });

  return [...byDate.values()];
}

export async function fetchBcbPtax(signal?: AbortSignal) {
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

  const response = await fetch(`${bcbPtaxUrl}?${params.toString()}`, { signal });
  if (!response.ok) throw new Error("Não foi possível consultar a PTAX no Banco Central.");

  const data = (await response.json()) as BcbPtaxResponse;
  const dailyRows = getLatestDistinctPtax(data.value || []);
  const latest = dailyRows.at(-1);
  const previous = dailyRows.at(-2);

  if (!latest?.cotacaoVenda || !latest.dataHoraCotacao) throw new Error("Banco Central não retornou cotação PTAX válida.");

  return {
    value: latest.cotacaoVenda,
    date: latest.dataHoraCotacao,
    previousValue: previous?.cotacaoVenda || latest.cotacaoVenda,
    history: dailyRows.slice(-5).map((row) => Number(row.cotacaoVenda || 0)).filter(Boolean)
  };
}

function buildPtaxIndicator(ptax: Awaited<ReturnType<typeof fetchBcbPtax>> | null, table: WeeklyTable | null): MarketRealityIndicator {
  if (ptax) {
    const day = variation(ptax.value, ptax.previousValue);
    return {
      name: "PTAX",
      value: formatCurrency(ptax.value),
      day,
      week: day,
      trend: classifyVariation(day),
      source: "Banco Central",
      updated: formatTime(ptax.date),
      history: ptax.history.length ? ptax.history : [ptax.value],
      confidence: "verified",
      note: "Cotação PTAX venda consultada na API pública do Banco Central."
    };
  }

  if (table?.ptax) {
    return {
      name: "PTAX",
      value: formatCurrency(table.ptax),
      day: 0,
      week: 0,
      trend: "Tabela importada",
      source: "Tabela da Semana",
      updated: formatTime(table.importedAt),
      history: [table.ptax],
      confidence: "internal",
      note: "Usando PTAX da Tabela da Semana porque a consulta ao Banco Central não respondeu."
    };
  }

  return {
    name: "PTAX",
    value: "Sem dado",
    day: 0,
    week: 0,
    trend: "Indisponível",
    source: "Banco Central",
    updated: "--:--",
    history: [0],
    confidence: "unavailable",
    note: "Importe a Tabela da Semana ou tente atualizar novamente para consultar o Banco Central."
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

function buildTableIndicator(table: WeeklyTable, name: string, terms: string[]): MarketRealityIndicator | null {
  const price = averageVisiblePrice(table, terms);
  if (!price) return null;

  return {
    name,
    value: formatCurrency(price, { maximumFractionDigits: 0 }),
    day: 0,
    week: 0,
    trend: "Tabela PADAP",
    source: "Tabela da Semana",
    updated: formatTime(table.importedAt),
    history: [price],
    confidence: "internal",
    note: "Preço médio dos itens disponíveis na Tabela da Semana ativa. Não é cotação externa de mercado."
  };
}

export async function loadMarketRealitySnapshot(signal?: AbortSignal, options: { force?: boolean } = {}): Promise<MarketRealitySnapshot> {
  const currentSlot = getCurrentMarketUpdateSlot();
  const nextSlot = getNextMarketUpdateSlot();
  const cached = readCachedSnapshot();

  if (!options.force && cached?.snapshot) {
    if (!currentSlot || cached.slotId === currentSlot.id) {
      return {
        ...cached.snapshot,
        fromCache: true,
        updateSlot: currentSlot && cached.slotId === currentSlot.id ? cached.snapshot.updateSlot : null,
        nextAllowedUpdate: nextSlot.date.toISOString()
      };
    }
  }

  if (!currentSlot && cached?.snapshot) {
    return {
      ...cached.snapshot,
      fromCache: true,
      updateSlot: null,
      nextAllowedUpdate: nextSlot.date.toISOString(),
      warnings: [...cached.snapshot.warnings, "Próxima consulta real será feita na primeira janela do dia."]
    };
  }

  const weeklyTable = getActiveWeeklyTable();
  let ptax: Awaited<ReturnType<typeof fetchBcbPtax>> | null = null;
  const warnings: string[] = [];

  if (!currentSlot) {
    warnings.push("Fora das 3 janelas diárias de atualização real; próxima consulta automática será feita no horário programado.");
  } else {
    try {
      ptax = await fetchBcbPtax(signal);
    } catch {
      warnings.push("PTAX online indisponível; usando referência interna quando houver Tabela da Semana.");
    }
  }

  const tableIndicators = weeklyTable
    ? [
      buildTableIndicator(weeklyTable, "YaraBela", ["yarabela", "yara bela", "nitrogen"]),
      buildTableIndicator(weeklyTable, "MAP/Fosfatados", ["map", "fosfat"]),
      buildTableIndicator(weeklyTable, "KCl/Potássicos", ["kcl", "potass", "cloreto"]),
      buildTableIndicator(weeklyTable, "Especialidades", ["yaravita", "yaratera", "especial"])
    ].filter((item): item is MarketRealityIndicator => Boolean(item))
    : [];

  if (!weeklyTable) warnings.push("Nenhuma Tabela da Semana ativa encontrada; preços PADAP não serão exibidos como se fossem mercado.");
  if (tableIndicators.length === 0) warnings.push("Sem produtos compatíveis na Tabela da Semana para montar indicadores internos.");

  const snapshot: MarketRealitySnapshot = {
    indicators: [buildPtaxIndicator(ptax, weeklyTable), ...tableIndicators],
    weeklyTable,
    ptax: {
      value: ptax?.value ?? weeklyTable?.ptax ?? null,
      date: ptax?.date ?? weeklyTable?.importedAt ?? null,
      source: ptax ? "Banco Central" : weeklyTable ? "Tabela da Semana" : "Banco Central",
      confidence: ptax ? "verified" : weeklyTable ? "internal" : "unavailable"
    },
    warnings,
    updatedAt: new Date().toISOString(),
    nextAllowedUpdate: nextSlot.date.toISOString(),
    updateSlot: currentSlot?.id ?? null,
    fromCache: false
  };

  writeCachedSnapshot({ slotId: currentSlot?.id ?? null, snapshot });
  return snapshot;
}
