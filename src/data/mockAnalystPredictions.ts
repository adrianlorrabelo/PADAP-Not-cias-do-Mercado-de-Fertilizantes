import type { AnalystPrediction } from "../types";

export const mockAnalystPredictions: AnalystPrediction[] = [
  { id: "pred-urea", predictionDate: "2026-05-09", product: "Ureia", prediction: "Tendência de alta nos próximos 7 dias.", horizon: "7 dias", observedResult: "Ureia subiu 2,8%.", hitTrend: true, precision: 86, note: "Movimento confirmado por mercado externo." },
  { id: "pred-kcl", predictionDate: "2026-05-08", product: "KCl", prediction: "Possivel queda pontual por oferta.", horizon: "5 dias", observedResult: "KCl recuou 1,9%.", hitTrend: true, precision: 82, note: "Oportunidade comercial detectada." },
  { id: "pred-map", predictionDate: "2026-05-07", product: "MAP", prediction: "Estabilidade com viés de alta.", horizon: "7 dias", observedResult: "MAP subiu 1,1%.", hitTrend: true, precision: 78, note: "Alta moderada." },
  { id: "pred-corn", predictionDate: "2026-05-06", product: "Milho", prediction: "Leve recuperação regional.", horizon: "7 dias", observedResult: "Milho caiu 0,7%.", hitTrend: false, precision: 61, note: "Oferta regional pressionou." }
];
