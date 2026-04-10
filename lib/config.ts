// lib/config.ts
export const config = {
  // Always use real API - removed the condition
  useRealApi: true,
  hoplixApiKey: process.env.HOPLIX_API_KEY,
  hoplixApiSecret: process.env.HOPLIX_API_SECRET,
  hoplixCampaignId: process.env.HOPLIX_CAMPAIGN_ID || '00560566',
};