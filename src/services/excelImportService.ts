import * as XLSX from "xlsx";
import type { Product, WeeklyTableImport } from "../types";
import { isPast } from "../utils/date";

function normalize(value: unknown): string {
  return String(value ?? "").trim();
}

function comparable(value: unknown): string {
  return normalize(value).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function findHeader(headers: string[], candidates: string[]) {
  return headers.findIndex((header) => candidates.some((candidate) => comparable(header).includes(comparable(candidate))));
}

function readCell(row: unknown[], index: number) {
  return index >= 0 ? row[index] : "";
}

function parseNumber(value: unknown): number {
  if (typeof value === "number") return value;
  const raw = normalize(value).replace(/[^\d,.-]/g, "");
  const text = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  return Number(text) || 0;
}

function parseDateCandidate(value: unknown): string | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
  const text = normalize(value);
  const match = text.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (!match) return undefined;
  const [, day, month, year] = match;
  const fullYear = year.length === 2 ? `20${year}` : year;
  return new Date(Number(fullYear), Number(month) - 1, Number(day), 23, 59, 59).toISOString();
}

export function validarImportacaoPlanilha(imported: WeeklyTableImport): WeeklyTableImport {
  const errors = [...imported.errors];
  const warnings = [...imported.warnings];
  const seen = new Set<string>();
  let duplicated = 0;
  let withoutFinalPrice = 0;
  let zeroPrice = 0;
  let valid = 0;

  if (!imported.ptax) errors.push("PTAX vazio.");
  if (!imported.expiresAt) errors.push("Vencimento vazio.");
  if (imported.expiresAt && isPast(imported.expiresAt)) warnings.push("Vencimento já vencido.");

  imported.products.forEach((product) => {
    if (!product.code) errors.push(`Produto sem código: ${product.description || "sem descrição"}.`);
    if (!product.description) errors.push(`Produto ${product.code || "sem código"} sem descrição.`);
    if (!product.packaging) warnings.push(`Produto ${product.code} com embalagem vazia.`);
    if (!product.finalPrice) withoutFinalPrice += 1;
    if (product.finalPrice === 0) zeroPrice += 1;
    if (product.code && seen.has(product.code)) duplicated += 1;
    if (product.code) seen.add(product.code);
    if (product.code && product.description && product.finalPrice > 0) valid += 1;
    if (product.finalPrice > 20000 || (product.finalPrice > 0 && product.finalPrice < 500)) warnings.push(`Preço fora da faixa esperada em ${product.code}.`);
  });

  return {
    ...imported,
    errors,
    warnings,
    stats: { found: imported.products.length, valid, withoutFinalPrice, duplicated, zeroPrice }
  };
}

export async function parseWeeklyTableFile(file: File): Promise<WeeklyTableImport> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { header: 1, defval: "" }) as unknown as unknown[][];
  const headerRowIndex = rows.findIndex((row) => row.some((cell) => comparable(cell).includes("preço final")));
  if (headerRowIndex < 0) {
    return validarImportacaoPlanilha({ supplier: "Yara", products: [], errors: ["Coluna Preço Final não encontrada."], warnings: [], stats: { found: 0, valid: 0, withoutFinalPrice: 0, duplicated: 0, zeroPrice: 0 } });
  }
  const headers = rows[headerRowIndex].map(normalize);
  const codeIdx = findHeader(headers, ["código", "codigo", "cod"]);
  const descIdx = findHeader(headers, ["descrição", "descricao", "produto"]);
  const groupIdx = findHeader(headers, ["grupo", "família", "familia"]);
  const packagingIdx = findHeader(headers, ["embalagem"]);
  const producerIdx = findHeader(headers, ["produtor"]);
  const resellerIdx = findHeader(headers, ["revenda"]);
  const finalIdx = findHeader(headers, ["preço final", "preço final"]);

  const topText = rows.slice(0, headerRowIndex).flat().map(normalize).join(" ");
  const ptaxMatch = topText.match(/PTAX\D*(\d+[,.]\d+)/i);
  const expiresAt = rows.slice(0, headerRowIndex).flat().map(parseDateCandidate).find(Boolean);
  const products: Product[] = rows.slice(headerRowIndex + 1).filter((row) => row.some(Boolean)).map((row, index) => ({
    id: `imp-${Date.now()}-${index}`,
    code: normalize(readCell(row, codeIdx)),
    group: normalize(readCell(row, groupIdx)) || "Fertilizantes",
    description: normalize(readCell(row, descIdx)),
    reference: "",
    characteristic: "",
    packaging: normalize(readCell(row, packagingIdx)),
    supplier: "Yara",
    producerPrice: parseNumber(readCell(row, producerIdx)),
    resellerPrice: parseNumber(readCell(row, resellerIdx)),
    finalPrice: parseNumber(readCell(row, finalIdx)),
    available: true
  }));

  return validarImportacaoPlanilha({
    supplier: "Yara",
    ptax: ptaxMatch ? Number(ptaxMatch[1].replace(",", ".")) : undefined,
    expiresAt,
    freight: undefined,
    icms: undefined,
    marginIcms: undefined,
    products,
    errors: [],
    warnings: [],
    stats: { found: products.length, valid: 0, withoutFinalPrice: 0, duplicated: 0, zeroPrice: 0 }
  });
}
