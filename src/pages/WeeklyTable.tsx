import { Copy, Eraser, History, PencilLine, Plus, RefreshCw, Save, Search, Trash2, Upload } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { BarChartCard } from "../components/charts/BarChartCard";
import { DonutChartCard } from "../components/charts/DonutChartCard";
import { LineChartCard } from "../components/charts/LineChartCard";
import { ImportValidation } from "../components/business/ImportValidation";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Select } from "../components/ui/Select";
import { mockWeeklyTable } from "../data/mockProducts";
import { calculateWeeklyFinalPrice, parseWeeklyTableFile } from "../services/excelImportService";
import type { ImportWarning, Product, WeeklyTable, WeeklyTableImport, WeeklyTableLineDeviation, YaraPriceHistoryEntry } from "../types";
import { formatarMoedaBRL } from "../utils/currency";
import { formatDateTime } from "../utils/date";
import { notify, simulatedAction } from "../utils/uiActions";
import { useAuth } from "../hooks/useAuth";

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

const tableStorageKey = "padap.weeklyTable.active";
const historyStorageKey = "padap.yaraPriceHistory";
const defaultYaraLines = [
  "YaraTera Krista",
  "YaraTera Calcinit",
  "YaraRega",
  "YaraMila Triples",
  "YaraMila High N",
  "YaraLiva",
  "YaraBela",
  "YaraBasa",
  "YaraBasa Full",
  "Packed Straights",
  "Differentiated Procote",
  "Bulk Straights",
  "Blends"
];

function todayIsoDate() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function dateInputValue(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function numberValue(value: string) {
  return Number(value.replace(",", ".")) || 0;
}

function numberInputValue(value: number | null | undefined) {
  if (!value || !Number.isFinite(value)) return "";
  return value;
}

function createImportId(fileName?: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  const normalizedFileName = (fileName || "lista-yara").replace(/[^a-zA-Z0-9.-]+/g, "-");
  return `${Date.now()}-${normalizedFileName}`;
}

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

function getListStatus(expiresAt: string): { label: string; tone: "green" | "amber" | "red" } {
  const expiration = new Date(expiresAt);
  if (!expiresAt || Number.isNaN(expiration.getTime())) return { label: "Lista vencida", tone: "red" };
  const today = new Date(`${todayIsoDate()}T00:00:00`);
  const expirationDay = new Date(expiration);
  expirationDay.setHours(0, 0, 0, 0);
  const daysToExpire = Math.ceil((expirationDay.getTime() - today.getTime()) / 86400000);
  if (daysToExpire < 0) return { label: "Lista vencida", tone: "red" };
  if (daysToExpire <= 3) return { label: "Vencendo", tone: "amber" };
  return { label: "Lista válida", tone: "green" };
}

function recalculateProducts(table: WeeklyTable, products = table.products) {
  return products.map((product) => {
    const desvioPrecificacao = product.desvioPrecificacao || 0;
    const calculatedFinalPrice = calculateWeeklyFinalPrice({
      revenda: product.resellerPrice,
      desvioPrecificacao,
      ptax: table.ptax,
      frete: table.freight,
      icms: table.icms,
      margemIcms: table.marginIcms
    });
    const finalPrice = Number.isFinite(product.finalPrice) ? product.finalPrice : 0;
    const finalPriceDifference = calculatedFinalPrice === null || !finalPrice ? null : calculatedFinalPrice - finalPrice;
    const calculationStatus: Product["calculationStatus"] = calculatedFinalPrice === null ? "incomplete" : finalPriceDifference !== null && Math.abs(finalPriceDifference) > 1 ? "divergent" : "ok";
    return {
      ...product,
      discount: product.discount || 0,
      desvioPrecificacao,
      finalPrice,
      calculatedFinalPrice,
      finalPriceDifference,
      calculationStatus
    };
  });
}

function getLineDeviations(table: WeeklyTable): WeeklyTableLineDeviation[] {
  const current = new Map((table.lineDeviations || []).map((item) => [item.line, item.deviation]));
  const defaults = defaultYaraLines.map((line) => ({ line, deviation: current.get(line) || 0 }));
  const custom = (table.lineDeviations || []).filter((item) => item.line && !defaultYaraLines.includes(item.line));
  return [...defaults, ...custom];
}

function getWeeklyAvailableDeviations(table: WeeklyTable): WeeklyTableLineDeviation[] {
  const current = new Map((table.weeklyAvailableDeviations || []).map((item) => [item.line, item.deviation]));
  return defaultYaraLines.map((line) => ({ line, deviation: current.get(line) || 0 }));
}

function buildPriceHistory(table: WeeklyTable): YaraPriceHistoryEntry[] {
  return table.products.map((product, index) => ({
    id: `${table.id}-${product.id || product.code || index}`,
    tableId: table.id,
    fileName: table.fileName,
    importedAt: table.importedAt,
    updatedAt: table.updatedAt || table.importedAt,
    importedBy: table.importedBy,
    status: table.active ? "Ativa" : "Arquivada",
    productCount: table.products.length,
    expiresAt: table.expiresAt,
    productCode: product.code,
    productDescription: product.description,
    group: product.group,
    packaging: product.packaging,
    ptax: table.ptax,
    freight: table.freight,
    icms: table.icms,
    marginIcms: table.marginIcms,
    resellerPrice: product.resellerPrice,
    discount: product.discount || 0,
    desvioPrecificacao: product.desvioPrecificacao || 0,
    calculatedFinalPrice: product.calculatedFinalPrice ?? null,
    finalPriceDifference: product.finalPriceDifference ?? null,
    finalPrice: product.finalPrice
  }));
}

function mergeHistory(current: YaraPriceHistoryEntry[], table: WeeklyTable) {
  const nextEntries = buildPriceHistory(table);
  const nextIds = new Set(nextEntries.map((entry) => entry.id));
  return [...nextEntries, ...current.filter((entry) => !nextIds.has(entry.id))].slice(0, 5000);
}

function createBlankProduct(): Product {
  return {
    id: `manual-${Date.now()}`,
    code: "",
    group: "",
    description: "",
    reference: "",
    characteristic: "",
    packaging: "",
    supplier: "Yara",
    producerPrice: 0,
    resellerPrice: 0,
    discount: 0,
    desvioPrecificacao: 0,
    finalPrice: 0,
    available: true
  };
}

function normalizeWeeklyTable(table: WeeklyTable) {
  return { ...table, products: recalculateProducts(table) };
}

function formatSignedCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatarMoedaBRL(value)}`;
}

function getCalculationWarnings(product: Product, table: WeeklyTable) {
  const warnings: string[] = [];
  if (!product.resellerPrice) warnings.push("Revenda vazia ou invalida.");
  if (!table.ptax) warnings.push("PTAX vazio ou invalido.");
  if (!table.icms) warnings.push("ICMS vazio, invalido ou igual a 0.");
  if (!table.marginIcms) warnings.push("Margem + ICMS vazia, invalida ou igual a 0.");
  if (product.calculatedFinalPrice === null || product.calculatedFinalPrice === undefined) warnings.push("Preco final calculado nao pode ser gerado com os parametros atuais.");
  if (product.finalPriceDifference !== null && product.finalPriceDifference !== undefined && Math.abs(product.finalPriceDifference) > Math.max(500, product.finalPrice * 0.15)) {
    warnings.push("Diferenca entre preco atual e calculado acima do esperado.");
  }
  return Array.from(new Set(warnings));
}

function getVisibleFinalPrice(product: Product) {
  if (product.calculatedFinalPrice && product.calculatedFinalPrice > 0) {
    return product.calculatedFinalPrice;
  }
  return product.finalPrice;
}

function getVisibleFinalPriceTitle(product: Product) {
  if (product.calculatedFinalPrice && product.calculatedFinalPrice > 0) {
    return `Preco calculado pelos parametros comerciais: ${formatarMoedaBRL(product.calculatedFinalPrice)}. Preco importado/salvo: ${formatarMoedaBRL(product.finalPrice)}.`;
  }
  return `Preco importado/salvo: ${formatarMoedaBRL(product.finalPrice)}.`;
}

const dynamicImportWarningTypes = new Set([
  "missing_ptax",
  "missing_freight",
  "missing_icms",
  "missing_margin_icms",
  "missing_expiration",
  "expired_list",
  "unchecked_parameters",
  "final_price_difference"
]);

function importWarning(type: string, message: string, severity: ImportWarning["severity"] = "warning", row?: number, productCode?: string): ImportWarning {
  return { type, message, severity, row, productCode };
}

function hasValidImportParameters(imported: WeeklyTableImport) {
  return !!imported.expiresAt && !!imported.ptax && !!imported.icms && !!imported.marginIcms;
}

function getImportedParameterWarnings(imported: WeeklyTableImport): ImportWarning[] {
  const warnings: ImportWarning[] = [];
  if (!imported.expiresAt) warnings.push(importWarning("missing_expiration", "Parametro nao encontrado na planilha: vencimento. Confira antes de salvar.", "error"));
  if (!imported.ptax) warnings.push(importWarning("missing_ptax", "Parametro nao encontrado na planilha: PTAX. Confira antes de salvar.", "error"));
  if (imported.freight === undefined || imported.freight === null || Number.isNaN(imported.freight)) warnings.push(importWarning("missing_freight", "Parametro nao encontrado na planilha: frete. Confira antes de salvar.", "warning"));
  if (!imported.icms) warnings.push(importWarning("missing_icms", "Parametro nao encontrado na planilha: ICMS. Confira antes de salvar.", "error"));
  if (!imported.marginIcms) warnings.push(importWarning("missing_margin_icms", "Parametro nao encontrado na planilha: margem + ICMS. Confira antes de salvar.", "error"));
  if (!hasValidImportParameters(imported)) warnings.push(importWarning("unchecked_parameters", "Alguns calculos podem estar divergentes porque existem parametros comerciais nao conferidos.", "warning"));
  return warnings;
}

function refreshImportedWithParameters(imported: WeeklyTableImport): WeeklyTableImport {
  const products = imported.products.map((product, index) => {
    const calculatedFinalPrice = calculateWeeklyFinalPrice({
      revenda: product.resellerPrice,
      desvioPrecificacao: product.desvioPrecificacao || 0,
      ptax: imported.ptax,
      frete: imported.freight || 0,
      icms: imported.icms,
      margemIcms: imported.marginIcms
    });
    const finalPrice = Number.isFinite(product.finalPrice) ? product.finalPrice : 0;
    const finalPriceDifference = calculatedFinalPrice === null || !finalPrice ? null : calculatedFinalPrice - finalPrice;
    const calculationStatus: Product["calculationStatus"] = calculatedFinalPrice === null ? "incomplete" : finalPriceDifference !== null && Math.abs(finalPriceDifference) > 1 ? "divergent" : "ok";
    const stableWarnings = (product.importWarnings || []).filter((item) => !dynamicImportWarningTypes.has(item.type));
    const calculationWarnings = finalPriceDifference !== null && Math.abs(finalPriceDifference) > 1
      ? [importWarning("final_price_difference", `Diferenca entre preco final importado e recalculado em ${product.code || "produto sem codigo"}.`, "warning", index + 1, product.code)]
      : [];

    return {
      ...product,
      calculatedFinalPrice,
      finalPriceDifference,
      calculationStatus,
      importWarnings: [...stableWarnings, ...calculationWarnings]
    };
  });
  const stableWarnings = (imported.importWarnings || []).filter((item) => !dynamicImportWarningTypes.has(item.type));
  const productWarnings = products.flatMap((product) => product.importWarnings || []).filter((item) => dynamicImportWarningTypes.has(item.type));
  const importWarnings = [...stableWarnings, ...getImportedParameterWarnings(imported), ...productWarnings];
  const errors = importWarnings.filter((item) => item.severity === "error").map((item) => item.message);
  const warnings = importWarnings.filter((item) => item.severity !== "error").map((item) => item.message);
  const valid = products.filter((product) => product.code && product.description && product.finalPrice > 0).length;

  return {
    ...imported,
    products,
    importWarnings,
    errors: Array.from(new Set(errors)),
    warnings: Array.from(new Set(warnings)),
    stats: { ...imported.stats, valid }
  };
}

export default function WeeklyTable() {
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
    groups: Array.from(new Set(table.products.map((product) => product.group).filter(Boolean))).sort(),
    characteristics: Array.from(new Set(table.products.map((product) => product.characteristic).filter(Boolean))).sort(),
    packaging: Array.from(new Set(table.products.map((product) => product.packaging).filter(Boolean))).sort()
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
  const editingProduct = table.products.find((product) => product.id === editingProductId) || null;
  const applyingCalculatedProduct = table.products.find((product) => product.id === applyCalculatedProductId) || null;
  const editingProductCalculationWarnings = editingProduct ? getCalculationWarnings(editingProduct, table) : [];
  const listStatus = getListStatus(table.expiresAt);
  const ptaxHistory = useMemo(() => {
    const byTable = new Map<string, YaraPriceHistoryEntry>();
    history.forEach((entry) => {
      if (!byTable.has(entry.tableId)) byTable.set(entry.tableId, entry);
    });
    return Array.from(byTable.values())
      .sort((a, b) => new Date(a.importedAt).getTime() - new Date(b.importedAt).getTime())
      .slice(-8)
      .map((entry) => ({ label: new Date(entry.importedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), value: entry.ptax }));
  }, [history]);

  function persist(next: WeeklyTable) {
    const updatedAt = new Date().toISOString();
    const recalculated = { ...next, updatedAt, products: recalculateProducts(next) };
    setTable(recalculated);
    localStorage.setItem(tableStorageKey, JSON.stringify(recalculated));
  }

  function persistDeviations(lineDeviations: WeeklyTableLineDeviation[], weeklyAvailableDeviations = table.weeklyAvailableDeviations) {
    const next = { ...table, updatedAt: new Date().toISOString(), lineDeviations, weeklyAvailableDeviations };
    setTable(next);
    localStorage.setItem(tableStorageKey, JSON.stringify(next));
  }

  function openFilePicker(mode: "normal" | "replace" = "normal") {
    setPendingImportMode(mode);
    if (fileInputRef.current) fileInputRef.current.value = "";
    fileInputRef.current?.click();
  }

  function requestImportList() {
    if (hasProducts) {
      requestReplaceList();
      return;
    }
    openFilePicker("normal");
  }

  async function onFile(file?: File) {
    if (!file) return;
    try {
      setImported(refreshImportedWithParameters(await parseWeeklyTableFile(file)));
    } catch {
      notify("Nao foi possivel importar a planilha. Feche o arquivo no Excel ou aguarde a sincronizacao do OneDrive e tente novamente. Esse erro normalmente acontece quando a planilha esta aberta em outro programa.");
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
    localStorage.setItem(tableStorageKey, JSON.stringify(recalculated));
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
    const products = table.products.map((product) => product.id === id ? { ...product, ...patch } : product);
    persist({ ...table, products });
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
    const nextLineDeviations = lineDeviations.map((item, itemIndex) => itemIndex === index ? { ...item, line } : item);
    persistDeviations(nextLineDeviations);
  }

  function updateDeviationValue(index: number, deviation: number) {
    const nextLineDeviations = lineDeviations.map((item, itemIndex) => itemIndex === index ? { ...item, deviation } : item);
    persistDeviations(nextLineDeviations);
  }

  function addDeviationLine() {
    persistDeviations([...lineDeviations, { line: "Nova linha", deviation: 0 }]);
  }

  function duplicateDeviationLine(index: number) {
    const item = lineDeviations[index];
    if (!item) return;
    const nextLineDeviations = [
      ...lineDeviations.slice(0, index + 1),
      { ...item, line: `${item.line || "Nova linha"} cópia` },
      ...lineDeviations.slice(index + 1)
    ];
    persistDeviations(nextLineDeviations);
  }

  function requestRemoveDeviationLine(index: number) {
    setDeviationToRemoveIndex(index);
  }

  function confirmRemoveDeviationLine() {
    if (deviationToRemoveIndex === null) return;
    const nextLineDeviations = lineDeviations.filter((_, index) => index !== deviationToRemoveIndex);
    persistDeviations(nextLineDeviations);
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
    if (hasEmptyLine) {
      notify("Informe o nome da linha de produto.");
      return;
    }
    const names = lineDeviations.map((item) => normalizeText(item.line)).filter(Boolean);
    const hasDuplicate = names.some((name, index) => names.indexOf(name) !== index);
    if (hasDuplicate) notify("Já existe uma linha com esse nome.");
    persistDeviations(lineDeviations, weeklyAvailableDeviations);
    simulatedAction("Desvios semanais salvos com sucesso.");
  }

  function clearPricingParameters() {
    if (!window.confirm("Limpar vencimento, codigo, nome, PTAX, frete, ICMS e margem + ICMS? Produtos e desvios serao mantidos.")) return;
    persist({
      ...table,
      expiresAt: "",
      listCode: "",
      listName: "",
      ptax: 0,
      freight: 0,
      icms: 0,
      marginIcms: 0
    });
    simulatedAction("Parametros de precificacao limpos.");
  }

  function clearDeviations() {
    if (!window.confirm("Tem certeza que deseja zerar os desvios semanais?")) return;
    const cleared = lineDeviations.map((item) => ({ ...item, deviation: 0 }));
    persistDeviations(cleared, cleared);
    simulatedAction("Desvios semanais zerados com sucesso.");
  }

  function requestRemoveCurrentList() {
    setClearParametersOnRemove(false);
    setClearDeviationsOnRemove(false);
    setShowRemoveListModal(true);
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
    if (!hasProducts) {
      openFilePicker("normal");
      return;
    }
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
    persist({ ...table, products: table.products.filter((product) => product.id !== id) });
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
            <Button variant="danger" onClick={requestRemoveCurrentList} disabled={!hasProducts}><Trash2 size={16} />Remover lista atual</Button>
            <Button variant="ghost" onClick={saveSnapshot}><History size={16} />Salvar no historico</Button>
            <Button variant="ghost" onClick={() => setShowHistory((value) => !value)}><RefreshCw size={16} />Historico</Button>
            <input ref={fileInputRef} className="hidden" type="file" accept=".xlsx,.xls,.csv" onChange={(event) => onFile(event.target.files?.[0])} />
          </div>
        </div>
      </Card>

      {imported && (
        <div className="mt-6">
          <ImportValidation
            imported={imported}
            previousParameters={{
              expiresAt: table.expiresAt,
              ptax: table.ptax,
              freight: table.freight,
              icms: table.icms,
              marginIcms: table.marginIcms
            }}
            onParameterChange={updateImportedParameter}
            onConfirm={confirmImport}
            onCancel={() => { setImported(null); setPendingImportMode("normal"); }}
          />
        </div>
      )}

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
              onRemove={() => requestRemoveDeviationLine(index)}
            />
          ))}
        </div>
      </section>

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
            <Input
              type="date"
              className="h-9 px-3 py-2 text-xs"
              value={dateInputValue(table.expiresAt)}
              onChange={(event) => updateTableField("expiresAt", event.target.value ? new Date(`${event.target.value}T23:59:59`).toISOString() : "")}
              onKeyDown={confirmParametersOnEnter}
            />
          </Field>
          <Field label="PTAX">
            <Input type="number" step="0.01" className="h-9 px-3 py-2 text-xs" value={numberInputValue(table.ptax)} onChange={(event) => updateTableField("ptax", numberValue(event.target.value))} onKeyDown={confirmParametersOnEnter} />
          </Field>
          <Field label="Frete">
            <Input type="number" step="0.01" className="h-9 px-3 py-2 text-xs" value={numberInputValue(table.freight)} onChange={(event) => updateTableField("freight", numberValue(event.target.value))} onKeyDown={confirmParametersOnEnter} />
          </Field>
          <Field label="ICMS">
            <Input type="number" step="0.01" className="h-9 px-3 py-2 text-xs" value={numberInputValue(table.icms)} onChange={(event) => updateTableField("icms", numberValue(event.target.value))} onKeyDown={confirmParametersOnEnter} />
          </Field>
          <Field label="Margem + ICMS">
            <Input type="number" step="0.01" className="h-9 px-3 py-2 text-xs" value={table.marginIcms} onChange={(event) => updateTableField("marginIcms", numberValue(event.target.value))} onKeyDown={confirmParametersOnEnter} />
          </Field>
        </div>
      </section>

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
            <Field label="Buscar" className="sm:col-span-2 lg:col-span-1"><Input className="h-9 px-3 py-2 text-xs" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Codigo, produto, grupo..." /></Field>
            <Field label="Grupo"><Select value={filters.group} onChange={(event) => setFilters((current) => ({ ...current, group: event.target.value }))}><option value="">Todos</option>{options.groups.map((item) => <option key={item} value={item}>{item}</option>)}</Select></Field>
            <Field label="Caracteristica"><Select value={filters.characteristic} onChange={(event) => setFilters((current) => ({ ...current, characteristic: event.target.value }))}><option value="">Todas</option>{options.characteristics.map((item) => <option key={item} value={item}>{item}</option>)}</Select></Field>
            <Field label="Embalagem"><Select value={filters.packaging} onChange={(event) => setFilters((current) => ({ ...current, packaging: event.target.value }))}><option value="">Todas</option>{options.packaging.map((item) => <option key={item} value={item}>{item}</option>)}</Select></Field>
            <Field label="Status"><Select value={filters.availability} onChange={(event) => setFilters((current) => ({ ...current, availability: event.target.value }))}><option value="">Todos</option><option value="available">Disponivel</option><option value="unavailable">Indisponivel</option></Select></Field>
          </div>
          )}
        </div>

        {hasProducts ? (
          <>
        <div className="hidden w-full overflow-hidden lg:block">
          <table className="w-full table-fixed text-left text-[11px]">
            <colgroup>
              <col className="w-[8%]" />
              <col className="w-[22%]" />
              <col className="w-[11%]" />
              <col className="w-[13%]" />
              <col className="w-[11%]" />
              <col className="w-[9%]" />
              <col className="w-[10%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
            </colgroup>
            <thead className="border-b border-white/[0.08] bg-white/[0.035] uppercase tracking-[0.08em] text-slate-500">
                <tr>{["Codigo", "Produto", "Grupo", "Referencia", "Embalagem", "Desvio", "Preco final", "Status", "Acoes"].map((header) => <th key={header} className="px-2 py-2.5 font-semibold">{header}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredProducts.map((product) => {
                return (
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
                );
              })}
              {!filteredProducts.length && <tr><td colSpan={9} className="px-3 py-8 text-center text-slate-500"><Search className="mx-auto mb-2" size={16} />Nenhum produto encontrado.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-3 lg:hidden">
          {filteredProducts.map((product) => (
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
          </>
        ) : (
          <EmptyProductsState onImport={openFilePicker} />
        )}
      </section>

      <Modal title="Remover lista atual?" open={showRemoveListModal} onClose={() => setShowRemoveListModal(false)}>
        <div className="space-y-5">
          <p className="text-sm leading-6 text-slate-300">
            Essa ação removerá os produtos carregados em "Produtos da Semana". Os parâmetros comerciais e os desvios da lista serão mantidos, a menos que você escolha limpar também.
          </p>
          <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-4">
            <label className="flex items-start gap-3 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={clearParametersOnRemove}
                onChange={(event) => setClearParametersOnRemove(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-black/30 accent-padap-green"
              />
              <span>Também limpar parâmetros comerciais</span>
            </label>
            <label className="flex items-start gap-3 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={clearDeviationsOnRemove}
                onChange={(event) => setClearDeviationsOnRemove(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-black/30 accent-padap-green"
              />
              <span>Também limpar desvios da lista</span>
            </label>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setShowRemoveListModal(false)}>Cancelar</Button>
            <Button variant="danger" onClick={removeCurrentList}><Trash2 size={16} />Remover lista</Button>
          </div>
        </div>
      </Modal>

      <Modal title="Substituir lista atual?" open={showReplaceListModal} onClose={() => setShowReplaceListModal(false)}>
        <div className="space-y-5">
          <p className="text-sm leading-6 text-slate-300">
            A lista atual será substituída por uma nova planilha após a validação da importação. Parâmetros comerciais e desvios serão mantidos.
          </p>
          <div className="rounded-lg border border-padap-green/15 bg-padap-green/[0.05] px-3 py-2 text-xs leading-5 text-slate-300">
            Se a nova importação falhar ou for cancelada, a lista atual continuará na tela.
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setShowReplaceListModal(false)}>Cancelar</Button>
            <Button onClick={confirmReplaceList}><Upload size={16} />Substituir lista</Button>
          </div>
        </div>
      </Modal>

      <Modal title="Remover linha de desvio?" open={deviationToRemoveIndex !== null} onClose={() => setDeviationToRemoveIndex(null)}>
        <div className="space-y-5">
          <p className="text-sm leading-6 text-slate-300">Remover esta linha de desvio?</p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setDeviationToRemoveIndex(null)}>Cancelar</Button>
            <Button variant="danger" onClick={confirmRemoveDeviationLine}><Trash2 size={16} />Remover</Button>
          </div>
        </div>
      </Modal>

      <Modal title="Aplicar preço calculado?" open={!!applyingCalculatedProduct} onClose={() => setApplyCalculatedProductId(null)}>
        <div className="space-y-5">
          <p className="text-sm leading-6 text-slate-300">
            O preço final atual será substituído pelo preço calculado usando o desvio de precificação. Deseja continuar?
          </p>
          {applyingCalculatedProduct && (
            <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-4 sm:grid-cols-3">
              <ReadOnlyDetail label="Preço atual" value={formatarMoedaBRL(applyingCalculatedProduct.finalPrice)} />
              <ReadOnlyDetail label="Preço calculado" value={formatarMoedaBRL(applyingCalculatedProduct.calculatedFinalPrice || 0)} />
              <ReadOnlyDetail label="Desvio usado" value={formatarMoedaBRL(applyingCalculatedProduct.desvioPrecificacao || 0)} />
            </div>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setApplyCalculatedProductId(null)}>Cancelar</Button>
            <Button onClick={confirmApplyCalculatedPrice}><RefreshCw size={16} />Aplicar preço calculado</Button>
          </div>
        </div>
      </Modal>

      <Modal title="Editar detalhes do produto" open={!!editingProduct} onClose={() => setEditingProductId(null)}>
        {editingProduct && (
          <div className="grid gap-4">
            <div className="flex flex-col gap-3 rounded-lg border border-white/[0.08] bg-white/[0.025] p-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white" title={editingProduct.description}>{editingProduct.description || "Produto sem descricao"}</p>
                <p className="mt-1 text-xs text-slate-400">O desvio de precificacao recalcula apenas o preco calculado. O preco final atual so muda ao aplicar.</p>
              </div>
              <Badge tone={editingProduct.available ? "green" : "red"}>{editingProduct.available ? "Disponivel" : "Indisponivel"}</Badge>
            </div>

            <div className="grid gap-4">
              <section className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Dados do produto</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <DetailInput label="Codigo" value={editingProduct.code} onChange={(value) => updateProduct(editingProduct.id, { code: value })} />
                  <DetailInput label="Grupo" value={editingProduct.group} onChange={(value) => updateProduct(editingProduct.id, { group: value })} />
                  <DetailInput label="Descricao" value={editingProduct.description} onChange={(value) => updateProduct(editingProduct.id, { description: value })} />
                  <DetailInput label="Referencia" value={editingProduct.reference} onChange={(value) => updateProduct(editingProduct.id, { reference: value })} />
                  <DetailInput label="Caracteristica" value={editingProduct.characteristic} onChange={(value) => updateProduct(editingProduct.id, { characteristic: value })} />
                  <DetailInput label="Embalagem" value={editingProduct.packaging} onChange={(value) => updateProduct(editingProduct.id, { packaging: value })} />
                </div>
              </section>

              <section className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Valores da lista</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <DetailInput label="Produtor" type="number" value={editingProduct.producerPrice} onChange={(value) => updateProduct(editingProduct.id, { producerPrice: numberValue(value) })} />
                  <DetailInput label="Revenda" type="number" value={editingProduct.resellerPrice} onChange={(value) => updateProduct(editingProduct.id, { resellerPrice: numberValue(value) })} />
                  <DetailInput label="Desconto" type="number" value={editingProduct.discount || 0} onChange={(value) => updateProduct(editingProduct.id, { discount: numberValue(value) })} />
                  <DetailInput label="Desvio de precificacao" type="number" value={editingProduct.desvioPrecificacao || 0} onChange={(value) => updateProduct(editingProduct.id, { desvioPrecificacao: numberValue(value) })} />
                  <ReadOnlyDetail label="Preco final atual/importado" value={formatarMoedaBRL(editingProduct.finalPrice)} />
                </div>
              </section>

              <section className="rounded-lg border border-padap-green/15 bg-padap-green/[0.035] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Precificacao com desvio</h3>
                    <p className="mt-1 text-xs text-slate-500">Campo individual do produto. Nao usa nem altera os desvios semanais.</p>
                  </div>
                  <Button
                    className="min-h-9 shrink-0 px-3 py-1.5 text-xs"
                    disabled={!editingProduct.calculatedFinalPrice || editingProduct.calculatedFinalPrice <= 0}
                    onClick={() => requestApplyCalculatedPrice(editingProduct)}
                  >
                    <RefreshCw size={14} />Aplicar preço calculado
                  </Button>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <ReadOnlyDetail label="Preco final calculado" value={editingProduct.calculatedFinalPrice ? formatarMoedaBRL(editingProduct.calculatedFinalPrice) : "Incompleto"} />
                  <ReadOnlyDetail label="Diferenca" value={formatSignedCurrency(editingProduct.finalPriceDifference)} />
                  <ReadOnlyDetail label="Desvio usado" value={formatarMoedaBRL(editingProduct.desvioPrecificacao || 0)} />
                </div>
              </section>

              <section className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Observacoes e status</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Status
                    <button
                      type="button"
                      onClick={() => updateProduct(editingProduct.id, { available: !editingProduct.available })}
                      className="mt-1.5 flex h-10 w-full items-center rounded-lg border border-white/10 bg-black/20 px-3 text-left"
                    >
                      <Badge tone={editingProduct.available ? "green" : "red"}>{editingProduct.available ? "Disponivel" : "Indisponivel"}</Badge>
                    </button>
                  </label>
                </div>
                {editingProductCalculationWarnings.length ? (
                  <div className="mt-3 rounded-lg border border-padap-amber/20 bg-padap-amber/[0.06] px-3 py-2 text-xs leading-5 text-amber-100">
                    {editingProductCalculationWarnings.join(" ")}
                  </div>
                ) : null}
              </section>
            </div>

            {editingProduct.importWarnings?.length ? (
              <div className="rounded-lg border border-padap-amber/20 bg-padap-amber/[0.06] px-3 py-2 text-xs leading-5 text-amber-100">
                {editingProduct.importWarnings.slice(0, 3).map((item) => item.message).join(" ")}
              </div>
            ) : null}

            <div className="rounded-lg border border-padap-green/15 bg-padap-green/[0.05] px-3 py-2 text-xs leading-5 text-slate-300">
              Campos de produtor, revenda, desconto e caracteristica permanecem salvos no produto, mas ficam fora da tabela principal para manter a lista compacta.
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setEditingProductId(null)}><Save size={16} />Concluir</Button>
            </div>
          </div>
        )}
      </Modal>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <LineChartCard title="Evolucao do PTAX" data={ptaxHistory.length ? ptaxHistory : [{ label: "Atual", value: table.ptax }]} />
        <BarChartCard title="Top produtos mais caros" data={topProducts.map((product) => ({ label: product.description.split(" ")[0] || product.code, value: getVisibleFinalPrice(product) }))} />
        <DonutChartCard title="Disponiveis x indisponiveis" data={[{ label: "Disponiveis", value: table.products.filter((p) => p.available).length, color: "#1dba2c" }, { label: "Indisponiveis", value: table.products.filter((p) => !p.available).length, color: "#ef4444" }]} />
      </div>

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
            <Field label="Produto ou codigo">
              <Input value={historyFilters.search} onChange={(event) => setHistoryFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Buscar no historico" />
            </Field>
            <Field label="Grupo">
              <Select value={historyFilters.group} onChange={(event) => setHistoryFilters((current) => ({ ...current, group: event.target.value }))}>
                <option value="">Todos</option>
                {options.groups.map((item) => <option key={item} value={item}>{item}</option>)}
              </Select>
            </Field>
            <Field label="Data inicial">
              <Input type="date" value={historyFilters.dateFrom} onChange={(event) => setHistoryFilters((current) => ({ ...current, dateFrom: event.target.value }))} />
            </Field>
            <Field label="Data final">
              <Input type="date" value={historyFilters.dateTo} onChange={(event) => setHistoryFilters((current) => ({ ...current, dateTo: event.target.value }))} />
            </Field>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[1480px] text-left text-sm">
              <thead className="border-b border-white/[0.08] text-xs uppercase tracking-[0.1em] text-slate-500">
                <tr>{["Arquivo", "Importacao", "Qtd.", "Status", "Usuario", "Vencimento", "PTAX", "Frete", "ICMS", "Margem + ICMS", "Codigo", "Produto", "Grupo", "Revenda", "Desconto", "Preco final"].map((header) => <th key={header} className="px-3 py-2">{header}</th>)}</tr>
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

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`min-w-0 space-y-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 [&_select]:h-9 [&_select]:px-3 [&_select]:py-2 [&_select]:text-xs ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return <td className="min-w-0 px-1.5 py-2">{children}</td>;
}

function DeviationCard({
  item,
  onNameChange,
  onDeviationChange,
  onDuplicate,
  onRemove
}: {
  item: WeeklyTableLineDeviation;
  onNameChange: (value: string) => void;
  onDeviationChange: (value: string) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2 transition hover:border-padap-green/20 hover:bg-padap-green/[0.04]">
      <input
        value={item.line}
        onChange={(event) => onNameChange(event.target.value)}
        className="h-8 min-w-0 flex-1 rounded-md border border-white/10 bg-black/20 px-2 text-xs font-semibold text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-padap-green/60 focus:bg-[#071b18]"
        placeholder="Nome da linha"
        title={item.line}
      />
      <input
        type="number"
        step="0.01"
        value={numberInputValue(item.deviation)}
        onChange={(event) => onDeviationChange(event.target.value)}
        className="h-8 w-20 shrink-0 rounded-md border border-white/10 bg-black/20 px-2 text-right text-xs font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-padap-green/60 focus:bg-[#071b18]"
      />
      <IconButton label="Duplicar linha" onClick={onDuplicate}><Copy size={13} /></IconButton>
      <IconButton label="Remover linha" danger onClick={onRemove}><Trash2 size={13} /></IconButton>
    </div>
  );
}

function InlineInput({ value, onChange, onConfirm, type = "text", className = "", title }: { value: string | number; onChange: (value: string) => void; onConfirm?: () => void; type?: string; className?: string; title?: string }) {
  const displayValue = type === "number" && typeof value === "number" ? numberInputValue(value) : value;

  function confirmOnEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    event.currentTarget.blur();
    onConfirm?.();
  }

  return (
    <input
      type={type}
      value={displayValue}
      title={title}
      step={type === "number" ? "0.01" : undefined}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={confirmOnEnter}
      className={`h-8 w-full min-w-0 truncate rounded-md border border-white/10 bg-black/20 px-2 text-[11px] text-white outline-none transition placeholder:text-slate-600 focus:border-padap-green/60 focus:bg-[#071b18] ${className}`}
    />
  );
}

function IconButton({ label, children, onClick, danger = false }: { label: string; children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition ${danger ? "border-red-400/20 text-red-200 hover:bg-red-500/10" : "border-white/10 text-slate-300 hover:bg-white/[0.06] hover:text-white"}`}
    >
      {children}
    </button>
  );
}

function SummaryTile({ label, value, title, strong = false }: { label: string; value: string; title?: string; strong?: boolean }) {
  return (
    <div className="min-w-0 rounded-md border border-white/10 bg-black/20 px-2 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</p>
      <p className={`mt-1 truncate ${strong ? "text-sm font-semibold text-white" : "text-xs text-slate-200"}`} title={title || value}>{value}</p>
    </div>
  );
}

function EmptyProductsState({ onImport }: { onImport: () => void }) {
  return (
    <div className="grid min-h-72 place-items-center border-t border-white/[0.08] p-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-padap-green/20 bg-padap-green/[0.08] text-padap-mint">
          <Upload size={20} />
        </div>
        <h3 className="mt-4 text-base font-bold text-padap-ink">Nenhuma lista importada</h3>
        <p className="mt-2 text-sm leading-6 text-padap-muted">Importe uma planilha para carregar os produtos da semana.</p>
        <div className="mt-5 flex justify-center">
          <Button onClick={onImport}><Upload size={16} />Importar planilha</Button>
        </div>
      </div>
    </div>
  );
}

function DetailInput({ label, value, onChange, type = "text" }: { label: string; value: string | number; onChange: (value: string) => void; type?: string }) {
  const displayValue = type === "number" && typeof value === "number" ? numberInputValue(value) : value;
  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
      {label}
      <input
        type={type}
        value={displayValue}
        title={String(value)}
        step={type === "number" ? "0.01" : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-10 w-full min-w-0 rounded-lg border border-white/10 bg-black/20 px-3 text-sm font-normal normal-case tracking-normal text-white outline-none transition focus:border-padap-green/60 focus:bg-[#071b18]"
      />
    </label>
  );
}

function ReadOnlyDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
      {label}
      <div className="mt-1.5 flex h-10 items-center rounded-lg border border-white/10 bg-white/[0.035] px-3 text-sm font-semibold normal-case tracking-normal text-white">
        {value}
      </div>
    </div>
  );
}
