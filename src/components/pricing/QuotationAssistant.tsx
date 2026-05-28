import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ClipboardCheck, Copy, Plus, Sparkles, Trash2 } from "lucide-react";
import type { Quotation, QuotationAssistantInput, QuotationDiagnosis, QuotationItem, QuotationSecurityScore as Score } from "../../types";
import {
  buildQuotationDiagnosis,
  calculateQuotationSecurityScore,
  classifyProductType,
  createEmptyQuotationInput,
  parseWhatsAppQuotationMessage,
  suggestPricingStrategy,
  validateQuotationRequiredFields
} from "../../utils/quotationAssistant";
import { createQuotationItem, quotationItemTotals, quotationSummary } from "../../utils/pricingCalculations";
import { formatarMoedaBRL } from "../../utils/currency";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { QuotationInputMode } from "./QuotationInputMode";

type Props = {
  onApply: (input: QuotationAssistantInput) => void;
  quotation: Quotation;
  onQuotationPatch: (patch: Partial<Quotation>, action?: string) => void;
  onItemsChange: (items: QuotationItem[], action: string) => void;
};

type LogEntry = {
  date: string;
  analyzedText: string;
  productType: string;
  strategy: string;
  score: number;
  pending: string[];
};

const units = ["tonelada", "kg", "litro", "galão", "caixa", "saco", "big bag"];

export function QuotationAssistant({ onApply, quotation, onQuotationPatch, onItemsChange }: Props) {
  const [mode, setMode] = useState<"whatsapp" | "manual">("whatsapp");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [input, setInput] = useState<QuotationAssistantInput>(() => createEmptyQuotationInput());
  const [applyNotice, setApplyNotice] = useState(false);

  useEffect(() => {
    const first = quotation.items[0];
    setInput((current) => ({
      ...current,
      client: quotation.client,
      consultant: quotation.consultant,
      product: first?.product || current.product,
      quantity: first ? String(first.quantity || "") : current.quantity,
      unit: first?.unit || current.unit,
      term: quotation.term,
      freightMode: quotation.freightMode,
      deliveryCity: quotation.deliveryCity,
      supplierOrPriceOrigin: quotation.priceOrigin,
      basePrice: first ? String(first.baseCost || "") : current.basePrice,
      validity: quotation.validity,
      availability: quotation.availability,
      productType: quotation.productType,
      pricingStrategy: quotation.strategy,
      suggestedSupplier: quotation.suggestedSupplier,
      suggestedMinimumMargin: String(quotation.suggestedMinimumMargin || "")
    }));
  }, [quotation.client, quotation.consultant, quotation.deliveryCity, quotation.freightMode, quotation.availability, quotation.items, quotation.priceOrigin, quotation.productType, quotation.strategy, quotation.suggestedMinimumMargin, quotation.term, quotation.validity]);

  const enrichedInput = useMemo(() => {
    const productType = input.productType && input.productType !== "Não identificado" ? input.productType : classifyProductType(input.product);
    const suggestion = suggestPricingStrategy(productType, input);
    return {
      ...input,
      productType,
      pricingStrategy: input.pricingStrategy || suggestion.strategy,
      suggestedSupplier: input.suggestedSupplier || suggestion.suggestedSupplier,
      suggestedMinimumMargin: input.suggestedMinimumMargin || String(suggestion.minimumMargin)
    };
  }, [input]);

  const diagnosis = useMemo(() => buildQuotationDiagnosis(enrichedInput), [enrichedInput]);
  const pending = useMemo(() => assistantPendingFields(enrichedInput, quotation.items), [enrichedInput, quotation.items]);
  const score = useMemo(() => calculateAssistantEntryScore(enrichedInput, quotation.items), [enrichedInput, quotation.items]);
  const recommendation = useMemo(() => buildAssistantRecommendation(enrichedInput, quotation.items, pending), [enrichedInput, pending, quotation.items]);
  const summary = useMemo(() => quotationSummary(quotation), [quotation]);

  function updateInput(patch: Partial<QuotationAssistantInput>) {
    setApplyNotice(false);
    setInput((current) => {
      const next = { ...current, ...patch };
      if (patch.product !== undefined) {
        const productType = classifyProductType(next.product);
        const suggestion = suggestPricingStrategy(productType, next);
        return {
          ...next,
          productType,
          pricingStrategy: suggestion.strategy,
          suggestedSupplier: suggestion.suggestedSupplier,
          suggestedMinimumMargin: String(suggestion.minimumMargin)
        };
      }
      return next;
    });
  }

  function analyzeMessage() {
    const parsed = parseWhatsAppQuotationMessage(whatsappMessage);
    setInput(parsed);
    setApplyNotice(false);
    const first = createQuotationItem({
      ...quotation.items[0],
      product: parsed.product,
      quantity: Number(parsed.quantity || quotation.items[0]?.quantity || 1),
      unit: normalizeUnit(parsed.unit || quotation.items[0]?.unit || "tonelada"),
      baseCost: Number(parsed.basePrice || quotation.items[0]?.baseCost || 0),
      finalPrice: quotation.items[0]?.finalPrice || 0,
      supplier: parsed.suggestedSupplier || parsed.supplierOrPriceOrigin || quotation.items[0]?.supplier
    });
    const nextItems = quotation.items.length ? [first, ...quotation.items.slice(1)] : [first];
    onQuotationPatch({
      client: parsed.client || quotation.client,
      consultant: parsed.consultant || quotation.consultant,
      term: parsed.term || quotation.term,
      freightMode: parsed.freightMode || quotation.freightMode,
      productType: parsed.productType || quotation.productType,
      strategy: parsed.pricingStrategy || quotation.strategy,
      suggestedSupplier: parsed.suggestedSupplier || quotation.suggestedSupplier,
      suggestedMinimumMargin: Number(parsed.suggestedMinimumMargin || quotation.suggestedMinimumMargin),
      items: nextItems
    }, "análise executada");
    saveLog(parsed, whatsappMessage);
  }

  function applySuggestions() {
    setApplyNotice(true);
    onApply(enrichedInput);
    saveLog(enrichedInput, whatsappMessage);
  }

  function saveLog(data: QuotationAssistantInput, analyzedText: string) {
    const dataScore = calculateQuotationSecurityScore(data);
    const entry: LogEntry = {
      date: new Date().toISOString(),
      analyzedText,
      productType: data.productType || classifyProductType(data.product),
      strategy: data.pricingStrategy || "",
      score: dataScore.percentage,
      pending: validateQuotationRequiredFields(data)
    };

    try {
      const current = JSON.parse(localStorage.getItem("padap.quotationAssistant.log") || "[]") as LogEntry[];
      localStorage.setItem("padap.quotationAssistant.log", JSON.stringify([entry, ...current].slice(0, 30)));
    } catch {
      localStorage.setItem("padap.quotationAssistant.log", JSON.stringify([entry]));
    }
  }

  function updateQuotationField<K extends keyof Quotation>(key: K, value: Quotation[K]) {
    onQuotationPatch({ [key]: value } as Partial<Quotation>);
    if (key === "client") updateInput({ client: String(value) });
    if (key === "consultant") updateInput({ consultant: String(value) });
    if (key === "term") updateInput({ term: String(value) });
    if (key === "freightMode") updateInput({ freightMode: value as QuotationAssistantInput["freightMode"] });
  }

  function updateItem(id: string, patch: Partial<QuotationItem>, action = "produto editado") {
    const updated = quotation.items.map((item) => item.id === id ? { ...item, ...patch } : item);
    onItemsChange(updated, action);
    const first = updated[0];
    if (first?.id === id) {
      updateInput({
        product: first.product,
        quantity: String(first.quantity || ""),
        unit: first.unit,
        basePrice: String(first.baseCost || "")
      });
    }
  }

  function addItem() {
    onItemsChange([...quotation.items, createQuotationItem({ unit: "tonelada", minimumMargin: Number(enrichedInput.suggestedMinimumMargin || 10) })], "produto adicionado");
  }

  function duplicateItem(item: QuotationItem) {
    onItemsChange([...quotation.items, createQuotationItem({ ...item, id: undefined, product: `${item.product} cópia` })], "produto duplicado");
  }

  function removeItem(id: string) {
    const next = quotation.items.filter((item) => item.id !== id);
    onItemsChange(next.length ? next : [createQuotationItem({ unit: "tonelada" })], "produto removido");
  }

  return (
    <Card className="mb-4 overflow-hidden border-padap-line bg-white p-4 shadow-panel">
      {/* Cabeçalho */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-padap-green/20 bg-padap-green/10 text-padap-emerald">
            <Sparkles size={14} />
          </span>
          <div>
            <h2 className="text-base font-bold text-padap-ink">Assistente da Cotação</h2>
            <p className="text-xs font-medium text-padap-muted">Entrada à esquerda · Diagnóstico e segurança à direita.</p>
          </div>
        </div>
        <Badge tone={pending.length ? "amber" : "green"}>{pending.length ? `${pending.length} pendências` : "Completa"}</Badge>
      </div>

      {/* Layout horizontal: entrada | diagnóstico + segurança */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">

        {/* Coluna esquerda: entrada */}
        <FlowSection title="Entrada da cotação">
          <QuotationInputMode
            mode={mode}
            setMode={setMode}
            whatsappMessage={whatsappMessage}
            setWhatsappMessage={setWhatsappMessage}
            input={enrichedInput}
            onChange={updateInput}
            onAnalyze={analyzeMessage}
          />
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <CompactField label="Cliente"><Input className="px-2.5 py-2 text-xs" value={quotation.client} onChange={(event) => updateQuotationField("client", event.target.value)} placeholder="Cliente" /></CompactField>
            <CompactField label="Consultor"><Input className="px-2.5 py-2 text-xs" value={quotation.consultant} onChange={(event) => updateQuotationField("consultant", event.target.value)} placeholder="Consultor" /></CompactField>
            <CompactField label="Condição"><Input className="px-2.5 py-2 text-xs" value={quotation.term} onChange={(event) => updateQuotationField("term", event.target.value)} placeholder="30 dias" /></CompactField>
            <CompactField label="Frete">
              <Select className="px-2.5 py-2 text-xs" value={quotation.freightMode} onChange={(event) => updateQuotationField("freightMode", event.target.value as Quotation["freightMode"])}>
                <option value="">Selecionar</option>
                <option value="CIF">CIF</option>
                <option value="FOB">FOB</option>
              </Select>
            </CompactField>
          </div>
        </FlowSection>

        {/* Coluna direita: diagnóstico + segurança */}
        <div className="flex flex-col gap-3">
          <FlowSection title="Diagnóstico & Sugestão">
            <CompactDiagnosis diagnosis={diagnosis} pending={pending} />
          </FlowSection>
          <FlowSection title="Segurança & Ação">
            <CompactSecurity score={score} recommendation={recommendation} summary={summary} />
            <div className={`mt-3 rounded-lg border px-3 py-2 text-xs font-medium ${applyNotice ? "border-padap-green/25 bg-padap-green/10 text-padap-emerald" : "border-padap-line bg-padap-field text-padap-muted"}`}>
              {applyNotice ? "Sugestões aplicadas. Tudo continua editável." : "As sugestões serão aplicadas à cotação atual."}
            </div>
            <Button onClick={applySuggestions} className="mt-3 min-h-9 w-full px-3 py-1.5 text-xs"><ClipboardCheck size={14} />Aplicar sugestões</Button>
          </FlowSection>
        </div>
      </div>

      {/* Tabela de itens: largura total */}
      <MiniItemsTable items={quotation.items} onAdd={addItem} onDuplicate={duplicateItem} onRemove={removeItem} onUpdate={updateItem} />
    </Card>
  );
}

function FlowSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-padap-line bg-white p-3">
      <h3 className="mb-3 text-sm font-bold text-padap-ink">{title}</h3>
      {children}
    </section>
  );
}

function CompactField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-1 text-[10px] font-bold uppercase tracking-[0.12em] text-padap-muted">
      <span>{label}</span>
      {children}
    </label>
  );
}

function MiniItemsTable({ items, onAdd, onDuplicate, onRemove, onUpdate }: { items: QuotationItem[]; onAdd: () => void; onDuplicate: (item: QuotationItem) => void; onRemove: (id: string) => void; onUpdate: (id: string, patch: Partial<QuotationItem>, action?: string) => void }) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-padap-ink">Itens da cotação</p>
        <Button onClick={onAdd} className="min-h-8 px-2.5 py-1 text-xs"><Plus size={13} />Adicionar produto</Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-padap-line bg-white">
        <table className="min-w-[980px] text-left text-xs">
          <thead className="bg-padap-field text-[10px] uppercase tracking-[0.1em] text-padap-muted">
            <tr>{["Produto", "Qtd", "Unidade", "Custo", "Venda", "Margem", "Total", "Ações"].map((header) => <th key={header} className="px-2 py-2 font-bold">{header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-padap-line">
            {items.map((item) => {
              const totals = quotationItemTotals(item);
              return (
                <tr key={item.id}>
                  <CellInput className="min-w-64" value={item.product} onChange={(value) => onUpdate(item.id, { product: value })} />
                  <CellInput type="number" value={item.quantity} onChange={(value) => onUpdate(item.id, { quantity: Number(value) })} />
                  <td className="px-2 py-2">
                    <select value={item.unit} onChange={(event) => onUpdate(item.id, { unit: event.target.value })} className="w-full rounded-md border border-padap-line bg-white px-2 py-1.5 text-xs font-medium text-padap-ink outline-none focus:border-padap-green">
                      {units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                    </select>
                  </td>
                  <CellInput type="number" value={item.baseCost} onChange={(value) => onUpdate(item.id, { baseCost: Number(value) }, "preço alterado")} />
                  <CellInput type="number" value={item.finalPrice} onChange={(value) => onUpdate(item.id, { finalPrice: Number(value) }, "preço alterado")} />
                  <td className="px-2 py-2 font-semibold text-padap-ink">{totals.marginPercent.toFixed(1)}%</td>
                  <td className="px-2 py-2 font-semibold text-padap-ink">{formatarMoedaBRL(totals.revenueTotal)}</td>
                  <td className="px-2 py-2">
                    <div className="flex gap-1">
                      <button className="rounded-md border border-padap-line p-1.5 text-padap-muted hover:bg-padap-field" onClick={() => onDuplicate(item)} title="Duplicar"><Copy size={13} /></button>
                      <button className="rounded-md border border-red-400/20 p-1.5 text-red-200 hover:bg-red-500/10" onClick={() => onRemove(item.id)} title="Remover"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CellInput({ value, onChange, type = "text", className = "" }: { value: string | number; onChange: (value: string) => void; type?: string; className?: string }) {
  return (
    <td className="px-2 py-2">
      <input type={type} value={value} step={type === "number" ? "0.01" : undefined} onChange={(event) => onChange(event.target.value)} className={`w-full rounded-md border border-padap-line bg-white px-2 py-1.5 text-xs font-medium text-padap-ink outline-none focus:border-padap-green ${className}`} />
    </td>
  );
}

function CompactDiagnosis({ diagnosis, pending }: { diagnosis: QuotationDiagnosis; pending: string[] }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <Metric label="Tipo" value={diagnosis.productType} />
        <Metric label="Estratégia" value={diagnosis.strategy} />
        <Metric label="Cotar fornecedor?" value={diagnosis.needsSupplierQuote ? "Sim" : "Não"} tone={diagnosis.needsSupplierQuote ? "amber" : "green"} />
        <Metric label="Margem mínima" value={`${diagnosis.minimumMargin}%`} />
      </div>
      <p className="rounded-lg border border-padap-line bg-padap-field px-3 py-2 text-xs font-medium leading-5 text-padap-ink">{diagnosis.nextAction}</p>
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-padap-muted">Pendências principais</p>
        <div className="flex flex-wrap gap-1.5">
          {(pending.length ? pending.slice(0, 7) : ["Sem pendências relevantes"]).map((item) => (
            <span key={item} className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${pending.length ? "border-padap-amber/25 bg-padap-amber/10 text-amber-100" : "border-padap-green/25 bg-padap-green/10 text-padap-mint"}`}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompactSecurity({ score, recommendation, summary }: { score: Score; recommendation: string; summary: ReturnType<typeof quotationSummary> }) {
  const tone = score.classification === "Alta" ? "green" : score.classification === "Boa" ? "cyan" : score.classification === "Média" ? "amber" : "red";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-padap-muted">Nota</p>
          <div className="mt-1 flex items-baseline gap-2">
            <strong className="text-3xl font-bold text-padap-ink">{score.percentage}%</strong>
            <Badge tone={tone}>{score.classification}</Badge>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-padap-muted">Margem</p>
          <p className="mt-1 text-sm font-bold text-padap-ink">{summary.averageMargin.toFixed(1)}%</p>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-padap-line">
        <div className="h-full rounded-full bg-gradient-to-r from-padap-green to-padap-cyan" style={{ width: `${score.percentage}%` }} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Metric label="Itens" value={String(summary.itemCount)} />
        <Metric label="Valor" value={formatarMoedaBRL(summary.revenueTotal)} />
        <Metric label="Status" value={summary.status} />
      </div>
      <div className="mt-3 rounded-lg border border-padap-line bg-padap-field p-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-padap-muted">Ação recomendada</p>
        <p className="mt-1 text-xs font-medium leading-5 text-padap-ink">{recommendation}</p>
      </div>
      <p className="mt-2 text-[11px] font-medium leading-4 text-padap-muted">Informativa. Não altera semáforo nem bloqueia envio.</p>
    </div>
  );
}

function Metric({ label, value, tone, className = "" }: { label: string; value: string; tone?: "green" | "amber"; className?: string }) {
  const valueTone = tone === "green" ? "text-padap-emerald" : tone === "amber" ? "text-amber-700" : "text-padap-ink";

  return (
    <div className={`rounded-lg border border-padap-line bg-padap-field px-3 py-2 ${className}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-padap-muted">{label}</p>
      <p className={`mt-1 truncate text-xs font-bold ${valueTone}`} title={value}>{value || "-"}</p>
    </div>
  );
}

function assistantPendingFields(input: QuotationAssistantInput, items: QuotationItem[]) {
  const pending: string[] = [];
  if (!input.client) pending.push("Cliente pendente");
  if (!input.consultant) pending.push("Consultor pendente");
  if (!input.term) pending.push("Condição pendente");
  if (!input.freightMode) pending.push("Frete pendente");
  if (!items.length || items.some((item) => !item.product)) pending.push("Produto pendente");
  if (items.some((item) => !item.quantity || !item.unit)) pending.push("Quantidade/unidade pendente");
  if (items.some((item) => !item.baseCost)) pending.push("Preço de custo pendente");
  if (items.some((item) => !item.finalPrice)) pending.push("Preço de venda pendente");
  return pending;
}

function calculateAssistantEntryScore(input: QuotationAssistantInput, items: QuotationItem[]): Score {
  const checks = [
    ["Cliente informado", Boolean(input.client), 15, "Cliente pendente"],
    ["Consultor informado", Boolean(input.consultant), 15, "Consultor pendente"],
    ["Produto(s), quantidade e unidade informados", Boolean(items.length && items.every((item) => item.product && item.quantity > 0 && item.unit)), 20, "Produto/quantidade/unidade pendente"],
    ["Condição de pagamento informada", Boolean(input.term), 15, "Condição pendente"],
    ["Frete CIF/FOB informado", Boolean(input.freightMode), 10, "Frete pendente"],
    ["Preço de custo informado", Boolean(items.length && items.every((item) => item.baseCost > 0)), 15, "Preço de custo pendente"],
    ["Preço de venda informado", Boolean(items.length && items.every((item) => item.finalPrice > 0)), 10, "Preço de venda pendente"]
  ] as const;
  const percentage = checks.reduce((sum, [, ok, points]) => sum + (ok ? points : 0), 0);
  const classification = percentage >= 90 ? "Alta" : percentage >= 70 ? "Boa" : percentage >= 50 ? "Média" : "Baixa";
  const positives = checks.filter(([, ok]) => ok).map(([label]) => label);
  const pending = checks.filter(([, ok]) => !ok).map(([, , , label]) => label);

  return { percentage, classification, positives, pending, recommendation: buildAssistantRecommendation(input, items, pending) };
}

function buildAssistantRecommendation(input: QuotationAssistantInput, items: QuotationItem[], pending: string[]) {
  if (pending.length) return `Revise: ${pending.slice(0, 3).join(", ")}.`;
  const productType = input.productType || classifyProductType(items[0]?.product || input.product);
  if (productType === "Adubo commodity") return "Produto classificado como commodity. Recomenda-se cotar fornecedores antes de formar preço.";
  if (productType === "Adubo especialidade") return "Produto identificado como especialidade. Recomenda-se usar Lista Yara / Tabela da Semana.";
  if (productType === "Foliar") return "Produto identificado como foliar. Recomenda-se usar lista de foliares ou estoque.";
  return "Cotação com informações suficientes para seguir.";
}

function normalizeUnit(unit: string) {
  const value = unit.toLowerCase();
  if (value.startsWith("ton") || value === "t") return "tonelada";
  if (value.startsWith("lit") || value === "l") return "litro";
  if (value.includes("gal")) return "galão";
  if (value.includes("bag")) return "big bag";
  return units.includes(value) ? value : "tonelada";
}
