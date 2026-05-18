import type { MarketAnalystInsight, MarketStatus, ProductMarketScore } from "../types";
import { calculateGeneralMarketScore } from "../utils/marketScores";

export function getExecutiveMarketStatus(scores: ProductMarketScore[]): MarketStatus {
  const score = calculateGeneralMarketScore(scores);
  if (score >= 78) return "Volátil";
  if (scores.some((item) => item.tone === "green" && item.score >= 74)) return "Oportunidade";
  if (score >= 68) return "Atenção";
  return "Neutro";
}

export function generateBriefingWhatsApp(insight: MarketAnalystInsight) {
  return `Bom dia, equipe.

Resumo do mercado:
- PTAX em atenção, cuidado com propostas antigas.
- Ureia segue volátil, revisar nitrogenados.
- KCl apresenta oportunidade para clientes com demanda de potássio.
- Café e milho exigem atenção na relação de troca.

Orientação:
${insight.recommendedAction}

Antes de prometer preço ao produtor, confirmem validade, disponibilidade e condição atualizada com compras.

Equipe PADAP.`;
}
