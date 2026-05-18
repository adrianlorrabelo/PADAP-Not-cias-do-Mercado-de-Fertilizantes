import { ApprovalTimeline } from "../components/business/ApprovalTimeline";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Table } from "../components/ui/Table";
import { mockClients, mockConsultants } from "../data/mockClients";
import { mockApprovals } from "../data/mockProposals";
import { formatarMoedaBRL, formatarPercentual } from "../utils/currency";
import { formatDateTime } from "../utils/date";

export default function Approvals() {
  const approval = mockApprovals[0];
  return (
    <div>
      <div className="page-title"><h1>Central de Aprovações</h1><p>Registro formal do que antes ficava perdido no WhatsApp: motivo, decisão, usuário, data, hora e justificativa.</p></div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <Table headers={["ID", "Cliente", "Consultor", "Valor", "Margem", "Motivo", "Decisão"]} rows={mockApprovals.map((a) => [a.id, mockClients.find((c) => c.id === a.clientId)?.name, mockConsultants.find((c) => c.id === a.consultantId)?.name, formatarMoedaBRL(a.totalValue), formatarPercentual(a.expectedMargin), a.reason, <Badge tone="amber">{a.decision}</Badge>])} />
        <Card>
          <h2 className="mb-4 text-lg font-semibold">{approval.id}</h2>
          <div className="space-y-3 text-sm text-slate-300">
            <p><strong className="text-white">Solicitado por:</strong> {approval.requestedBy}</p>
            <p><strong className="text-white">Aprovador:</strong> {approval.approver}</p>
            <p><strong className="text-white">Data:</strong> {formatDateTime(approval.requestedAt)}</p>
            <p><strong className="text-white">Observação:</strong> {approval.observation}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2"><Button>Aprovar</Button><Button variant="danger">Reprovar</Button><Button variant="amber">Ajustar preço</Button><Button variant="ghost">Enviar para diretoria</Button></div>
        </Card>
      </div>
      <div className="mt-6"><ApprovalTimeline approval={approval} /></div>
    </div>
  );
}
