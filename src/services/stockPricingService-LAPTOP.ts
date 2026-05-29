import * as XLSX from "xlsx";
import type {
  ConsolidatedStockItem,
  StockPricingHistory,
  StockPricingImportDraft,
  StockPricingImportWarning,
  StockPricingImportedColumn,
  StockPricingProduct,
  StockPricingProductStatus,
  StockPricingTermPrice,
  StockPricingTable,
  StockUnit
} from "../types";
import { normalizeStockSearch, readStoredArray, writeStoredArray } from "./stockService";

export const stockPricingTableKey = "padap.stockPricing.activeTable";
export const stockPricingHistoryKey = "padap.stockPricing.history";

type HeaderMap = {
  produto: number;
  linha: number;
  fornecedor: number;
  embalagem: number;
  precoCusto: number;
  vencimento: number;
  antecipacao: number;
  juros: number;
  margem: number;
  precoVenda: number;
  monthly: { key: string; index: number; dateSerial?: number; date?: string }[];
  extra: { key: string; label: string; index: number }[];
};

const requiredHeaders = ["produto", "precoCusto", "vencimento", "margem", "precoVenda"] as const;
const monthPattern = /^(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)(eiro|ereiro|co|il|o|ho|osto|embro|ubro)?([./\s-]?\d{2,4})?$/i;
const termPattern = /^(a vista|avista|à vista|\d+\s*dias?|mes\s*\d+|m[eê]s\s*\d+)$/i;

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function comparable(value: unknown) {
  return normalizeText(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function headerKey(value: unknown) {
  const text = comparable(value);
  if (["produtos", "produto"].includes(text)) return "produto";
  if (text === "linha") return "linha";
  if (text === "fornecedor") return "fornecedor";
  if (["embal", "embalagem"].includes(text)) return "embalagem";
  if (["preco de custo", "custo"].includes(text)) return "precoCusto";
  if (text === "vencimento") return "vencimento";
  if (text === "antecipacao") return "antecipacao";
  if (text === "juros") return "juros";
  if (text === "margem") return "margem";
  if (["preco de venda", "venda"].includes(text)) return "precoVenda";
  return "";
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const raw = normalizeText(value).replace(/[^\d,.-]/g, "");
  if (!raw) return null;
  const text = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function excelSerialToIso(value: unknown): string | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
  if (typeof value !== "number" || value <= 20000 || value >= 80000) return undefined;
  const parsed = XLSX.SSF.parse_date_code(value);
  return parsed ? new Date(parsed.y, parsed.m - 1, parsed.d, 23, 59, 59).toISOString() : undefined;
}

function parseDate(value: unknown): string | null {
  const serial = excelSerialToIso(value);
  if (serial) return serial;
  const text = normalizeText(value);
  if (!text) return null;
  const match = text.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (!match) return text;
  const [, day, month, year] = match;
  const fullYear = year.length === 2 ? `20${year}` : year;
  return new Date(Number(fullYear), Number(month) - 1, Number(day), 23, 59, 59).toISOString();
}

function formatMonthKey(value: unknown) {
  return normalizeText(value).replace(/\s+/g, " ").trim();
}

function isMonthHeader(value: unknown) {
  const text = comparable(value);
  return monthPattern.test(formatMonthKey(value).toLowerCase()) || termPattern.test(text);
}

function columnKey(label: string, index: number) {
  const base = comparable(label).replace(/\s+/g, "_");
  return base || `coluna_${index + 1}`;
}

function readFormula(sheet: XLSX.WorkSheet, rowIndex: number, columnIndex: number) {
  if (columnIndex < 0) return undefined;
  const cell = sheet[XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex })] as XLSX.CellObject | undefined;
  return typeof cell?.f === "string" && cell.f.trim() ? cell.f.trim() : undefined;
}

function buildHeaderMap(row: unknown[], dateRow: unknown[] = []): HeaderMap {
  const map: HeaderMap = {
    produto: -1,
    linha: -1,
    fornecedor: -1,
    embalagem: -1,
    precoCusto: -1,
    vencimento: -1,
    antecipacao: -1,
    juros: -1,
    margem: -1,
    precoVenda: -1,
    monthly: [],
    extra: []
  };

  row.forEach((cell, index) => {
    const label = formatMonthKey(cell);
    const key = headerKey(cell);
    if (key && key in map && typeof map[key as keyof HeaderMap] === "number") {
      (map[key as keyof Omit<HeaderMap, "monthly">] as number) = index;
    }
    if (isMonthHeader(cell)) {
      const dateSerial = typeof dateRow[index] === "number" ? dateRow[index] : undefined;
      map.monthly.push({ key: label, index, dateSerial, date: excelSerialToIso(dateRow[index]) });
    } else if (label && !key) {
      map.extra.push({ key: columnKey(label, index), label, index });
    }
  });

  return map;
}

function headerScore(map: HeaderMap) {
  return requiredHeaders.filter((key) => map[key] >= 0).length + (map.monthly.length ? 1 : 0);
}

function findHeaderRow(rows: unknown[][]) {
  let best: { index: number; map: HeaderMap; score: number } | null = null;
  for (let index = 0; index < rows.length; index += 1) {
    const map = buildHeaderMap(rows[index], rows[index - 1] || []);
    const score = headerScore(map);
    if (score >= 4 && (!best || score > best.score)) best = { index, map, score };
  }
  return best;
}

function readCell(row: unknown[], index: number) {
  return index >= 0 ? row[index] : "";
}

function warning(type: string, message: string, severity: StockPricingImportWarning["severity"] = "warning", row?: number, productName?: string): StockPricingImportWarning {
  return { type, message, severity, row, productName };
}

function validPositive(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function calculateBaseStockPrice({ custo, margemFator, divisorAjuste = 1 }: { custo: number | null | undefined; margemFator: number | null | undefined; divisorAjuste?: number | null }) {
  if (!validPositive(custo) || !validPositive(margemFator)) return null;
  const divisor = validPositive(divisorAjuste) ? divisorAjuste : 1;
  return (custo / margemFator) / divisor;
}

export function calculateSalePrice(product: Pick<StockPricingProduct, "precoCusto" | "margem" | "margemFator" | "divisorAjuste" | "precoVenda">) {
  return calculateBaseStockPrice({
    custo: product.precoCusto,
    margemFator: product.margemFator ?? product.margem,
    divisorAjuste: product.divisorAjuste
  }) ?? product.precoVenda ?? null;
}

export function calculateMargin(product: Pick<StockPricingProduct, "precoCusto" | "precoVenda" | "margem" | "margemFator">) {
  if (validPositive(product.precoCusto) && validPositive(product.precoVenda)) return product.precoCusto / product.precoVenda;
  return product.margemFator ?? product.margem ?? null;
}

export function calculateTermPrice({ basePrice, vencimentoDate, termDate, antecipacao, juros }: { basePrice: number | null | undefined; vencimentoDate: string | null | undefined; termDate: string | null | undefined; antecipacao?: number | null; juros?: number | null }) {
  if (!validPositive(basePrice) || !vencimentoDate || !termDate) return null;
  const due = new Date(vencimentoDate);
  const term = new Date(termDate);
  if (Number.isNaN(due.getTime()) || Number.isNaN(term.getTime())) return null;
  const diffDays = (term.getTime() - due.getTime()) / 86400000;
  const rate = term.getTime() <= due.getTime() ? antecipacao || 0 : juros || 0;
  return Math.round((1 + ((diffDays / 30) * rate)) * basePrice);
}

export function calculateMonthlyPrices(product: StockPricingProduct, basePrice = calculateSalePrice(product), overwriteManualTerms = false) {
  const prazoPrices = (product.prazoPrices || []).map((term) => {
    if (term.manuallyEdited && !overwriteManualTerms) return term;
    if (term.formula && !term.date) return { ...term, formulaType: "calculated" as const };
    const price = calculateTermPrice({
      basePrice,
      vencimentoDate: product.vencimento,
      termDate: term.date,
      antecipacao: product.antecipacao,
      juros: product.juros
    });
    return { ...term, price, formulaType: price === null ? term.formulaType : "calculated" as const, manuallyEdited: false };
  });
  const monthlyPrices = prazoPrices.reduce<Record<string, number | null>>((acc, term) => {
    acc[term.key] = term.price;
      return acc;
  }, { ...(product.monthlyPrices || {}) });
  return { prazoPrices, monthlyPrices };
}

export function calculateStockPricingRow(product: StockPricingProduct, overwriteManualTerms = false): StockPricingProduct {
  const margemFator = product.margemFator ?? product.margem;
  const basePrice = calculateSalePrice(product);
  const { prazoPrices, monthlyPrices } = calculateMonthlyPrices(product, basePrice, overwriteManualTerms);
  return {
    ...product,
    custo: product.precoCusto,
    margem: margemFator ?? null,
    margemFator: margemFator ?? null,
    precoVenda: basePrice,
    prazoPrices,
    monthlyPrices,
    updatedAt: new Date().toISOString()
  };
}

export function recalculateStockPricingProduct(product: StockPricingProduct, overwriteManualTerms = false): StockPricingProduct {
  return calculateStockPricingRow(product, overwriteManualTerms);
}

export function calculateStockPricingStatus(product: Pick<StockPricingProduct, "precoCusto" | "precoVenda" | "margem" | "margemFator" | "vencimento">, totalAvailable?: number | null): StockPricingProductStatus {
  if (!product.precoVenda) return "sem_preco";
  if (!product.precoCusto || !(product.margemFator ?? product.margem) || !product.vencimento) return "incompleto";
  const due = new Date(product.vencimento);
  const today = new Date(new Date().toDateString()).getTime();
  if (!Number.isNaN(due.getTime()) && due.getTime() < today) return "vencido";
  if (((product.precoVenda - product.precoCusto) / product.precoVenda) <= 0.05) return "revisar_margem";
  if (typeof totalAvailable === "number") return totalAvailable > 0 ? "pronto_para_cotacao" : "sem_estoque";
  return "completo";
}

function buildImportedColumns(map: HeaderMap, sheet: XLSX.WorkSheet, headerRowIndex: number): StockPricingImportedColumn[] {
  const known: StockPricingImportedColumn[] = [
    ["produto", "Produto", map.produto, "input"],
    ["linha", "Linha", map.linha, "input"],
    ["fornecedor", "Fornecedor", map.fornecedor, "input"],
    ["embalagem", "Embalagem", map.embalagem, "input"],
    ["precoCusto", "Custo", map.precoCusto, "input"],
    ["vencimento", "Vencimento", map.vencimento, "input"],
    ["antecipacao", "Ant.", map.antecipacao, "input"],
    ["juros", "Juros", map.juros, "input"],
    ["margem", "Margem", map.margem, "input"],
    ["precoVenda", "Preço venda", map.precoVenda, "calculated"]
  ].filter(([, , index]) => Number(index) >= 0).map(([key, label, index, role]) => ({
    key: String(key),
    label: String(label),
    index: Number(index),
    role: role as StockPricingImportedColumn["role"],
    formula: readFormula(sheet, headerRowIndex + 1, Number(index))
  }));
  const terms = map.monthly.map((month) => ({ key: month.key, label: month.key, index: month.index, role: "term" as const, formula: readFormula(sheet, headerRowIndex + 1, month.index) }));
  const extras = map.extra.map((column) => ({ ...column, role: "extra" as const, formula: readFormula(sheet, headerRowIndex + 1, column.index) }));
  return [...known, ...terms, ...extras].sort((a, b) => a.index - b.index);
}

function readProducts(rows: unknown[][], sheet: XLSX.WorkSheet, headerRowIndex: number, map: HeaderMap, fileName: string) {
  const products: StockPricingProduct[] = [];
  const warnings: StockPricingImportWarning[] = [];
  let emptySequence = 0;

  for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const productName = normalizeText(readCell(row, map.produto));
    const hasAny = [map.produto, map.linha, map.fornecedor, map.embalagem, map.precoCusto, map.precoVenda]
      .some((index) => normalizeText(readCell(row, index)));
    if (!hasAny) {
      emptySequence += 1;
      if (emptySequence >= 8) break;
      continue;
    }
    emptySequence = 0;
    if (!productName) {
      warnings.push(warning("missing_product", "Linha ignorada por estar sem produto.", "warning", rowIndex + 1));
      continue;
    }

    const precoCusto = parseNumber(readCell(row, map.precoCusto));
    const precoVenda = parseNumber(readCell(row, map.precoVenda));
    const vencimento = parseDate(readCell(row, map.vencimento));
    const margemFator = parseNumber(readCell(row, map.margem));
    const prazoPrices: StockPricingTermPrice[] = map.monthly.map((month) => ({
      key: month.key,
      label: month.key,
      dateSerial: month.dateSerial,
      date: month.date,
      price: parseNumber(readCell(row, month.index)),
      formula: readFormula(sheet, rowIndex, month.index),
      formulaType: "calculated",
      manuallyEdited: false
    }));
    const pricingFormulas: Record<string, string> = {};
    ([
      ["precoCusto", map.precoCusto],
      ["vencimento", map.vencimento],
      ["antecipacao", map.antecipacao],
      ["juros", map.juros],
      ["margem", map.margem],
      ["precoVenda", map.precoVenda]
    ] as const).forEach(([key, index]) => {
      const formula = readFormula(sheet, rowIndex, index);
      if (formula) pricingFormulas[key] = formula;
    });
    const extraValues = map.extra.reduce<Record<string, string | number | null>>((acc, column) => {
      const value = readCell(row, column.index);
      acc[column.key] = typeof value === "number" ? value : normalizeText(value) || null;
      const formula = readFormula(sheet, rowIndex, column.index);
      if (formula) pricingFormulas[column.key] = formula;
      return acc;
    }, {});
    const monthlyPrices = prazoPrices.reduce<Record<string, number | null>>((acc, term) => {
      acc[term.key] = term.price;
      return acc;
    }, {});

    if (!precoVenda) warnings.push(warning("missing_sale_price", `Produto ${productName} sem preço de venda.`, "warning", rowIndex + 1, productName));
    if (!precoCusto) warnings.push(warning("missing_cost", `Produto ${productName} sem preço de custo.`, "warning", rowIndex + 1, productName));
    if (!vencimento) warnings.push(warning("missing_due_date", `Produto ${productName} sem vencimento.`, "info", rowIndex + 1, productName));
    if (!margemFator) warnings.push(warning("missing_margin", `Produto ${productName} sem margem/fator.`, "warning", rowIndex + 1, productName));

    const product = recalculateStockPricingProduct({
      id: crypto.randomUUID(),
      produto: productName,
      linha: normalizeText(readCell(row, map.linha)),
      fornecedor: normalizeText(readCell(row, map.fornecedor)),
      embalagem: normalizeText(readCell(row, map.embalagem)),
      precoCusto,
      custo: precoCusto,
      vencimento,
      antecipacao: parseNumber(readCell(row, map.antecipacao)),
      juros: parseNumber(readCell(row, map.juros)),
      margem: margemFator,
      margemFator,
      divisorAjuste: 1,
      precoVenda,
      monthlyPrices,
      prazoPrices,
      extraValues,
      pricingFormulas,
      observation: "",
      observacao: "",
      sourceFileName: fileName,
      importedAt: new Date().toISOString(),
      status: "incompleto",
      updatedAt: new Date().toISOString()
    });
    products.push({ ...product, status: calculateStockPricingStatus(product) });
  }

  return { products, warnings };
}

export async function parseStockPricingFile(file: File): Promise<StockPricingImportDraft> {
  if (!/\.(xlsx|xls)$/i.test(file.name)) throw new Error("Arquivo inválido. Importe uma planilha Excel no formato correto.");
  const buffer = await file.arrayBuffer();
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "array", cellDates: true, cellFormula: true });
  } catch {
    throw new Error("Arquivo inválido. Importe uma planilha Excel no formato correto.");
  }

  const preferredSheet = workbook.SheetNames.find((name) => comparable(name) === "apoio");
  let selected: { sheetName: string; rows: unknown[][]; header: NonNullable<ReturnType<typeof findHeaderRow>> } | null = null;
  for (const sheetName of [preferredSheet, ...workbook.SheetNames].filter(Boolean) as string[]) {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], { header: 1, defval: "", raw: true }) as unknown[][];
    const header = findHeaderRow(rows);
    if (header && headerScore(header.map) >= 5) {
      selected = { sheetName, rows, header };
      break;
    }
  }

  if (!selected) {
    throw new Error("Não foi possível identificar a tabela de precificação. Verifique se a planilha possui colunas como PRODUTOS, PREÇO DE CUSTO, VENCIMENTO, MARGEM e PREÇO DE VENDA.");
  }

  const sheet = workbook.Sheets[selected.sheetName];
  const { products, warnings } = readProducts(selected.rows, sheet, selected.header.index, selected.header.map, file.name);
  const missingHeaders = requiredHeaders.filter((key) => selected.header.map[key] < 0);
  const importWarnings = [
    ...missingHeaders.map((key) => warning("missing_header", `Coluna esperada não encontrada: ${key}.`, "warning")),
    ...warnings
  ];
  const termColumns = selected.header.map.monthly.map((month) => ({
    key: month.key,
    label: month.key,
    dateSerial: month.dateSerial,
    date: month.date,
    price: null,
    formula: readFormula(sheet, selected.header.index + 1, month.index),
    formulaType: "calculated" as const
  }));
  const importedColumns = buildImportedColumns(selected.header.map, sheet, selected.header.index);
  const extraColumns = importedColumns.filter((column) => column.role === "extra");

  return {
    id: crypto.randomUUID(),
    fileName: file.name,
    sourceSheetName: selected.sheetName,
    readAt: new Date().toISOString(),
    monthReference: termColumns[0]?.label,
    termColumns,
    importedColumns,
    extraColumns,
    products,
    importWarnings
  };
}

export function loadStockPricingTable(): StockPricingTable | null {
  try {
    const stored = localStorage.getItem(stockPricingTableKey);
    return stored ? JSON.parse(stored) as StockPricingTable : null;
  } catch {
    return null;
  }
}

export function saveStockPricingTable(table: StockPricingTable | null) {
  if (!table) {
    localStorage.removeItem(stockPricingTableKey);
    return;
  }
  localStorage.setItem(stockPricingTableKey, JSON.stringify(table));
}

export function loadStockPricingHistory() {
  return readStoredArray<StockPricingHistory>(stockPricingHistoryKey);
}

export function saveStockPricingHistory(history: StockPricingHistory[]) {
  writeStoredArray(stockPricingHistoryKey, history);
}

export function confirmStockPricingDraft(draft: StockPricingImportDraft, currentHistory: StockPricingHistory[]) {
  const warningCount = draft.importWarnings.filter((item) => item.severity !== "info").length;
  const importedAt = new Date().toISOString();
  const table: StockPricingTable = {
    id: crypto.randomUUID(),
    fileName: draft.fileName,
    importedAt,
    monthReference: draft.monthReference,
    termColumns: draft.termColumns,
    importedColumns: draft.importedColumns,
    extraColumns: draft.extraColumns,
    active: true,
    products: draft.products.map((product) => ({ ...product, sourceFileName: draft.fileName, importedAt })),
    importWarnings: draft.importWarnings
  };
  const history: StockPricingHistory[] = [
    {
      id: crypto.randomUUID(),
      fileName: draft.fileName,
      importedAt,
      productCount: draft.products.length,
      warningCount,
      changedCount: 0,
      lastEditedAt: importedAt,
      user: "local"
    },
    ...currentHistory
  ].slice(0, 30);

  return { table, history };
}

export function stockByProduct(consolidated: ConsolidatedStockItem[]) {
  const map = new Map<string, ConsolidatedStockItem>();
  consolidated.forEach((item) => map.set(normalizeStockSearch(item.productName), item));
  return map;
}

export function getPricingStockMatch(productName: string, consolidated: ConsolidatedStockItem[]) {
  const normalized = normalizeStockSearch(productName);
  return consolidated.find((item) => normalizeStockSearch(item.productName) === normalized)
    || consolidated.find((item) => normalizeStockSearch(item.productName).includes(normalized) || normalized.includes(normalizeStockSearch(item.productName)))
    || null;
}

export function emptyStockPricingProduct(productName = "", group = "", termColumns: StockPricingTermPrice[] = []): StockPricingProduct {
  const prazoPrices = termColumns.map((term) => ({ ...term, price: null, formulaType: "calculated" as const, manuallyEdited: false }));
  return {
    id: crypto.randomUUID(),
    produto: productName,
    linha: group,
    fornecedor: "",
    embalagem: "",
    precoCusto: null,
    custo: null,
    vencimento: null,
    antecipacao: null,
    juros: null,
    margem: null,
    margemFator: null,
    divisorAjuste: 1,
    precoVenda: null,
    monthlyPrices: prazoPrices.reduce<Record<string, number | null>>((acc, term) => {
      acc[term.key] = null;
      return acc;
    }, {}),
    prazoPrices,
    extraValues: {},
    pricingFormulas: {},
    observation: "",
    observacao: "",
    status: "incompleto",
    updatedAt: new Date().toISOString()
  };
}

export function withCommercialStatus(product: StockPricingProduct, stock?: ConsolidatedStockItem | null): StockPricingProduct {
  return {
    ...product,
    custo: product.custo ?? product.precoCusto,
    margemFator: product.margemFator ?? product.margem,
    status: calculateStockPricingStatus(product, stock ? stock.totalAvailable : null)
  };
}

export function emptyUnitStock(): Record<StockUnit, number> {
  return {
    "São Gotardo": 0,
    "Santa Juliana": 0,
    "Campos Altos": 0
  };
}
