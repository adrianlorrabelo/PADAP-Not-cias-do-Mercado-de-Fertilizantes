import { supabase } from "../supabaseClient";
import type { WeeklyTable } from "../../types";

export async function fetchActiveWeeklyTable(): Promise<WeeklyTable | null> {
  const { data, error } = await supabase
    .from("weekly_tables")
    .select("*")
    .eq("active", true)
    .order("imported_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToWeeklyTable(data as Record<string, unknown>) : null;
}

export async function upsertWeeklyTable(table: WeeklyTable): Promise<void> {
  // deactivate all previous active tables first
  await supabase.from("weekly_tables").update({ active: false }).eq("active", true);

  const { error } = await supabase.from("weekly_tables").upsert({
    id: table.id,
    supplier: table.supplier,
    file_name: table.fileName ?? null,
    list_code: table.listCode ?? null,
    list_name: table.listName ?? null,
    expires_at: table.expiresAt,
    ptax: table.ptax,
    freight: table.freight,
    icms: table.icms,
    margin_icms: table.marginIcms,
    products: table.products,
    imported_at: table.importedAt,
    updated_at: table.updatedAt ?? new Date().toISOString(),
    imported_by: table.importedBy,
    active: table.active,
    metadata: {
      lineDeviations: table.lineDeviations,
      weeklyAvailableDeviations: table.weeklyAvailableDeviations,
      importWarnings: table.importWarnings,
      sourceSheetName: table.sourceSheetName,
    },
  }, { onConflict: "id" });
  if (error) throw error;
}

function rowToWeeklyTable(r: Record<string, unknown>): WeeklyTable {
  const meta = (r.metadata as Record<string, unknown>) ?? {};
  return {
    id: r.id as string,
    supplier: r.supplier as string,
    fileName: (r.file_name as string) ?? undefined,
    listCode: (r.list_code as string) ?? undefined,
    listName: (r.list_name as string) ?? undefined,
    expiresAt: r.expires_at as string,
    ptax: Number(r.ptax),
    freight: Number(r.freight),
    icms: Number(r.icms),
    marginIcms: Number(r.margin_icms),
    products: (r.products as WeeklyTable["products"]) ?? [],
    importedAt: r.imported_at as string,
    updatedAt: (r.updated_at as string) ?? undefined,
    importedBy: r.imported_by as string,
    active: r.active as boolean,
    lineDeviations: (meta.lineDeviations as WeeklyTable["lineDeviations"]) ?? undefined,
    weeklyAvailableDeviations: (meta.weeklyAvailableDeviations as WeeklyTable["weeklyAvailableDeviations"]) ?? undefined,
    importWarnings: (meta.importWarnings as WeeklyTable["importWarnings"]) ?? undefined,
    sourceSheetName: (meta.sourceSheetName as string) ?? undefined,
  };
}
