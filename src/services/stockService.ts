import type { ConsolidatedStockItem, MinimumStockRule, StockImportDraft, StockImportHistory, StockItem, StockStatus, StockUnit } from "../types";

export const stockUnits: StockUnit[] = ["São Gotardo", "Santa Juliana", "Campos Altos"];

export const stockItemsKey = "padap.stock.items";
export const stockMinimumRulesKey = "padap.stock.minimumRules";
export const stockHistoryKey = "padap.stock.importHistory";

export function normalizeStockSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function getStockStatus(totalAvailable: number, rule?: MinimumStockRule): StockStatus {
  if (totalAvailable < 0) return "Crítico / Negativo";
  if (totalAvailable === 0) return "Zerado";
  if (!rule) return "Sem regra mínima";
  if (totalAvailable <= rule.minimumStock) return "Baixo estoque";
  return "Disponível";
}

export function getStockStatusTone(status: StockStatus): "green" | "amber" | "red" | "neutral" {
  if (status === "Disponível") return "green";
  if (status === "Baixo estoque") return "amber";
  if (status === "Zerado" || status === "Crítico / Negativo") return "red";
  return "neutral";
}

export function readStoredArray<T>(key: string, fallback: T[] = []): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T[] : fallback;
  } catch {
    return fallback;
  }
}

export function writeStoredArray<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadStockItems() {
  return readStoredArray<StockItem>(stockItemsKey);
}

export function saveStockItems(items: StockItem[]) {
  writeStoredArray(stockItemsKey, items);
}

export function loadMinimumRules() {
  return readStoredArray<MinimumStockRule>(stockMinimumRulesKey);
}

export function saveMinimumRules(rules: MinimumStockRule[]) {
  writeStoredArray(stockMinimumRulesKey, rules);
}

export function loadImportHistory() {
  return readStoredArray<StockImportHistory>(stockHistoryKey);
}

export function saveImportHistory(history: StockImportHistory[]) {
  writeStoredArray(stockHistoryKey, history);
}

export function applyStockDraft(currentItems: StockItem[], currentHistory: StockImportHistory[], draft: StockImportDraft) {
  const nextItems = [
    ...currentItems.filter((item) => item.unit !== draft.unit),
    ...draft.items
  ];
  const productCount = draft.items.filter((item) => item.type === "product").length;
  const warningCount = draft.warnings.filter((warning) => warning.severity !== "info").length;
  const nextHistory: StockImportHistory[] = [
    {
      id: crypto.randomUUID(),
      unit: draft.unit,
      fileName: draft.fileName,
      importedAt: new Date().toISOString(),
      productCount,
      warningCount
    },
    ...currentHistory
  ].slice(0, 50);

  return { items: nextItems, history: nextHistory };
}

export function removeUnitStock(currentItems: StockItem[], unit: StockUnit) {
  return currentItems.filter((item) => item.unit !== unit);
}

export function consolidateStock(items: StockItem[], rules: MinimumStockRule[]): ConsolidatedStockItem[] {
  const products = items.filter((item) => item.type === "product");
  const byProduct = new Map<string, ConsolidatedStockItem>();

  products.forEach((item) => {
    const key = item.productName.trim();
    if (!key) return;
    const rule = rules.find((candidate) => normalizeStockSearch(candidate.productName) === normalizeStockSearch(key));
    const existing = byProduct.get(key) || {
      productName: key,
      group: item.group,
      byUnit: {
        "São Gotardo": 0,
        "Santa Juliana": 0,
        "Campos Altos": 0
      },
      totalAvailable: 0,
      minimumRule: rule,
      status: "Sem regra mínima" as StockStatus,
      purchaseSuggestion: null,
      reason: ""
    };

    existing.byUnit[item.unit] += item.availableStock;
    existing.totalAvailable += item.availableStock;
    if (!existing.group && item.group) existing.group = item.group;
    if (!existing.minimumRule && rule) existing.minimumRule = rule;
    byProduct.set(key, existing);
  });

  return [...byProduct.values()]
    .map((item) => {
      const status = getStockStatus(item.totalAvailable, item.minimumRule);
      const purchaseSuggestion = item.minimumRule ? Math.max(0, item.minimumRule.minimumStock - item.totalAvailable) : null;
      const reason = status === "Crítico / Negativo" ? "Estoque negativo"
        : status === "Zerado" ? "Estoque zerado"
          : status === "Baixo estoque" ? "Abaixo do mínimo"
            : status === "Sem regra mínima" ? "Sem regra mínima"
              : "Disponível";
      return { ...item, status, purchaseSuggestion, reason };
    })
    .sort((a, b) => a.productName.localeCompare(b.productName, "pt-BR"));
}

export function getPurchaseSuggestions(consolidated: ConsolidatedStockItem[]) {
  return consolidated.filter((item) => {
    if (item.totalAvailable < 0 || item.totalAvailable === 0) return true;
    return !!item.minimumRule && item.totalAvailable <= item.minimumRule.minimumStock;
  });
}

export function buildPurchaseOrderText(items: ConsolidatedStockItem[]) {
  const lines = items.map((item, index) => {
    const minimum = item.minimumRule ? String(item.minimumRule.minimumStock) : "Sem regra mínima";
    const suggested = item.purchaseSuggestion === null ? "Sem regra mínima" : String(item.purchaseSuggestion);
    return `${index + 1}. ${item.productName} — Estoque atual: ${item.totalAvailable} — Mínimo: ${minimum} — Comprar: ${suggested} — Motivo: ${item.reason}`;
  });

  return `Pedido de compra sugerido:\n${lines.length ? lines.join("\n") : "Nenhum produto em atenção no momento."}`;
}
