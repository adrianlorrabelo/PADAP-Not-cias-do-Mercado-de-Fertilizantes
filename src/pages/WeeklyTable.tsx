import { Eraser, History, PencilLine, Plus, RefreshCw, Save, Search, Trash2, Upload } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { usePagination } from "../hooks/usePagination";
import { Pagination } from "../components/ui/Pagination";
import { BarChartCard } from "../components/charts/BarChartCard";
import { DonutChartCard } from "../components/charts/DonutChartCard";
import { LineChartCard } from "../components/charts/LineChartCard";
import { ImportValidation } from "../components/business/ImportValidation";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { mockWeeklyTable } from "../data/mockProducts";
import { parseWeeklyTableFile } from "../services/excelImportService";
import { saveWeeklyTable } from "../services/weeklyTableService";
import type { Product, WeeklyTable, WeeklyTableImport, WeeklyTableLineDeviation, YaraPriceHistoryEntry } from "../types";
import { formatarMoedaBRL } from "../utils/currency";
import { formatDateTime } from "../utils/date";
import { notify, simulatedAction } from "../utils/uiActions";
import { useAuth } from "../hooks/useAuth";
import {
  createBlankProduct,
  createImportId,
  dateInputValue,
  defaultYaraLines,
  getCalculationWarnings,
  getLineDeviations,
  getListStatus,
  getVisibleFinalPrice,
  getVisibleFinalPriceTitle,
  getWeeklyAvailableDeviations,
  hasValidImportParameters,
  historyStorageKey,
  mergeHistory,
  normalizeText,
  normalizeWeeklyTable,
  numberValue,
  numberInputValue,
  recalculateProducts,
  refreshImportedWithParameters,
  tableStorageKey,
} from "./weeklyTableUtils";
import { Cell, DeviationCard, EmptyProductsState, Field, IconButton, InlineInput, SummaryTile } from "./WeeklyTablePrimitives";
import { ApplyCalculatedPriceModal, EditProductModal, RemoveDeviationModal, RemoveListModal, ReplaceListModal } from "./WeeklyTableModals";

type Filters = {
  search: string;
  group: string;
  characteristic: string;
  packaging: string;
  availability: string;
};

type HistoryFilters = {
  search: string;
  group: string;
  dateFrom: string;
  dateTo: string;
};

export default function WeeklyTablePage() {
  const { user } = useAuth();
  const [table, setTable] = useState<WeeklyTable>(() => {
    try {
      return normalizeWeeklyTable(JSON.parse(localStorage.getItem(tableStorageKey) || "null") || mockWeeklyTable);
    } catch {
      return normalizeWeeklyTable(mockWeeklyTable);
    }
  });
  const [history, setHistory] = useState<YaraPriceHistoryEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(historyStorageKey) || "[]");
    } catch {
      return [];
    }
  });
  const [imported, setImported] = useState<WeeklyTableImport | null>(null);
  const [filters, setFilters] = useState<Filters>({ search: "", group: "", characteristic: "", packaging: "", availability: "" });
  const [historyFilters, setHistoryFilters] = useState<HistoryFilters>({ search: "", group: "", dateFrom: "", dateTo: "" });
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(true);
  const [showRemoveListModal, setShowRemoveListModal] = useState(false);
  const [showReplaceListModal, setShowReplaceListModal] = useState(false);
  const [clearParametersOnRemove, setClearParametersOnRemove] = useState(false);
  const [clearDeviationsOnRemove, setClearDeviationsOnRemove] = useState(false);
  const [pendingImportMode, setPendingImportMode] = useState<"normal" | "replace">("normal");
  const [deviationToRemoveIndex, setDeviationToRemoveIndex] = useState<number | null>(null);
  const [applyCalculatedProductId, setApplyCalculatedProductId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const lineDeviations = useMemo(() => getLineDeviations(table), [table]);
  const weeklyAvailableDeviations = useMemo(() => getWeeklyAvailableDeviations(table), [table]);
  const hasProducts = table.products.length > 0;

  const options = useMemo(() => ({
    groups: Array.from(new Set(table.products.map((p) => p.group).filter(Boolean))).sort(),
    characteristics: Array.from(new Set(table.products.map((p) => p.characteristic).filter(Boolean))).sort(),
    packaging: Array.from(new Set(table.products.map((p) => p.packaging).filter(Boolean))).sort()
  }), [table.products]);

  const filteredProducts = useMemo(() => {
    const search = normalizeText(filters.search);
    return table.products.filter((product) => {
      const haystack = normalizeText([product.code, product.group, product.description, product.reference, product.characteristic, product.packaging].join(" "));
      const matchesSearch = !search || haystack.includes(search);
      const matchesGroup = !filters.group || product.group === filters.group;
      const matchesCharacteristic = !filters.characteristic || product.characteristic === filters.characteristic;
      const matchesPackaging = !filters.packaging || product.packaging === filters.packaging;
      const matchesAvailability = !filters.availability || (filters.availability === "available" ? product.available : !product.available);
      return matchesSearch && matchesGroup && matchesCharacteristic && matchesPackaging && matchesAvailability;
    });
  }, [filters, table.products]);

  const PRODUCTS_PAGE_SIZE = 50;
  const { page: productsPage, setPage: setProductsPage, totalPages: productsTotalPages, paged: pagedProducts } = usePagination(filteredProducts, PRODUCTS_PAGE_SIZE);

  const selectedHistory = useMemo(() => {
    const search = normalizeText(historyFilters.search);
    const from = historyFilters.dateFrom ? new Date(`${historyFilters.dateFrom}T00:00:00`).getTime() : 0;
    const to = historyFilters.dateTo ? new Date(`${historyFilters.dateTo}T23:59:59`).getTime() : Number.POSITIVE_INFINITY;
    return history.filter((entry) => {
      const importedAt = new Date(entry.importedAt).getTime();
      const matchesSearch = !search || normalizeText(`${entry.fileName || ""} ${entry.productCode} ${entry.productDescription} ${entry.group} ${entry.packaging} ${entry.importedBy || ""} ${entry.status || ""}`).includes(search);
      const matchesGroup = !historyFilters.group || entry.group === historyFilters.group;
      const matchesDate = importedAt >= from && importedAt <= to;
      return matchesSearch && matchesGroup && matchesDate;
    }).slice(0, 80);
  }, [history, historyFilters]);

  const topProducts = useMemo(() => [...table.products].sort((a, b) => getVisibleFinalPrice(b) - getVisibleFinalPrice(a)).slice(0, 5), [table.products]);
  const editingProduct = table.products.find((p) => p.id === editingProductId) || null;
  const applyingCalculatedProduct = table.products.find((p) => p.id === applyCalculatedProductId) || null;
  const editingProductCalculationWarnings = editingProduct ? getCalculationWarnings(editingProduct, table) : [];
  const listStatus = getListStatus(table.expiresAt);

  const ptaxHistory = useMemo(() => {
    const byTable = new Map<string, YaraPriceHistoryEntry>();
    history.forEach((entry) => { if (!byTable.has(entry.tableId)) byTable.set(entry.tableId, entry); });
    return Array.from(byTable.values())
      .sort((a, b) => new Date(a.importedAt).getTime() - new Date(b.importedAt).getTime())
      .slice(-8)
      .map((entry) => ({ label: new Date(entry.importedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), value: entry.ptax }));
  }, [history]);

  function persist(next: WeeklyTable) {
    const updatedAt = new Date().toISOString();
    const recalculated = { ...next, updatedAt, products: recalculateProducts(next) };
    setTable(recalculated);
    saveWeeklyTable(recalculated);
  }

  function persistDeviations(nextLineDeviations: WeeklyTableLineDeviation[], nextWeeklyDeviations = table.weeklyAvailableDeviations) {
    const next = { ...table, updatedAt: new Date().toISOString(), lineDeviations: nextLineDeviations, weeklyAvailableDeviations: nextWeeklyDeviations };
    setTable(next);
    saveWeeklyTable(next);
  }

  function openFilePicker(mode: "normal" | "replace" = "normal") {
    setPendingImportMode(mode);
    if (fileInputRef.current) fileInputRef.current.value = "";
    fileInputRef.current?.click();
  }

  function requestImportList() {
    if (hasProducts) { requestReplaceList(); return; }
    openFilePicker("normal");
  }

  async function onFile(file?: File) {
    if (!file) return;
    try {
      setImported(refreshImportedWithParameters(await parseWeeklyTableFile(file)));
    } catch {
      notify("Nao foi possivel importar a planilha. Feche o arquivo no Excel ou aguarde a sincronizacao do OneDrive e tente novamente.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function updateImportedParameter<K extends keyof Pick<WeeklyTableImport, "expiresAt" | "ptax" | "freight" | "icms" | "marginIcms">>(key: K, value: WeeklyTableImport[K]) {
    setImported((current) => current ? refreshImportedWithParameters({ ...current, [key]: value }) : current);
  }

  function confirmImport() {
    if (!imported) return;
    const checkedImport = refreshImportedWithParameters(imported);
    if (!hasValidImportParameters(checkedImport)) {
      setImported(checkedImport);
      notify("Existem parametros comerciais vazios ou invalidos. Confira antes de salvar.");
      return;
    }
    const preservingCurrentListSettings = pendingImportMode === "replace";
    const importedAt = new Date().toISOString();
    const next: WeeklyTable = {
      id: createImportId(imported.fileName),
      supplier: imported.supplier,
      fileName: imported.fileName,
      sourceSheetName: imported.sourceSheetName,
      listCode: imported.listCode,
      listName: imported.listName,
      lineDeviations: preservingCurrentListSettings ? lineDeviations : imported.lineDeviations,
      weeklyAvailableDeviations: preservingCurrentListSettings ? weeklyAvailableDeviations : imported.weeklyAvailableDeviations,
      importWarnings: checkedImport.importWarnings,
      expiresAt: checkedImport.expiresAt || "",
      ptax: checkedImport.ptax || 0,
      freight: checkedImport.freight ?? 0,
      icms: checkedImport.icms || 0,
      marginIcms: checkedImport.marginIcms || 0,
      products: checkedImport.products,
      importedAt,
      updatedAt: importedAt,
      importedBy: user?.name || "Sistema",
      active: true
    };
    const recalculated = { ...next, products: recalculateProducts(next) };
    const nextHistory = mergeHistory(history, recalculated);
    setTable(recalculated);
    setHistory(nextHistory);
    saveWeeklyTable(recalculated);
    localStorage.setItem(historyStorageKey, JSON.stringify(nextHistory));
    setImported(null);
    setPendingImportMode("normal");
  }

  function saveSnapshot() {
    const nextHistory = mergeHistory(history, table);
    setHistory(nextHistory);
    localStorage.setItem(historyStorageKey, JSON.stringify(nextHistory));
    simulatedAction("Historico de precos Yara atualizado.");
  }

  function updateTableField<K extends keyof WeeklyTable>(key: K, value: WeeklyTable[K]) {
    persist({ ...table, [key]: value });
  }

  function updateProduct(id: string, patch: Partial<Product>) {
    persist({ ...table, products: table.products.map((p) => p.id === id ? { ...p, ...patch } : p) });
  }

  function requestApplyCalculatedPrice(product: Product) {
    if (!product.calculatedFinalPrice || product.calculatedFinalPrice <= 0) return;
    setApplyCalculatedProductId(product.id);
  }

  function confirmApplyCalculatedPrice() {
    if (!applyingCalculatedProduct?.calculatedFinalPrice || applyingCalculatedProduct.calculatedFinalPrice <= 0) return;
    updateProduct(applyingCalculatedProduct.id, { finalPrice: applyingCalculatedProduct.calculatedFinalPrice });
    setApplyCalculatedProductId(null);
    notify("Preco calculado aplicado ao produto.");
  }

  function updateDeviationName(index: number, line: string) {
    persistDeviations(lineDeviations.map((item, i) => i === index ? { ...item, line } : item));
  }

  function updateDeviationValue(index: number, deviation: number) {
    persistDeviations(lineDeviations.map((item, i) => i === index ? { ...item, deviation } : item));
  }

  function addDeviationLine() {
    persistDeviations([...lineDeviations, { line: "Nova linha", deviation: 0 }]);
  }

  function duplicateDeviationLine(index: number) {
    const item = lineDeviations[index];
    if (!item) return;
    const next = [...lineDeviations.slice(0, index + 1), { ...item, line: `${item.line || "Nova linha"} cópia` }, ...lineDeviations.slice(index + 1)];
    persistDeviations(next);
  }

  function confirmRemoveDeviationLine() {
    if (deviationToRemoveIndex === null) return;
    persistDeviations(lineDeviations.filter((_, i) => i !== deviationToRemoveIndex));
    setDeviationToRemoveIndex(null);
  }

  function saveParameters() {
    persist(table);
    simulatedAction("Parâmetros da lista salvos com sucesso.");
  }

  function confirmParametersOnEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.currentTarget.blur();
    saveParameters();
  }

  function saveDeviations() {
    const hasEmptyLine = lineDeviations.some((item) => !item.line.trim());
    if (hasEmptyLine) { notify("Informe o nome da linha de produto."); return; }
    const names = lineDeviations.map((item) => normalizeText(item.line)).filter(Boolean);
    const hasDuplicate = names.some((name, index) => names.indexOf(name) !== index);
    if (hasDuplicate) notify("Já existe uma linha com esse nome.");
    persistDeviations(lineDeviations, weeklyAvailableDeviations);
    simulatedAction("Desvios semanais salvos com sucesso.");
  }

  function clearPricingParameters() {
    if (!window.confirm("Limpar vencimento, codigo, nome, PTAX, frete, ICMS e margem + ICMS? Produtos e desvios serao mantidos.")) return;
    persist({ ...table, expiresAt: "", listCode: "", listName: "", ptax: 0, freight: 0, icms: 0, marginIcms: 0 });
    simulatedAction("Parametros de precificacao limpos.");
  }

  function clearDeviations() {
    if (!window.confirm("Tem certeza que deseja zerar os desvios semanais?")) return;
    const cleared = lineDeviations.map((item) => ({ ...item, deviation: 0 }));
    persistDeviations(cleared, cleared);
    simulatedAction("Desvios semanais zerados com sucesso.");
  }

  function removeCurrentList() {
    const clearedDeviations = defaultYaraLines.map((line) => ({ line, deviation: 0 }));
    persist({
      ...table,
      active: false,
      listCode: "",
      listName: "",
      products: [],
      ...(clearParametersOnRemove ? { expiresAt: "", ptax: 0, freight: 0, icms: 0, marginIcms: 0 } : {}),
      ...(clearDeviationsOnRemove ? { lineDeviations: clearedDeviations, weeklyAvailableDeviations: clearedDeviations } : {})
    });
    setFilters({ search: "", group: "", characteristic: "", packaging: "", availability: "" });
    setEditingProductId(null);
    setImported(null);
    setShowRemoveListModal(false);
    notify("Lista atual removida. Parâmetros comerciais, desvios e histórico foram mantidos conforme sua seleção.");
  }

  function requestReplaceList() {
    if (!hasProducts) { openFilePicker("normal"); return; }
    setShowReplaceListModal(true);
  }

  function confirmReplaceList() {
    setShowReplaceListModal(false);
    setImported(null);
    openFilePicker("replace");
  }

  function addProduct() {
    const product = createBlankProduct();
    persist({ ...table, products: [product, ...table.products] });
    setEditingProductId(product.id);
  }

  function removeProduct(id: string) {
    if (editingProductId === id) setEditingProductId(null);
    persist({ ...table, products: table.products.filter((p) => p.id !== id) });
  }

  return (
    <div>
      <div className="page-title">
        <h1>Lista Yara</h1>
        <p>Planilha semanal dentro do sistema, com edicao, calculo automatico e historico anual de precos.</p>
      </div>

      <Card>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={hasProducts ? "green" : "amber"}>{hasProducts ? "Tabela ativa" : "Sem lista"}</Badge>
              <Badge tone="cyan">{table.products.length} produtos</Badge>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {hasProducts
                ? `Fornecedor: ${table.supplier} | Importada por ${table.importedBy} em ${formatDateTime(table.importedAt)}`
                : "Nenhuma lista carregada. Importe uma planilha para preencher os produtos da semana."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={requestImportList}><Upload size={16} />Importar planilha</Button>
            <Button variant="ghost" onClick={requestReplaceList}><RefreshCw size={16} />Substituir lista</Button>
            <Button variant="danger" onClick={() => { setClearParametersOnRemove(false); setClearDeviationsOnRemove(false); setShowRemoveListModal(true); }} disabled={!hasProducts}><Trash2 size={16} />Remover lista atual</Button>
            <Button variant="ghost" onClick={saveSnapshot}><History size={16} />Salvar no historico</Button>
            <Button variant="ghost" onClick={() => setShowHistory((v) => !v)}><RefreshCw size={16} />Historico</Button>
            <input ref={fileInputRef} className="hidden" type="file" accept=".xlsx,.xls,.csv" onChange={(event) => onFile(event.target.files?.[0])} />
          </div>
        </div>
      </Card>

      {imported && (
        <div className="mt-6">
          <ImportValidation
            imported={imported}
            previousParameters={{ expiresAt: table.expiresAt, ptax: table.ptax, freight: table.freight, icms: table.icms, marginIcms: table.marginIcms }}
            onParameterChange={updateImportedParameter}
            onConfirm={confirmImport}
            onCancel={() => { setImported(null); setPendingImportMode("normal"); }}
          />
        </div>
      )}

      {/* Desvios semanais */}
      <section className="mt-6 rounded-xl border border-white/[0.08] bg-padap-panel p-3 shadow-panel md:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
                <h2 className="text-base font-bold text-padap-ink">Desvios semanais</h2>
              </div>
              <Badge tone="cyan">{lineDeviations.length} linhas</Badge>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">Referência visual da semana. Não altera o preço final dos produtos.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="min-h-9 px-3 py-1.5 text-xs" variant="ghost" onClick={addDeviationLine}><Plus size={14} />Adicionar linha</Button>
            <Button className="min-h-9 px-3 py-1.5 text-xs" onClick={saveDeviations}><Save size={14} />Salvar desvios</Button>
            <Button className="min-h-9 px-3 py-1.5 text-xs" variant="ghost" onClick={clearDeviations}><Eraser size={14} />Limpar desvios</Button>
          </div>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2 2xl:grid-cols-3">
          {lineDeviations.map((item, index) => (
            <DeviationCard
              key={`${item.line}-${index}`}
              item={item}
              onNameChange={(value) => updateDeviationName(index, value)}
              onDeviationChange={(value) => updateDeviationValue(index, numberValue(value))}
              onDuplicate={() => duplicateDeviationLine(index)}
              onRemove={() => setDeviationToRemoveIndex(index)}
            />
          ))}
        </div>
      </section>

      {/* Parâmetros comerciais */}
      <section className="mt-6 rounded-xl border border-white/[0.08] bg-padap-panel p-4 shadow-panel md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
                <h2 className="text-base font-bold text-padap-ink">Parâmetros comerciais</h2>
              </div>
              <Badge tone={listStatus.tone}>{listStatus.label}</Badge>
            </div>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">Base usada no cálculo do preço final da lista semanal.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={saveParameters}><Save size={16} />Salvar parâmetros</Button>
            <Button variant="ghost" onClick={clearPricingParameters}><Eraser size={16} />Limpar campos</Button>
          </div>
        </div>
        <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Field label="Vencimento da lista">
            <input type="date" className="h-9 w-full rounded-lg border border-padap-line bg-white px-3 py-2 text-xs text-padap-ink outline-none focus:border-padap-green" value={dateInputValue(table.expiresAt)} onChange={(event) => updateTableField("expiresAt", event.target.value ? new Date(`${event.target.value}T23:59:59`).toISOString() : "")} onKeyDown={confirmParametersOnEnter} />
          </Field>
          <Field label="PTAX"><input type="number" step="0.01" className="h-9 w-full rounded-lg border border-padap-line bg-white px-3 py-2 text-xs text-padap-ink outline-none focus:border-padap-green" value={numberInputValue(table.ptax)} onChange={(event) => updateTableField("ptax", numberValue(event.target.value))} onKeyDown={confirmParametersOnEnter} /></Field>
          <Field label="Frete"><input type="number" step="0.01" className="h-9 w-full rounded-lg border border-padap-line bg-white px-3 py-2 text-xs text-padap-ink outline-none focus:border-padap-green" value={numberInputValue(table.freight)} onChange={(event) => updateTableField("freight", numberValue(event.target.value))} onKeyDown={confirmParametersOnEnter} /></Field>
          <Field label="ICMS"><input type="number" step="0.01" className="h-9 w-full rounded-lg border border-padap-line bg-white px-3 py-2 text-xs text-padap-ink outline-none focus:border-padap-green" value={numberInputValue(table.icms)} onChange={(event) => updateTableField("icms", numberValue(event.target.value))} onKeyDown={confirmParametersOnEnter} /></Field>
          <Field label="Margem + ICMS"><input type="number" step="0.01" className="h-9 w-full rounded-lg border border-padap-line bg-white px-3 py-2 text-xs text-padap-ink outline-none focus:border-padap-green" value={table.marginIcms} onChange={(event) => updateTableField("marginIcms", numberValue(event.target.value))} onKeyDown={confirmParametersOnEnter} /></Field>
        </div>
      </section>

      {/* Produtos da semana */}
      <section className="mt-6 min-w-0 overflow-hidden rounded-xl border border-white/[0.08] bg-[#061314]/70">
        <div className="border-b border-white/[0.08] p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
                <h2 className="text-base font-bold text-padap-ink">Produtos da semana</h2>
              </div>
              <p className="mt-1 text-xs text-slate-400">Lista compacta para consulta diaria. Os campos completos ficam em Editar detalhes.</p>
            </div>
            <Button onClick={addProduct} className="shrink-0"><Plus size={16} />Adicionar produto</Button>
          </div>
          {hasProducts && (
            <div className="mt-4 grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-[minmax(280px,1fr)_150px_150px_150px_140px]">
              <Field label="Buscar" className="sm:col-span-2 lg:col-span-1"><Input className="h-9 px-3 py-2 text-xs" value={filters.search} onChange={(event) => setFilters((c) => ({ ...c, search: event.target.value }))} placeholder="Codigo, produto, grupo..." /></Field>
              <Field label="Grupo"><Select value={filters.group} onChange={(event) => setFilters((c) => ({ ...c, group: event.target.value }))}><option value="">Todos</option>{options.groups.map((item) => <option key={item} value={item}>{item}</option>)}</Select></Field>
              <Field label="Caracteristica"><Select value={filters.characteristic} onChange={(event) => setFilters((c) => ({ ...c, characteristic: event.target.value }))}><option value="">Todas</option>{options.characteristics.map((item) => <option key={item} value={item}>{item}</option>)}</Select></Field>
              <Field label="Embalagem"><Select value={filters.packaging} onChange={(event) => setFilters((c) => ({ ...c, packaging: event.target.value }))}><option value="">Todas</option>{options.packaging.map((item) => <option key={item} value={item}>{item}</option>)}</Select></Field>
              <Field label="Status"><Select value={filters.availability} onChange={(event) => setFilters((c) => ({ ...c, availability: event.target.value }))}><option value="">Todos</option><option value="available">Disponivel</option><option value="unavailable">Indisponivel</option></Select></Field>
            </div>
          )}
        </div>

        {hasProducts ? (
          <>
            {/* Desktop */}
            <div className="hidden w-full overflow-hidden lg:block">
              <table className="w-full table-fixed text-left text-[11px]">
                <colgroup>
                  <col className="w-[8%]" /><col className="w-[22%]" /><col className="w-[11%]" /><col className="w-[13%]" /><col className="w-[11%]" /><col className="w-[9%]" /><col className="w-[10%]" /><col className="w-[8%]" /><col className="w-[8%]" />
                </colgroup>
                <thead className="border-b border-white/[0.08] bg-white/[0.035] uppercase tracking-[0.08em] text-slate-500">
                  <tr>{["Codigo", "Produto", "Grupo", "Referencia", "Embalagem", "Desvio", "Preco final", "Status", "Acoes"].map((h) => <th key={h} className="px-2 py-2.5 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {pagedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-padap-green/[0.035]">
                      <Cell><InlineInput value={product.code} onChange={(value) => updateProduct(product.id, { code: value })} /></Cell>
                      <Cell><InlineInput value={product.description} onChange={(value) => updateProduct(product.id, { description: value })} title={product.description} /></Cell>
                      <Cell><InlineInput value={product.group} onChange={(value) => updateProduct(product.id, { group: value })} title={product.group} /></Cell>
                      <Cell><InlineInput value={product.reference} onChange={(value) => updateProduct(product.id, { reference: value })} title={product.reference} /></Cell>
                      <Cell><InlineInput value={product.packaging} onChange={(value) => updateProduct(product.id, { packaging: value })} title={product.packaging} /></Cell>
                      <Cell><InlineInput type="number" value={product.desvioPrecificacao || 0} onChange={(value) => updateProduct(product.id, { desvioPrecificacao: numberValue(value) })} onConfirm={() => simulatedAction("Desvio confirmado.")} title="Desvio de precificacao" className="text-right font-semibold text-padap-mint" /></Cell>
                      <td className="truncate px-2 py-2 font-semibold text-white" title={getVisibleFinalPriceTitle(product)}>{formatarMoedaBRL(getVisibleFinalPrice(product))}</td>
                      <td className="px-2 py-2"><button type="button" className="max-w-full" onClick={() => updateProduct(product.id, { available: !product.available })}><Badge tone={product.available ? "green" : "red"}>{product.available ? "Disp." : "Indisp."}</Badge></button></td>
                      <td className="px-2 py-2">
                        <div className="flex items-center justify-end gap-1">
                          <IconButton label="Editar detalhes" onClick={() => setEditingProductId(product.id)}><PencilLine size={13} /></IconButton>
                          <IconButton label="Excluir produto" danger onClick={() => removeProduct(product.id)}><Trash2 size={13} /></IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filteredProducts.length && <tr><td colSpan={9} className="px-3 py-8 text-center text-slate-500"><Search className="mx-auto mb-2" size={16} />Nenhum produto encontrado.</td></tr>}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="grid gap-3 p-3 lg:hidden">
              {pagedProducts.map((product) => (
                <div key={product.id} className="rounded-lg border border-white/[0.08] bg-black/15 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white" title={product.description}>{product.description || "Produto sem descricao"}</p>
                      <p className="mt-1 text-xs text-slate-400">{product.code || "Sem codigo"} · {product.group || "Sem grupo"}</p>
                    </div>
                    <button type="button" onClick={() => updateProduct(product.id, { available: !product.available })}>
                      <Badge tone={product.available ? "green" : "red"}>{product.available ? "Disponivel" : "Indisponivel"}</Badge>
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <SummaryTile label="Referencia" value={product.reference || "-"} />
                    <SummaryTile label="Embalagem" value={product.packaging || "-"} />
                    <SummaryTile label="Desvio" value={formatarMoedaBRL(product.desvioPrecificacao || 0)} />
                    <SummaryTile label="Preco final" value={formatarMoedaBRL(getVisibleFinalPrice(product))} title={getVisibleFinalPriceTitle(product)} strong />
                    <SummaryTile label="Caracteristica" value={product.characteristic || "-"} />
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    <Button variant="ghost" className="min-h-9 flex-1 px-2 text-xs" onClick={() => setEditingProductId(product.id)}><PencilLine size={14} />Editar detalhes</Button>
                    <IconButton label="Excluir produto" danger onClick={() => removeProduct(product.id)}><Trash2 size={14} /></IconButton>
                  </div>
                </div>
              ))}
              {!filteredProducts.length && <div className="rounded-lg border border-white/[0.08] py-8 text-center text-sm text-slate-500"><Search className="mx-auto mb-2" size={16} />Nenhum produto encontrado.</div>}
            </div>

            <div className="px-4 pb-2">
              <Pagination page={productsPage} totalPages={productsTotalPages} total={filteredProducts.length} pageSize={PRODUCTS_PAGE_SIZE} onPageChange={setProductsPage} />
            </div>
          </>
        ) : (
          <EmptyProductsState onImport={openFilePicker} />
        )}
      </section>

      {/* Modais */}
      <RemoveListModal
        open={showRemoveListModal}
        clearParameters={clearParametersOnRemove}
        clearDeviations={clearDeviationsOnRemove}
        onClearParametersChange={setClearParametersOnRemove}
        onClearDeviationsChange={setClearDeviationsOnRemove}
        onClose={() => setShowRemoveListModal(false)}
        onConfirm={removeCurrentList}
      />
      <ReplaceListModal open={showReplaceListModal} onClose={() => setShowReplaceListModal(false)} onConfirm={confirmReplaceList} />
      <RemoveDeviationModal open={deviationToRemoveIndex !== null} onClose={() => setDeviationToRemoveIndex(null)} onConfirm={confirmRemoveDeviationLine} />
      <ApplyCalculatedPriceModal product={applyingCalculatedProduct} onClose={() => setApplyCalculatedProductId(null)} onConfirm={confirmApplyCalculatedPrice} />
      <EditProductModal
        product={editingProduct}
        table={table}
        calculationWarnings={editingProductCalculationWarnings}
        onUpdate={updateProduct}
        onRequestApplyCalculated={requestApplyCalculatedPrice}
        onClose={() => setEditingProductId(null)}
      />

      {/* Gráficos */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <LineChartCard title="Evolucao do PTAX" data={ptaxHistory.length ? ptaxHistory : [{ label: "Atual", value: table.ptax }]} />
        <BarChartCard title="Top produtos mais caros" data={topProducts.map((p) => ({ label: p.description.split(" ")[0] || p.code, value: getVisibleFinalPrice(p) }))} />
        <DonutChartCard title="Disponiveis x indisponiveis" data={[{ label: "Disponiveis", value: table.products.filter((p) => p.available).length, color: "#1dba2c" }, { label: "Indisponiveis", value: table.products.filter((p) => !p.available).length, color: "#ef4444" }]} />
      </div>

      {/* Histórico de preços */}
      {showHistory && (
        <section className="mt-6 rounded-xl border border-white/[0.08] bg-[#071918]/80 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-4 w-1 rounded-full bg-padap-green" />
                <h2 className="text-base font-bold text-padap-ink">Historico de precos Yara</h2>
              </div>
              <p className="mt-1 pl-3 text-xs text-padap-muted">Base anual para acompanhar evolucao por produto, importacao e vencimento.</p>
            </div>
            <Badge tone="cyan">{history.length} registros</Badge>
          </div>
          <div className="mb-4 grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_220px_180px_180px]">
            <Field label="Produto ou codigo"><Input value={historyFilters.search} onChange={(event) => setHistoryFilters((c) => ({ ...c, search: event.target.value }))} placeholder="Buscar no historico" /></Field>
            <Field label="Grupo">
              <Select value={historyFilters.group} onChange={(event) => setHistoryFilters((c) => ({ ...c, group: event.target.value }))}>
                <option value="">Todos</option>
                {options.groups.map((item) => <option key={item} value={item}>{item}</option>)}
              </Select>
            </Field>
            <Field label="Data inicial"><Input type="date" value={historyFilters.dateFrom} onChange={(event) => setHistoryFilters((c) => ({ ...c, dateFrom: event.target.value }))} /></Field>
            <Field label="Data final"><Input type="date" value={historyFilters.dateTo} onChange={(event) => setHistoryFilters((c) => ({ ...c, dateTo: event.target.value }))} /></Field>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[1480px] text-left text-sm">
              <thead className="border-b border-white/[0.08] text-xs uppercase tracking-[0.1em] text-slate-500">
                <tr>{["Arquivo", "Importacao", "Qtd.", "Status", "Usuario", "Vencimento", "PTAX", "Frete", "ICMS", "Margem + ICMS", "Codigo", "Produto", "Grupo", "Revenda", "Desconto", "Preco final"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {selectedHistory.map((entry) => (
                  <tr key={entry.id}>
                    <td className="max-w-56 truncate px-3 py-2 text-slate-200" title={entry.fileName || "Arquivo nao informado"}>{entry.fileName || "Arquivo nao informado"}</td>
                    <td className="px-3 py-2 text-slate-400">{formatDateTime(entry.importedAt)}</td>
                    <td className="px-3 py-2 text-slate-300">{entry.productCount ?? "-"}</td>
                    <td className="px-3 py-2 text-slate-300">{entry.status || "-"}</td>
                    <td className="px-3 py-2 text-slate-300">{entry.importedBy || "-"}</td>
                    <td className="px-3 py-2 text-slate-300">{new Date(entry.expiresAt).toLocaleDateString("pt-BR")}</td>
                    <td className="px-3 py-2 text-slate-300">{entry.ptax.toFixed(4)}</td>
                    <td className="px-3 py-2 text-slate-300">{formatarMoedaBRL(entry.freight)}</td>
                    <td className="px-3 py-2 text-slate-300">{entry.icms.toLocaleString("pt-BR", { maximumFractionDigits: 4 })}</td>
                    <td className="px-3 py-2 text-slate-300">{entry.marginIcms.toLocaleString("pt-BR", { maximumFractionDigits: 4 })}</td>
                    <td className="px-3 py-2 text-slate-200">{entry.productCode}</td>
                    <td className="max-w-72 truncate px-3 py-2 text-slate-200" title={entry.productDescription}>{entry.productDescription}</td>
                    <td className="px-3 py-2 text-slate-300">{entry.group}</td>
                    <td className="px-3 py-2 text-slate-300">{formatarMoedaBRL(entry.resellerPrice)}</td>
                    <td className="px-3 py-2 text-slate-300">{formatarMoedaBRL(entry.discount)}</td>
                    <td className="px-3 py-2 font-semibold text-white">{formatarMoedaBRL(entry.finalPrice)}</td>
                  </tr>
                ))}
                {!selectedHistory.length && <tr><td colSpan={16} className="px-3 py-8 text-center text-slate-500">Nenhum historico salvo ainda.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
