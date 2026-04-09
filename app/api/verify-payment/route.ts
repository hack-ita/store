import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'No session ID' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    return NextResponse.json({
      success: session.payment_status === 'paid',
      session,
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ success: false, error: 'Verification failed' });
  }
}