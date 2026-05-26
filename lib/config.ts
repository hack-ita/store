// lib/config.ts
export const config = {
  // Always use real API - removed the condition
  useRealApi: true,
  hoplixApiKey: process.env.HOPLIX_API_KEY,
  hoplixApiSecret: process.env.HOPLIX_API_SECRET,
  hoplixCampaignId: process.env.HOPLIX_CAMPAIGN_ID || '00560566',
  
  /**
   * Comma-separated list of campaign IDs to include on the store.
   * When empty (or not set), ALL campaigns from Hoplix are included.
   * Example: HOPLIX_ENABLED_CAMPAIGNS="00560566,00560567,00560568"
   */
  enabledCampaigns: (process.env.HOPLIX_ENABLED_CAMPAIGNS || '').split(',').map(s => s.trim()).filter(Boolean),
  
  /**
   * Comma-separated list of campaign IDs to exclude from the store.
   * Exclusion is applied AFTER enabledCampaigns filtering.
   * Example: HOPLIX_EXCLUDED_CAMPAIGNS="00560569,00560570"
   */
  excludedCampaigns: (process.env.HOPLIX_EXCLUDED_CAMPAIGNS || '').split(',').map(s => s.trim()).filter(Boolean),
};

/**
 * Returns the list of active campaign IDs:
 * - If enabledCampaigns is non-empty, returns those minus excludedCampaigns
 * - If enabledCampaigns is empty, returns all (minus excludedCampaigns, but that happens at fetch time)
 * - Falls back to hoplixCampaignId if no enabledCampaigns specified
 */
export function getActiveCampaignIds(): string[] {
  if (config.enabledCampaigns.length > 0) {
    return config.enabledCampaigns.filter(id => !config.excludedCampaigns.includes(id));
  }
  // When no explicit enabled list, return the default single campaign
  return [config.hoplixCampaignId];
}

/**
 * Filters a list of campaign IDs based on enabled/excluded config.
 * Useful for API routes and server components.
 */
export function filterCampaignIds(campaignIds: string[]): string[] {
  if (config.enabledCampaigns.length > 0) {
    // Only keep campaigns that are in the enabled list AND not excluded
    return campaignIds.filter(id => 
      config.enabledCampaigns.includes(id) && !config.excludedCampaigns.includes(id)
    );
  }
  // No enabled list specified, just remove excluded
  return campaignIds.filter(id => !config.excludedCampaigns.includes(id));
}