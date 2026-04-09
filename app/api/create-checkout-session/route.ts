import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { items, customer, shippingCost, tax } = await request.json();
    
    console.log('🔍 ========== CHECKOUT SESSION CREATION ==========');
    console.log('📦 Received items from cart:', JSON.stringify(items, null, 2));
    console.log('👤 Customer info:', customer);
    console.log('💰 Shipping:', shippingCost, 'Tax:', tax);

    if (!items || items.length === 0) {
      console.error('❌ No items in cart!');
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    // Format line items for Stripe display
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add shipping if not free
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: 'Spedizione' },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Add tax
    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: 'IVA (22%)' },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });
    }

    // Prepare metadata for webhook (THIS IS THE IMPORTANT PART)
    const itemsMetadata = items.map((item: any) => ({
      productId: item.productId,
      campaignId: item.campaignId || process.env.HOPLIX_CAMPAIGN_ID || '00560566',
      color: item.color || 'black',
      size: item.size || 'M',
      quantity: item.quantity,
      price: item.price,
    }));

    console.log('📦 Saving to metadata:', JSON.stringify(itemsMetadata, null, 2));

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      customer_email: customer.email,
      metadata: {
        items: JSON.stringify(itemsMetadata),
        customerFirstName: customer.firstName || '',
        customerLastName: customer.lastName || '',
        customerPhone: customer.phone || '',
        customerAddress: customer.address || '',
        customerCity: customer.city || '',
        customerPostalCode: customer.postalCode || '',
        customerCountry: customer.country || 'Italy',
      },
    });

    console.log('✅ Checkout session created:', session.id);
    console.log('✅ Metadata in session:', session.metadata);
    console.log('🔍 ========== END ==========');

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('❌ Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}