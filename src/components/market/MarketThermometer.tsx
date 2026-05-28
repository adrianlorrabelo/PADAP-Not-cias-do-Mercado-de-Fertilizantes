import { RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import type { MarketThermometer as MarketThermometerData } from "../../types";
import { classifyMarket } from "../../utils/marketScores";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

export function MarketThermometer({ score, thermometer }: { score: number; thermometer?: MarketThermometerData }) {
  const activeScore = thermometer?.score ?? score;
  const status = thermometer?.trend ?? classifyMarket(activeScore);

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-padap-ink">Termômetro do mercado</h2>
          <p className="mt-1 text-sm leading-6 text-padap-muted">Leitura rápida de risco e oportunidade comercial.</p>
        </div>
        <Badge tone={activeScore > 78 ? "amber" : "green"}>{status}</Badge>
      </div>

      <div className="relative mt-4 h-36">
        <ResponsiveContainer>
          <RadialBarChart innerRadius="70%" outerRadius="96%" data={[{ name: "score", value: activeScore, fill: activeScore > 78 ? "#f6b73c" : "#1dba2c" }]} startAngle={90} endAngle={-270}>
            <RadialBar dataKey="value" cornerRadius={12} background={{ fill: "rgba(255,255,255,.08)" }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-4xl font-semibold text-padap-ink">{activeScore}<span className="text-lg text-padap-muted">/100</span></p>
          <p className="text-xs uppercase tracking-[0.14em] text-padap-muted">score geral</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <Mini label="Risco" value={thermometer?.risk ?? "Médio"} />
        <Mini label="Oportunidade" value={thermometer?.opportunity ?? "Alta"} />
        <Mini label="Tendência" value={thermometer?.trend ?? "Alta no curto prazo"} />
        <Mini label="Horizonte" value={thermometer?.horizon ?? "Próximos 7 dias"} />
        <Mini label="Confiança" value={thermometer?.confidence ?? "Alta - 80%"} />
        <Mini label="Leitura" value="Validar preço antes de enviar" />
      </div>

      <div className="mt-3 rounded-lg border border-padap-line bg-padap-field p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-padap-muted">Composição do score</p>
        <p className="mt-2 text-xs leading-5 text-padap-muted">Base 70 ajustada por fontes internas/externas, PTAX, erros de fonte, KCl, nitrogenados e validade da Lista Yara.</p>
      </div>
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-padap-line bg-padap-field p-3"><p className="text-xs text-padap-muted">{label}</p><p className="mt-1 font-semibold leading-5 text-padap-ink">{value}</p></div>;
}
