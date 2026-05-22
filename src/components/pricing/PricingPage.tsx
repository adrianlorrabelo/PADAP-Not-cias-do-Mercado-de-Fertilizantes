import { Clock, MoreHorizontal, Plus, RefreshCw, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import type { ProductAvailability, ProductClassification, Quotation, QuotationAssistantInput, QuotationHistoryEntry, QuotationItem } from "../../types";
import { mockClients, mockConsultants } from "../../data/mockClients";
import { mockWeeklyTable } from "../../data/mockProducts";
import { mockProposals } from "../../data/mockProposals";
import { buildQuotationRecommendation, calculateQuotationSecurityScore, validateQuotationRequiredFields } from "../../utils/quotationAssistant";
import { createQuotationItem, quotationSummary } from "../../utils/pricingCalculations";
import { simulatedAction } from "../../utils/uiActions";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { ConsultantMessageCard } from "./ConsultantMessageCard";
import { QuotationAssistant } from "./QuotationAssistant";
import { QuotationChecklist } from "./QuotationChecklist";
import { QuotationHistoryTable } from "./QuotationHistoryTable";
import { QuotationItemsTable } from "./QuotationItemsTable";
import { QuotationSummaryCard } from "./QuotationSummaryCard";
import { QuotationTrafficLight } from "./QuotationTrafficLight";

const availabilityOptions: ProductAvailability[] = ["Confirmada", "Aguardando fornecedor", "Indisponível", "Não verificada"];
const productTypes: ProductClassification[] = ["Adubo especialidade", "Adubo commodity", "Foliar", "Produto em estoque", "Pacote comercial", "Cotação manual", "Não identificado"];

function createInitialQuotation(): Quotation {
  const proposal = mockProposals[0];
  const product = mockWeeklyTable.products.find((item) => item.id === proposal.productId) || mockWeeklyTable.products[0];
  const client = mockClients.find((item) => item.id === proposal.clientId) || mockClients[0];
  const consultant = mockConsultants.find((item) => item.id === proposal.consultantId) || mockConsultants[0];
  const now = new Date().toISOString();

  return {
    id: `COT-${Date.now().toString().slice(-5)}`,
    client: client.name,
    consultant: consultant.name,
    farm: client.company,
    term: proposal.term,
    freightMode: proposal.freightMode,
    deliveryCity: client.region,
    validity: new Date(proposal.validity).toLocaleString("pt-BR"),
    availability: product.available ? "Confirmada" : "Indisponível",
    priceOrigin: product.supplier,
    productType: "Adubo especialidade",
    strategy: "Lista Yara / Tabela da Semana",
    suggestedSupplier: product.supplier,
    suggestedMinimumMargin: 10,
    packageMode: false,
    packageTargetMargin: 10,
    items: [createQuotationItem({
      product: product.description,
      supplier: product.supplier,
      quantity: proposal.quantity,
      unit: proposal.unit,
      baseCost: proposal.productCost,
      freight: proposal.freight,
      taxes: proposal.taxes,
      commission: proposal.commission,
      interest: proposal.otherExpenses,
      minimumMargin: 10,
      desiredMargin: 12,
      finalPrice: proposal.salePrice
    })],
    trafficLight: {
      status: "Em análise",
      reason: "Cotação em revisão comercial",
      nextAction: "Conferir margem e disponibilidade",
      owner: "Compras",
      expectedReturn: "Hoje",
      updatedAt: now
    },
    checklist: {
      priceChecked: false,
      freightChecked: false,
      termChecked: false,
      validityChecked: false,
      availabilityChecked: false,
      marginChecked: false,
      supplierChecked: false
    },
    createdAt: now,
    updatedAt: now
  };
}

function historyFromQuotation(quotation: Quotation, action: string): QuotationHistoryEntry {
  const summary = quotationSummary(quotation);
  return {
    id: `hist-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    date: new Date().toISOString(),
    client: quotation.client,
    consultant: quotation.consultant,
    itemCount: quotation.items.length,
    totalValue: summary.revenueTotal,
    averageMargin: summary.averageMargin,
    status: quotation.trafficLight.status,
    action
  };
}

export function PricingPage() {
  const [quotation, setQuotation] = useState<Quotation>(() => {
    try {
      return JSON.parse(localStorage.getItem("padap.currentQuotation") || "null") || createInitialQuotation();
    } catch {
      return createInitialQuotation();
    }
  });
  const [history, setHistory] = useState<QuotationHistoryEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("padap.quotationHistory") || "[]");
    } catch {
      return [];
    }
  });
  const [showHistory, setShowHistory] = useState(false);

  const assistantInput = useMemo<QuotationAssistantInput>(() => ({
    client: quotation.client,
    consultant: quotation.consultant,
    product: quotation.items[0]?.product || "",
    quantity: String(quotation.items[0]?.quantity || ""),
    unit: quotation.items[0]?.unit || "",
    term: quotation.term,
    freightMode: quotation.freightMode,
    deliveryCity: quotation.deliveryCity,
    supplierOrPriceOrigin: quotation.priceOrigin,
    basePrice: String(quotation.items[0]?.baseCost || ""),
    validity: quotation.validity,
    availability: quotation.availability,
    productType: quotation.productType,
    pricingStrategy: quotation.strategy,
    suggestedSupplier: quotation.suggestedSupplier,
    suggestedMinimumMargin: String(quotation.suggestedMinimumMargin || "")
  }), [quotation]);

  const securityScore = useMemo(() => calculateQuotationSecurityScore(assistantInput), [assistantInput]);
  const pending = useMemo(() => validateQuotationRequiredFields(assistantInput), [assistantInput]);
  const recommendation = useMemo(() => buildQuotationRecommendation(assistantInput), [assistantInput]);

  function persist(next: Quotation, action?: string) {
    const withDate = { ...next, updatedAt: new Date().toISOString() };
    setQuotation(withDate);
    localStorage.setItem("padap.currentQuotation", JSON.stringify(withDate));
    if (action) registerHistory(withDate, action);
  }

  function registerHistory(next: Quotation, action: string) {
    const entry = historyFromQuotation(next, action);
    const updated = [entry, ...history].slice(0, 40);
    setHistory(updated);
    localStorage.setItem("padap.quotationHistory", JSON.stringify(updated));
  }

  function applyAssistant(input: QuotationAssistantInput) {
    const baseCost = Number(input.basePrice || quotation.items[0]?.baseCost || 0);
    const minimumMargin = Number(input.suggestedMinimumMargin || quotation.suggestedMinimumMargin || 10);
    const firstItem = createQuotationItem({
      ...quotation.items[0],
      product: input.product,
      supplier: input.suggestedSupplier || input.supplierOrPriceOrigin,
      quantity: Number(input.quantity || 1),
      unit: input.unit || "Tonelada",
      baseCost,
      minimumMargin,
      desiredMargin: Math.max(minimumMargin, quotation.items[0]?.desiredMargin || minimumMargin)
    });
    const nextItems: QuotationItem[] = quotation.items.length ? [firstItem, ...quotation.items.slice(1)] : [firstItem];

    persist({
      ...quotation,
      client: input.client,
      consultant: input.consultant,
      term: input.term,
      freightMode: input.freightMode,
      deliveryCity: input.deliveryCity,
      validity: input.validity,
      availability: input.availability,
      priceOrigin: input.supplierOrPriceOrigin,
      productType: input.productType || "Não identificado",
      strategy: input.pricingStrategy || "",
      suggestedSupplier: input.suggestedSupplier || "",
      suggestedMinimumMargin: minimumMargin,
      items: nextItems
    }, "análise executada");
  }

  function updateItems(items: QuotationItem[], action: string) {
    persist({ ...quotation, items }, action);
  }

  function updateField<K extends keyof Quotation>(key: K, value: Quotation[K]) {
    persist({ ...quotation, [key]: value });
  }

  function newQuotation() {
    const next = createInitialQuotation();
    persist({ ...next, id: `COT-${Date.now().toString().slice(-5)}` }, "cotação criada");
    simulatedAction("Nova cotação criada.");
  }

  function clearFields() {
    const now = new Date().toISOString();
    persist({
      ...createInitialQuotation(),
      id: quotation.id,
      client: "",
      consultant: "",
      farm: "",
      term: "",
      freightMode: "",
      deliveryCity: "",
      validity: "",
      availability: "Não verificada",
      priceOrigin: "",
      productType: "Não identificado",
      strategy: "",
      suggestedSupplier: "",
      items: [createQuotationItem()],
      createdAt: quotation.createdAt,
      updatedAt: now
    }, "campos limpos");
  }

  function duplicateAndUpdate() {
    const duplicated: Quotation = {
      ...quotation,
      id: `COT-${Date.now().toString().slice(-5)}`,
      validity: "",
      priceOrigin: "",
      availability: "Não verificada",
      items: quotation.items.map((item) => createQuotationItem({ ...item, id: undefined, baseCost: 0, freight: 0, finalPrice: 0 })),
      trafficLight: {
        ...quotation.trafficLight,
        status: "Em análise",
        reason: "Cotação duplicada. Revisar preço base, PTAX, validade, frete e disponibilidade.",
        nextAction: "Atualizar condições comerciais",
        updatedAt: new Date().toISOString()
      }
    };
    persist(duplicated, "duplicar e atualizar cotação");
  }

  function saveQuotation(message?: string) {
    registerHistory(quotation, message ? "mensagem gerada / cotação salva" : "cotação salva");
    simulatedAction("Cotação salva no histórico.");
  }

  return (
    <div>
      <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="page-title mb-0">
          <h1>Precificação Inteligente</h1>
          <p>Transforme demandas do WhatsApp em propostas comerciais seguras.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={newQuotation}><Plus size={16} />Nova cotação</Button>
          <Button variant="ghost" onClick={() => setShowHistory((value) => !value)}><Clock size={16} />Histórico</Button>
          <Button variant="ghost" onClick={clearFields}><RotateCcw size={16} />Limpar campos</Button>
          <Button variant="ghost" onClick={duplicateAndUpdate}><RefreshCw size={16} />Duplicar e atualizar</Button>
          <Button variant="ghost"><MoreHorizontal size={16} /></Button>
        </div>
      </header>

      <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <QuotationAssistant onApply={applyAssistant} />
          <section className="rounded-xl border border-white/[0.08] bg-[#071918]/80 p-4">
            <div className="grid gap-3 md:grid-cols-4">
              <Input value={quotation.client} onChange={(event) => updateField("client", event.target.value)} placeholder="Cliente" />
              <Input value={quotation.consultant} onChange={(event) => updateField("consultant", event.target.value)} placeholder="Consultor" />
              <Input value={quotation.farm} onChange={(event) => updateField("farm", event.target.value)} placeholder="Fazenda" />
              <Input value={quotation.deliveryCity} onChange={(event) => updateField("deliveryCity", event.target.value)} placeholder="Cidade/local" />
              <Input value={quotation.term} onChange={(event) => updateField("term", event.target.value)} placeholder="Prazo" />
              <Select value={quotation.freightMode} onChange={(event) => updateField("freightMode", event.target.value as Quotation["freightMode"])}>
                <option value="">Frete</option><option value="CIF">CIF</option><option value="FOB">FOB</option>
              </Select>
              <Input value={quotation.validity} onChange={(event) => updateField("validity", event.target.value)} placeholder="Validade" />
              <Select value={quotation.availability} onChange={(event) => updateField("availability", event.target.value as ProductAvailability)}>
                {availabilityOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </Select>
              <Input value={quotation.priceOrigin} onChange={(event) => updateField("priceOrigin", event.target.value)} placeholder="Origem do preço" />
              <Select value={quotation.productType} onChange={(event) => updateField("productType", event.target.value as ProductClassification)}>
                {productTypes.map((item) => <option key={item} value={item}>{item}</option>)}
              </Select>
              <Input value={quotation.strategy} onChange={(event) => updateField("strategy", event.target.value)} placeholder="Estratégia" />
              <Input value={quotation.suggestedMinimumMargin} type="number" onChange={(event) => updateField("suggestedMinimumMargin", Number(event.target.value))} placeholder="Margem mín." />
            </div>
          </section>
        </div>
        <aside className="space-y-4">
          <QuotationSummaryCard quotation={quotation} onPackageModeChange={(enabled, target) => persist({ ...quotation, packageMode: enabled, packageTargetMargin: target }, enabled ? "modo pacote ativado" : "modo pacote desativado")} />
          <CompactSecurity score={securityScore.percentage} classification={securityScore.classification} pending={pending} recommendation={recommendation} />
          <QuotationTrafficLight value={quotation.trafficLight} recommendation={recommendation} onChange={(trafficLight) => persist({ ...quotation, trafficLight }, "status alterado")} />
        </aside>
      </div>

      <div className="space-y-6">
        <QuotationItemsTable items={quotation.items} onChange={updateItems} />
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <ConsultantMessageCard quotation={quotation} onSave={saveQuotation} />
          <QuotationChecklist value={quotation.checklist} onChange={(checklist) => persist({ ...quotation, checklist }, "checklist atualizado")} />
        </div>
        {showHistory && <QuotationHistoryTable entries={history} />}
      </div>
    </div>
  );
}

function CompactSecurity({ score, classification, pending, recommendation }: { score: number; classification: string; pending: string[]; recommendation: string }) {
  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#071918]/80 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">Segurança</h2>
        <strong className="text-2xl text-white">{score}%</strong>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-padap-green" style={{ width: `${score}%` }} /></div>
      <p className="mt-2 text-sm text-slate-300">{classification}</p>
      {pending.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pending.slice(0, 4).map((item) => <span key={item} className="rounded-full border border-padap-amber/25 bg-padap-amber/10 px-2 py-1 text-[11px] text-amber-100">{item}</span>)}
        </div>
      )}
      <p className="mt-3 text-xs leading-5 text-slate-400">{recommendation}</p>
    </section>
  );
}
