import { NextResponse } from 'next/server';
import { hoplixService } from '@/lib/services/hoplixService';

export async function GET() {
  const apiKey = process.env.HOPLIX_API_KEY;
  const apiSecret = process.env.HOPLIX_API_SECRET;
  
  console.log('🔍 Testing Hoplix API...');
  console.log('API Key present:', !!apiKey);
  console.log('API Secret present:', !!apiSecret);
  
  if (!apiKey || !apiSecret) {
    return NextResponse.json({
      error: 'Missing API credentials',
      apiKey: !!apiKey,
      apiSecret: !!apiSecret
    });
  }
  
  // Initialize service
  hoplixService.initialize(apiKey, apiSecret);
  
  try {
    // Try to get products
    const products = await hoplixService.getAllProducts();
    
    return NextResponse.json({
      success: true,
      productCount: products.length,
      firstProduct: products[0] ? {
        code: products[0]['product-code'],
        name: products[0].name
      } : null,
      rawResponse: 'Check server console for details'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    });
  }
}