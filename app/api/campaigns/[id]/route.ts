import { NextResponse } from 'next/server';
import { hoplixService } from '@/lib/services/hoplixService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiKey = process.env.HOPLIX_API_KEY;
  const apiSecret = process.env.HOPLIX_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Missing API credentials' }, { status: 500 });
  }
  
  hoplixService.initialize(apiKey, apiSecret);
  
  try {
    // ✅ IMPORTANT: Must await params in Next.js 16
    const { id } = await params;
    
    console.log(`🔍 API route fetching campaign: ${id}`);
    const campaign = await hoplixService.getCampaign(id);
    
    if (campaign) {
      return NextResponse.json({ campaign });
    } else {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 });
  }
}