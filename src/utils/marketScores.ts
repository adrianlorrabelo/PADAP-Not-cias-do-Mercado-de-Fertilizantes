import type { ProductAttention, ProductMarketScore } from "../types";

export function calculateGeneralMarketScore(scores: ProductMarketScore[]) {
  return Math.round(scores.reduce((sum, item) => sum + item.score, 0) / Math.max(scores.length, 1));
}

export function classifyMarket(score: number) {
  if (score >= 82) return "Alto risco";
  if (score >= 72) return "Atenção positiva";
  if (score >= 62) return "Volátil";
  if (score >= 52) return "Monitoramento";
  return "Baixo risco";
}

export function deriveProductScores(products: ProductAttention[]): ProductMarketScore[] {
  return products.slice(0, 8).map((item) => ({
    product: item.product,
    score: item.score,
    situation: item.score >= 76 ? "prioridade comercial" : item.score >= 66 ? "atenção" : "monitoramento",
    risk: item.impact === "Alto" ? "Alto" : item.impact === "Médio" ? "Médio" : "Baixo",
    opportunity: item.dailyVariation < 0 || item.product === "Café" ? "Alta" : item.score > 70 ? "Média" : "Baixa",
    recommendedAction: item.recommendedAction,
    tone: item.dailyVariation < 0 ? "green" : item.score > 80 ? "red" : item.score > 65 ? "amber" : "cyan"
  }));
}
