import { supabase } from "../supabaseClient";
import type { Campaign } from "../../services/campaignService";

export async function fetchCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToCampaign);
}

export async function upsertCampaigns(campaigns: Campaign[]): Promise<void> {
  if (!campaigns.length) return;
  const { error } = await supabase
    .from("campaigns")
    .upsert(campaigns.map(campaignToRow), { onConflict: "id" });
  if (error) throw error;
}

export async function deleteCampaign(id: string): Promise<void> {
  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) throw error;
}

function campaignToRow(c: Campaign) {
  return {
    id: c.id,
    title: c.title,
    type_label: c.typeLabel,
    subtitle: c.subtitle,
    description: c.description ?? null,
    crop: c.crop ?? null,
    status: c.status,
    payment_dates: c.paymentDates,
    rows: c.rows,
    footer_note: c.footerNote,
    visual_theme: c.visualTheme ?? "PADAP Verde",
    preview_mode: c.previewMode ?? "Normal",
    show_logo: c.showLogo ?? true,
    show_institutional_subtitle: c.showInstitutionalSubtitle ?? true,
    show_footer_note: c.showFooterNote ?? true,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  };
}

function rowToCampaign(r: Record<string, unknown>): Campaign {
  return {
    id: r.id as string,
    title: r.title as string,
    typeLabel: r.type_label as string,
    subtitle: r.subtitle as string,
    description: (r.description as string) ?? undefined,
    crop: (r.crop as string) ?? undefined,
    status: r.status as Campaign["status"],
    paymentDates: (r.payment_dates as string[]) ?? [],
    rows: (r.rows as Campaign["rows"]) ?? [],
    footerNote: r.footer_note as string,
    visualTheme: (r.visual_theme as Campaign["visualTheme"]) ?? "PADAP Verde",
    previewMode: (r.preview_mode as Campaign["previewMode"]) ?? "Normal",
    showLogo: r.show_logo as boolean,
    showInstitutionalSubtitle: r.show_institutional_subtitle as boolean,
    showFooterNote: r.show_footer_note as boolean,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}
