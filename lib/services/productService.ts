import { config, getActiveCampaignIds } from '@/lib/config';
import { hoplixService, HoplixProduct } from './hoplixService';
import { parseColors, type ColorInfo } from '@/lib/colorUtils';

export interface AppProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  images: string[];
  price: number;
  originalPrice: number | null;
  category: string;
  categorySlug: string;
  badge?: string;
  badgeColor?: string;
  description: string;
  features: string[];
  sizes: string[];
  colors: ColorInfo[];
  rating: number;
  reviews: number;
  inStock: boolean;
  productCode: string;
  baseCost: number;
  campaignId?: string;
}

// Build a color-specific image URL by swapping the color segment in the Hoplix CDN URL.
// CDN pattern: /showimaged/Front/{campaignId}/{productSlug}/{color}/{size}/
function buildImageUrl(baseUrl: string, colorCode: string): string {
  if (!baseUrl) return '';
  return baseUrl.replace(/\/([^/]+)(\/\d+\/)$/, `/${colorCode}$2`);
}

// Get the base CDN URL from a product's preview object (always the black/first color variant)
function getBaseImageFromPreview(preview: Array<Record<string, string>> | undefined): string {
  if (!preview || !preview[0]) return '';
  const anyFrontKey = Object.keys(preview[0]).find(key => key.startsWith('front-'));
  return anyFrontKey ? preview[0][anyFrontKey] : '';
}

// Helper to parse sizes from API response
function parseSizes(sizeString: string): string[] {
  if (!sizeString) return [];

  const sizes = sizeString.split(',').map(s => s.trim());
  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];
  sizes.sort((a, b) => {
    const indexA = sizeOrder.indexOf(a);
    const indexB = sizeOrder.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });

  return sizes;
}


function transformToAppProduct(hoplixProduct: HoplixProduct): AppProduct {
  const slug = hoplixProduct['product-code'].toLowerCase().replace(/_/g, '-');
  const colors = parseColors(hoplixProduct.colors);
  const sizes = parseSizes(hoplixProduct.sizes);
  const baseCost = parseFloat(hoplixProduct['base-cost']);
  const sellingPrice = Math.round((baseCost + 15) * 100) / 100;

  // Get base image from preview and build per-color URLs
  const baseImage = getBaseImageFromPreview(hoplixProduct.preview);
  const allImages = colors.map(color =>
    buildImageUrl(baseImage, color.imageKey) || baseImage || '/images/hero-1.png'
  );
  const mainImage = allImages[0] || baseImage || '/images/hero-1.png';

  // Determine category and badge
  let category = 'Prodotti';
  let badge = '';
  let badgeColor = '';
  const name = hoplixProduct.name.toLowerCase();
  const productCode = hoplixProduct['product-code'].toLowerCase();

  if (name.includes('felpa') || name.includes('hoodie') || productCode.includes('felpa')) {
    category = 'Più Venduti';
    badge = '⭐ Best Seller';
    badgeColor = 'text-yellow-500';
  } else if (name.includes('t-shirt') || name.includes('maglietta') || productCode.includes('maglietta')) {
    category = 'Nuovi Arrivi';
    badge = '🔥 Hot';
    badgeColor = 'text-orange-500';
  } else if (name.includes('tazza') || name.includes('mug') || productCode.includes('tazza')) {
    category = 'Nuovi Arrivi';
    badge = '🔥 Hot';
    badgeColor = 'text-orange-500';
  } else if (name.includes('borraccia') || productCode.includes('borraccia')) {
    category = 'In Offerta';
    badge = '💸 Sale';
    badgeColor = 'text-green-500';
  }

  return {
    id: hoplixProduct['product-code'],
    name: hoplixProduct.name,
    slug: slug,
    image: mainImage,
    images: allImages,
    price: sellingPrice,
    originalPrice: null,
    category: category,
    categorySlug: category.toLowerCase().replace(/\s+/g, '-'),
    badge: badge,
    badgeColor: badgeColor,
    description: hoplixProduct.description || `High-quality ${hoplixProduct.name}.`,
    features: [
      `Print area: ${hoplixProduct['printable-area']}`,
      `Weight: ${hoplixProduct.weight}g`,
      `Production time: ${hoplixProduct['production days']} days`,
    ],
    sizes: sizes,
    colors: colors,
    rating: 4.5,
    reviews: 0,
    inStock: true,
    productCode: hoplixProduct['product-code'],
    baseCost: baseCost,
  };
}

// Initialize hoplixService
if (config.hoplixApiKey && config.hoplixApiSecret) {
  hoplixService.initialize(config.hoplixApiKey, config.hoplixApiSecret);
  console.log('✅ HoplixService initialized from productService');
}

// Shared helper to transform campaign products into AppProduct[]
function transformCampaignProducts(campaign: any, campaignId: string): AppProduct[] {
  if (!campaign || !campaign.products) return [];

  return campaign.products.map((product: any) => {
    const baseImage = getBaseImageFromPreview(product.preview);
    const colors = parseColors(product['product-color'] || '');
    const sizes = parseSizes(product['product-size'] || '');

    const allImages = colors.map(color =>
      buildImageUrl(baseImage, color.imageKey) || baseImage || '/images/hero-1.png'
    );
    const mainImage = allImages[0] || baseImage || '/images/hero-1.png';

    const slug = product['product-name']
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    return {
      id: product['product-id'],
      name: product['product-name'],
      slug: slug,
      image: mainImage,
      images: allImages.length > 0 ? allImages : [mainImage],
      price: parseFloat(product['product-price']),
      originalPrice: null,
      category: campaign.name || 'Featured',
      categorySlug: (campaign.name || 'featured').toLowerCase().replace(/\s+/g, '-'),
      badgeColor: 'text-orange-500',
      description: campaign.description || '',
      features: [
        `Product Code: ${product['product-code']}`,
        `Available Colors: ${product['product-color'] || ''}`,
        `Available Sizes: ${product['product-size'] || ''}`,
      ],
      sizes: sizes,
      colors: colors,
      rating: 4.5,
      reviews: 0,
      inStock: true,
      productCode: product['product-code'],
      baseCost: 0,
      campaignId,
    };
  });
}

export const productService = {
  /**
   * Fetch products from the active/default campaign.
   * Uses the campaign config (enabled/excluded) to determine which campaign to fetch.
   */
  async getAllProducts(): Promise<AppProduct[]> {
    console.log('🔍 productService.getAllProducts() called');

    if (!hoplixService.isConfigured()) {
      console.warn('⚠️ Hoplix service not configured');
      return [];
    }

    try {
      let activeIds = getActiveCampaignIds();
      
      // If no active campaigns from config, fall back to listing ALL campaigns
      // from the Hoplix API and filtering out the excluded ones
      if (activeIds.length === 0) {
        console.log('🌐 No active campaigns in config, listing all campaigns...');
        const allCampaigns = await hoplixService.listCampaigns();
        
        // Hoplix returns status in Italian: "attiva" = active, "eliminata" = deleted
        const validCampaigns = allCampaigns.filter((c: any) => {
          const status = (c.status || '').toLowerCase().trim();
          if (status !== 'attiva') {
            console.log(`⏭️ Skipping campaign "${c.name}" (${c.id_campaign}) - status: "${c.status}"`);
            return false;
          }
          return true;
        });
        
        activeIds = validCampaigns
          .map((c: any) => c.id_campaign || c.campaign_id || c.id || c.url)
          .filter(Boolean);
        
        // Apply excluded filter
        activeIds = activeIds.filter((id: string) => !config.excludedCampaigns.includes(id));
        
        console.log(`📋 Found ${activeIds.length} in-progress campaigns after exclusion filter`);
      }

      if (activeIds.length === 0) {
        console.warn('⚠️ No active campaigns found');
        return [];
      }

      // If only one active campaign, fetch it directly
      if (activeIds.length === 1) {
        const campaignId = activeIds[0];
        console.log(`🌐 Fetching campaign: ${campaignId}`);
        const campaign = await hoplixService.getCampaign(campaignId);

        if (campaign && campaign.products) {
          console.log(`✅ Found ${campaign.products.length} products in campaign`);
          return transformCampaignProducts(campaign, campaignId);
        }

        console.warn('No products found in campaign');
        return [];
      }

      // Multiple campaigns - fetch all and merge
      console.log(`🌐 Fetching products from ${activeIds.length} campaigns`);
      return await this.getProductsByCampaigns(activeIds);
    } catch (error) {
      console.error('❌ Error fetching from Hoplix API:', error);
      return [];
    }
  },

  /**
   * Fetch products from multiple campaign IDs, merge and deduplicate.
   */
  async getProductsByCampaigns(campaignIds: string[]): Promise<AppProduct[]> {
    console.log(`🔍 Fetching products from ${campaignIds.length} campaigns:`, campaignIds);

    if (!hoplixService.isConfigured()) {
      console.warn('⚠️ Hoplix service not configured');
      return [];
    }

    try {
      const results = await Promise.allSettled(
        campaignIds.map(async (campaignId) => {
          const campaign = await hoplixService.getCampaign(campaignId);
          return transformCampaignProducts(campaign, campaignId);
        })
      );

      const allProducts: AppProduct[] = results
        .filter((r): r is PromiseFulfilledResult<AppProduct[]> => r.status === 'fulfilled')
        .flatMap(r => r.value);

      // Deduplicate by productCode (same product might be in multiple campaigns)
      const seen = new Set<string>();
      const unique = allProducts.filter(product => {
        const key = `${product.campaignId}_${product.productCode}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      console.log(`✅ Loaded ${unique.length} unique products from ${campaignIds.length} campaigns`);
      return unique;
    } catch (error) {
      console.error('❌ Error fetching products by campaigns:', error);
      return [];
    }
  },

  async getProduct(productCode: string): Promise<AppProduct | null> {
    console.log(`🔍 Getting product: ${productCode}`);

    if (!hoplixService.isConfigured()) {
      console.warn('⚠️ Hoplix service not configured');
      return null;
    }

    try {
      const result = await hoplixService.getProduct(productCode);
      if (result.product) {
        return transformToAppProduct(result.product);
      }
      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  async getProductBySlug(slug: string): Promise<AppProduct | null> {
    const products = await this.getAllProducts();
    return products.find(p => p.slug === slug) || null;
  },

  async getProductsByCategory(category: string): Promise<AppProduct[]> {
    const products = await this.getAllProducts();
    return products.filter(p => p.category === category);
  },

  async getProductsByCampaign(campaignId: string): Promise<AppProduct[]> {
    console.log(`🔍 Fetching products from campaign: ${campaignId}`);
    
    if (!hoplixService.isConfigured()) {
      console.warn('⚠️ Hoplix service not configured');
      return [];
    }

    try {
      const campaign = await hoplixService.getCampaign(campaignId);
      return transformCampaignProducts(campaign, campaignId);
    } catch (error) {
      console.error(`❌ Error fetching campaign ${campaignId}:`, error);
      return [];
    }
  }
};