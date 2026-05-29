import type { MarketUpdateHistory } from "../types";

export const marketUpdateHistoryStorageKey = "padap_market_update_history";
const maxMarketUpdateHistory = 50;

function safeRead(): MarketUpdateHistory[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(marketUpdateHistoryStorageKey);
    if (!stored) return [];

    const parsed = JSON.parse(stored) as MarketUpdateHistory[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMarketUpdateHistory(history: MarketUpdateHistory[]) {
  const limited = history
    .filter(Boolean)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, maxMarketUpdateHistory);

  if (typeof window !== "undefined") {
    localStorage.setItem(marketUpdateHistoryStorageKey, JSON.stringify(limited));
  }

  return limited;
}

export function getMarketUpdateHistory() {
  return saveMarketUpdateHistory(safeRead());
}

export function appendMarketUpdateHistory(entry: MarketUpdateHistory) {
  return saveMarketUpdateHistory([entry, ...safeRead()]);
}

export function clearMarketUpdateHistory() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(marketUpdateHistoryStorageKey);
  }

  return [];
}

export function getLatestMarketUpdateHistory() {
  return getMarketUpdateHistory()[0] ?? null;
}
