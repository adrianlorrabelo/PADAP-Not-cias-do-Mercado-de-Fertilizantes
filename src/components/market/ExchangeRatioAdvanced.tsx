import type { ExchangeRatioItem } from "../../types";
import { formatPercent, statusTone } from "../../utils/marketFormatting";
import { Sparkline } from "../charts/Sparkline";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { SectionHeader } from "./MarketPrimitives";

export function ExchangeRatioAdvanced({ ratios }: { ratios: ExchangeRatioItem[] }) {
  return (
    <Card>
      <SectionHeader title="Relação de Troca" subtitle="Comparativos comerciais por cultura, fertilizante e pacote." />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ratios.map((ratio) => (
          <div key={ratio.id} className="rounded-lg border border-padap-line bg-padap-field p-4">
            <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-padap-ink">{ratio.pair}</p><p className="mt-1 text-xs text-padap-muted">Semana passada: {ratio.previous} {ratio.unit}</p><p className="text-sm text-padap-muted">Hoje: <strong>{ratio.current} {ratio.unit}</strong></p></div><Badge tone={statusTone(ratio.status)}>{ratio.status}</Badge></div>
            <div className="mt-3 flex items-center justify-between"><span className={ratio.variation <= 0 ? "text-padap-emerald" : "text-amber-700"}>{formatPercent(ratio.variation)}</span><Sparkline data={ratio.history} color={ratio.status === "Favorável" ? "#1dba2c" : "#f6b73c"} /></div>
            <p className="mt-3 text-sm leading-6 text-padap-muted">{ratio.interpretation}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
