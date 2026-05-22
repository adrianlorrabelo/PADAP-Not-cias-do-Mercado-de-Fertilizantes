import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { MarginAnalysis } from "../components/business/MarginAnalysis";
import { RecommendedAction } from "../components/business/RecommendedAction";
import { WhatsAppPreview } from "../components/business/WhatsAppPreview";
import { QuotationAssistant } from "../components/pricing/QuotationAssistant";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Table } from "../components/ui/Table";
import { mockClients, mockConsultants } from "../data/mockClients";
import { mockWeeklyTable } from "../data/mockProducts";
import { mockProposals } from "../data/mockProposals";
import { gerarMensagemWhatsAppProposta } from "../services/whatsappService";
import type { Proposal, QuotationAssistantInput } from "../types";
import { formatarMoedaBRL } from "../utils/currency";
import { addHours } from "../utils/date";
import { calcularStatusProposta } from "../utils/marginCalculations";
import { simulatedAction } from "../utils/uiActions";
import { usePermissions } from "../hooks/usePermissions";

export default function Proposals() {
  const { canSeeSensitive, user } = usePermissions();
  const [proposals, setProposals] = useState<Proposal[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("padap.proposals") || "null") || mockProposals;
    } catch {
      return mockProposals;
    }
  });

  const visibleProposals = useMemo(
    () => user?.role === "Consultor" ? proposals.filter((proposal) => proposal.consultantId === "c-1") : proposals,
    [proposals, user?.role]
  );
  const [selectedId, setSelectedId] = useState(visibleProposals[0]?.id);
  const selected = visibleProposals.find((p) => p.id === selectedId) || visibleProposals[0];
  const product = mockWeeklyTable.products.find((p) => p.id === selected.productId) || mockWeeklyTable.products[0];
  const client = mockClients.find((c) => c.id === selected.clientId) || mockClients[0];
  const consultant = mockConsultants.find((c) => c.id === selected.consultantId) || mockConsultants[0];
  const message = gerarMensagemWhatsAppProposta(selected, client, consultant, product.description);

  function normalize(value: string) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function applyQuotationSuggestions(input: QuotationAssistantInput) {
    const matchedClient = mockClients.find((item) => normalize(item.name).includes(normalize(input.client)) || normalize(input.client).includes(normalize(item.name)));
    const matchedConsultant = mockConsultants.find((item) => normalize(item.name).includes(normalize(input.consultant)) || normalize(input.consultant).includes(normalize(item.name)));
    const matchedProduct = mockWeeklyTable.products.find((item) => normalize(item.description).includes(normalize(input.product)) || normalize(input.product).includes(normalize(item.description).split(" ")[0]));
    const quantity = Number(input.quantity);
    const productCost = Number(input.basePrice);

    const updated = proposals.map((proposal) => proposal.id === selected.id ? {
      ...proposal,
      clientId: matchedClient?.id || proposal.clientId,
      consultantId: matchedConsultant?.id || proposal.consultantId,
      productId: matchedProduct?.id || proposal.productId,
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : proposal.quantity,
      unit: input.unit || proposal.unit,
      term: input.term || proposal.term,
      freightMode: input.freightMode || proposal.freightMode,
      supplier: input.suggestedSupplier || input.supplierOrPriceOrigin || proposal.supplier,
      productCost: Number.isFinite(productCost) && productCost > 0 ? productCost : proposal.productCost,
      validity: input.validity || proposal.validity,
      assistantProductName: input.product,
      assistantClientName: input.client,
      assistantConsultantName: input.consultant,
      assistantDeliveryCity: input.deliveryCity,
      assistantPriceOrigin: input.supplierOrPriceOrigin,
      assistantProductType: input.productType,
      assistantPricingStrategy: input.pricingStrategy,
      assistantSuggestedSupplier: input.suggestedSupplier,
      assistantSuggestedMinimumMargin: Number(input.suggestedMinimumMargin || 0),
      assistantAvailability: input.availability
    } : proposal);

    setProposals(updated);
    localStorage.setItem("padap.proposals", JSON.stringify(updated));
    simulatedAction("Sugestões aplicadas à cotação atual. Revise e edite antes de enviar.");
  }

  function createProposal() {
    if (!user || ["Consultor", "Visualizador", "Gestor / Gerente"].includes(user.role)) {
      simulatedAction("Este perfil não pode criar propostas.");
      return;
    }
    const product = mockWeeklyTable.products[0];
    const next: Proposal = {
      ...mockProposals[0],
      id: `PR-${Date.now().toString().slice(-4)}`,
      productId: product.id,
      productCost: product.finalPrice * 0.9,
      salePrice: product.finalPrice,
      validity: addHours(24),
      createdAt: new Date().toISOString(),
      createdBy: user.name,
      ptaxUsed: 5.18
    };
    const updated = [next, ...proposals];
    setProposals(updated);
    localStorage.setItem("padap.proposals", JSON.stringify(updated));
    setSelectedId(next.id);
    simulatedAction("Proposta criada e salva no LocalStorage.");
  }

  return (
    <div>
      <div className="page-title"><h1>Central de Propostas</h1><p>Criação, análise de margem, status comercial e mensagem limpa para WhatsApp sem dados internos.</p></div>
      <div className="mb-6 flex justify-end"><Button onClick={createProposal}><Plus size={16} />Criar proposta</Button></div>
      <QuotationAssistant onApply={applyQuotationSuggestions} />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-6">
          <Table headers={["ID", "Cliente", "Produto", "Quantidade", "Venda", "Status"]} rows={visibleProposals.map((p) => {
            const prod = mockWeeklyTable.products.find((item) => item.id === p.productId);
            return [<button className="text-padap-mint" onClick={() => setSelectedId(p.id)}>{p.id}</button>, mockClients.find((c) => c.id === p.clientId)?.name || "-", prod?.description || "-", `${p.quantity} ${p.unit}`, formatarMoedaBRL(p.salePrice), <Badge tone={calcularStatusProposta(p, 5.18).includes("Aprovado") ? "green" : "amber"}>{calcularStatusProposta(p, 5.18)}</Badge>];
          })} />
          <Card>
            <h2 className="mb-4 text-lg font-semibold">Editar proposta selecionada</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <Select value={selected.clientId} disabled>{mockClients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
              <Select value={selected.consultantId} disabled>{mockConsultants.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
              <Input value={product.description} disabled />
              <Input value={selected.quantity} disabled />
              <Input value={selected.unit} disabled />
              <Input value={selected.term} disabled />
            </div>
            {(selected.assistantProductType || selected.assistantPricingStrategy || selected.assistantAvailability) && (
              <div className="mt-4 grid gap-3 rounded-lg border border-padap-green/20 bg-padap-green/10 p-4 text-sm md:grid-cols-3">
                <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Tipo sugerido</p><p className="mt-1 text-slate-100">{selected.assistantProductType || "-"}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Estratégia</p><p className="mt-1 text-slate-100">{selected.assistantPricingStrategy || "-"}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Fornecedor sugerido</p><p className="mt-1 text-slate-100">{selected.assistantSuggestedSupplier || selected.supplier}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Margem mínima</p><p className="mt-1 text-slate-100">{selected.assistantSuggestedMinimumMargin ? `${selected.assistantSuggestedMinimumMargin}%` : "-"}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Disponibilidade</p><p className="mt-1 text-slate-100">{selected.assistantAvailability || "-"}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Entrega</p><p className="mt-1 text-slate-100">{selected.assistantDeliveryCity || "-"}</p></div>
              </div>
            )}
          </Card>
          <MarginAnalysis proposal={selected} currentPtax={5.18} showSensitive={canSeeSensitive} />
          <RecommendedAction problem="Cotação com PTAX diferente do atual." why="A alteração cambial pode reduzir a margem planejada." action="Clique em Atualizar cotação com novo PTAX para simular preço antigo, diferença, nova margem e nova validade." priority="Alta" button="Atualizar cotação" />
        </div>
        <WhatsAppPreview message={message} />
      </div>
    </div>
  );
}
