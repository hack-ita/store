import { NextResponse } from 'next/server';
import { hoplixService } from '@/lib/services/hoplixService';
import { productService } from '@/lib/services/productService';

export async function GET(request: Request) {
  const apiKey = process.env.HOPLIX_API_KEY;
  const apiSecret = process.env.HOPLIX_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Missing API credentials' }, { status: 500 });
  }
  
  hoplixService.initialize(apiKey, apiSecret);
  
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let products = await productService.getAllProducts();
    
    if (category) {
      products = products.filter(p => p.category === category);
    }
    
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}