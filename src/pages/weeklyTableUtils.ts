import { calculateWeeklyFinalPrice } from "../services/excelImportService";
import type { ImportWarning, Product, WeeklyTable, WeeklyTableImport, WeeklyTableLineDeviation, YaraPriceHistoryEntry } from "../types";
import { formatarMoedaBRL } from "../utils/currency";

export const tableStorageKey = "padap.weeklyTable.active";
export const historyStorageKey = "padap.yaraPriceHistory";
export const defaultYaraLines = [
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

export const dynamicImportWarningTypes = new Set([
  "missing_ptax",
  "missing_freight",
  "missing_icms",
  "missing_margin_icms",
  "missing_expiration",
  "expired_list",
  "unchecked_parameters",
  "final_price_difference"
]);

export function todayIsoDate() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

export function dateInputValue(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function numberValue(value: string) {
  return Number(value.replace(",", ".")) || 0;
}

export function numberInputValue(value: number | null | undefined) {
  if (!value || !Number.isFinite(value)) return "";
  return value;
}

export function createImportId(fileName?: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  const normalizedFileName = (fileName || "lista-yara").replace(/[^a-zA-Z0-9.-]+/g, "-");
  return `${Date.now()}-${normalizedFileName}`;
}

export function normalizeText(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

export function getListStatus(expiresAt: string): { label: string; tone: "green" | "amber" | "red" } {
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

export function recalculateProducts(table: WeeklyTable, products = table.products) {
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
    return { ...product, discount: product.discount || 0, desvioPrecificacao, finalPrice, calculatedFinalPrice, finalPriceDifference, calculationStatus };
  });
}

export function getLineDeviations(table: WeeklyTable): WeeklyTableLineDeviation[] {
  const current = new Map((table.lineDeviations || []).map((item) => [item.line, item.deviation]));
  const defaults = defaultYaraLines.map((line) => ({ line, deviation: current.get(line) || 0 }));
  const custom = (table.lineDeviations || []).filter((item) => item.line && !defaultYaraLines.includes(item.line));
  return [...defaults, ...custom];
}

export function getWeeklyAvailableDeviations(table: WeeklyTable): WeeklyTableLineDeviation[] {
  const current = new Map((table.weeklyAvailableDeviations || []).map((item) => [item.line, item.deviation]));
  return defaultYaraLines.map((line) => ({ line, deviation: current.get(line) || 0 }));
}

export function buildPriceHistory(table: WeeklyTable): YaraPriceHistoryEntry[] {
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

export function mergeHistory(current: YaraPriceHistoryEntry[], table: WeeklyTable) {
  const nextEntries = buildPriceHistory(table);
  const nextIds = new Set(nextEntries.map((entry) => entry.id));
  return [...nextEntries, ...current.filter((entry) => !nextIds.has(entry.id))].slice(0, 5000);
}

export function createBlankProduct(): Product {
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

export function normalizeWeeklyTable(table: WeeklyTable) {
  return { ...table, products: recalculateProducts(table) };
}

export function formatSignedCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatarMoedaBRL(value)}`;
}

export function getCalculationWarnings(product: Product, table: WeeklyTable) {
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

export function getVisibleFinalPrice(product: Product) {
  if (product.calculatedFinalPrice && product.calculatedFinalPrice > 0) return product.calculatedFinalPrice;
  return product.finalPrice;
}

export function getVisibleFinalPriceTitle(product: Product) {
  if (product.calculatedFinalPrice && product.calculatedFinalPrice > 0) {
    return `Preco calculado pelos parametros comerciais: ${formatarMoedaBRL(product.calculatedFinalPrice)}. Preco importado/salvo: ${formatarMoedaBRL(product.finalPrice)}.`;
  }
  return `Preco importado/salvo: ${formatarMoedaBRL(product.finalPrice)}.`;
}

export function importWarning(type: string, message: string, severity: ImportWarning["severity"] = "warning", row?: number, productCode?: string): ImportWarning {
  return { type, message, severity, row, productCode };
}

export function hasValidImportParameters(imported: WeeklyTableImport) {
  return !!imported.expiresAt && !!imported.ptax && !!imported.icms && !!imported.marginIcms;
}

export function getImportedParameterWarnings(imported: WeeklyTableImport): ImportWarning[] {
  const warnings: ImportWarning[] = [];
  if (!imported.expiresAt) warnings.push(importWarning("missing_expiration", "Parametro nao encontrado na planilha: vencimento. Confira antes de salvar.", "error"));
  if (!imported.ptax) warnings.push(importWarning("missing_ptax", "Parametro nao encontrado na planilha: PTAX. Confira antes de salvar.", "error"));
  if (imported.freight === undefined || imported.freight === null || Number.isNaN(imported.freight)) warnings.push(importWarning("missing_freight", "Parametro nao encontrado na planilha: frete. Confira antes de salvar.", "warning"));
  if (!imported.icms) warnings.push(importWarning("missing_icms", "Parametro nao encontrado na planilha: ICMS. Confira antes de salvar.", "error"));
  if (!imported.marginIcms) warnings.push(importWarning("missing_margin_icms", "Parametro nao encontrado na planilha: margem + ICMS. Confira antes de salvar.", "error"));
  if (!hasValidImportParameters(imported)) warnings.push(importWarning("unchecked_parameters", "Alguns calculos podem estar divergentes porque existem parametros comerciais nao conferidos.", "warning"));
  return warnings;
}

export function refreshImportedWithParameters(imported: WeeklyTableImport): WeeklyTableImport {
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
    return { ...product, calculatedFinalPrice, finalPriceDifference, calculationStatus, importWarnings: [...stableWarnings, ...calculationWarnings] };
  });
  const stableWarnings = (imported.importWarnings || []).filter((item) => !dynamicImportWarningTypes.has(item.type));
  const productWarnings = products.flatMap((product) => product.importWarnings || []).filter((item) => dynamicImportWarningTypes.has(item.type));
  const importWarnings = [...stableWarnings, ...getImportedParameterWarnings(imported), ...productWarnings];
  const errors = importWarnings.filter((item) => item.severity === "error").map((item) => item.message);
  const warnings = importWarnings.filter((item) => item.severity !== "error").map((item) => item.message);
  const valid = products.filter((product) => product.code && product.description && product.finalPrice > 0).length;
  return { ...imported, products, importWarnings, errors: Array.from(new Set(errors)), warnings: Array.from(new Set(warnings)), stats: { ...imported.stats, valid } };
}
