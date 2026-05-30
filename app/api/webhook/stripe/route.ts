import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// In-process deduplication: prevents double-processing if two webhook endpoints
// (e.g. Stripe CLI + a registered Dashboard endpoint) fire for the same session.
const processedSessions = new Set<string>();

const COUNTRY_CODE_MAP: Record<string, string> = {
  'Italy': 'IT',
  'France': 'FR',
  'Germany': 'DE',
  'Spain': 'ES',
  'United Kingdom': 'GB',
  'Netherlands': 'NL',
  'Belgium': 'BE',
  'Austria': 'AT',
  'Switzerland': 'CH',
  'Portugal': 'PT',
  'United States': 'US',
};

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

    if (processedSessions.has(session.id)) {
      console.warn('⚠️ Duplicate webhook for session:', session.id, '— already processed, skipping');
      return NextResponse.json({ received: true });
    }
    processedSessions.add(session.id);

    console.log('💰 Payment successful! Session ID:', session.id);

    let items: any[] = [];
    try {
      items = JSON.parse(session.metadata?.items || '[]');
      console.log('📦 Items from metadata:', items);
    } catch (e) {
      console.error('❌ Failed to parse items from metadata:', e);
    }

    if (items.length === 0) {
      console.error('❌ No items found in metadata!');
      return NextResponse.json({ error: 'No items found' }, { status: 400 });
    }

    // Build a short, safe order reference (Hoplix has an undocumented limit).
    // Format: "CS-{last10} [MixMatch -10%]" or just "CS-{last10}"
    // The last 10 chars of the Stripe session ID are unique enough.
    const sessionShort = session.id.slice(-10);
    const discountSummary = session.metadata?.discountSummary || '';
    const discountTag = discountSummary
      ? ` [${discountSummary.split('|')[0].trim()}]`
      : '';
    const orderReference = `CS-${sessionShort}${discountTag}`;

    const countryCode =
      COUNTRY_CODE_MAP[session.metadata?.customerCountry || ''] || 'IT';

    const shippingInfo: Record<string, string> = {
      name: session.metadata?.customerFirstName || '',
      surname: session.metadata?.customerLastName || '',
      address: session.metadata?.customerAddress || '',
      'zip-code': session.metadata?.customerPostalCode || '',
      city: session.metadata?.customerCity || '',
      province: session.metadata?.customerCity || '',
      'country-code': countryCode,
    };

    // Guard: every item must have a campaignId. The checkout session should have already
    // resolved these, but log clearly if anything slips through.
    const missingCampaign = items.filter((item: any) => !item.campaignId);
    if (missingCampaign.length > 0) {
      console.error('❌ Cannot create Hoplix order — item(s) missing campaignId:',
        missingCampaign.map((i: any) => i.productId).join(', ')
      );
      return NextResponse.json({ received: true });
    }

    const orderPayload = {
      api: process.env.HOPLIX_API_KEY,
      secret: process.env.HOPLIX_API_SECRET,
      order: {
        products: items.map((item: any) => ({
          'campaign-id': item.campaignId,
          'product-id': item.productId,
          'product-color': item.color?.toLowerCase() || 'black',
          'product-size': item.size || 'M',
          quantity: item.quantity,
        })),
        'shipping-mode': 'economy',
        'payment-method': 'wallet',
        'client-email': session.customer_email || '',
        'order_reference': orderReference,
        'shipping-info': shippingInfo,
      },
    };

    console.log('📋 Order reference:', orderReference);
    console.log('🌍 Country code:', countryCode, '(from:', session.metadata?.customerCountry, ')');
    console.log('📤 Hoplix payload:', JSON.stringify(orderPayload, null, 2));

    try {
      const hoplixResponse = await fetch('https://api.hoplix.com/v1/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const responseData = await hoplixResponse.json();
      console.log('📥 Hoplix raw response:', JSON.stringify(responseData, null, 2));

      if (responseData.status === 200) {
        console.log('✅ Hoplix order created! Order ID:', responseData['order-id']);
        console.log('✅ Total:', responseData.total, '| Shipping cost:', responseData['shipping-cost']);
      } else if (responseData.message === 'This order is already present in our systems') {
        // Stripe can retry webhooks — treat duplicate as a non-fatal warning
        console.warn('⚠️ Order already exists in Hoplix (duplicate webhook). Reference:', orderReference);
      } else {
        console.error('❌ Hoplix order creation FAILED');
        console.error('❌ Status code:', responseData.status);
        console.error('❌ Error message:', responseData.message);
        console.error('❌ Products sent:', JSON.stringify(orderPayload.order.products, null, 2));
        console.error('❌ Shipping info sent:', JSON.stringify(shippingInfo, null, 2));
      }
    } catch (error) {
      console.error('❌ Hoplix network error:', error);
    }
  }

  return NextResponse.json({ received: true });
}
