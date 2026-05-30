import { NextResponse } from 'next/server';
import { hoplixService } from '@/lib/services/hoplixService';

export async function GET() {
  const apiKey = process.env.HOPLIX_API_KEY;
  const apiSecret = process.env.HOPLIX_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Missing API credentials' });
  }

  hoplixService.initialize(apiKey, apiSecret);

  try {
    const raw = await hoplixService.listCampaigns();

    // Return every campaign with its raw fields so we can see what Hoplix actually sends
    const summary = raw.map((c: any) => ({
      id: c.id_campaign || c.campaign_id || c.id || c.url,
      name: c.name,
      status: c.status,
      endDate: c['End Date'],
      allKeys: Object.keys(c),
      raw: c,
    }));

    return NextResponse.json({ total: raw.length, campaigns: summary });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
