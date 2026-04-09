import { notFound } from 'next/navigation';
import { hoplixService } from '@/lib/services/hoplixService';
import { productService } from '@/lib/services/productService';
import CategoryClient from '@/components/CategoryClient';
import { secureHeapUsed } from 'crypto';

// Initialize Hoplix service
const apiKey = process.env.HOPLIX_API_KEY;
const apiSecret = process.env.HOPLIX_API_SECRET;

if (apiKey && apiSecret) {
  hoplixService.initialize(apiKey, apiSecret);
  console.log('✅ Hoplix service initialized in category page');
}

// Server Component - params must be awaited
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  console.log(`🔍 Category page fetching for slug: ${slug}`);
  
  // First, get all campaigns to find the matching one
  const campaigns = await hoplixService.listCampaigns();
  console.log(`📋 Found ${campaigns?.length || 0} campaigns`);
  
  // Find campaign by URL or ID
  let foundCampaign = campaigns?.find((c: any) => 
    c.url === slug || 
    c.url?.includes(slug) || 
    slug.includes(c.url) ||
    c.id_campaign === slug
  );
  
  // If not found by URL, try by name
  if (!foundCampaign) {
    foundCampaign = campaigns?.find((c: any) => 
      c.name?.toLowerCase().replace(/\s+/g, '-') === slug ||
      c.name?.toLowerCase().includes(slug)
    );
  }
  
  if (!foundCampaign) {
    console.log(`❌ Campaign not found for slug: ${slug}`);
    notFound();
  }
  
  console.log(`✅ Found campaign: ${foundCampaign.name} (${foundCampaign.id_campaign})`);
  
  // Get full campaign details with products
  const campaignDetail = await hoplixService.getCampaign(foundCampaign.id_campaign);
  
  // Get all products to enrich with additional data
  const allProducts = await productService.getAllProducts();
  
  // Filter products that belong to this campaign and ensure they have valid data
  const campaignProducts = campaignDetail?.products || [];
  const enrichedProducts = campaignProducts
    .map((p: any) => {
      const enriched = allProducts.find(ap => ap.productCode === p['product-code']);
      return enriched || {
        id: p['product-id'],
        name: p['product-name'],
        slug: p['product-name']?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') || 'product',
        price: parseFloat(p['product-price']) || 0,
        image: '/images/hero-1.png',
        images: ['/images/hero-1.png'],
        category: campaignDetail.name,
        categorySlug: slug,
        badge: '🔥 New',
        badgeColor: 'text-orange-500',
        description: campaignDetail.description || '',
        features: [],
        sizes: p['product-size']?.split(',') || [],
        colors: [],
        rating: 4.5,
        reviews: 0,
        inStock: true,
        productCode: p['product-code'],
      };
    })
    .filter((p: any) => p && p.name); // Filter out any invalid products
  
  console.log(`📦 Enriched ${enrichedProducts.length} products for category`);
  
  return (
    <section className='mt-20'>
      <CategoryClient 
        initialCampaign={campaignDetail} 
        initialProducts={enrichedProducts} 
        slug={slug}
      />
    </section>
  );
}