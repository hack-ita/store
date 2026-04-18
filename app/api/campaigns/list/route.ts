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
    return NextResponse.json(campaigns, {
        headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate' },
    });
  } catch (error) {
    console.error('Error listing campaigns:', error);
    return NextResponse.json({ error: 'Failed to list campaigns' }, { status: 500 });
  }
}