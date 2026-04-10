import { notFound } from 'next/navigation';
import { hoplixService } from '@/lib/services/hoplixService';
import CategoryClient from '@/components/CategoryClient';

// Initialize Hoplix service
const apiKey = process.env.HOPLIX_API_KEY;
const apiSecret = process.env.HOPLIX_API_SECRET;

if (apiKey && apiSecret) {
  hoplixService.initialize(apiKey, apiSecret);
  console.log('✅ Hoplix service initialized in category page');
}

// Build a color-specific image URL by swapping the color segment in the Hoplix CDN URL.
// CDN pattern: /showimaged/Front/{campaignId}/{productSlug}/{color}/{size}/
function buildImageUrl(baseUrl: string, colorCode: string): string {
  if (!baseUrl) return '';
  return baseUrl.replace(/\/([^/]+)(\/\d+\/)$/, `/${colorCode}$2`);
}

// Get the base CDN URL from a product's preview object
function getBaseImageFromPreview(preview: Array<Record<string, string>> | undefined): string {
  if (!preview || !preview[0]) return '';
  const anyFrontKey = Object.keys(preview[0]).find(key => key.startsWith('front-'));
  return anyFrontKey ? preview[0][anyFrontKey] : '';
}

// Server Component - params must be awaited
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  console.log(`🔍 Category page fetching for slug: ${slug}`);

  // Get all campaigns to find the matching one
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
  const campaignProducts = campaignDetail?.products || [];

  // Transform campaign products directly — no allProducts lookup needed
  const enrichedProducts = campaignProducts
    .map((p: any) => {
      // Build image URLs directly from preview data (same logic as productService)
      const baseImage = getBaseImageFromPreview(p.preview);
      const firstColor = p['product-color']?.split(',')[0]?.trim().toLowerCase() || 'black';
      const mainImage = buildImageUrl(baseImage, firstColor) || baseImage || '/images/hero-1.png';

      // Build per-color images array
      const colorList = p['product-color']
        ?.split(',')
        .map((c: string) => c.trim().toLowerCase())
        .filter(Boolean) || [];

      const images = colorList.length > 0
        ? colorList.map((color: string) => buildImageUrl(baseImage, color) || baseImage || '/images/hero-1.png')
        : [mainImage];

      console.log(`🖼️ "${p['product-name']}" baseImage: ${baseImage} → mainImage: ${mainImage}`);

      const productSlug = p['product-name']
        ?.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-') || 'product';

      return {
        id: p['product-id'],
        name: p['product-name'],
        slug: productSlug,
        price: parseFloat(p['product-price']) || 0,
        originalPrice: null,
        image: mainImage,
        images: images,
        category: campaignDetail.name,
        categorySlug: slug,
        badge: '🔥 New',
        badgeColor: 'text-orange-500',
        description: campaignDetail.description || '',
        features: [
          `Available Colors: ${p['product-color'] || ''}`,
          `Available Sizes: ${p['product-size'] || ''}`,
        ],
        sizes: p['product-size']?.split(',').map((s: string) => s.trim()) || [],
        colors: colorList.map((color: string) => ({
          name: color.charAt(0).toUpperCase() + color.slice(1),
          code: color,
          colorClass: `bg-${color}`,
          imageKey: color,
        })),
        rating: 4.5,
        reviews: 0,
        inStock: true,
        productCode: p['product-code'],
      };
    })
    .filter((p: any) => p && p.name);

  console.log(`📦 Built ${enrichedProducts.length} products for category`);

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