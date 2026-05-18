import { AlertTriangle, DollarSign, PackageX, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { RecommendedAction } from "../components/business/RecommendedAction";
import { Sparkline } from "../components/charts/Sparkline";
import { mockAlerts, mockMarketIndicators } from "../data/mockMarket";
import { mockApprovals, mockPackages, mockProposals } from "../data/mockProposals";
import { useAuth } from "../hooks/useAuth";
import { formatarMoedaBRL, formatarPercentual } from "../utils/currency";
import { calcularMargemPercentual, packageTotals } from "../utils/marginCalculations";

export default function Cockpit() {
  const { user } = useAuth();
  const avgMargin = mockProposals.reduce((sum, proposal) => sum + calcularMargemPercentual(proposal.salePrice, proposal.productCost + proposal.freight + proposal.taxes + proposal.commission + proposal.otherExpenses), 0) / mockProposals.length;
  const openValue = mockProposals.reduce((sum, proposal) => sum + proposal.salePrice * proposal.quantity, 0);
  const actions = mockApprovals.length + mockAlerts.length + 2;
  return (
    <div>
      <div className="page-title">
        <h1>Bom dia, {user?.name}. Existem {actions} ações comerciais que precisam da sua atenção hoje.</h1>
        <p>Cockpit executivo para decidir rapidamente o que revisar, aprovar, reconfirmar ou enviar.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Propostas vencendo hoje" value="4" icon={<AlertTriangle size={18} />} tone="amber" />
        <Kpi title="Aprovações pendentes" value={String(mockApprovals.length)} icon={<TrendingUp size={18} />} tone="cyan" />
        <Kpi title="Volume em propostas abertas" value={formatarMoedaBRL(openValue)} icon={<DollarSign size={18} />} />
        <Kpi title="Margem média das propostas" value={formatarPercentual(avgMargin)} icon={<PackageX size={18} />} tone="green" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Semáforo comercial</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {["Verde: pode enviar", "Amarelo: atenção", "Laranja: requer aprovação", "Vermelho: bloqueado", "Azul: aguardando fornecedor", "Cinza: vencido/inativo"].map((item, index) => <div key={item} className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-200"><span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${["bg-padap-green","bg-padap-amber","bg-orange-400","bg-red-500","bg-padap-cyan","bg-slate-500"][index]}`} />{item}</div>)}
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Pulso do mercado</h2>
          {mockMarketIndicators.slice(0, 3).map((indicator) => <div key={indicator.name} className="mb-3 flex items-center justify-between"><div><p className="text-sm text-white">{indicator.name}</p><p className="text-xs text-slate-500">{indicator.value} {indicator.unit}</p></div><Sparkline data={indicator.history} /></div>)}
        </Card>
      </div>
      <h2 className="mb-4 mt-8 text-lg font-semibold">Ações Recomendadas</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        <RecommendedAction problem="PTAX subiu 0,95% desde a última cotação." why="Pode reduzir sua margem em propostas abertas de adubos importados." action="Recalcular 4 propostas antes de reenviar ao consultor." priority="Alta" />
        <RecommendedAction problem="Pacote estratégico abaixo da meta." why={`Margem atual do pacote ${mockPackages[0].id}: ${formatarPercentual(packageTotals(mockPackages[0]).margin)}.`} action="Solicitar aprovação ou redistribuir margem entre itens." priority="Crítico" />
        <RecommendedAction problem="Lista semanal vence em 36 horas." why="Novas propostas podem nascer com validade curta." action="Preparar importação da próxima tabela Yara." priority="Média" />
      </div>
    </div>
  );
}

function Kpi({ title, value, icon, tone = "green" }: { title: string; value: string; icon: ReactNode; tone?: "green" | "amber" | "cyan" }) {
  return <Card><div className="flex items-start justify-between"><div><p className="text-sm text-slate-400">{title}</p><p className="mt-3 text-2xl font-semibold text-white">{value}</p></div><Badge tone={tone}>{icon}</Badge></div></Card>;
}
