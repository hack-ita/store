import { config } from '@/lib/config';
import { hoplixService, HoplixProduct } from './hoplixService';

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
  colors: Array<{ name: string; code: string; colorClass: string; imageKey: string }>;
  rating: number;
  reviews: number;
  inStock: boolean;
  productCode: string;
  baseCost: number;
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

// Helper to parse colors from API response
function parseColors(colorString: string): Array<{ name: string; code: string; colorClass: string; imageKey: string }> {
  if (!colorString) return [];

  const colorNames = colorString.split(',');
  return colorNames.slice(0, 6).map(name => {
    const trimmed = name.trim().toLowerCase();
    return {
      name: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
      code: getColorCode(trimmed),
      colorClass: `bg-${trimmed}`,
      imageKey: trimmed,
    };
  });
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

function getColorCode(colorName: string): string {
  const colorMap: Record<string, string> = {
    white: '#FFFFFF',
    black: '#000000',
    red: '#FF0000',
    navy: '#000080',
    darkgrey: '#555555',
    heathergrey: '#888888',
    lightblue: '#ADD8E6',
    kellygreen: '#4CBB17',
    yellow: '#FFFF00',
    orange: '#FFA500',
    bordeaux: '#800000',
    fuchsia: '#FF00FF',
    pink: '#FFC0CB',
    purple: '#800080',
    graymarble: '#AAAAAA',
    neonorange: '#FF6600',
    deepberry: '#8B0000',
    kiwi: '#86B404',
    bottlegreen: '#006400',
    blueroyal: '#4169E1',
  };
  return colorMap[colorName] || '#CCCCCC';
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

export const productService = {
  async getAllProducts(): Promise<AppProduct[]> {
    console.log('🔍 productService.getAllProducts() called');
    console.log('🔍 hoplixService.isConfigured():', hoplixService.isConfigured());

    if (!hoplixService.isConfigured()) {
      console.warn('⚠️ Hoplix service not configured');
      return [];
    }

    try {
      const campaignId = config.hoplixCampaignId || process.env.HOPLIX_CAMPAIGN_ID || '00560566';

      console.log(`🌐 Fetching campaign: ${campaignId}`);
      const campaign = await hoplixService.getCampaign(campaignId);

      if (campaign && campaign.products) {
        console.log(`✅ Found ${campaign.products.length} products in campaign`);

        const products: AppProduct[] = campaign.products.map((product: any) => {
          // Get base CDN image from preview data and build per-color URLs
          const baseImage = getBaseImageFromPreview(product.preview);
          const colors = parseColors(product['product-color'] || '');
          const sizes = parseSizes(product['product-size'] || '');

          const allImages = colors.map(color =>
            buildImageUrl(baseImage, color.imageKey) || baseImage || '/images/hero-1.png'
          );
          const mainImage = allImages[0] || baseImage || '/images/hero-1.png';

          console.log(`🖼️ Product "${product['product-name']}" mainImage: ${mainImage}`);

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
            badge: '🔥 New',
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
          };
        });

        if (products.length > 0) {
          return products;
        }
      }

      console.warn('No products found in campaign');
      return [];
    } catch (error) {
      console.error('❌ Error fetching from Hoplix API:', error);
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

  // Add this to productService object in productService.ts
  async getProductsByCampaign(campaignId: string): Promise<AppProduct[]> {
    console.log(`🔍 Fetching products from campaign: ${campaignId}`);
    
    if (!hoplixService.isConfigured()) {
      console.warn('⚠️ Hoplix service not configured');
      return [];
    }

    try {
      const campaign = await hoplixService.getCampaign(campaignId);
      
      if (campaign && campaign.products) {
        console.log(`✅ Found ${campaign.products.length} products in campaign ${campaignId}`);
        
        const products: AppProduct[] = campaign.products.map((product: any) => {
          // Get base CDN image from preview data
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
            badge: '🔥 New',
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
          };
        });
        
        return products;
      }
      
      return [];
    } catch (error) {
      console.error(`❌ Error fetching campaign ${campaignId}:`, error);
      return [];
    }
  }
};