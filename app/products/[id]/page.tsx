import { notFound } from 'next/navigation';
import { productService } from '@/lib/services/productService';
import { hoplixService } from '@/lib/services/hoplixService';
import { parseColors } from '@/lib/colorUtils';
import ProductDetailClient from '@/components/ProductDetailClient';

const apiKey = process.env.HOPLIX_API_KEY;
const apiSecret = process.env.HOPLIX_API_SECRET;

if (apiKey && apiSecret) {
  hoplixService.initialize(apiKey, apiSecret);
}

function buildImageUrl(baseUrl: string, colorCode: string): string {
  if (!baseUrl) return '';
  return baseUrl.replace(/\/([^/]+)(\/\d+\/)$/, `/${colorCode}$2`);
}

function getBaseImageFromPreview(preview: Array<Record<string, string>> | undefined): string {
  if (!preview || !preview[0]) return '';
  const key = Object.keys(preview[0]).find(k => k.startsWith('front-'));
  return key ? preview[0][key] : '';
}

function transformCampaignProduct(campaign: any, campaignId: string, slug: string) {
  if (!campaign || !campaign.products) return null;

  const found = campaign.products.find((p: any) => {
    const productSlug = (p['product-name'] || '')
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    return productSlug === slug || p['product-id'] === slug || p['product-code'] === slug;
  });

  if (!found) return null;

  const colors = parseColors(found['product-color'] || '');
  const sizes = (found['product-size'] || '').split(',').map((s: string) => s.trim());

  const baseImage = getBaseImageFromPreview(found.preview);
  const allImages = colors.length > 0
    ? colors.map(color => buildImageUrl(baseImage, color.imageKey) || baseImage || '/images/hero-1.png')
    : [baseImage || '/images/hero-1.png'];

  return {
    id: found['product-id'],
    name: found['product-name'],
    slug: (found['product-name'] || '').toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
    image: allImages[0] || '/images/hero-1.png',
    images: allImages,
    price: parseFloat(found['product-price']) || 0,
    originalPrice: null,
    category: campaign.name || 'Prodotti',
    categorySlug: (campaign.name || 'prodotti').toLowerCase().replace(/\s+/g, '-'),
    badge: '',
    badgeColor: '',
    description: campaign.description || '',
    features: [
      `Product Code: ${found['product-code']}`,
      `Available Colors: ${found['product-color'] || ''}`,
      `Available Sizes: ${found['product-size'] || ''}`,
    ],
    sizes,
    colors,
    rating: 4.5,
    reviews: 0,
    inStock: true,
    productCode: found['product-code'],
    campaignId,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log(`🔍 Product page fetching: ${id}`);

  // Strategy 1: Search active campaigns first — returns campaign design images
  try {
    const allCampaigns = await hoplixService.listCampaigns();
    for (const campaign of allCampaigns) {
      const campaignId = campaign.id_campaign || campaign.campaign_id || campaign.id || campaign.url;
      if (!campaignId) continue;

      // Only search active campaigns
      const status = (campaign.status || '').toLowerCase().trim();
      if (status && status !== 'attiva') continue;

      const campaignData = await hoplixService.getCampaign(campaignId);
      const product = transformCampaignProduct(campaignData, campaignId, id);
      if (product) {
        console.log(`✅ Found in campaign ${campaignId}: ${product.name}`);
        return <ProductDetailClient initialProduct={product} />;
      }
    }
  } catch (err) {
    console.error('Error searching campaigns:', err);
  }

  // Strategy 2: Fall back to direct Hoplix catalog lookup
  const directProduct = await productService.getProduct(id);
  if (directProduct) {
    console.log(`✅ Found via catalog lookup: ${directProduct.name}`);
    return <ProductDetailClient initialProduct={directProduct} />;
  }

  console.log(`❌ Product not found: ${id}`);
  notFound();
}
