import { supabase } from "../supabaseClient";
import type { MarketSource } from "../../types";

export async function fetchMarketSources(): Promise<MarketSource[]> {
  const { data, error } = await supabase
    .from("market_sources")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToSource);
}

export async function upsertMarketSources(sources: MarketSource[]): Promise<void> {
  if (!sources.length) return;
  const { error } = await supabase
    .from("market_sources")
    .upsert(sources.map(sourceToRow), { onConflict: "id" });
  if (error) throw error;
}

export async function deleteMarketSource(id: string): Promise<void> {
  const { error } = await supabase.from("market_sources").delete().eq("id", id);
  if (error) throw error;
}

function sourceToRow(s: MarketSource) {
  return {
    id: s.id,
    name: s.name,
    category: s.category,
    source_type: s.sourceType,
    confidence: s.confidence,
    is_active: s.isActive,
    use_in_briefing: s.useInBriefing,
    url: s.url ?? null,
    observation: s.observation ?? null,
    last_status: s.lastStatus,
    updated_at: s.updatedAt,
  };
}

function rowToSource(r: Record<string, unknown>): MarketSource {
  return {
    id: r.id as string,
    name: r.name as string,
    category: r.category as MarketSource["category"],
    sourceType: r.source_type as MarketSource["sourceType"],
    confidence: r.confidence as MarketSource["confidence"],
    isActive: r.is_active as boolean,
    useInBriefing: r.use_in_briefing as boolean,
    url: (r.url as string) ?? undefined,
    observation: (r.observation as string) ?? undefined,
    lastStatus: r.last_status as MarketSource["lastStatus"],
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}
