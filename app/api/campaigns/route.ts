import { NextResponse } from 'next/server';
import { hoplixService, HoplixCampaign } from '@/lib/services/hoplixService';

export async function GET() {
  const apiKey = process.env.HOPLIX_API_KEY;
  const apiSecret = process.env.HOPLIX_API_SECRET;
  
  console.log('🔍 API Key present:', !!apiKey);
  console.log('🔍 API Secret present:', !!apiSecret);
  
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Missing API credentials' }, { status: 500 });
  }
  
  hoplixService.initialize(apiKey, apiSecret);
  
  try {
    const campaigns: HoplixCampaign[] = await hoplixService.listCampaigns();
    console.log('📋 Campaigns found:', campaigns.length);
    
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}