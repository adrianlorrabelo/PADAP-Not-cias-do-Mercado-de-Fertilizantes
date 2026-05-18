import type { MarketUpdateStatus } from "../types";

export function canRunManualMarketUpdate(statuses: MarketUpdateStatus[]) {
  const nextManual = statuses
    .map((status) => status.nextManual)
    .filter((value) => value.includes("T"))
    .map((value) => new Date(value).getTime())
    .sort((a, b) => a - b)[0];

  return {
    allowed: !nextManual || Date.now() >= nextManual,
    nextManual: nextManual ? new Date(nextManual).toISOString() : "Em breve"
  };
}

export function simulateMarketUpdate(statuses: MarketUpdateStatus[]): MarketUpdateStatus[] {
  const now = new Date();
  return statuses.map((status, index) => ({
    ...status,
    lastUpdate: now.toISOString(),
    nextManual: new Date(now.getTime() + (30 + index * 2) * 60000).toISOString(),
    status: index === 5 ? "atenção" : "atualizado"
  }));
}

export function getNextAutomaticUpdate(statuses: MarketUpdateStatus[]) {
  return statuses.find((status) => status.nextAutomatic.includes("T"))?.nextAutomatic ?? "12:00";
}
