import type { AnalystPrediction } from "../../types";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Table } from "../ui/Table";
import { MetricTile, SectionHeader } from "./MarketPrimitives";

export function AnalystPrecisionHistory({ predictions }: { predictions: AnalystPrediction[] }) {
  const hitRate = Math.round((predictions.filter((item) => item.hitTrend).length / Math.max(predictions.length, 1)) * 100);
  const best = [...predictions].sort((a, b) => b.precision - a.precision)[0];

  return (
    <Card>
      <SectionHeader title="Precisão do Analista" subtitle="Histórico mockado de previsões e resultados observados." />
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <MetricTile label="Taxa geral de acerto" value={`${hitRate}%`} tone="green" />
        <MetricTile label="Maior precisão" value={best?.product ?? "-"} tone="cyan" detail={`${best?.precision ?? 0}%`} />
        <MetricTile label="Maior volatilidade" value="Ureia" tone="amber" detail="Maior sensibilidade semanal" />
      </div>
      <Table
        headers={["Data", "Produto/indicador", "Previsão", "Horizonte", "Resultado", "Acertou?", "Precisão", "Observação"]}
        rows={predictions.map((item) => [
          item.predictionDate,
          item.product,
          item.prediction,
          item.horizon,
          item.observedResult,
          <Badge tone={item.hitTrend ? "green" : "amber"}>{item.hitTrend ? "Sim" : "Não"}</Badge>,
          `${item.precision}%`,
          item.note
        ])}
      />
    </Card>
  );
}
