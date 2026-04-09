import { NextResponse } from 'next/server';
import { hoplixService } from '@/lib/services/hoplixService';
import { productService } from '@/lib/services/productService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const apiKey = process.env.HOPLIX_API_KEY;
  const apiSecret = process.env.HOPLIX_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Missing API credentials' }, { status: 500 });
  }
  
  hoplixService.initialize(apiKey, apiSecret);
  
  try {
    const { slug } = await params;
    
    // Get all products and find by slug
    const products = await productService.getAllProducts();
    const product = products.find(p => p.slug === slug);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}