import { NextResponse } from 'next/server';
import { hoplixService } from '@/lib/services/hoplixService';
import { config, filterCampaignIds } from '@/lib/config';

const apiKey = process.env.HOPLIX_API_KEY;
const apiSecret = process.env.HOPLIX_API_SECRET;

if (apiKey && apiSecret) {
  hoplixService.initialize(apiKey, apiSecret);
}

export async function GET() {
  try {
    if (!hoplixService.isConfigured()) {
      return NextResponse.json({ error: 'Hoplix service not configured' }, { status: 500 });
    }

    const campaigns = await hoplixService.listCampaigns();
    
    // Use the centralized config filtering (which includes always-excluded campaigns 00560566 and 00542388)
    const filteredCampaigns = campaigns.filter((campaign: any) => {
      const campaignId = campaign.id_campaign || campaign.campaign_id || campaign.id || campaign.url;
      if (!campaignId) return false;
      
      // Hoplix returns status in Italian: "attiva" = active, "eliminata" = deleted
      const status = (campaign.status || '').toLowerCase().trim();
      if (status !== 'attiva') {
        console.log(`⏭️ Skipping campaign "${campaign.name}" (${campaignId}) - status: "${campaign.status}"`);
        return false;
      }
      
      // If enabledCampaigns is set, only keep campaigns in that list
      if (config.enabledCampaigns.length > 0 && !config.enabledCampaigns.includes(campaignId)) {
        return false;
      }
      
      // Exclude campaigns in the excluded list (includes ALWAYS_EXCLUDED_CAMPAIGNS)
      if (config.excludedCampaigns.includes(campaignId)) {
        return false;
      }
      
      return true;
    });
    
    console.log(`📋 Campaigns after filter: ${filteredCampaigns.length} (from ${campaigns.length} total)`);
    
    return NextResponse.json(filteredCampaigns, {
        headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate' },
    });
  } catch (error) {
    console.error('Error listing campaigns:', error);
    return NextResponse.json({ error: 'Failed to list campaigns' }, { status: 500 });
  }
}
