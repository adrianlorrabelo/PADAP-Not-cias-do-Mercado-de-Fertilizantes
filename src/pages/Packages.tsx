import { Plus } from "lucide-react";
import { RecommendedAction } from "../components/business/RecommendedAction";
import { WhatsAppPreview } from "../components/business/WhatsAppPreview";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Table } from "../components/ui/Table";
import { mockClients, mockConsultants } from "../data/mockClients";
import { mockPackages } from "../data/mockProposals";
import { gerarMensagemWhatsAppPacote } from "../services/whatsappService";
import { formatarMoedaBRL, formatarPercentual } from "../utils/currency";
import { calcularFaltaParaMeta, calcularStatusPacote, calcularVendaNecessariaParaMeta, packageItemTotals, packageTotals } from "../utils/marginCalculations";

export default function Packages() {
  const pkg = mockPackages[0];
  const client = mockClients.find((c) => c.id === pkg.clientId)!;
  const consultant = mockConsultants.find((c) => c.id === pkg.consultantId)!;
  const totals = packageTotals(pkg);
  const status = calcularStatusPacote(pkg, client);
  return (
    <div>
      <div className="page-title"><h1>Montador de Pacote Comercial</h1><p>Monte pacotes com vários produtos, compensando margem entre itens sem perder o controle do total.</p></div>
      <div className="mb-6 flex flex-wrap justify-end gap-2"><Button><Plus size={16} />Salvar rascunho</Button><Button variant="amber">Solicitar aprovação</Button><Button variant="ghost">Gerar PDF</Button></div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-6">
          <Card>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Custo total" value={formatarMoedaBRL(totals.costTotal)} />
              <Metric label="Venda total" value={formatarMoedaBRL(totals.saleTotal)} />
              <Metric label="Lucro bruto" value={formatarMoedaBRL(totals.grossProfit)} />
              <Metric label="Margem média" value={formatarPercentual(totals.margin)} />
              <Metric label="Meta PADAP" value="10,00%" />
              <Metric label="Venda necessária" value={formatarMoedaBRL(calcularVendaNecessariaParaMeta(totals.costTotal, 10))} />
              <Metric label="Falta para 10%" value={formatarMoedaBRL(calcularFaltaParaMeta(totals.costTotal, totals.saleTotal, 10))} />
              <div><p className="mb-2 text-xs text-slate-500">Status</p><Badge tone={status === "Pacote aprovado" ? "green" : "amber"}>{status}</Badge></div>
            </div>
          </Card>
          <Table headers={["Produto", "Qtd", "Custo unit.", "Venda unit.", "Custo total", "Venda total", "Margem"]} rows={pkg.items.map((item) => {
            const totals = packageItemTotals(item);
            return [item.productName, `${item.quantity} ${item.unit}`, formatarMoedaBRL(item.unitCost), formatarMoedaBRL(item.unitSale), formatarMoedaBRL(totals.costTotal), formatarMoedaBRL(totals.saleTotal), formatarPercentual(totals.marginPercent)];
          })} />
          <RecommendedAction problem="Pacote em zona de atenção." why="Cliente estratégico pode operar perto de 9%, mas precisa justificativa formal." action="Registrar solicitação de aprovação e anexar contexto comercial." priority="Alta" />
        </div>
        <WhatsAppPreview message={gerarMensagemWhatsAppPacote(pkg, client, consultant)} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-lg font-semibold text-white">{value}</p></div>;
}
