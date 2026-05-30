import { syncCampaignsFromSupabase } from "../services/campaignService";
import { syncMarketSourcesFromSupabase } from "../services/marketSourcesService";
import { syncPlannerFromSupabase } from "../services/plannerService";
import { syncStockFromSupabase } from "../services/stockService";
import { syncWeeklyTableFromSupabase } from "../services/weeklyTableService";

/**
 * Syncs all Supabase data into localStorage so every existing service/page
 * continues to work unchanged. Call once after the user authenticates.
 */
export async function syncAllFromSupabase(): Promise<void> {
  await Promise.allSettled([
    syncPlannerFromSupabase(),
    syncStockFromSupabase(),
    syncCampaignsFromSupabase(),
    syncWeeklyTableFromSupabase(),
    syncMarketSourcesFromSupabase(),
  ]);
}
