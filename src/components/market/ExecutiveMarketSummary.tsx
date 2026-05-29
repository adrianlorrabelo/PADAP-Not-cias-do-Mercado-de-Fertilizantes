import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function ExecutiveMarketSummary({ status, lastUpdate, confidence, onOpenAnalysis }: { status: string; lastUpdate: string; confidence: number; onOpenAnalysis: () => void }) {
  const impacts = ["PTAX em alta pressiona tabela Yara.", "Ureia em alta exige revisão de nitrogenados.", "KCl em queda abre oportunidade em potássicos.", "Café melhorou e favorece relação de troca."];
  return (
    <Card className="lg:col-span-2">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-padap-cyan">Resumo executivo do mercado</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="inline-block h-6 w-1.5 rounded-full bg-padap-green" />
            <h2 className="text-2xl font-bold text-padap-ink">Hoje o mercado esta: <span className="text-padap-emerald">{status.toUpperCase()}</span></h2>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {impacts.map((impact, index) => <div key={impact} className="rounded-lg border border-padap-line bg-padap-field p-3 text-sm text-padap-ink"><span className="mr-2 text-padap-green">{index + 1}.</span>{impact}</div>)}
          </div>
        </div>
        <div className="min-w-56 rounded-lg border border-padap-green/20 bg-padap-green/[0.06] p-4">
          <Badge tone="cyan">Atualizado</Badge>
          <p className="mt-3 text-sm text-padap-muted">Última atualização</p>
          <p className="font-semibold text-padap-ink">{lastUpdate}</p>
          <p className="mt-3 text-sm text-padap-muted">Nível de confiança</p>
          <p className="text-2xl font-semibold text-padap-emerald">{confidence}%</p>
          <Button className="mt-4 w-full" onClick={onOpenAnalysis}>Ver analise completa</Button>
        </div>
      </div>
    </Card>
  );
}
