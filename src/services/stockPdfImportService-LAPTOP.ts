import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { StockImportDraft, StockImportWarning, StockItem, StockItemType, StockUnit } from "../types";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const knownGroups = new Set([
  "ADUBO CONVENCIONAL",
  "AQUA",
  "FORTGREEN",
  "MICROSOLO",
  "SAIS",
  "SANTA CLARA",
  "YARA",
  "YARAVITA",
  "OMYA"
]);

const ignoredExactLines = [
  "Tabela de Estoque Disponível para Vendas",
  "Seguimento Estoque Físico PV Retira Loja Pedido de Compra Saldo Consignado Estoque Disponível",
  "Seguimento Estoque Fisico PV Retira Loja Pedido de Compra Saldo Consignado Estoque Disponivel"
];

const numberPattern = /^-?\d{1,3}(?:\.\d{3})*(?:,\d+)?$|^-?\d+(?:,\d+)?$/;

type PositionedText = {
  text: string;
  x: number;
  y: number;
};

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function comparable(value: string) {
  return normalizeText(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase();
}

export function parseStockNumber(value: string): number {
  const clean = value.replace(/[^\d,.-]/g, "");
  if (!clean) return 0;
  const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean.replace(/\.(?=\d{3}(?:\D|$))/g, "");
  return Number(normalized) || 0;
}

function isIgnoredLine(line: string) {
  const text = comparable(line);
  if (!text) return true;
  if (ignoredExactLines.some((item) => comparable(item) === text)) return true;
  if (text.includes("ESTOQUE FISICO") && text.includes("ESTOQUE DISPONIVEL")) return true;
  if (text.startsWith("TOTAL GERAL")) return true;
  return false;
}

function hasProductSignal(name: string) {
  const text = comparable(name);
  return /(\d{2}-\d{2}-\d{2})|(\d+[,.]?\d*\s*(KG|LT|L)\b)|\/|UREIA|KCL|BORTRAC|CALTRAC|FOLICARE|FERTIL/.test(text);
}

function classifyLine(name: string): StockItemType {
  const text = comparable(name);
  if (knownGroups.has(text)) return "group";
  if (hasProductSignal(name)) return "product";
  if (text.length <= 24 && !text.includes("/") && text.split(" ").length <= 3) return "group";
  return "product";
}

function buildLineItem(line: string, unit: StockUnit, sourceFileName: string, importedAt: string, currentGroup: string) {
  const tokens = normalizeText(line).split(" ");
  const numericTokens: string[] = [];
  let index = tokens.length - 1;

  while (index >= 0 && numericTokens.length < 5) {
    if (!numberPattern.test(tokens[index])) break;
    numericTokens.unshift(tokens[index]);
    index -= 1;
  }

  if (numericTokens.length !== 5) return null;

  const productName = tokens.slice(0, index + 1).join(" ").trim();
  if (!productName) return null;

  const type = classifyLine(productName);
  const [physicalStock, pvRetiraLoja, purchaseOrder, consignedBalance, availableStock] = numericTokens.map(parseStockNumber);
  const group = type === "group" ? productName : currentGroup;

  return {
    id: crypto.randomUUID(),
    unit,
    group,
    productName,
    physicalStock,
    pvRetiraLoja,
    purchaseOrder,
    consignedBalance,
    availableStock,
    type,
    sourceFileName,
    importedAt
  } satisfies StockItem;
}

function extractLinesFromTextItems(items: PositionedText[]) {
  const sorted = [...items]
    .filter((item) => item.text.trim())
    .sort((a, b) => Math.abs(b.y - a.y) > 2 ? b.y - a.y : a.x - b.x);

  const rows: PositionedText[][] = [];
  sorted.forEach((item) => {
    const row = rows.find((candidate) => Math.abs(candidate[0].y - item.y) <= 3);
    if (row) row.push(item);
    else rows.push([item]);
  });

  return rows
    .map((row) => row.sort((a, b) => a.x - b.x).map((item) => item.text).join(" "))
    .map(normalizeText)
    .filter(Boolean);
}

export async function readStockPdf(file: File, unit: StockUnit, mode: StockImportDraft["mode"]): Promise<StockImportDraft> {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) throw new Error("Formato inválido. Importe um arquivo PDF de estoque.");

  const readAt = new Date().toISOString();
  const warnings: StockImportWarning[] = [];

  try {
    const bytes = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
    const allLines: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const positioned = (content.items as Array<{ str?: string; transform?: number[] }>).map((item) => ({
        text: item.str || "",
        x: item.transform?.[4] || 0,
        y: item.transform?.[5] || 0
      }));
      allLines.push(...extractLinesFromTextItems(positioned));
    }

    const items: StockItem[] = [];
    let currentGroup = "";

    allLines.forEach((line) => {
      if (isIgnoredLine(line)) {
        if (comparable(line).startsWith("TOTAL GERAL")) {
          warnings.push({ id: crypto.randomUUID(), line, message: "Linha Total Geral ignorada.", severity: "info" });
        }
        return;
      }

      const item = buildLineItem(line, unit, file.name, readAt, currentGroup);
      if (!item) {
        warnings.push({ id: crypto.randomUUID(), line, message: "Possível erro de leitura. Revise o PDF ou cadastre a linha manualmente.", severity: "warning" });
        return;
      }

      if (item.type === "group") currentGroup = item.productName;
      if (item.type === "product" && !item.group) {
        warnings.push({ id: crypto.randomUUID(), line, message: "Produto sem grupo anterior identificado.", severity: "warning" });
      }
      items.push(item);
    });

    if (!items.length) {
      warnings.push({ id: crypto.randomUUID(), line: file.name, message: "Nenhuma linha de estoque foi interpretada.", severity: "error" });
    }

    return {
      id: crypto.randomUUID(),
      unit,
      fileName: file.name,
      readAt,
      items,
      warnings,
      mode
    };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Formato inválido")) throw error;
    throw new Error("Não foi possível ler o PDF. Confirme se o arquivo está no formato correto e tente novamente.");
  }
}
