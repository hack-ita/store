import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature') as string;
  
  console.log('🔔 Webhook received!');
  
  let event: Stripe.Event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log('✅ Webhook verified. Event type:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    console.log('💰 Payment successful! Session ID:', session.id);
    
    // Parse items from metadata
    let items = [];
    try {
      items = JSON.parse(session.metadata?.items || '[]');
      console.log('📦 Items from metadata:', items);
    } catch (e) {
      console.error('Failed to parse items:', e);
    }

    if (items.length === 0) {
      console.error('❌ No items found!');
      return NextResponse.json({ error: 'No items found' }, { status: 400 });
    }

    // Corrected Hoplix Payload Structure
    const orderPayload = {
      api: process.env.HOPLIX_API_KEY,
      secret: process.env.HOPLIX_API_SECRET,
      // [!] FIX: Wrap everything inside "order"
      order: {
        products: items.map((item: any) => ({
          'campaign-id': item.campaignId || process.env.HOPLIX_CAMPAIGN_ID,
          'product-id': item.productId,
          'product-color': item.color?.toLowerCase() || 'black', // Send lowercase
          'product-size': item.size || 'M',
          quantity: item.quantity,
        })),
        'shipping-mode': 'economy', // or 'tracked' / 'express'
        'payment-method': 'wallet', // or omit for credit card
        'client-email': session.customer_email || session.metadata?.customerEmail,
        'order_reference': session.id, // Optional: your internal ID
        'shipping-info': {
          name: session.metadata?.customerFirstName || '',
          surname: session.metadata?.customerLastName || '',
          address: session.metadata?.customerAddress || '',
          'address-more': '', // Optional, but include if you have it
          'zip-code': session.metadata?.customerPostalCode || '',
          city: session.metadata?.customerCity || '',
          province: session.metadata?.customerCity || '',
          'country-code': session.metadata?.customerCountry === 'Italy' ? 'IT' : 'FR',
        },
      },
    };
    
    console.log('📤 Hoplix payload:', JSON.stringify(orderPayload, null, 2));
    
    try {
      const hoplixResponse = await fetch('https://api.hoplix.com/v1/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      const responseData = await hoplixResponse.json();
      console.log('📥 Hoplix response:', responseData);
      
    } catch (error) {
      console.error('❌ Hoplix error:', error);
    }
  }

  return NextResponse.json({ received: true });
}