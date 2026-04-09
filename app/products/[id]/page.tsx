import { notFound } from 'next/navigation';
import { productService } from '@/lib/services/productService';
import { hoplixService } from '@/lib/services/hoplixService';
import ProductDetailClient from '@/components/ProductDetailClient';

// Initialize Hoplix service with credentials
const apiKey = process.env.HOPLIX_API_KEY;
const apiSecret = process.env.HOPLIX_API_SECRET;

if (apiKey && apiSecret) {
  hoplixService.initialize(apiKey, apiSecret);
  console.log('✅ Hoplix service initialized in product page');
} else {
  console.warn('⚠️ Missing API credentials in product page');
}

// Server Component - params must be awaited
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  console.log(`🔍 Product page fetching product with slug/id: ${id}`);
  
  // Fetch all products
  const products = await productService.getAllProducts();
  console.log(`📦 Total products fetched: ${products.length}`);
  
  // Find product by slug or ID
  const product = products.find(p => p.slug === id || p.id === id);
  
  if (!product) {
    console.log(`❌ Product not found for: ${id}`);
    notFound();
  }
  
  console.log(`✅ Product found: ${product.name}`);
  
  // Pass the product data to a Client Component for interactivity
  return <ProductDetailClient initialProduct={product} />;
}