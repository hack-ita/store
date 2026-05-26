import { NextResponse } from 'next/server';
import { hoplixService } from '@/lib/services/hoplixService';

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
    
    // Apply enabled/excluded filters from config
    const filteredCampaigns = campaigns.filter((campaign: any) => {
      const campaignId = campaign.id_campaign || campaign.campaign_id || campaign.id || campaign.url;
      if (!campaignId) return false;
      
      // If enabledCampaigns is set, only keep campaigns in that list
      const enabledList = (process.env.HOPLIX_ENABLED_CAMPAIGNS || '').split(',').map(s => s.trim()).filter(Boolean);
      if (enabledList.length > 0 && !enabledList.includes(campaignId)) {
        return false;
      }
      
      // Exclude campaigns in the excluded list
      const excludedList = (process.env.HOPLIX_EXCLUDED_CAMPAIGNS || '').split(',').map(s => s.trim()).filter(Boolean);
      if (excludedList.includes(campaignId)) {
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