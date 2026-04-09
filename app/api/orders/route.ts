import { NextResponse } from 'next/server';
import { hoplixService } from '@/lib/services/hoplixService';

hoplixService.initialize(
  process.env.HOPLIX_API_KEY!,
  process.env.HOPLIX_API_SECRET!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...data } = body;
    
    switch (action) {
      case 'create':
        const order = await hoplixService.createOrder(data);
        return NextResponse.json(order);
      
      case 'create-with-campaign':
        const campaignOrder = await hoplixService.createCampaignAndOrder(data);
        return NextResponse.json(campaignOrder);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const orderRef = searchParams.get('orderRef');
    
    if (orderId) {
      const status = await hoplixService.getOrderStatus(orderId);
      return NextResponse.json(status);
    }
    
    if (orderRef) {
      const status = await hoplixService.getOrderStatusByReference(orderRef);
      return NextResponse.json(status);
    }
    
    const orders = await hoplixService.listOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}