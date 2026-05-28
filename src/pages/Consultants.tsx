import { BarChartCard } from "../components/charts/BarChartCard";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/ui/Table";
import { mockClients, mockConsultants } from "../data/mockClients";
import { formatarMoedaBRL, formatarPercentual } from "../utils/currency";

export default function Consultants() {
  return (
    <div>
      <div className="page-title"><h1>Consultores</h1><p>Cadastro e indicadores comerciais por consultor, com vínculo de clientes e performance mockada.</p></div>
      <Table headers={["Nome", "E-mail", "Telefone", "Região", "Clientes vinculados", "Status", "Margem média"]} rows={mockConsultants.map((c, index) => [c.name, c.email, c.phone, c.region, mockClients.filter((client) => client.consultantId === c.id).length, <Badge tone="green">{c.status}</Badge>, formatarPercentual(9.8 + index * 1.4)])} />
      <div className="mt-6 grid gap-4 lg:grid-cols-2"><BarChartCard title="Volume cotado" data={mockConsultants.map((c, index) => ({ label: c.name.split(" ")[0], value: 420000 + index * 160000 }))} /><BarChartCard title="Produtos mais vendidos" data={[{ label: "YaraBasa", value: 42 }, { label: "YaraMila", value: 36 }, { label: "KCl", value: 29 }, { label: "MAP", value: 21 }]} color="#1dba2c" /></div>
      <p className="mt-4 text-sm text-padap-muted">Volume fechado demonstrativo: {formatarMoedaBRL(986000)}</p>
    </div>
  );
}
