import type { MarketConfidenceSource } from "../types";

export function summarizeSources(sources: MarketConfidenceSource[]) {
  const monitored = sources.length;
  const averageConfidence = Math.round(sources.reduce((sum, source) => sum + source.confidence, 0) / Math.max(monitored, 1));
  const official = sources.filter((source) => source.tier === "Nível 1").length;
  return { monitored, averageConfidence, official };
}
