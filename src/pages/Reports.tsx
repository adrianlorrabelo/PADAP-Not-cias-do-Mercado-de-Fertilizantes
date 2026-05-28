import { FileSpreadsheet, Send } from "lucide-react";
import { BarChartCard } from "../components/charts/BarChartCard";
import { DonutChartCard } from "../components/charts/DonutChartCard";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { mockClients, mockConsultants } from "../data/mockClients";
import { mockProposals } from "../data/mockProposals";
import { formatarMoedaBRL } from "../utils/currency";

export default function Reports() {
  const total = mockProposals.reduce((sum, p) => sum + p.quantity * p.salePrice, 0);
  return (
    <div>
      <div className="page-title"><h1>Relatórios</h1><p>Cards, filtros e exportações simuladas para propostas, pacotes, margem, aprovações, mercado, clientes, consultores e Tabela da Semana.</p></div>
      <Card>
        <div className="grid gap-3 md:grid-cols-4"><Input type="date" /><Select><option>Todos os clientes</option>{mockClients.map((c) => <option key={c.id}>{c.name}</option>)}</Select><Select><option>Todos os consultores</option>{mockConsultants.map((c) => <option key={c.id}>{c.name}</option>)}</Select><Select><option>Status</option><option>Aprovado</option><option>Pendente</option></Select></div>
        <div className="mt-4 flex flex-wrap gap-2"><Button><FileSpreadsheet size={16} />Exportar Excel</Button><Button variant="ghost">Gerar PDF</Button><Button variant="ghost">Copiar resumo</Button><Button variant="ghost"><Send size={16} />Enviar resumo</Button></div>
      </Card>
      <div className="mt-6 grid gap-4 sm:grid-cols-3"><Metric label="Relatório de propostas" value={formatarMoedaBRL(total)} /><Metric label="Relatório de pacotes" value={formatarMoedaBRL(318000)} /><Metric label="Relatório de aprovações" value="1 pendente" /></div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2"><BarChartCard title="Margem por cultura" data={[{ label: "Café", value: 10.8 }, { label: "Milho", value: 11.4 }, { label: "Soja", value: 9.9 }, { label: "Alho", value: 27.5 }]} /><DonutChartCard title="Status de propostas" data={[{ label: "Aprovadas", value: 38, color: "#1dba2c" }, { label: "Aprovação", value: 12, color: "#f6b73c" }, { label: "Vencidas", value: 8, color: "#64748b" }]} /></div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <Card><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></Card>;
}
