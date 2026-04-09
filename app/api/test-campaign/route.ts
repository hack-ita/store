import { NextResponse } from 'next/server';
import { hoplixService } from '@/lib/services/hoplixService';

export async function GET() {
  const apiKey = process.env.HOPLIX_API_KEY;
  const apiSecret = process.env.HOPLIX_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Missing API credentials' });
  }
  
  // Initialize service
  hoplixService.initialize(apiKey, apiSecret);
  
  // Your campaign ID from the dashboard
  const campaignId = '00542388'; // Your Product ID
  const campaignUrl = 'hackita---test-60189';
  
  const results: any = {};
  
  try {
    // Try to get campaign by ID
    const campaignById = await hoplixService.getCampaign(campaignId);
    results.byId = campaignById;
  } catch (error) {
    results.byId = { error: error instanceof Error ? error.message : 'Failed' };
  }
  
  try {
    // Try to get campaign by URL
    const campaignByUrl = await hoplixService.getCampaign(campaignUrl);
    results.byUrl = campaignByUrl;
  } catch (error) {
    results.byUrl = { error: error instanceof Error ? error.message : 'Failed' };
  }
  
  try {
    // List all campaigns
    const allCampaigns = await hoplixService.listCampaigns();
    results.allCampaigns = allCampaigns;
  } catch (error) {
    results.allCampaigns = { error: error instanceof Error ? error.message : 'Failed' };
  }
  
  return NextResponse.json({
    campaignId,
    campaignUrl,
    results,
    message: 'Check your terminal for detailed logs'
  });
}