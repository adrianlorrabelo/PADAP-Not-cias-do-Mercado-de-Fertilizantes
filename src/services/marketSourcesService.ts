import type { MarketSource, MarketSourceCategory, MarketSourceConfidence, MarketSourceType } from "../types";
import { deleteMarketSource as dbDelete, fetchMarketSources, upsertMarketSources } from "../lib/db/marketSources";

export const marketSourcesStorageKey = "padap_market_sources";

export const marketSourceCategories: MarketSourceCategory[] = ["Câmbio", "Fertilizantes", "Oferta e demanda", "Café", "Grãos", "Institucional", "Interna", "Outra"];
export const marketSourceTypes: MarketSourceType[] = ["API", "Link monitorado", "Entrada manual", "Fonte interna"];
export const marketSourceConfidences: MarketSourceConfidence[] = ["Alta", "Média", "Baixa"];

const now = () => new Date().toISOString();

function createSeedSource(source: Omit<MarketSource, "id" | "createdAt" | "updatedAt" | "lastStatus"> & { id: string }): MarketSource {
  const timestamp = now();
  return {
    ...source,
    lastStatus: source.sourceType === "Entrada manual" || source.sourceType === "Fonte interna" ? "Manual" : source.isActive ? "Ativa" : "Inativa",
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export const defaultMarketSources: MarketSource[] = [
  createSeedSource({ id: "banco-central", name: "Banco Central", category: "Câmbio", sourceType: "API", confidence: "Alta", isActive: true, useInBriefing: true, url: "https://www.bcb.gov.br/", observation: "Fonte oficial para câmbio e PTAX." }),
  createSeedSource({ id: "lista-yara-padap", name: "Lista Yara / Tabela PADAP", category: "Interna", sourceType: "Fonte interna", confidence: "Alta", isActive: true, useInBriefing: true, observation: "Base interna de compras e precificação." }),
  createSeedSource({ id: "anda", name: "ANDA", category: "Oferta e demanda", sourceType: "Link monitorado", confidence: "Alta", isActive: true, useInBriefing: true, url: "https://anda.org.br/" }),
  createSeedSource({ id: "globalfert", name: "GlobalFert", category: "Fertilizantes", sourceType: "Link monitorado", confidence: "Alta", isActive: true, useInBriefing: true, url: "https://globalfert.com.br/" }),
  createSeedSource({ id: "noticias-agricolas", name: "Notícias Agrícolas", category: "Fertilizantes", sourceType: "Link monitorado", confidence: "Média", isActive: true, useInBriefing: true, url: "https://www.noticiasagricolas.com.br/" }),
  createSeedSource({ id: "agrolink", name: "Agrolink", category: "Fertilizantes", sourceType: "Link monitorado", confidence: "Média", isActive: true, useInBriefing: true, url: "https://www.agrolink.com.br/" }),
  createSeedSource({ id: "cepea", name: "CEPEA", category: "Café", sourceType: "Link monitorado", confidence: "Alta", isActive: true, useInBriefing: true, url: "https://www.cepea.esalq.usp.br/" }),
  createSeedSource({ id: "conab", name: "CONAB", category: "Oferta e demanda", sourceType: "Link monitorado", confidence: "Alta", isActive: true, useInBriefing: true, url: "https://www.conab.gov.br/" })
];

function safeRead(): MarketSource[] | null {
  if (typeof window === "undefined") return defaultMarketSources;
  try {
    const stored = localStorage.getItem(marketSourcesStorageKey);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as MarketSource[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveMarketSources(sources: MarketSource[]) {
  if (typeof window === "undefined") return sources;
  localStorage.setItem(marketSourcesStorageKey, JSON.stringify(sources));
  upsertMarketSources(sources).catch(console.error);
  return sources;
}

export function getMarketSources() {
  const stored = safeRead();
  if (stored !== null) return stored;
  return saveMarketSources(defaultMarketSources);
}

export function createMarketSource(source: Omit<MarketSource, "id" | "createdAt" | "updatedAt" | "lastStatus">) {
  const timestamp = now();
  const next: MarketSource = {
    ...source,
    id: makeId(timestamp),
    lastStatus: source.sourceType === "Entrada manual" || source.sourceType === "Fonte interna" ? "Manual" : source.isActive ? "Ativa" : "Inativa",
    createdAt: timestamp,
    updatedAt: timestamp
  };
  return saveMarketSources([next, ...getMarketSources()])[0];
}

export function updateMarketSource(id: string, updates: Partial<MarketSource>) {
  const sources = getMarketSources();
  const next = sources.map((source) => source.id === id ? { ...source, ...updates, updatedAt: now() } : source);
  saveMarketSources(next);
  return next.find((source) => source.id === id) ?? null;
}

export function deleteMarketSource(id: string) {
  dbDelete(id).catch(console.error);
  return saveMarketSources(getMarketSources().filter((source) => source.id !== id));
}

export async function syncMarketSourcesFromSupabase(): Promise<void> {
  const data = await fetchMarketSources();
  if (data.length) localStorage.setItem(marketSourcesStorageKey, JSON.stringify(data));
}

export function getActiveMarketSources() {
  return getMarketSources().filter((source) => source.isActive);
}

export function getBriefingSources() {
  return getMarketSources().filter((source) => source.isActive && source.useInBriefing);
}

function makeId(seed: string) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `source-${seed}-${Math.random().toString(16).slice(2)}`;
}
