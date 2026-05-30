import { supabase } from "../supabaseClient";
import type { MinimumStockRule, StockImportHistory, StockItem, StockPricingTable } from "../../types";

// ── Stock Items ───────────────────────────────────────────────

export async function fetchStockItems(): Promise<StockItem[]> {
  const { data, error } = await supabase
    .from("stock_items")
    .select("*")
    .order("product_name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToStockItem);
}

export async function upsertStockItems(items: StockItem[]): Promise<void> {
  if (!items.length) return;
  const { error } = await supabase
    .from("stock_items")
    .upsert(items.map(stockItemToRow), { onConflict: "id" });
  if (error) throw error;
}

export async function deleteAllStockItemsByUnit(unit: string): Promise<void> {
  const { error } = await supabase.from("stock_items").delete().eq("unit", unit);
  if (error) throw error;
}

// ── Minimum Rules ─────────────────────────────────────────────

export async function fetchStockMinimumRules(): Promise<MinimumStockRule[]> {
  const { data, error } = await supabase
    .from("stock_minimum_rules")
    .select("*")
    .order("product_name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToRule);
}

export async function upsertStockMinimumRules(rules: MinimumStockRule[]): Promise<void> {
  if (!rules.length) return;
  const { error } = await supabase
    .from("stock_minimum_rules")
    .upsert(rules.map(ruleToRow), { onConflict: "id" });
  if (error) throw error;
}

export async function deleteStockMinimumRule(id: string): Promise<void> {
  const { error } = await supabase.from("stock_minimum_rules").delete().eq("id", id);
  if (error) throw error;
}

// ── Import History ────────────────────────────────────────────

export async function fetchStockImportHistory(): Promise<StockImportHistory[]> {
  const { data, error } = await supabase
    .from("stock_import_history")
    .select("*")
    .order("imported_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToHistory);
}

export async function insertStockImportHistory(entry: StockImportHistory): Promise<void> {
  const { error } = await supabase.from("stock_import_history").insert({
    id: entry.id,
    unit: entry.unit,
    file_name: entry.fileName,
    imported_at: entry.importedAt,
    product_count: entry.productCount,
    warning_count: entry.warningCount,
  });
  if (error) throw error;
}

// ── Pricing Table ─────────────────────────────────────────────

export async function fetchActiveStockPricingTable(): Promise<StockPricingTable | null> {
  const { data, error } = await supabase
    .from("stock_pricing_tables")
    .select("*")
    .eq("active", true)
    .order("imported_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToPricingTable(data as Record<string, unknown>) : null;
}

export async function upsertStockPricingTable(table: StockPricingTable): Promise<void> {
  const { error } = await supabase.from("stock_pricing_tables").upsert({
    id: table.id,
    file_name: table.fileName,
    imported_at: table.importedAt,
    month_reference: table.monthReference ?? null,
    active: table.active,
    products: table.products,
    import_warnings: table.importWarnings,
    metadata: {
      termColumns: table.termColumns,
      importedColumns: table.importedColumns,
      extraColumns: table.extraColumns,
    },
  }, { onConflict: "id" });
  if (error) throw error;
}

// ── Mappers ───────────────────────────────────────────────────

function stockItemToRow(item: StockItem) {
  return {
    id: item.id,
    unit: item.unit,
    group: item.group,
    product_name: item.productName,
    physical_stock: item.physicalStock,
    pv_retira_loja: item.pvRetiraLoja,
    purchase_order: item.purchaseOrder,
    consigned_balance: item.consignedBalance,
    available_stock: item.availableStock,
    type: item.type,
    source_file_name: item.sourceFileName,
    imported_at: item.importedAt,
  };
}

function rowToStockItem(r: Record<string, unknown>): StockItem {
  return {
    id: r.id as string,
    unit: r.unit as StockItem["unit"],
    group: r.group as string,
    productName: r.product_name as string,
    physicalStock: Number(r.physical_stock),
    pvRetiraLoja: Number(r.pv_retira_loja),
    purchaseOrder: Number(r.purchase_order),
    consignedBalance: Number(r.consigned_balance),
    availableStock: Number(r.available_stock),
    type: r.type as StockItem["type"],
    sourceFileName: r.source_file_name as string,
    importedAt: r.imported_at as string,
  };
}

function ruleToRow(rule: MinimumStockRule) {
  return {
    id: rule.id,
    product_name: rule.productName,
    group: rule.group ?? null,
    unit_of_measure: rule.unitOfMeasure ?? null,
    minimum_stock: rule.minimumStock,
    observation: rule.observation ?? null,
    updated_at: new Date().toISOString(),
  };
}

function rowToRule(r: Record<string, unknown>): MinimumStockRule {
  return {
    id: r.id as string,
    productName: r.product_name as string,
    group: (r.group as string) ?? undefined,
    unitOfMeasure: (r.unit_of_measure as string) ?? undefined,
    minimumStock: Number(r.minimum_stock),
    observation: (r.observation as string) ?? undefined,
  };
}

function rowToHistory(r: Record<string, unknown>): StockImportHistory {
  return {
    id: r.id as string,
    unit: r.unit as StockImportHistory["unit"],
    fileName: r.file_name as string,
    importedAt: r.imported_at as string,
    productCount: Number(r.product_count),
    warningCount: Number(r.warning_count),
  };
}

function rowToPricingTable(r: Record<string, unknown>): StockPricingTable {
  const meta = (r.metadata as Record<string, unknown>) ?? {};
  return {
    id: r.id as string,
    fileName: r.file_name as string,
    importedAt: r.imported_at as string,
    monthReference: (r.month_reference as string) ?? undefined,
    active: r.active as boolean,
    products: (r.products as StockPricingTable["products"]) ?? [],
    importWarnings: (r.import_warnings as StockPricingTable["importWarnings"]) ?? [],
    termColumns: (meta.termColumns as StockPricingTable["termColumns"]) ?? undefined,
    importedColumns: (meta.importedColumns as StockPricingTable["importedColumns"]) ?? undefined,
    extraColumns: (meta.extraColumns as StockPricingTable["extraColumns"]) ?? undefined,
  };
}
