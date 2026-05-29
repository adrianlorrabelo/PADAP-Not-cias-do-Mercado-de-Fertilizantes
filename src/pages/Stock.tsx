import { CheckCircle2, ClipboardCopy, Copy, FileUp, Pencil, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Select } from "../components/ui/Select";
import { copyToClipboard } from "../services/whatsappService";
import { readStockPdf } from "../services/stockPdfImportService";
import {
  applyStockDraft,
  buildPurchaseOrderText,
  consolidateStock,
  getPurchaseSuggestions,
  getStockStatus,
  getStockStatusTone,
  loadImportHistory,
  loadMinimumRules,
  loadStockItems,
  normalizeStockSearch,
  removeUnitStock,
  saveImportHistory,
  saveMinimumRules,
  saveStockItems,
  stockUnits
} from "../services/stockService";
import {
  confirmStockPricingDraft,
  emptyStockPricingProduct,
  getPricingStockMatch,
  loadStockPricingHistory,
  loadStockPricingTable,
  parseStockPricingFile,
  recalculateStockPricingProduct,
  saveStockPricingHistory,
  saveStockPricingTable,
  withCommercialStatus
} from "../services/stockPricingService";
import type { ConsolidatedStockItem, MinimumStockRule, StockImportDraft, StockItem, StockItemType, StockPricingHistory, StockPricingImportDraft, StockPricingProduct, StockPricingProductStatus, StockPricingTable, StockStatus, StockUnit } from "../types";
import { formatDateTime } from "../utils/date";
import { notify } from "../utils/uiActions";

type StockTab = "visao-geral" | "consolidado" | "unidade" | "precificacao" | "minimos" | "pedido" | "historico";
type UnitFilter = StockUnit | "Todas as unidades";
type StockTypeFilter = "Todos" | StockItemType;
type ImportTarget = { unit: StockUnit; mode: StockImportDraft["mode"] };
type PricingImportMode = "import" | "replace";

const emptyRule = (): MinimumStockRule => ({
  id: crypto.randomUUID(),
  productName: "",
  group: "",
  unitOfMeasure: "",
  minimumStock: 0,
  observation: ""
});

function formatNumber(value: number) {
  return (value || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

function getItemStatus(item: StockItem, rules: MinimumStockRule[]) {
  const rule = rules.find((candidate) => normalizeStockSearch(candidate.productName) === normalizeStockSearch(item.productName));
  return getStockStatus(item.availableStock, rule);
}

function getUnitSummary(unit: StockUnit, items: StockItem[], history: ReturnType<typeof loadImportHistory>, rules: MinimumStockRule[]) {
  const unitItems = items.filter((item) => item.unit === unit);
  const products = unitItems.filter((item) => item.type === "product");
  const last = history.find((entry) => entry.unit === unit);
  const statuses = products.map((item) => getItemStatus(item, rules));

  return {
    unit,
    fileName: last?.fileName || "Nenhum PDF importado",
    lastUpdate: last?.importedAt || "",
    productCount: products.length,
    availableCount: statuses.filter((status) => status === "Disponível").length,
    lowCount: statuses.filter((status) => status === "Baixo estoque").length,
    zeroCount: statuses.filter((status) => status === "Zerado").length,
    criticalCount: statuses.filter((status) => status === "Crítico / Negativo").length,
    hasPdf: products.length > 0
  };
}

export default function Stock() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pricingFileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<StockItem[]>(() => loadStockItems());
  const [rules, setRules] = useState<MinimumStockRule[]>(() => loadMinimumRules());
  const [history, setHistory] = useState(() => loadImportHistory());
  const [pricingTable, setPricingTable] = useState<StockPricingTable | null>(() => loadStockPricingTable());
  const [pricingHistory, setPricingHistory] = useState<StockPricingHistory[]>(() => loadStockPricingHistory());
  const [draft, setDraft] = useState<StockImportDraft | null>(null);
  const [pricingDraft, setPricingDraft] = useState<StockPricingImportDraft | null>(null);
  const [importTarget, setImportTarget] = useState<ImportTarget | null>(null);
  const [pricingImportMode, setPricingImportMode] = useState<PricingImportMode>("import");
  const [activeTab, setActiveTab] = useState<StockTab>("visao-geral");
  const [loadingUnit, setLoadingUnit] = useState<StockUnit | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [unitFilter, setUnitFilter] = useState<UnitFilter>("Todas as unidades");
  const [groupFilter, setGroupFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState<StockStatus | "Todos">("Todos");
  const [stockTypeFilter, setStockTypeFilter] = useState<StockTypeFilter>("Todos");
  const [search, setSearch] = useState("");
  const [ruleForm, setRuleForm] = useState<MinimumStockRule>(() => emptyRule());
  const [editingPricingProduct, setEditingPricingProduct] = useState<StockPricingProduct | null>(null);
  const [pricingSearch, setPricingSearch] = useState("");
  const [pricingLineFilter, setPricingLineFilter] = useState("Todos");
  const [pricingSupplierFilter, setPricingSupplierFilter] = useState("Todos");
  const [pricingStatusFilter, setPricingStatusFilter] = useState<StockPricingProductStatus | "Todos" | "vencimento_proximo" | "vencido" | "em_estoque_sem_preco" | "com_preco_sem_estoque">("Todos");
  const [pricingDueFilter, setPricingDueFilter] = useState("Todos");
  const [pricingStockFilter, setPricingStockFilter] = useState<"Todos" | "Com estoque" | "Sem estoque">("Todos");
  const [pricingDirty, setPricingDirty] = useState(false);
  const [autoRecalculateTerms, setAutoRecalculateTerms] = useState(true);

  const consolidated = useMemo(() => consolidateStock(items, rules), [items, rules]);
  const suggestions = useMemo(() => getPurchaseSuggestions(consolidated), [consolidated]);
  const groups = useMemo(() => [...new Set(items.map((item) => item.group).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR")), [items]);

  const productsImported = consolidated.length;
  const availableCount = consolidated.filter((item) => item.status === "Disponível").length;
  const lowCount = consolidated.filter((item) => item.status === "Baixo estoque").length;
  const zeroCount = consolidated.filter((item) => item.status === "Zerado").length;
  const criticalCount = consolidated.filter((item) => item.status === "Crítico / Negativo").length;
  const lastUpdate = history[0]?.importedAt;

  const openFilePicker = (unit: StockUnit, mode: StockImportDraft["mode"]) => {
    if (mode === "replace" && !window.confirm(`Substituir estoque de ${unit}?\nO estoque atual desta unidade será substituído somente após a confirmação da nova importação.`)) return;
    setImportTarget({ unit, mode });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (file?: File) => {
    if (!file || !importTarget) return;
    setLoadingUnit(importTarget.unit);
    try {
      const nextDraft = await readStockPdf(file, importTarget.unit, importTarget.mode);
      setDraft(nextDraft);
      if (nextDraft.warnings.some((warning) => warning.severity !== "info")) {
        notify("PDF importado, mas algumas linhas precisam de conferência. Revise antes de salvar.");
      }
    } catch (error) {
      notify(error instanceof Error ? error.message : "Não foi possível ler o PDF. Confirme se o arquivo está no formato correto e tente novamente.");
    } finally {
      setLoadingUnit(null);
      setImportTarget(null);
    }
  };

  const openPricingImport = (mode: PricingImportMode) => {
    if (mode === "replace" && pricingTable && !window.confirm("Substituir tabela de precificação atual?\nA tabela atual só será substituída após você confirmar a nova importação.")) return;
    setPricingImportMode(mode);
    if (pricingFileInputRef.current) {
      pricingFileInputRef.current.value = "";
      pricingFileInputRef.current.click();
    }
  };

  const handlePricingFileSelected = async (file?: File) => {
    if (!file) return;
    setLoadingPricing(true);
    try {
      const nextDraft = await parseStockPricingFile(file);
      setPricingDraft(nextDraft);
      if (nextDraft.importWarnings.some((warning) => warning.severity !== "info")) {
        notify("Planilha lida. Revise os alertas antes de confirmar a precificação.");
      }
    } catch (error) {
      notify(error instanceof Error ? error.message : "Arquivo inválido. Importe uma planilha Excel no formato correto.");
    } finally {
      setLoadingPricing(false);
    }
  };

  const confirmDraft = () => {
    if (!draft) return;
    const saved = applyStockDraft(items, history, draft);
    setItems(saved.items);
    setHistory(saved.history);
    saveStockItems(saved.items);
    saveImportHistory(saved.history);
    setDraft(null);
    notify("Estoque confirmado e salvo.");
  };

  const confirmPricingDraft = () => {
    if (!pricingDraft) return;
    const saved = confirmStockPricingDraft(pricingDraft, pricingHistory);
    setPricingTable(saved.table);
    setPricingHistory(saved.history);
    saveStockPricingTable(saved.table);
    saveStockPricingHistory(saved.history);
    setPricingDraft(null);
    setPricingDirty(false);
    notify(pricingImportMode === "replace" ? "Tabela de precificação substituída." : "Tabela de precificação salva.");
  };

  const removeUnit = (unit: StockUnit) => {
    if (!window.confirm(`Remover PDF e estoque de ${unit}? Esta ação não remove regras de mínimo nem outras unidades.`)) return;
    const nextItems = removeUnitStock(items, unit);
    setItems(nextItems);
    saveStockItems(nextItems);
    notify(`Estoque de ${unit} removido.`);
  };

  const removePricingTable = () => {
    if (!pricingTable) return;
    if (!window.confirm("Remover tabela de precificação do estoque?\nEssa ação remove a tabela ativa de preços do estoque. O estoque físico importado por PDF não será alterado.")) return;
    setPricingTable(null);
    saveStockPricingTable(null);
    setPricingDirty(false);
    notify("Tabela de precificação removida. O estoque físico foi preservado.");
  };

  const updateItem = <K extends keyof StockItem>(id: string, field: K, value: StockItem[K]) => {
    const nextItems = items.map((item) => item.id === id ? { ...item, [field]: value } : item);
    setItems(nextItems);
    saveStockItems(nextItems);
  };

  const removeItem = (id: string) => {
    if (!window.confirm("Remover este item do estoque?")) return;
    const nextItems = items.filter((item) => item.id !== id);
    setItems(nextItems);
    saveStockItems(nextItems);
  };

  const updatePricingProducts = (products: StockPricingProduct[], dirty = true) => {
    if (!pricingTable) {
      const table: StockPricingTable = {
        id: crypto.randomUUID(),
        fileName: "Cadastro manual",
        importedAt: new Date().toISOString(),
        active: true,
        products,
        importWarnings: []
      };
      setPricingTable(table);
    } else {
      setPricingTable({ ...pricingTable, products });
    }
    if (dirty) setPricingDirty(true);
  };

  const savePricingChanges = () => {
    if (!pricingTable) return;
    const products = pricingTable.products.map((product) => withCommercialStatus(product, getPricingStockMatch(product.produto, consolidated)));
    const next = { ...pricingTable, products };
    setPricingTable(next);
    saveStockPricingTable(next);
    setPricingDirty(false);
    notify("Alterações da precificação salvas.");
  };

  const discardPricingChanges = () => {
    const saved = loadStockPricingTable();
    setPricingTable(saved);
    setEditingPricingProduct(null);
    setPricingDirty(false);
    notify("Alterações descartadas.");
  };

  const addPricingProduct = (base?: Partial<StockPricingProduct>) => {
    const product = { ...emptyStockPricingProduct(base?.produto || "", base?.linha || "", pricingTable?.termColumns || []), ...base, id: crypto.randomUUID(), updatedAt: new Date().toISOString() };
    updatePricingProducts([...(pricingTable?.products || []), product]);
    setEditingPricingProduct(product);
  };

  const savePricingProduct = (product: StockPricingProduct) => {
    const calculated = autoRecalculateTerms ? recalculateStockPricingProduct(product) : product;
    const nextProduct = withCommercialStatus({ ...calculated, updatedAt: new Date().toISOString() }, getPricingStockMatch(product.produto, consolidated));
    const current = pricingTable?.products || [];
    const exists = current.some((item) => item.id === product.id);
    updatePricingProducts(exists ? current.map((item) => item.id === product.id ? nextProduct : item) : [...current, nextProduct]);
    setEditingPricingProduct(null);
  };

  const updatePricingProduct = (product: StockPricingProduct) => {
    const current = pricingTable?.products || [];
    const calculated = autoRecalculateTerms ? recalculateStockPricingProduct(product) : { ...product, updatedAt: new Date().toISOString() };
    const nextProduct = withCommercialStatus(calculated, getPricingStockMatch(product.produto, consolidated));
    updatePricingProducts(current.map((item) => item.id === product.id ? nextProduct : item));
    if (editingPricingProduct?.id === product.id) setEditingPricingProduct(nextProduct);
  };

  const duplicatePricingProduct = (product: StockPricingProduct) => {
    const copy = { ...product, id: crypto.randomUUID(), produto: `${product.produto} (cópia)`, updatedAt: new Date().toISOString() };
    updatePricingProducts([...(pricingTable?.products || []), copy]);
    notify("Produto duplicado na precificação.");
  };

  const removePricingProduct = (id: string) => {
    if (!window.confirm("Remover este produto da precificação?")) return;
    updatePricingProducts((pricingTable?.products || []).filter((product) => product.id !== id));
    if (editingPricingProduct?.id === id) setEditingPricingProduct(null);
  };

  const updateDraftItem = <K extends keyof StockItem>(id: string, field: K, value: StockItem[K]) => {
    setDraft((current) => current ? { ...current, items: current.items.map((item) => item.id === id ? { ...item, [field]: value } : item) } : current);
  };

  const removeDraftItem = (id: string) => {
    setDraft((current) => current ? { ...current, items: current.items.filter((item) => item.id !== id) } : current);
  };

  const saveRule = () => {
    if (!ruleForm.productName.trim()) {
      notify("Informe o produto da regra de estoque mínimo.");
      return;
    }
    const exists = rules.some((rule) => rule.id === ruleForm.id);
    const nextRules = exists ? rules.map((rule) => rule.id === ruleForm.id ? ruleForm : rule) : [...rules, ruleForm];
    setRules(nextRules);
    saveMinimumRules(nextRules);
    setRuleForm(emptyRule());
    notify("Regra de estoque mínimo salva.");
  };

  const editRule = (rule: MinimumStockRule) => {
    setRuleForm(rule);
    setActiveTab("minimos");
  };

  const removeRule = (id: string) => {
    if (!window.confirm("Remover esta regra de estoque mínimo?")) return;
    const nextRules = rules.filter((rule) => rule.id !== id);
    setRules(nextRules);
    saveMinimumRules(nextRules);
  };

  const copyPurchaseOrder = () => {
    copyToClipboard(buildPurchaseOrderText(suggestions)).then(() => notify("Pedido de compra copiado."));
  };

  const filteredUnitItems = items.filter((item) => {
    if (unitFilter !== "Todas as unidades" && item.unit !== unitFilter) return false;
    if (groupFilter !== "Todos" && item.group !== groupFilter) return false;
    if (stockTypeFilter !== "Todos" && item.type !== stockTypeFilter) return false;
    const status = getItemStatus(item, rules);
    if (statusFilter !== "Todos" && status !== statusFilter) return false;
    const haystack = normalizeStockSearch([item.productName, item.group, item.unit].join(" "));
    return !search || haystack.includes(normalizeStockSearch(search));
  });

  return (
    <div>
      <div className="page-title">
        <h1>Estoque</h1>
        <p>Controle de estoque por unidade e apoio à compra.</p>
      </div>

      <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(event) => handleFileSelected(event.target.files?.[0])} />
      <input ref={pricingFileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(event) => handlePricingFileSelected(event.target.files?.[0])} />

      <Card>
        <div className="mb-5 flex flex-wrap gap-2">
          <TabButton active={activeTab === "visao-geral"} onClick={() => setActiveTab("visao-geral")}>Visão Geral</TabButton>
          <TabButton active={activeTab === "consolidado"} onClick={() => setActiveTab("consolidado")}>Consolidado</TabButton>
          <TabButton active={activeTab === "unidade"} onClick={() => setActiveTab("unidade")}>Por Unidade</TabButton>
          <TabButton active={activeTab === "precificacao"} onClick={() => setActiveTab("precificacao")}>Precificação do Estoque</TabButton>
          <TabButton active={activeTab === "minimos"} onClick={() => setActiveTab("minimos")}>Estoque Mínimo</TabButton>
          <TabButton active={activeTab === "pedido"} onClick={() => setActiveTab("pedido")}>Pedido de Compra</TabButton>
          <TabButton active={activeTab === "historico"} onClick={() => setActiveTab("historico")}>Histórico</TabButton>
        </div>

        {activeTab === "visao-geral" && (
          <OverviewView
            items={items}
            history={history}
            rules={rules}
            loadingUnit={loadingUnit}
            productsImported={productsImported}
            availableCount={availableCount}
            lowCount={lowCount}
            zeroCount={zeroCount}
            criticalCount={criticalCount}
            suggestionsCount={suggestions.length}
            lastUpdate={lastUpdate}
            onImport={openFilePicker}
            onRemove={removeUnit}
          />
        )}
        {activeTab === "consolidado" && <ConsolidatedView items={consolidated} onEditRule={editRule} />}
        {activeTab === "unidade" && (
          <UnitStockView
            allItems={items}
            items={filteredUnitItems}
            unitFilter={unitFilter}
            groupFilter={groupFilter}
            statusFilter={statusFilter}
            stockTypeFilter={stockTypeFilter}
            search={search}
            groups={groups}
            rules={rules}
            history={history}
            onUnitFilter={setUnitFilter}
            onGroupFilter={setGroupFilter}
            onStatusFilter={setStatusFilter}
            onStockTypeFilter={setStockTypeFilter}
            onSearch={setSearch}
            onUpdate={updateItem}
            onRemove={removeItem}
          />
        )}
        {activeTab === "precificacao" && (
          <StockPricingView
            table={pricingTable}
            history={pricingHistory}
            consolidated={consolidated}
            loading={loadingPricing}
            dirty={pricingDirty}
            search={pricingSearch}
            lineFilter={pricingLineFilter}
            supplierFilter={pricingSupplierFilter}
            statusFilter={pricingStatusFilter}
            dueFilter={pricingDueFilter}
            stockFilter={pricingStockFilter}
            autoRecalculate={autoRecalculateTerms}
            onImport={() => openPricingImport("import")}
            onReplace={() => openPricingImport("replace")}
            onRemoveTable={removePricingTable}
            onAdd={() => addPricingProduct()}
            onSaveChanges={savePricingChanges}
            onDiscardChanges={discardPricingChanges}
            onSearch={setPricingSearch}
            onLineFilter={setPricingLineFilter}
            onSupplierFilter={setPricingSupplierFilter}
            onStatusFilter={setPricingStatusFilter}
            onDueFilter={setPricingDueFilter}
            onStockFilter={setPricingStockFilter}
            onAutoRecalculate={setAutoRecalculateTerms}
            onEdit={setEditingPricingProduct}
            onUpdate={updatePricingProduct}
            onDuplicate={duplicatePricingProduct}
            onRemove={removePricingProduct}
            onCreateFromStock={(item) => addPricingProduct({ produto: item.productName, linha: item.group })}
          />
        )}
        {activeTab === "minimos" && (
          <MinimumRulesView
            rules={rules}
            form={ruleForm}
            onFormChange={setRuleForm}
            onSave={saveRule}
            onEdit={editRule}
            onRemove={removeRule}
            onNew={() => setRuleForm(emptyRule())}
          />
        )}
        {activeTab === "pedido" && <PurchaseSuggestionView items={suggestions} onCopy={copyPurchaseOrder} onEditRule={editRule} />}
        {activeTab === "historico" && <HistoryView history={history} />}
      </Card>

      <ImportReviewModal
        draft={draft}
        onClose={() => setDraft(null)}
        onConfirm={confirmDraft}
        onUpdate={updateDraftItem}
        onRemove={removeDraftItem}
      />
      <StockPricingReviewModal draft={pricingDraft} onClose={() => setPricingDraft(null)} onConfirm={confirmPricingDraft} />
      <StockPricingProductModal product={editingPricingProduct} onClose={() => setEditingPricingProduct(null)} onSave={savePricingProduct} onRemove={removePricingProduct} />
    </div>
  );
}

function OverviewView({ items, history, rules, loadingUnit, productsImported, availableCount, lowCount, zeroCount, criticalCount, suggestionsCount, lastUpdate, onImport, onRemove }: {
  items: StockItem[];
  history: ReturnType<typeof loadImportHistory>;
  rules: MinimumStockRule[];
  loadingUnit: StockUnit | null;
  productsImported: number;
  availableCount: number;
  lowCount: number;
  zeroCount: number;
  criticalCount: number;
  suggestionsCount: number;
  lastUpdate?: string;
  onImport: (unit: StockUnit, mode: StockImportDraft["mode"]) => void;
  onRemove: (unit: StockUnit) => void;
}) {
  return (
    <div>
      <SectionHeader title="Visão Geral" subtitle="Importação por unidade, status dos PDFs e resumo consolidado do estoque." />
      <div className="grid gap-4 lg:grid-cols-3">
        {stockUnits.map((unit) => (
          <UnitCard
            key={unit}
            unit={unit}
            items={items}
            history={history}
            rules={rules}
            loading={loadingUnit === unit}
            onImport={() => onImport(unit, "import")}
            onReplace={() => onImport(unit, "replace")}
            onRemove={() => onRemove(unit)}
          />
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
        <SummaryCard label="Produtos importados" value={String(productsImported)} />
        <SummaryCard label="Disponíveis" value={String(availableCount)} tone="green" />
        <SummaryCard label="Baixo estoque" value={String(lowCount)} tone="amber" />
        <SummaryCard label="Zerados" value={String(zeroCount)} tone="red" />
        <SummaryCard label="Críticos/negativos" value={String(criticalCount)} tone="red" />
        <SummaryCard label="Sugestões de compra" value={String(suggestionsCount)} tone="amber" />
        <SummaryCard label="Última atualização" value={lastUpdate ? formatDateTime(lastUpdate) : "Sem importação"} />
      </div>
    </div>
  );
}

function UnitCard({ unit, items, history, rules, loading, onImport, onReplace, onRemove }: {
  unit: StockUnit;
  items: StockItem[];
  history: ReturnType<typeof loadImportHistory>;
  rules: MinimumStockRule[];
  loading: boolean;
  onImport: () => void;
  onReplace: () => void;
  onRemove: () => void;
}) {
  const summary = getUnitSummary(unit, items, history, rules);

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
            <h2 className="text-base font-bold text-padap-ink">{unit}</h2>
          </div>
          <p className="mt-1 pl-3 text-xs text-padap-muted">Unidade PADAP</p>
        </div>
        <Badge tone={summary.hasPdf ? "green" : "neutral"}>{summary.hasPdf ? "PDF importado" : "Sem PDF"}</Badge>
      </div>
      <div className="mt-4 grid gap-2 text-sm">
        <InfoLine label="Última atualização" value={summary.lastUpdate ? formatDateTime(summary.lastUpdate) : "Sem importação"} />
        <InfoLine label="Produtos importados" value={String(summary.productCount)} />
        <InfoLine label="Críticos/negativos" value={String(summary.criticalCount)} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={onImport} disabled={loading}><FileUp size={15} />{loading ? "Lendo..." : "Importar PDF"}</Button>
        <Button variant="ghost" onClick={onReplace} disabled={loading || !summary.hasPdf}><RefreshCw size={15} />Substituir PDF</Button>
        <Button variant="danger" onClick={onRemove} disabled={!summary.hasPdf}><Trash2 size={15} />Remover PDF</Button>
      </div>
    </Card>
  );
}

function ConsolidatedView({ items, onEditRule }: { items: ConsolidatedStockItem[]; onEditRule: (rule: MinimumStockRule) => void }) {
  return (
    <div>
      <SectionHeader title="Estoque consolidado" subtitle="Produtos consolidados pelo nome exato, somando Estoque Disponível das 3 unidades." />
      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item.productName} className="grid gap-3 rounded-lg border border-white/[0.08] bg-black/15 p-3 xl:grid-cols-[minmax(220px,1.5fr)_110px_110px_110px_120px_120px_140px_90px] xl:items-center">
            <ProductCell product={item.productName} group={item.group} />
            <Metric label="São Gotardo" value={formatNumber(item.byUnit["São Gotardo"])} />
            <Metric label="Santa Juliana" value={formatNumber(item.byUnit["Santa Juliana"])} />
            <Metric label="Campos Altos" value={formatNumber(item.byUnit["Campos Altos"])} />
            <Metric label="Total disponível" value={formatNumber(item.totalAvailable)} strong />
            <Metric label="Estoque mínimo" value={item.minimumRule ? formatNumber(item.minimumRule.minimumStock) : "Sem regra"} />
            <div><Badge tone={getStockStatusTone(item.status)}>{item.status}</Badge><p className="mt-1 text-xs text-slate-500">{item.purchaseSuggestion === null ? "Sem sugestão" : `Comprar ${formatNumber(item.purchaseSuggestion)}`}</p></div>
            <Button variant="ghost" className="h-9 px-3" onClick={() => onEditRule(item.minimumRule || { ...emptyRule(), productName: item.productName, group: item.group })}><Pencil size={14} />Mínimo</Button>
          </div>
        ))}
        {!items.length && <EmptyState text="Nenhum estoque importado ainda." />}
      </div>
    </div>
  );
}

function UnitStockView({ allItems, items, unitFilter, groupFilter, statusFilter, stockTypeFilter, search, groups, rules, history, onUnitFilter, onGroupFilter, onStatusFilter, onStockTypeFilter, onSearch, onUpdate, onRemove }: {
  allItems: StockItem[];
  items: StockItem[];
  unitFilter: UnitFilter;
  groupFilter: string;
  statusFilter: StockStatus | "Todos";
  stockTypeFilter: StockTypeFilter;
  search: string;
  groups: string[];
  rules: MinimumStockRule[];
  history: ReturnType<typeof loadImportHistory>;
  onUnitFilter: (value: UnitFilter) => void;
  onGroupFilter: (value: string) => void;
  onStatusFilter: (value: StockStatus | "Todos") => void;
  onStockTypeFilter: (value: StockTypeFilter) => void;
  onSearch: (value: string) => void;
  onUpdate: <K extends keyof StockItem>(id: string, field: K, value: StockItem[K]) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div>
      <SectionHeader title="Por Unidade" subtitle="Visualize cada estoque separado por cidade. A decisão de compra principal continua no Consolidado e no Pedido de Compra." />
      <UnitSelector value={unitFilter} onChange={onUnitFilter} />
      <UnitSummaryPanel unitFilter={unitFilter} items={allItems} history={history} rules={rules} />
      <div className="mb-4 grid gap-3 md:grid-cols-5">
        <Input className="md:col-span-2" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Buscar produto" />
        <Select value={groupFilter} onChange={(event) => onGroupFilter(event.target.value)}><option>Todos</option>{groups.map((group) => <option key={group}>{group}</option>)}</Select>
        <Select value={statusFilter} onChange={(event) => onStatusFilter(event.target.value as StockStatus | "Todos")}><option>Todos</option><option>Disponível</option><option>Baixo estoque</option><option>Zerado</option><option>Crítico / Negativo</option><option>Sem regra mínima</option></Select>
        <Select value={stockTypeFilter} onChange={(event) => onStockTypeFilter(event.target.value as StockTypeFilter)}><option>Todos</option><option value="product">Produto</option><option value="group">Grupo</option></Select>
      </div>
      <div className="grid gap-3">
        {items.map((item) => {
          const status = getItemStatus(item, rules);
          return <StockEditableRow key={item.id} item={item} status={status} onUpdate={onUpdate} onRemove={onRemove} />;
        })}
        {!items.length && <EmptyState text="Nenhum produto encontrado para os filtros selecionados." />}
      </div>
    </div>
  );
}

function UnitSelector({ value, onChange }: { value: UnitFilter; onChange: (value: UnitFilter) => void }) {
  const options: UnitFilter[] = ["Todas as unidades", ...stockUnits];
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${value === option ? "border-padap-green/30 bg-padap-green/10 text-padap-mint" : "border-white/10 bg-white/[0.035] text-slate-300 hover:bg-white/[0.06]"}`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function UnitSummaryPanel({ unitFilter, items, history, rules }: { unitFilter: UnitFilter; items: StockItem[]; history: ReturnType<typeof loadImportHistory>; rules: MinimumStockRule[] }) {
  const units = unitFilter === "Todas as unidades" ? stockUnits : [unitFilter];
  return (
    <div className="mb-4 grid gap-3 lg:grid-cols-3">
      {units.map((unit) => {
        const summary = getUnitSummary(unit, items, history, rules);
        return (
          <div key={unit} className="rounded-lg border border-white/[0.08] bg-black/15 p-3">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
                  <h3 className="text-base font-bold text-padap-ink">{summary.unit}</h3>
                </div>
                <p className="mt-1 pl-3 text-xs text-padap-muted">PDF: {summary.fileName}</p>
              </div>
              <Badge tone={summary.hasPdf ? "green" : "neutral"}>{summary.hasPdf ? "Atualizado" : "Sem PDF"}</Badge>
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <InfoLine label="Última atualização" value={summary.lastUpdate ? formatDateTime(summary.lastUpdate) : "Sem importação"} />
              <InfoLine label="Produtos importados" value={String(summary.productCount)} />
              <InfoLine label="Disponíveis" value={String(summary.availableCount)} />
              <InfoLine label="Baixo estoque" value={String(summary.lowCount)} />
              <InfoLine label="Zerados" value={String(summary.zeroCount)} />
              <InfoLine label="Críticos/negativos" value={String(summary.criticalCount)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StockEditableRow({ item, status, onUpdate, onRemove }: {
  item: StockItem;
  status: StockStatus;
  onUpdate: <K extends keyof StockItem>(id: string, field: K, value: StockItem[K]) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-black/15 p-3">
      <div className="grid gap-2 lg:grid-cols-[minmax(180px,1.5fr)_130px_120px_100px_100px_100px_100px_120px_84px] lg:items-start">
        <Field label="Produto"><Input value={item.productName} onChange={(event) => onUpdate(item.id, "productName", event.target.value)} /></Field>
        <Field label="Grupo"><Input value={item.group} onChange={(event) => onUpdate(item.id, "group", event.target.value)} /></Field>
        <Field label="Unidade"><Select value={item.unit} onChange={(event) => onUpdate(item.id, "unit", event.target.value as StockUnit)}>{stockUnits.map((unit) => <option key={unit}>{unit}</option>)}</Select></Field>
        <NumberField label="Físico" value={item.physicalStock} onChange={(value) => onUpdate(item.id, "physicalStock", value)} />
        <NumberField label="PV Retira" value={item.pvRetiraLoja} onChange={(value) => onUpdate(item.id, "pvRetiraLoja", value)} />
        <NumberField label="Pedido" value={item.purchaseOrder} onChange={(value) => onUpdate(item.id, "purchaseOrder", value)} />
        <NumberField label="Consignado" value={item.consignedBalance} onChange={(value) => onUpdate(item.id, "consignedBalance", value)} />
        <NumberField label="Disponível" value={item.availableStock} onChange={(value) => onUpdate(item.id, "availableStock", value)} />
        <div className="flex gap-1">
          <Select value={item.type} onChange={(event) => onUpdate(item.id, "type", event.target.value as StockItemType)}><option value="product">Produto</option><option value="group">Grupo</option></Select>
          <button type="button" className="h-10 w-10 rounded-lg border border-red-400/20 bg-red-500/10 text-red-100" onClick={() => onRemove(item.id)} aria-label="Remover item"><Trash2 size={15} className="mx-auto" /></button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <Badge tone={getStockStatusTone(status)}>{status}</Badge>
        <span>Arquivo: {item.sourceFileName}</span>
        <span>Importado em: {formatDateTime(item.importedAt)}</span>
      </div>
    </div>
  );
}

function MinimumRulesView({ rules, form, onFormChange, onSave, onEdit, onRemove, onNew }: {
  rules: MinimumStockRule[];
  form: MinimumStockRule;
  onFormChange: (value: MinimumStockRule) => void;
  onSave: () => void;
  onEdit: (rule: MinimumStockRule) => void;
  onRemove: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <div>
      <SectionHeader title="Regras de estoque mínimo" subtitle="Cadastro manual preservado mesmo ao remover ou substituir PDFs." />
      <div className="mb-5 grid gap-3 rounded-lg border border-white/[0.08] bg-black/15 p-3 md:grid-cols-6">
        <Field label="Produto"><Input value={form.productName} onChange={(event) => onFormChange({ ...form, productName: event.target.value })} /></Field>
        <Field label="Grupo"><Input value={form.group || ""} onChange={(event) => onFormChange({ ...form, group: event.target.value })} /></Field>
        <Field label="Unidade medida"><Input value={form.unitOfMeasure || ""} onChange={(event) => onFormChange({ ...form, unitOfMeasure: event.target.value })} /></Field>
        <NumberField label="Estoque mínimo" value={form.minimumStock} onChange={(value) => onFormChange({ ...form, minimumStock: value })} />
        <Field label="Observação"><Input value={form.observation || ""} onChange={(event) => onFormChange({ ...form, observation: event.target.value })} /></Field>
        <div className="flex items-end gap-2">
          <Button className="h-10" onClick={onSave}><Save size={15} />Salvar</Button>
          <Button variant="ghost" className="h-10 w-10 p-0" onClick={onNew} aria-label="Nova regra"><Plus size={15} /></Button>
        </div>
      </div>
      <div className="grid gap-3">
        {rules.map((rule) => (
          <div key={rule.id} className="grid gap-3 rounded-lg border border-white/[0.08] bg-black/15 p-3 md:grid-cols-[minmax(220px,1fr)_140px_110px_130px_1fr_100px] md:items-center">
            <ProductCell product={rule.productName} group={rule.group || "Sem grupo"} />
            <Metric label="Unidade" value={rule.unitOfMeasure || "-"} />
            <Metric label="Mínimo" value={formatNumber(rule.minimumStock)} strong />
            <Metric label="Observação" value={rule.observation || "-"} />
            <div />
            <div className="flex gap-2"><Button variant="ghost" className="h-9 px-3" onClick={() => onEdit(rule)}><Pencil size={14} /></Button><Button variant="danger" className="h-9 px-3" onClick={() => onRemove(rule.id)}><Trash2 size={14} /></Button></div>
          </div>
        ))}
        {!rules.length && <EmptyState text="Nenhuma regra mínima cadastrada." />}
      </div>
    </div>
  );
}

function PurchaseSuggestionView({ items, onCopy, onEditRule }: { items: ConsolidatedStockItem[]; onCopy: () => void; onEditRule: (rule: MinimumStockRule) => void }) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SectionHeader title="Pedido de compra sugerido" subtitle="Produtos negativos, zerados ou abaixo do estoque mínimo." compact />
        <Button onClick={onCopy}><ClipboardCopy size={15} />Copiar pedido de compra</Button>
      </div>
      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item.productName} className="grid gap-3 rounded-lg border border-white/[0.08] bg-black/15 p-3 lg:grid-cols-[minmax(220px,1.5fr)_120px_120px_140px_160px_100px] lg:items-center">
            <ProductCell product={item.productName} group={item.group} />
            <Metric label="Estoque atual" value={formatNumber(item.totalAvailable)} strong />
            <Metric label="Estoque mínimo" value={item.minimumRule ? formatNumber(item.minimumRule.minimumStock) : "Sem regra"} />
            <Metric label="Comprar" value={item.purchaseSuggestion === null ? "Sem regra mínima" : formatNumber(item.purchaseSuggestion)} />
            <div><Badge tone={getStockStatusTone(item.status)}>{item.reason}</Badge></div>
            <Button variant="ghost" className="h-9 px-3" onClick={() => onEditRule(item.minimumRule || { ...emptyRule(), productName: item.productName, group: item.group })}><Pencil size={14} />Mínimo</Button>
          </div>
        ))}
        {!items.length && <EmptyState text="Nenhum produto precisa de compra sugerida no momento." />}
      </div>
    </div>
  );
}

function HistoryView({ history }: { history: ReturnType<typeof loadImportHistory> }) {
  return (
    <div>
      <SectionHeader title="Histórico de atualizações" subtitle="Últimas importações confirmadas por unidade." />
      <div className="grid gap-3">
        {history.map((entry) => (
          <div key={entry.id} className="grid gap-2 rounded-lg border border-white/[0.08] bg-black/15 p-3 md:grid-cols-5 md:items-center">
            <Metric label="Unidade" value={entry.unit} strong />
            <Metric label="Arquivo" value={entry.fileName} />
            <Metric label="Data/hora" value={formatDateTime(entry.importedAt)} />
            <Metric label="Produtos" value={String(entry.productCount)} />
            <Metric label="Alertas" value={String(entry.warningCount)} />
          </div>
        ))}
        {!history.length && <EmptyState text="Nenhuma importação confirmada ainda." />}
      </div>
    </div>
  );
}

function StockPricingView({ table, history, consolidated, loading, dirty, search, lineFilter, supplierFilter, statusFilter, dueFilter, stockFilter, autoRecalculate, onImport, onReplace, onRemoveTable, onAdd, onSaveChanges, onDiscardChanges, onSearch, onLineFilter, onSupplierFilter, onStatusFilter, onDueFilter, onStockFilter, onAutoRecalculate, onEdit, onUpdate, onDuplicate, onRemove, onCreateFromStock }: {
  table: StockPricingTable | null;
  history: StockPricingHistory[];
  consolidated: ConsolidatedStockItem[];
  loading: boolean;
  dirty: boolean;
  search: string;
  lineFilter: string;
  supplierFilter: string;
  statusFilter: StockPricingProductStatus | "Todos" | "vencimento_proximo" | "vencido" | "em_estoque_sem_preco" | "com_preco_sem_estoque";
  dueFilter: string;
  stockFilter: "Todos" | "Com estoque" | "Sem estoque";
  autoRecalculate: boolean;
  onImport: () => void;
  onReplace: () => void;
  onRemoveTable: () => void;
  onAdd: () => void;
  onSaveChanges: () => void;
  onDiscardChanges: () => void;
  onSearch: (value: string) => void;
  onLineFilter: (value: string) => void;
  onSupplierFilter: (value: string) => void;
  onStatusFilter: (value: StockPricingProductStatus | "Todos" | "vencimento_proximo" | "vencido" | "em_estoque_sem_preco" | "com_preco_sem_estoque") => void;
  onDueFilter: (value: string) => void;
  onStockFilter: (value: "Todos" | "Com estoque" | "Sem estoque") => void;
  onAutoRecalculate: (value: boolean) => void;
  onEdit: (product: StockPricingProduct) => void;
  onUpdate: (product: StockPricingProduct) => void;
  onDuplicate: (product: StockPricingProduct) => void;
  onRemove: (id: string) => void;
  onCreateFromStock: (item: ConsolidatedStockItem) => void;
}) {
  const products = table?.products || [];
  const lines = [...new Set(products.map((product) => product.linha).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const suppliers = [...new Set(products.map((product) => product.fornecedor).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const termColumns = getStockPricingTermColumns(products, table?.termColumns || []);
  const extraColumns = getStockPricingExtraColumns(products, table?.extraColumns || []);
  const gridTemplateColumns = buildStockPricingGridTemplate(termColumns.length, extraColumns.length);
  const gridMinWidth = buildStockPricingGridMinWidth(termColumns.length, extraColumns.length);

  const enriched = products.map((product) => {
    const stock = getPricingStockMatch(product.produto, consolidated);
    return { product: withCommercialStatus(product, stock), stock };
  });
  const ready = enriched.filter((item) => item.product.status === "pronto_para_cotacao").length;
  const incomplete = enriched.filter((item) => item.product.status === "incompleto" || item.product.status === "sem_preco").length;

  const filtered = enriched.filter(({ product, stock }) => {
    const haystack = normalizeStockSearch([product.produto, product.linha, product.fornecedor, product.embalagem].join(" "));
    if (search && !haystack.includes(normalizeStockSearch(search))) return false;
    if (lineFilter !== "Todos" && product.linha !== lineFilter) return false;
    if (supplierFilter !== "Todos" && product.fornecedor !== supplierFilter) return false;
    if (stockFilter === "Com estoque" && (!stock || stock.totalAvailable <= 0)) return false;
    if (stockFilter === "Sem estoque" && stock && stock.totalAvailable > 0) return false;
    if (dueFilter !== "Todos" && getDueStatus(product.vencimento) !== dueFilter) return false;
    if (statusFilter === "com_preco_sem_estoque" && !(product.precoVenda && (!stock || stock.totalAvailable <= 0))) return false;
    if (statusFilter !== "Todos" && statusFilter !== "com_preco_sem_estoque" && statusFilter !== "em_estoque_sem_preco" && statusFilter !== "vencimento_proximo" && statusFilter !== "vencido" && product.status !== statusFilter) return false;
    if ((statusFilter === "vencimento_proximo" || statusFilter === "vencido") && getDueStatus(product.vencimento) !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <PricingHeader table={table} loading={loading} dirty={dirty} autoRecalculate={autoRecalculate} onAutoRecalculate={onAutoRecalculate} onImport={onImport} onReplace={onReplace} onRemoveTable={onRemoveTable} onAdd={onAdd} onSaveChanges={onSaveChanges} onDiscardChanges={onDiscardChanges} />
      {!table && (
        <div className="rounded-lg border border-dashed border-white/[0.12] bg-white/[0.025] p-6 text-center">
          <h3 className="text-base font-bold text-padap-ink">Nenhuma tabela de precificação importada.</h3>
          <p className="mt-2 text-sm text-padap-muted">Importe uma planilha Excel para carregar os preços dos produtos em estoque.</p>
          <Button className="mt-4" onClick={onImport}><FileUp size={15} />Importar tabela de precificação</Button>
        </div>
      )}
      {table && (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Produtos precificados" value={String(products.length)} />
            <SummaryCard label="Prontos para cotação" value={String(ready)} tone="green" />
            <SummaryCard label="Preços incompletos" value={String(incomplete)} tone={incomplete ? "red" : "green"} />
            <SummaryCard label="Última atualização" value={formatDateTime(table.importedAt)} />
          </div>
          <PricingFilters search={search} lines={lines} suppliers={suppliers} lineFilter={lineFilter} supplierFilter={supplierFilter} statusFilter={statusFilter} dueFilter={dueFilter} stockFilter={stockFilter} onSearch={onSearch} onLineFilter={onLineFilter} onSupplierFilter={onSupplierFilter} onStatusFilter={onStatusFilter} onDueFilter={onDueFilter} onStockFilter={onStockFilter} />
          <div className="max-w-full overflow-hidden rounded-lg border border-white/[0.08] bg-black/10">
            <div className="overflow-auto overscroll-contain" style={{ maxHeight: "max(360px, calc(100vh - 360px))", scrollbarGutter: "stable" }}>
              <div className="space-y-2 p-2" style={{ minWidth: gridMinWidth }}>
                <StockPricingGridHeader termColumns={termColumns} extraColumns={extraColumns} gridTemplateColumns={gridTemplateColumns} />
                {filtered.map(({ product, stock }) => <StockPricingRow key={product.id} product={product} stock={stock} termColumns={termColumns} extraColumns={extraColumns} gridTemplateColumns={gridTemplateColumns} onEdit={onEdit} onUpdate={onUpdate} onDuplicate={onDuplicate} onRemove={onRemove} />)}
                {!filtered.length && <EmptyState text="Nenhum produto encontrado para os filtros selecionados." />}
              </div>
            </div>
          </div>
          {!!history.length && <PricingHistory history={history} />}
        </>
      )}
    </div>
  );
}

function PricingHeader({ table, loading, dirty, autoRecalculate, onAutoRecalculate, onImport, onReplace, onRemoveTable, onAdd, onSaveChanges, onDiscardChanges }: {
  table: StockPricingTable | null;
  loading: boolean;
  dirty: boolean;
  autoRecalculate: boolean;
  onAutoRecalculate: (value: boolean) => void;
  onImport: () => void;
  onReplace: () => void;
  onRemoveTable: () => void;
  onAdd: () => void;
  onSaveChanges: () => void;
  onDiscardChanges: () => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <SectionHeader title="Precificação do Estoque" subtitle="Planilha inteligente de preços dos produtos disponíveis para venda do estoque." compact />
      <div className="flex flex-wrap gap-2">
        <label className="flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-xs font-semibold text-slate-300">
          <input type="checkbox" checked={autoRecalculate} onChange={(event) => onAutoRecalculate(event.target.checked)} />
          Recalcular prazos automaticamente
        </label>
        <Button onClick={onImport} disabled={loading}><FileUp size={15} />{loading ? "Lendo..." : "Importar tabela"}</Button>
        <Button variant="ghost" onClick={onReplace} disabled={loading || !table}><RefreshCw size={15} />Substituir</Button>
        <Button variant="danger" onClick={onRemoveTable} disabled={!table}><Trash2 size={15} />Remover</Button>
        <Button variant="ghost" onClick={onAdd}><Plus size={15} />Adicionar produto</Button>
        <Button onClick={onSaveChanges} disabled={!table || !dirty}><Save size={15} />Salvar alterações</Button>
        <Button variant="ghost" onClick={onDiscardChanges} disabled={!dirty}>Descartar</Button>
      </div>
    </div>
  );
}

function PricingFilters({ search, lines, suppliers, lineFilter, supplierFilter, statusFilter, dueFilter, stockFilter, onSearch, onLineFilter, onSupplierFilter, onStatusFilter, onDueFilter, onStockFilter }: {
  search: string;
  lines: string[];
  suppliers: string[];
  lineFilter: string;
  supplierFilter: string;
  statusFilter: string;
  dueFilter: string;
  stockFilter: string;
  onSearch: (value: string) => void;
  onLineFilter: (value: string) => void;
  onSupplierFilter: (value: string) => void;
  onStatusFilter: (value: StockPricingProductStatus | "Todos" | "vencimento_proximo" | "vencido" | "em_estoque_sem_preco" | "com_preco_sem_estoque") => void;
  onDueFilter: (value: string) => void;
  onStockFilter: (value: "Todos" | "Com estoque" | "Sem estoque") => void;
}) {
  return (
    <div className="mb-4 grid gap-3 md:grid-cols-6">
      <Input className="md:col-span-2" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Buscar produto" />
      <Select value={lineFilter} onChange={(event) => onLineFilter(event.target.value)}><option>Todos</option>{lines.map((line) => <option key={line}>{line}</option>)}</Select>
      <Select value={supplierFilter} onChange={(event) => onSupplierFilter(event.target.value)}><option>Todos</option>{suppliers.map((supplier) => <option key={supplier}>{supplier}</option>)}</Select>
      <Select value={statusFilter} onChange={(event) => onStatusFilter(event.target.value as StockPricingProductStatus | "Todos" | "vencimento_proximo" | "vencido" | "em_estoque_sem_preco" | "com_preco_sem_estoque")}><option>Todos</option><option value="pronto_para_cotacao">Pronto para cotação</option><option value="sem_preco">Sem preço de venda</option><option value="incompleto">Preço incompleto</option><option value="vencimento_proximo">Vencimento próximo</option><option value="vencido">Vencido</option></Select>
      <Select value={stockFilter} onChange={(event) => onStockFilter(event.target.value as "Todos" | "Com estoque" | "Sem estoque")}><option>Todos</option><option>Com estoque</option><option>Sem estoque</option></Select>
      <Select value={dueFilter} onChange={(event) => onDueFilter(event.target.value)}><option>Todos</option><option value="ok">Vencimento ok</option><option value="vencimento_proximo">Vencimento próximo</option><option value="vencido">Vencido</option><option value="sem_vencimento">Sem vencimento</option></Select>
    </div>
  );
}

function getStockPricingTermColumns(products: StockPricingProduct[], tableTerms: NonNullable<StockPricingTable["termColumns"]>) {
  const found = new Map<string, { key: string; label: string }>();
  tableTerms.forEach((term) => found.set(term.key, { key: term.key, label: term.label || term.key }));
  products.forEach((product) => {
    (product.prazoPrices || []).forEach((term) => found.set(term.key, { key: term.key, label: term.label || term.key }));
    Object.keys(product.monthlyPrices || {}).forEach((key) => {
      if (!found.has(key)) found.set(key, { key, label: key });
    });
  });
  return [...found.values()];
}

function getStockPricingExtraColumns(products: StockPricingProduct[], tableExtras: NonNullable<StockPricingTable["extraColumns"]>) {
  const found = new Map<string, { key: string; label: string }>();
  tableExtras.forEach((column) => found.set(column.key, { key: column.key, label: column.label || column.key }));
  products.forEach((product) => {
    Object.keys(product.extraValues || {}).forEach((key) => {
      if (!found.has(key)) found.set(key, { key, label: key });
    });
  });
  return [...found.values()];
}

function buildStockPricingGridTemplate(termCount: number, extraCount = 0) {
  const monthColumns = termCount > 0 ? ` repeat(${termCount}, 104px)` : "";
  const extraColumns = extraCount > 0 ? ` repeat(${extraCount}, 130px)` : "";
  return `300px 110px 150px 100px 115px 130px 90px 90px 120px 125px${monthColumns}${extraColumns} 170px 150px`;
}

function buildStockPricingGridMinWidth(termCount: number, extraCount = 0) {
  return `${1550 + (termCount * 104) + (extraCount * 130)}px`;
}

function resolveProductTerms(product: StockPricingProduct, termColumns: { key: string; label: string }[]) {
  const productTerms = product.prazoPrices?.length ? product.prazoPrices : Object.entries(product.monthlyPrices || {}).map(([key, price]) => ({ key, label: key, price, formulaType: "calculated" as const, manuallyEdited: false }));
  if (!termColumns.length) return productTerms;
  return termColumns.map((column) => {
    const existing = productTerms.find((term) => term.key === column.key);
    return existing || { key: column.key, label: column.label, price: null, formulaType: "calculated" as const, manuallyEdited: false };
  });
}

function StockPricingGridHeader({ termColumns, extraColumns, gridTemplateColumns }: { termColumns: { key: string; label: string }[]; extraColumns: { key: string; label: string }[]; gridTemplateColumns: string }) {
  const headerClass = "px-3 text-[11px] font-semibold uppercase text-slate-500";
  return (
    <div className="sticky top-0 z-30 grid gap-2 rounded-lg border border-white/[0.08] bg-[#071312] py-2 shadow-[0_8px_22px_rgba(0,0,0,.20)]" style={{ gridTemplateColumns }}>
      <div className={`${headerClass} sticky left-0 z-40 bg-[#071312] shadow-[12px_0_18px_-16px_rgba(0,0,0,.9)]`}>Produto</div>
      <div className={headerClass}>Linha</div>
      <div className={headerClass}>Fornecedor</div>
      <div className={headerClass}>Embal.</div>
      <div className={`${headerClass} text-right`}>Custo</div>
      <div className={headerClass}>Vencimento</div>
      <div className={`${headerClass} text-right`}>Ant.</div>
      <div className={`${headerClass} text-right`}>Juros</div>
      <div className={`${headerClass} text-right`}>Margem/Fator</div>
      <div className={`${headerClass} text-right`}>Preço venda</div>
      {termColumns.map((term, index) => <div key={term.key} className={`${headerClass} truncate text-right ${index === 0 ? "border-l border-padap-green/20" : ""}`} title={`Prazos / Meses: ${term.label}`}>{term.label}</div>)}
      {extraColumns.map((column, index) => <div key={column.key} className={`${headerClass} truncate ${index === 0 && !termColumns.length ? "border-l border-padap-green/20" : ""}`} title={`Coluna importada: ${column.label}`}>{column.label}</div>)}
      <div className={headerClass}>Estoque</div>
      <div className={`${headerClass} sticky right-0 z-40 bg-[#071312] shadow-[-12px_0_18px_-16px_rgba(0,0,0,.9)]`}>Status / Ações</div>
    </div>
  );
}

function StockPricingRow({ product, stock, termColumns, extraColumns, gridTemplateColumns, onEdit, onUpdate, onDuplicate, onRemove }: {
  product: StockPricingProduct;
  stock: ConsolidatedStockItem | null;
  termColumns: { key: string; label: string }[];
  extraColumns: { key: string; label: string }[];
  gridTemplateColumns: string;
  onEdit: (product: StockPricingProduct) => void;
  onUpdate: (product: StockPricingProduct) => void;
  onDuplicate: (product: StockPricingProduct) => void;
  onRemove: (id: string) => void;
}) {
  const total = stock?.totalAvailable || 0;
  const terms = resolveProductTerms(product, termColumns);
  const selectedTerm = terms.find((term) => term.price) || terms[0];
  const copyText = `Produto: ${product.produto}\nEmbalagem: ${product.embalagem || "-"}\nFornecedor: ${product.fornecedor || "-"}\nPreço: ${formatCurrency(selectedTerm?.price ?? product.precoVenda)}\nPrazo/Mês: ${selectedTerm?.label || "Preço venda"}\nVencimento: ${formatShortDate(product.vencimento)}\nEstoque: SG ${formatNumber(stock?.byUnit["São Gotardo"] || 0)} | SJ ${formatNumber(stock?.byUnit["Santa Juliana"] || 0)} | CA ${formatNumber(stock?.byUnit["Campos Altos"] || 0)} | Total ${formatNumber(total)}`;
  const update = <K extends keyof StockPricingProduct>(field: K, value: StockPricingProduct[K]) => onUpdate({ ...product, [field]: value });
  const updateTerm = (key: string, value: number | null) => {
    const prazoPrices = terms.map((term) => term.key === key ? { ...term, price: value, formulaType: "manual" as const, manuallyEdited: true } : term);
    const monthlyPrices = prazoPrices.reduce<Record<string, number | null>>((acc, term) => {
      acc[term.key] = term.price;
      return acc;
    }, {});
    onUpdate({ ...product, prazoPrices, monthlyPrices });
  };
  const updateExtra = (key: string, value: string) => {
    onUpdate({ ...product, extraValues: { ...(product.extraValues || {}), [key]: value } });
  };
  return (
    <div className="grid gap-2 rounded-lg border border-white/[0.08] bg-black/20 p-2" style={{ gridTemplateColumns }}>
        <div className="sticky left-0 z-20 -m-2 mr-0 rounded-l-lg border-r border-white/[0.08] bg-[#071312] p-2 shadow-[12px_0_18px_-16px_rgba(0,0,0,.9)]">
          <Field label="Produto"><Input className="font-semibold" value={product.produto} onChange={(event) => update("produto", event.target.value)} /></Field>
        </div>
        <Field label="Linha"><Input value={product.linha} onChange={(event) => update("linha", event.target.value)} /></Field>
        <Field label="Fornecedor"><Input value={product.fornecedor} onChange={(event) => update("fornecedor", event.target.value)} /></Field>
        <Field label="Embal."><Input value={product.embalagem} onChange={(event) => update("embalagem", event.target.value)} /></Field>
        <NullableNumberField label="Custo" value={product.precoCusto} onChange={(value) => update("precoCusto", value)} />
        <Field label="Vencimento"><Input value={formatInputDate(product.vencimento)} type="date" onChange={(event) => update("vencimento", event.target.value ? new Date(`${event.target.value}T23:59:59`).toISOString() : null)} /></Field>
        <NullableNumberField label="Ant." value={product.antecipacao} onChange={(value) => update("antecipacao", value)} />
        <NullableNumberField label="Juros" value={product.juros} onChange={(value) => update("juros", value)} />
        <NullableNumberField label="Margem/Fator" value={product.margemFator ?? product.margem} onChange={(value) => update("margemFator", value)} />
        <NullableNumberField label="Preço venda" value={product.precoVenda} onChange={(value) => update("precoVenda", value)} />
        {terms.map((term, index) => (
          <label key={term.key} className={`block text-[11px] text-slate-500 ${index === 0 ? "border-l border-padap-green/20 pl-2" : ""}`}>
            <span className="mb-1 block truncate" title={term.label}>{term.label}{term.manuallyEdited ? " *" : ""}</span>
            <Input className={`px-2 text-right ${term.manuallyEdited ? "border-padap-amber/40" : ""}`} type="number" step="1" value={term.price ?? ""} onChange={(event) => updateTerm(term.key, event.target.value === "" ? null : Number(event.target.value))} />
          </label>
        ))}
        {extraColumns.map((column, index) => (
          <label key={column.key} className={`block text-[11px] text-slate-500 ${index === 0 && !terms.length ? "border-l border-padap-green/20 pl-2" : ""}`}>
            <span className="mb-1 block truncate" title={column.label}>{column.label}</span>
            <Input className="px-2" value={String(product.extraValues?.[column.key] ?? "")} onChange={(event) => updateExtra(column.key, event.target.value)} />
          </label>
        ))}
        <div className="text-xs text-slate-500">
          <p>SG: {formatNumber(stock?.byUnit["São Gotardo"] || 0)}</p>
          <p>SJ: {formatNumber(stock?.byUnit["Santa Juliana"] || 0)}</p>
          <p>CA: {formatNumber(stock?.byUnit["Campos Altos"] || 0)}</p>
          <p className="font-semibold text-slate-200">Total: {formatNumber(total)}</p>
        </div>
        <div className="sticky right-0 z-20 -m-2 ml-0 rounded-r-lg border-l border-white/[0.08] bg-[#071312] p-2 shadow-[-12px_0_18px_-16px_rgba(0,0,0,.9)]">
          <div className="mb-2 flex flex-wrap gap-1"><CommercialStatusChips product={product} stock={stock} /></div>
          <div className="flex flex-wrap gap-1">
          <Button variant="ghost" className="h-9 px-3" onClick={() => onEdit(product)}><Pencil size={14} /></Button>
          <Button variant="ghost" className="h-9 px-3" onClick={() => onDuplicate(product)}><Copy size={14} /></Button>
          <Button variant="ghost" className="h-9 px-3" onClick={() => copyToClipboard(copyText).then(() => notify("Dados copiados para cotação."))}><ClipboardCopy size={14} /></Button>
          <Button variant="danger" className="h-9 px-3" onClick={() => onRemove(product.id)}><Trash2 size={14} /></Button>
          </div>
        </div>
    </div>
  );
}

function CommercialStatusChips({ product, stock }: { product: StockPricingProduct; stock: ConsolidatedStockItem | null }) {
  const due = getDueStatus(product.vencimento);
  const chips: { label: string; tone: "green" | "amber" | "red" | "neutral" }[] = [];
  const commercialMargin = product.precoVenda && product.precoCusto ? ((product.precoVenda - product.precoCusto) / product.precoVenda) * 100 : null;
  if (product.precoVenda && stock && stock.totalAvailable > 0) chips.push({ label: "Pronto para cotação", tone: "green" });
  else if (product.precoVenda) chips.push({ label: "Com preço sem estoque", tone: "amber" });
  if (!product.precoCusto || !product.precoVenda || !(product.margemFator ?? product.margem) || !product.vencimento) chips.push({ label: "Preço incompleto", tone: "red" });
  if (commercialMargin !== null && commercialMargin <= 5) chips.push({ label: "Revisar margem", tone: "amber" });
  if (due === "vencimento_proximo") chips.push({ label: "Vencimento próximo", tone: "amber" });
  if (due === "vencido") chips.push({ label: "Vencido", tone: "red" });
  if (due === "sem_vencimento") chips.push({ label: "Sem vencimento", tone: "neutral" });
  if (!chips.length) chips.push({ label: "Completo", tone: "green" });
  return <>{chips.map((chip) => <Badge key={chip.label} tone={chip.tone}>{chip.label}</Badge>)}</>;
}

function UnpricedStockView({ items, onCreate }: { items: ConsolidatedStockItem[]; onCreate: (item: ConsolidatedStockItem) => void }) {
  return (
    <div>
      <SectionHeader title="Em estoque sem preço" subtitle="Produtos que aparecem no estoque físico consolidado, mas não aparecem na tabela de precificação." />
      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item.productName} className="grid gap-3 rounded-lg border border-white/[0.08] bg-black/15 p-3 lg:grid-cols-[minmax(220px,1.5fr)_150px_120px_120px_120px_120px_150px] lg:items-center">
            <ProductCell product={item.productName} group={item.group} />
            <Metric label="Total disponível" value={formatNumber(item.totalAvailable)} strong />
            <Metric label="São Gotardo" value={formatNumber(item.byUnit["São Gotardo"])} />
            <Metric label="Santa Juliana" value={formatNumber(item.byUnit["Santa Juliana"])} />
            <Metric label="Campos Altos" value={formatNumber(item.byUnit["Campos Altos"])} />
            <div><Badge tone="amber">Em estoque sem preço</Badge></div>
            <Button variant="ghost" onClick={() => onCreate(item)}><Plus size={15} />Criar preço</Button>
          </div>
        ))}
        {!items.length && <EmptyState text="Nenhum produto em estoque sem preço encontrado." />}
      </div>
    </div>
  );
}

function PricingHistory({ history }: { history: StockPricingHistory[] }) {
  return (
    <div className="mt-5">
      <SectionHeader title="Histórico da precificação" subtitle="Últimas tabelas de precificação confirmadas." compact />
      <div className="mt-3 grid gap-3">
        {history.slice(0, 5).map((entry) => (
          <div key={entry.id} className="grid gap-2 rounded-lg border border-white/[0.08] bg-black/15 p-3 md:grid-cols-4">
            <Metric label="Arquivo" value={entry.fileName} strong />
            <Metric label="Data/hora" value={formatDateTime(entry.importedAt)} />
            <Metric label="Produtos" value={String(entry.productCount)} />
            <Metric label="Alertas" value={String(entry.warningCount)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StockPricingReviewModal({ draft, onClose, onConfirm }: { draft: StockPricingImportDraft | null; onClose: () => void; onConfirm: () => void }) {
  if (!draft) return null;
  const missingSale = draft.products.filter((product) => !product.precoVenda).length;
  const missingCost = draft.products.filter((product) => !product.precoCusto).length;
  const missingDue = draft.products.filter((product) => !product.vencimento).length;
  const missingMargin = draft.products.filter((product) => !(product.margemFator ?? product.margem)).length;
  const complete = draft.products.length - draft.products.filter((product) => !product.precoVenda || !product.precoCusto).length;
  const warningCount = draft.importWarnings.filter((warning) => warning.severity !== "info").length;

  return (
    <Modal title="Conferir importação da Precificação do Estoque" open={!!draft} onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-8">
        <SummaryCard label="Arquivo" value={draft.fileName} />
        <SummaryCard label="Aba lida" value={draft.sourceSheetName} tone="green" />
        <SummaryCard label="Produtos encontrados" value={String(draft.products.length)} />
        <SummaryCard label="Colunas de prazo" value={String(draft.termColumns?.length || 0)} tone="green" />
        <SummaryCard label="Produtos completos" value={String(complete)} tone="green" />
        <SummaryCard label="Sem preço" value={String(missingSale)} tone={missingSale ? "amber" : "green"} />
        <SummaryCard label="Sem custo" value={String(missingCost)} tone={missingCost ? "amber" : "green"} />
        <SummaryCard label="Sem vencimento" value={String(missingDue)} tone={missingDue ? "amber" : "green"} />
        <SummaryCard label="Sem margem/fator" value={String(missingMargin)} tone={missingMargin ? "amber" : "green"} />
      </div>
      {!!draft.importWarnings.length && (
        <div className="mt-4 rounded-lg border border-padap-amber/20 bg-padap-amber/10 p-3 text-sm text-amber-100">
          <p className="font-semibold">Alertas encontrados: {warningCount}</p>
          <div className="mt-2 grid gap-1 text-xs">
            {draft.importWarnings.slice(0, 8).map((warning, index) => <p key={`${warning.type}-${index}`}>{warning.row ? `Linha ${warning.row}: ` : ""}{warning.message}</p>)}
          </div>
        </div>
      )}
      <div className="mt-5 grid max-h-[44vh] gap-3 overflow-auto pr-1">
        {draft.products.slice(0, 80).map((product) => (
          <div key={product.id} className="grid gap-3 rounded-lg border border-white/[0.08] bg-black/15 p-3 lg:grid-cols-[minmax(220px,1.5fr)_110px_130px_90px_100px_110px_90px_120px_150px] lg:items-center">
            <ProductCell product={product.produto} group={product.linha} />
            <Metric label="Fornecedor" value={product.fornecedor || "-"} />
            <Metric label="Embalagem" value={product.embalagem || "-"} />
            <Metric label="Custo" value={formatCurrency(product.precoCusto)} />
            <Metric label="Vencimento" value={formatShortDate(product.vencimento)} />
            <Metric label="Margem/Fator" value={formatFactor(product.margemFator ?? product.margem)} />
            <Metric label="Venda" value={formatCurrency(product.precoVenda)} strong />
            <div><Badge tone={product.precoVenda && product.precoCusto ? "green" : "amber"}>{product.precoVenda && product.precoCusto ? "Completo" : "Incompleto"}</Badge></div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={onClose}><X size={15} />Cancelar importação</Button>
        <Button onClick={onConfirm} disabled={!draft.products.length}><CheckCircle2 size={15} />Confirmar e salvar tabela</Button>
      </div>
    </Modal>
  );
}

function StockPricingProductModal({ product, onClose, onSave, onRemove }: {
  product: StockPricingProduct | null;
  onClose: () => void;
  onSave: (product: StockPricingProduct) => void;
  onRemove: (id: string) => void;
}) {
  const [form, setForm] = useState<StockPricingProduct | null>(product);

  useEffect(() => {
    setForm(product);
  }, [product]);

  if (!product || !form) return null;
  const terms = form.prazoPrices?.length ? form.prazoPrices : Object.entries(form.monthlyPrices || {}).map(([key, price]) => ({ key, label: key, price, formulaType: "calculated" as const, manuallyEdited: false }));
  const commercialMargin = form.precoVenda && form.precoCusto ? ((form.precoVenda - form.precoCusto) / form.precoVenda) * 100 : null;

  const update = <K extends keyof StockPricingProduct>(field: K, value: StockPricingProduct[K]) => {
    const next = { ...form, [field]: value };
    setForm(["precoCusto", "vencimento", "antecipacao", "juros", "margemFator", "divisorAjuste"].includes(String(field)) ? recalculateStockPricingProduct(next) : next);
  };
  const updateMonth = (key: string, value: number | null) => {
    const prazoPrices = terms.map((term) => term.key === key ? { ...term, price: value, formulaType: "manual" as const, manuallyEdited: true } : term);
    const monthlyPrices = prazoPrices.reduce<Record<string, number | null>>((acc, term) => {
      acc[term.key] = term.price;
      return acc;
    }, {});
    setForm({ ...form, prazoPrices, monthlyPrices });
  };

  return (
    <Modal title="Editar produto da precificação" open={!!product} onClose={onClose}>
      <SectionHeader title="Identificação" subtitle="Dados comerciais preservados da planilha APOIO." compact />
      <div className="grid gap-3 md:grid-cols-4">
        <Field label="Produto"><Input value={form.produto} onChange={(event) => update("produto", event.target.value)} /></Field>
        <Field label="Linha"><Input value={form.linha} onChange={(event) => update("linha", event.target.value)} /></Field>
        <Field label="Fornecedor"><Input value={form.fornecedor} onChange={(event) => update("fornecedor", event.target.value)} /></Field>
        <Field label="Embalagem"><Input value={form.embalagem} onChange={(event) => update("embalagem", event.target.value)} /></Field>
      </div>
      <div className="mt-4">
        <SectionHeader title="Base de cálculo" subtitle="Margem/Fator é divisor operacional da planilha; margem comercial é apenas referência." compact />
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <NullableNumberField label="Preço de custo" value={form.precoCusto} onChange={(value) => update("precoCusto", value)} />
        <Field label="Vencimento"><Input value={formatInputDate(form.vencimento)} type="date" onChange={(event) => update("vencimento", event.target.value ? new Date(`${event.target.value}T23:59:59`).toISOString() : null)} /></Field>
        <NullableNumberField label="Antecipação" value={form.antecipacao} onChange={(value) => update("antecipacao", value)} />
        <NullableNumberField label="Juros" value={form.juros} onChange={(value) => update("juros", value)} />
        <NullableNumberField label="Margem/Fator" value={form.margemFator ?? form.margem} onChange={(value) => update("margemFator", value)} />
        <NullableNumberField label="Divisor ajuste" value={form.divisorAjuste ?? 1} onChange={(value) => update("divisorAjuste", value || 1)} />
        <NullableNumberField label="Preço de venda" value={form.precoVenda} onChange={(value) => update("precoVenda", value)} />
        <Metric label="Margem comercial equivalente" value={commercialMargin === null ? "-" : formatPercent(commercialMargin)} strong />
      </div>
      {!!terms.length && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Prazos / Meses</p>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {terms.map((term) => <NullableNumberField key={term.key} label={`${term.label}${term.manuallyEdited ? " (manual)" : ""}`} value={term.price} onChange={(value) => updateMonth(term.key, value)} />)}
          </div>
        </div>
      )}
      <div className="mt-4">
        <Field label="Observação">
          <textarea value={form.observation || ""} onChange={(event) => update("observation", event.target.value)} className="min-h-24 w-full rounded-lg border border-white/10 bg-[#061314]/80 px-3.5 py-2.5 text-sm text-white outline-none focus:border-padap-green/70" />
        </Field>
      </div>
      <div className="mt-5 flex flex-wrap justify-between gap-2">
        <Button variant="danger" onClick={() => onRemove(form.id)}><Trash2 size={15} />Remover produto</Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={onClose}><X size={15} />Cancelar</Button>
          <Button onClick={() => onSave(form)}><Save size={15} />Salvar alterações</Button>
        </div>
      </div>
    </Modal>
  );
}

function NullableNumberField({ label, value, onChange }: { label: string; value: number | null; onChange: (value: number | null) => void }) {
  return <Field label={label}><Input type="number" step="0.01" value={value ?? ""} onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))} /></Field>;
}

function formatCurrency(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPercent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
}

function formatFactor(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

function formatShortDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

function formatInputDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function getDueStatus(value: string | null | undefined) {
  if (!value) return "sem_vencimento";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "ok";
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.ceil((date.getTime() - start) / 86400000);
  if (diffDays < 0) return "vencido";
  if (diffDays <= 7) return "vencimento_proximo";
  return "ok";
}

function ImportReviewModal({ draft, onClose, onConfirm, onUpdate, onRemove }: {
  draft: StockImportDraft | null;
  onClose: () => void;
  onConfirm: () => void;
  onUpdate: <K extends keyof StockItem>(id: string, field: K, value: StockItem[K]) => void;
  onRemove: (id: string) => void;
}) {
  if (!draft) return null;
  const products = draft.items.filter((item) => item.type === "product");
  const groups = draft.items.filter((item) => item.type === "group");
  const negative = products.filter((item) => item.availableStock < 0).length;
  const zero = products.filter((item) => item.availableStock === 0).length;
  const warningCount = draft.warnings.filter((warning) => warning.severity !== "info").length;

  return (
    <Modal title="Conferir importação de estoque" open={!!draft} onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        <SummaryCard label="Unidade" value={draft.unit} />
        <SummaryCard label="Arquivo" value={draft.fileName} />
        <SummaryCard label="Data/hora" value={formatDateTime(draft.readAt)} />
        <SummaryCard label="Linhas lidas" value={String(draft.items.length)} />
        <SummaryCard label="Produtos" value={String(products.length)} tone="green" />
        <SummaryCard label="Grupos" value={String(groups.length)} />
        <SummaryCard label="Possíveis erros" value={String(warningCount)} tone={warningCount ? "amber" : "green"} />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <SummaryCard label="Produtos negativos" value={String(negative)} tone={negative ? "red" : "green"} />
        <SummaryCard label="Produtos zerados" value={String(zero)} tone={zero ? "red" : "green"} />
      </div>

      {!!draft.warnings.length && (
        <div className="mt-4 rounded-lg border border-padap-amber/20 bg-padap-amber/10 p-3 text-sm text-amber-100">
          <p className="font-semibold">Linhas com aviso</p>
          <div className="mt-2 grid gap-1 text-xs">
            {draft.warnings.slice(0, 8).map((warning) => <p key={warning.id}>{warning.message}: {warning.line}</p>)}
          </div>
        </div>
      )}

      <div className="mt-5 grid max-h-[46vh] gap-3 overflow-auto pr-1">
        {draft.items.map((item) => (
          <StockEditableRow key={item.id} item={item} status={getStockStatus(item.availableStock)} onUpdate={onUpdate} onRemove={onRemove} />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={onClose}><X size={15} />Cancelar importação</Button>
        <Button onClick={onConfirm} disabled={!draft.items.length}><CheckCircle2 size={15} />Confirmar e salvar estoque</Button>
      </div>
    </Modal>
  );
}

function SummaryCard({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "green" | "amber" | "red" | "neutral" }) {
  const colors = {
    green: "text-padap-mint",
    amber: "text-amber-100",
    red: "text-red-200",
    neutral: "text-white"
  };
  return <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-3"><p className="text-xs text-slate-500">{label}</p><p className={`mt-1 truncate text-base font-semibold ${colors[tone]}`}>{value}</p></div>;
}

function SectionHeader({ title, subtitle, compact = false }: { title: string; subtitle: string; compact?: boolean }) {
  return (
    <div className={compact ? "" : "mb-4"}>
      <div className="flex items-center gap-2">
        <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
        <h2 className="text-base font-bold text-padap-ink">{title}</h2>
      </div>
      <p className="mt-1 pl-3 text-sm leading-6 text-padap-muted">{subtitle}</p>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${active ? "border-padap-green/30 bg-padap-green/10 text-padap-mint" : "border-white/10 bg-white/[0.035] text-slate-300 hover:bg-white/[0.06]"}`}>{children}</button>;
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.035] px-3 py-2"><span className="text-slate-500">{label}</span><strong className="text-right text-slate-100">{value}</strong></div>;
}

function ProductCell({ product, group }: { product: string; group: string }) {
  return <div><p className="text-sm font-semibold leading-5 text-white">{product}</p><p className="mt-1 text-xs text-slate-500">{group || "Sem grupo"}</p></div>;
}

function Metric({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div><p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p><p className={`mt-1 text-sm ${strong ? "font-semibold text-white" : "text-slate-200"}`}>{value}</p></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-slate-400"><span className="mb-1.5 block">{label}</span>{children}</label>;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <Field label={label}><Input type="number" step="0.01" value={value} onChange={(event) => onChange(Number(event.target.value))} /></Field>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-white/[0.12] bg-white/[0.025] p-6 text-center text-sm text-slate-400">{text}</div>;
}
