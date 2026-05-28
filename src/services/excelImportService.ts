import * as XLSX from "xlsx";
import type { ImportWarning, Product, WeeklyTableImport, WeeklyTableLineDeviation } from "../types";
import { isPast } from "../utils/date";

const expectedDeviationLines = [
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

type HeaderMap = {
  codeIdx: number;
  groupIdx: number;
  descIdx: number;
  referenceIdx: number;
  characteristicIdx: number;
  packagingIdx: number;
  producerIdx: number;
  resellerIdx: number;
  discountIdx: number;
  pricingDeviationIdx: number;
  finalIdx: number;
};

type ProductTableMatch = {
  rowIndex: number;
  map: HeaderMap;
  score: number;
};

type WeeklyFinalPriceInput = {
  revenda: number | null | undefined;
  desvioPrecificacao?: number | null | undefined;
  ptax: number | null | undefined;
  frete: number | null | undefined;
  icms: number | null | undefined;
  margemIcms: number | null | undefined;
};

function normalize(value: unknown): string {
  return String(value ?? "").trim();
}

function comparable(value: unknown): string {
  return normalize(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(value: unknown, candidates: string[]) {
  const text = comparable(value);
  return candidates.some((candidate) => text.includes(comparable(candidate)));
}

function findHeader(headers: string[], candidates: string[]) {
  return headers.findIndex((header) => includesAny(header, candidates));
}

function findExactHeader(headers: string[], candidates: string[]) {
  return headers.findIndex((header) => candidates.some((candidate) => comparable(header) === comparable(candidate)));
}

function readCell(row: unknown[], index: number) {
  return index >= 0 ? row[index] : "";
}

function parseNumber(value: unknown): number {
  if (typeof value === "number") return value;
  const raw = normalize(value).replace(/[^\d,.-]/g, "");
  if (!raw) return 0;
  const text = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  return Number(text) || 0;
}

function parseDateCandidate(value: unknown): string | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
  if (typeof value === "number" && value > 20000 && value < 80000) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) return new Date(parsed.y, parsed.m - 1, parsed.d, 23, 59, 59).toISOString();
  }
  const text = normalize(value);
  const match = text.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (!match) return undefined;
  const [, dayOrMonth, monthOrDay, year] = match;
  const fullYear = year.length === 2 ? `20${year}` : year;
  const first = Number(dayOrMonth);
  const second = Number(monthOrDay);
  const month = first > 12 ? second : first;
  const day = first > 12 ? first : second;
  return new Date(Number(fullYear), month - 1, day, 23, 59, 59).toISOString();
}

function valueNearLabel(rows: unknown[][], labels: string[]): unknown {
  for (const row of rows) {
    for (let index = 0; index < row.length; index += 1) {
      if (!includesAny(row[index], labels)) continue;
      const candidates = [row[index + 1], row[index + 2], row[index - 1], row[index - 2]];
      const value = candidates.find((candidate) => normalize(candidate));
      if (value !== undefined) return value;
    }
  }
  return undefined;
}

function findNumberNearLabel(rows: unknown[][], labels: string[]) {
  const value = valueNearLabel(rows, labels);
  const parsed = parseNumber(value);
  return parsed || undefined;
}

function findDateNearLabel(rows: unknown[][], labels: string[]) {
  const value = valueNearLabel(rows, labels);
  return parseDateCandidate(value);
}

function buildHeaderMap(headers: string[]): HeaderMap {
  return {
    codeIdx: findExactHeader(headers, ["produto", "codigo", "cod"]),
    groupIdx: findHeader(headers, ["grupo de familia", "grupo familia", "familia", "grupo"]),
    descIdx: findHeader(headers, ["descricao", "produto descricao"]),
    referenceIdx: findHeader(headers, ["referencia complementar", "referencia", "ref complementar"]),
    characteristicIdx: findHeader(headers, ["caracteristica"]),
    packagingIdx: findHeader(headers, ["embalagem"]),
    producerIdx: findHeader(headers, ["produtor"]),
    resellerIdx: findHeader(headers, ["revenda"]),
    discountIdx: findHeader(headers, ["desconto"]),
    pricingDeviationIdx: findHeader(headers, ["desvio precificacao", "desvio de precificacao", "desconto precificacao", "desvio"]),
    finalIdx: findHeader(headers, ["preco final"])
  };
}

function headerScore(map: HeaderMap) {
  return [map.codeIdx, map.groupIdx, map.descIdx, map.packagingIdx, map.resellerIdx, map.finalIdx].filter((index) => index >= 0).length;
}

function findProductTable(rows: unknown[][]): ProductTableMatch | null {
  let best: ProductTableMatch | null = null;
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const headers = row.map(normalize);
    const map = buildHeaderMap(headers);
    const score = headerScore(map);
    if (score >= 4 && (!best || score > best.score)) best = { rowIndex, map, score };
  }
  return best;
}

function findProductSheet(workbook: XLSX.WorkBook) {
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { header: 1, defval: "", raw: false }) as unknown as unknown[][];
    const table = findProductTable(rows);
    if (table) return { sheetName, rows, table };
  }
  return null;
}

function normalizeDeviationLine(value: string) {
  return comparable(value).replace(/\s/g, "");
}

function readLineDeviations(rows: unknown[][]): WeeklyTableLineDeviation[] {
  const found = new Map<string, WeeklyTableLineDeviation>();
  rows.forEach((row) => {
    row.forEach((cell, index) => {
      const text = normalize(cell);
      if (!text) return;
      const expected = expectedDeviationLines.find((line) => normalizeDeviationLine(line) === normalizeDeviationLine(text));
      if (!expected) return;
      const deviation = parseNumber(row[index + 1]) || parseNumber(row[index - 1]) || parseNumber(row[index + 2]);
      found.set(normalizeDeviationLine(expected), { line: expected, deviation, foundInSpreadsheet: true });
    });
  });

  return expectedDeviationLines.map((line) => found.get(normalizeDeviationLine(line)) || { line, deviation: 0, foundInSpreadsheet: false });
}

function validPositive(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function calculateWeeklyFinalPrice({ revenda, desvioPrecificacao = 0, ptax, frete, icms, margemIcms }: WeeklyFinalPriceInput) {
  if (!validPositive(revenda) || !validPositive(ptax) || !validPositive(icms) || !validPositive(margemIcms)) return null;
  const resellerPrice = revenda;
  const ptaxValue = ptax;
  const icmsValue = icms;
  const marginIcmsValue = margemIcms;
  const pricingDeviation = Number.isFinite(desvioPrecificacao || 0) ? desvioPrecificacao || 0 : 0;
  const freightValue = Number.isFinite(frete || 0) ? frete || 0 : 0;
  return ((((resellerPrice - pricingDeviation) * ptaxValue) + freightValue) / icmsValue) / marginIcmsValue;
}

export function calculateYaraFinalPrice(resellerPrice: number, discount: number, ptax: number, freight: number, icms: number, marginIcms: number) {
  return calculateWeeklyFinalPrice({ revenda: resellerPrice, desvioPrecificacao: discount, ptax, frete: freight, icms, margemIcms: marginIcms }) || 0;
}

function warning(type: string, message: string, severity: ImportWarning["severity"] = "warning", row?: number, productCode?: string): ImportWarning {
  return { type, message, severity, row, productCode };
}

export function validarImportacaoPlanilha(imported: WeeklyTableImport): WeeklyTableImport {
  const importWarnings = [...(imported.importWarnings || [])];
  const errors = [...imported.errors];
  const warnings = [...imported.warnings];
  const seen = new Set<string>();
  let duplicated = 0;
  let withoutFinalPrice = 0;
  let zeroPrice = 0;
  let valid = 0;

  if (!imported.ptax) importWarnings.push(warning("missing_ptax", "PTAX vazio.", "error"));
  if (!imported.freight) importWarnings.push(warning("missing_freight", "Frete não informado.", "warning"));
  if (!imported.icms) importWarnings.push(warning("missing_icms", "ICMS vazio.", "error"));
  if (!imported.marginIcms) importWarnings.push(warning("missing_margin_icms", "Margem + ICMS vazia.", "error"));
  if (!imported.expiresAt) importWarnings.push(warning("missing_expiration", "Vencimento vazio.", "error"));
  if (imported.expiresAt && isPast(imported.expiresAt)) importWarnings.push(warning("expired_list", "Vencimento já vencido.", "warning"));

  (imported.lineDeviations || []).forEach((item) => {
    if (!item.foundInSpreadsheet) importWarnings.push(warning("missing_deviation", `Desvio não encontrado para ${item.line}. Valor 0 aplicado.`, "info"));
  });

  imported.products.forEach((product, index) => {
    const row = index + 1;
    const productWarnings = [...(product.importWarnings || [])];
    if (!product.code) productWarnings.push(warning("missing_code", `Produto sem código: ${product.description || "sem descrição"}.`, "error", row));
    if (!product.group) productWarnings.push(warning("missing_group", `Produto ${product.code || "sem código"} sem grupo.`, "warning", row, product.code));
    if (!product.description) productWarnings.push(warning("missing_description", `Produto ${product.code || "sem código"} sem descrição.`, "error", row, product.code));
    if (!product.resellerPrice) productWarnings.push(warning("missing_reseller", `Produto ${product.code || "sem código"} sem revenda.`, "warning", row, product.code));
    if (!product.finalPrice) productWarnings.push(warning("missing_final_price", `Produto ${product.code || "sem código"} sem preço final.`, "warning", row, product.code));
    if (product.discount === undefined || Number.isNaN(product.discount)) productWarnings.push(warning("invalid_discount", `Produto ${product.code || "sem código"} com desconto vazio ou inválido.`, "warning", row, product.code));
    if (Math.abs(product.finalPriceDifference || 0) > 1) productWarnings.push(warning("final_price_difference", `Diferença entre preço final importado e recalculado em ${product.code || "produto sem código"}.`, "warning", row, product.code));
    product.importWarnings = productWarnings;
    importWarnings.push(...productWarnings);

    if (!product.finalPrice) withoutFinalPrice += 1;
    if (product.finalPrice === 0) zeroPrice += 1;
    if (product.code && seen.has(product.code)) duplicated += 1;
    if (product.code) seen.add(product.code);
    if (product.code && product.description && product.finalPrice > 0) valid += 1;
    if (product.finalPrice > 30000 || (product.finalPrice > 0 && product.finalPrice < 300)) importWarnings.push(warning("price_range", `Preço fora da faixa esperada em ${product.code}.`, "warning", row, product.code));
  });

  errors.push(...importWarnings.filter((item) => item.severity === "error").map((item) => item.message));
  warnings.push(...importWarnings.filter((item) => item.severity !== "error").map((item) => item.message));

  return {
    ...imported,
    errors: Array.from(new Set(errors)),
    warnings: Array.from(new Set(warnings)),
    importWarnings,
    stats: { found: imported.products.length, valid, withoutFinalPrice, duplicated, zeroPrice }
  };
}

function readProducts(rows: unknown[][], headerRowIndex: number, map: HeaderMap, imported: Pick<WeeklyTableImport, "ptax" | "freight" | "icms" | "marginIcms">) {
  const products: Product[] = [];
  let emptySequence = 0;

  for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const hasAnyProductCell = [map.codeIdx, map.groupIdx, map.descIdx, map.referenceIdx, map.packagingIdx, map.resellerIdx, map.finalIdx]
      .some((cellIndex) => normalize(readCell(row, cellIndex)));
    if (!hasAnyProductCell) {
      emptySequence += 1;
      if (emptySequence >= 3) break;
      continue;
    }
    emptySequence = 0;
    const index = rowIndex - headerRowIndex - 1;

    const code = normalize(readCell(row, map.codeIdx));
    const resellerPrice = parseNumber(readCell(row, map.resellerIdx));
    const discount = parseNumber(readCell(row, map.discountIdx));
    const desvioPrecificacao = parseNumber(readCell(row, map.pricingDeviationIdx));
    const importedFinalPrice = parseNumber(readCell(row, map.finalIdx));
    const calculatedFinalPrice = calculateWeeklyFinalPrice({
      revenda: resellerPrice,
      desvioPrecificacao,
      ptax: imported.ptax,
      frete: imported.freight,
      icms: imported.icms,
      margemIcms: imported.marginIcms
    });
    const finalPriceDifference = calculatedFinalPrice === null || !importedFinalPrice ? null : calculatedFinalPrice - importedFinalPrice;

    products.push({
      id: `yara-${code || Date.now()}-${index}`,
      code,
      group: normalize(readCell(row, map.groupIdx)),
      description: normalize(readCell(row, map.descIdx)),
      reference: normalize(readCell(row, map.referenceIdx)),
      characteristic: normalize(readCell(row, map.characteristicIdx)),
      packaging: normalize(readCell(row, map.packagingIdx)),
      supplier: "Yara",
      producerPrice: parseNumber(readCell(row, map.producerIdx)),
      resellerPrice,
      discount,
      desvioPrecificacao,
      finalPrice: importedFinalPrice || 0,
      calculatedFinalPrice,
      finalPriceDifference,
      calculationStatus: calculatedFinalPrice === null ? "incomplete" : finalPriceDifference !== null && Math.abs(finalPriceDifference) > 1 ? "divergent" : "ok",
      available: true
    });
  }

  return products;
}

export async function parseWeeklyTableFile(file: File): Promise<WeeklyTableImport> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const selected = findProductSheet(workbook);
  if (!selected) {
    return validarImportacaoPlanilha({
      supplier: "Yara",
      fileName: file.name,
      products: [],
      errors: ["Cabeçalhos da tabela de produtos não encontrados."],
      warnings: [],
      importWarnings: [warning("missing_product_table", "Cabeçalhos da tabela de produtos não encontrados.", "error")],
      stats: { found: 0, valid: 0, withoutFinalPrice: 0, duplicated: 0, zeroPrice: 0 }
    });
  }

  const { sheetName, rows, table } = selected;
  const topRows = rows.slice(0, table.rowIndex);
  const ptax = findNumberNearLabel(topRows, ["ptax"]);
  const freight = findNumberNearLabel(topRows, ["frete"]);
  const icms = findNumberNearLabel(topRows, ["icms"]);
  const marginIcms = findNumberNearLabel(topRows, ["margem + icms", "margem"]);
  const expiresAt = findDateNearLabel(topRows, ["vencimento lista", "vencimento da lista"]) || topRows.flat().map(parseDateCandidate).find(Boolean);
  const listCode = normalize(topRows[3]?.[8]);
  const listName = normalize(topRows[3]?.[9]);
  const lineDeviations = readLineDeviations(rows);
  const products = readProducts(rows, table.rowIndex, table.map, { ptax, freight, icms, marginIcms });
  const foundDeviations = lineDeviations.filter((item) => item.foundInSpreadsheet).length;

  return validarImportacaoPlanilha({
    supplier: "Yara",
    fileName: file.name,
    sourceSheetName: sheetName,
    listCode,
    listName,
    lineDeviations,
    weeklyAvailableDeviations: lineDeviations.map((item) => ({ ...item })),
    deviationStats: { found: foundDeviations, missing: lineDeviations.length - foundDeviations },
    ptax,
    expiresAt,
    freight,
    icms,
    marginIcms,
    products,
    errors: [],
    warnings: [],
    importWarnings: [],
    stats: { found: products.length, valid: 0, withoutFinalPrice: 0, duplicated: 0, zeroPrice: 0 }
  });
}
