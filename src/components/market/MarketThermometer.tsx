import { RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { classifyMarket } from "../../utils/marketScores";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

export function MarketThermometer({ score }: { score: number }) {
  const status = classifyMarket(score);
  return (
    <Card className="min-h-[330px]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Termômetro do mercado</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">Leitura rápida de risco e oportunidade.</p>
        </div>
        <Badge tone={score > 78 ? "amber" : "green"}>{status}</Badge>
      </div>

      <div className="relative mt-4 h-44">
        <ResponsiveContainer>
          <RadialBarChart innerRadius="70%" outerRadius="96%" data={[{ name: "score", value: score, fill: score > 78 ? "#f6b73c" : "#39d353" }]} startAngle={90} endAngle={-270}>
            <RadialBar dataKey="value" cornerRadius={12} background={{ fill: "rgba(255,255,255,.08)" }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-4xl font-semibold text-white">{score}<span className="text-lg text-slate-500">/100</span></p>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">score geral</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <Mini label="Risco" value="Médio" />
        <Mini label="Oportunidade" value="Alta" />
        <Mini label="Tendência" value="Alta no curto prazo" />
        <Mini label="Horizonte" value="Próximos 7 dias" />
      </div>
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold leading-5 text-slate-100">{value}</p></div>;
}
