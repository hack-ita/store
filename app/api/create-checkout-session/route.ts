import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { items, customer, shippingCost, tax, discountSummary } = await request.json();
    
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

    // Hoplix CDN URLs embed the campaign ID: /showimaged/Front/{campaignId}/{slug}/
    // Use this to recover missing campaignIds from stale cart items (e.g. from localStorage
    // before a fix landed) without requiring the user to re-add the product.
    function extractCampaignFromImage(imageUrl: string): string {
      if (!imageUrl) return '';
      const m = imageUrl.match(/showimaged\/Front\/(\d+)\//);
      return m ? m[1] : '';
    }

    const resolvedItems = items.map((item: any) => {
      if (item.campaignId) return item;
      const recovered = extractCampaignFromImage(item.image || '');
      if (recovered) {
        console.log(`🔧 Recovered campaignId "${recovered}" from image URL for: ${item.name}`);
        return { ...item, campaignId: recovered };
      }
      return item;
    });

    // After recovery, any item still missing campaignId cannot be fulfilled.
    const missingCampaign = resolvedItems.filter((item: any) => !item.campaignId);
    if (missingCampaign.length > 0) {
      const names = missingCampaign.map((i: any) => i.name).join(', ');
      console.error('❌ Checkout blocked — item(s) missing campaignId after recovery:', names);
      return NextResponse.json(
        { error: `Impossibile determinare la campagna per: ${names}. Rimuovili dal carrello e aggiungili di nuovo.` },
        { status: 400 }
      );
    }

    // Prepare metadata for webhook — keep this minimal to stay under Stripe's 500-char limit
    const itemsMetadata = resolvedItems.map((item: any) => ({
      productId: item.productId,
      campaignId: item.campaignId,
      color: item.color || 'black',
      size: item.size || 'M',
      quantity: item.quantity,
      price: item.price,
    }));

    // Guard against metadata overflow (Stripe limit: 500 chars per value)
    const itemsJson = JSON.stringify(itemsMetadata);
    if (itemsJson.length > 500) {
      console.error('❌ items metadata too long:', itemsJson.length, 'chars');
      return NextResponse.json({ error: 'Too many items or data too large' }, { status: 400 });
    }

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
        items: itemsJson,
        customerFirstName: customer.firstName || '',
        customerLastName: customer.lastName || '',
        customerPhone: customer.phone || '',
        customerAddress: customer.address || '',
        customerCity: customer.city || '',
        customerPostalCode: customer.postalCode || '',
        customerCountry: customer.country || 'Italy',
        discountSummary: discountSummary || '',
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