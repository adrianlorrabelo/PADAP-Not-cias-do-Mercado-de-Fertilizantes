import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Table } from "../components/ui/Table";
import { mockClients, mockConsultants } from "../data/mockClients";
import { usePermissions } from "../hooks/usePermissions";
import { formatarMoedaBRL, formatarPercentual } from "../utils/currency";

export default function Clients() {
  const { user } = usePermissions();
  const clients = user?.role === "Consultor" ? mockClients.filter((client) => client.consultantId === "c-1") : mockClients;

  return (
    <div>
      <div className="page-title"><h1>Clientes</h1><p>Cadastro comercial de produtores com histórico, perfil, cultura, preferência por marca e campo futuro de status financeiro.</p></div>
      <Table headers={["Nome", "Fazenda/empresa", "Consultor", "Região", "Cultura", "Perfil", "Status financeiro futuro"]} rows={clients.map((c) => [c.name, c.company, mockConsultants.find((x) => x.id === c.consultantId)?.name || "-", c.region, c.mainCrop, <Badge tone={c.profile.includes("estratégico") || c.profile.includes("diamante") ? "green" : "neutral"}>{c.profile}</Badge>, c.financialStatusFuture])} />
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {clients.slice(0, 3).map((client, index) => <Card key={client.id}><div className="flex items-center gap-2 mb-2"><span className="inline-block h-4 w-1 rounded-full bg-padap-green" /><h2 className="text-base font-bold text-padap-ink">{client.name}</h2></div><p className="mt-2 text-sm text-slate-400">{client.notes}</p><div className="mt-4 grid grid-cols-2 gap-3"><Metric label="Volume total" value={formatarMoedaBRL(480000 + index * 185000)} /><Metric label="Margem média" value={formatarPercentual(10.4 + index)} /></div></Card>)}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>;
}
