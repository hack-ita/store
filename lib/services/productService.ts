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

// Helper to generate preview URL for a product and color
function getProductPreviewUrl(productCode: string, color: string): string {
  return `https://api.hoplix.com/v1/preview/${productCode}/${color}.png`;
}

// Helper to generate a fallback image (for development)
function getFallbackImage(productCode: string): string {
  const fallbackMap: Record<string, string> = {
    'maglietta-unisex': '/images/hero-1.png',
    'felpa-unisex-con-capuccio': '/images/hero-3.png',
    'tazza-bianca': '/images/hero-2.png',
    't-shirt-unisex': '/images/hero-1.png',
    'tazza-nera': '/images/hero-2.png',
  };
  return fallbackMap[productCode] || '/images/hero-1.png';
}

function parseHoplixColors(colorsStr: string): Array<{ name: string; code: string; colorClass: string; imageKey: string }> {
  const colorNames = colorsStr.split(',');
  return colorNames.slice(0, 6).map(name => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    code: getColorCode(name),
    colorClass: `bg-${name}`,
    imageKey: name,
  }));
}

function parseHoplixSizes(sizesStr: string): string[] {
  return sizesStr.split(',');
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

function transformToAppProduct(hoplixProduct: HoplixProduct, useRealImages: boolean = true): AppProduct {
  const slug = hoplixProduct['product-code'].toLowerCase().replace(/_/g, '-');
  const colors = parseHoplixColors(hoplixProduct.colors);
  const sizes = parseHoplixSizes(hoplixProduct.sizes);
  const baseCost = parseFloat(hoplixProduct['base-cost']);
  const sellingPrice = Math.round((baseCost + 15) * 100) / 100;
  
  let mainImage: string;
  let allImages: string[];
  
  if (useRealImages) {
    allImages = colors.map(color => getProductPreviewUrl(hoplixProduct['product-code'], color.imageKey));
    mainImage = allImages[0] || getFallbackImage(hoplixProduct['product-code']);
  } else {
    const fallback = getFallbackImage(hoplixProduct['product-code']);
    mainImage = fallback;
    allImages = [fallback];
  }
  
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

// Mock data for development/fallback
function getMockProducts(): AppProduct[] {
  return [
    {
      id: 'maglietta-unisex',
      name: 'T-Shirt Unisex',
      slug: 't-shirt-unisex',
      image: '/images/hero-1.png',
      images: ['/images/hero-1.png'],
      price: 29.99,
      originalPrice: null,
      category: 'Nuovi Arrivi',
      categorySlug: 'new-arrivals',
      badge: '🔥 Hot',
      badgeColor: 'text-orange-500',
      description: 'Soft t-shirt with no side seams, in sturdy cotton jersey.',
      features: ['100% ring-spun cotton', 'Tubular fabric', 'Washable at 30 degrees'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: [
        { name: 'Black', code: '#000000', colorClass: 'bg-black', imageKey: 'black' },
        { name: 'White', code: '#FFFFFF', colorClass: 'bg-white border border-gray-300', imageKey: 'white' },
        { name: 'Red', code: '#FF0000', colorClass: 'bg-red-600', imageKey: 'red' },
      ],
      rating: 4.5,
      reviews: 24,
      inStock: true,
      productCode: 'maglietta-unisex',
      baseCost: 7.5,
    },
    {
      id: 'felpa-unisex-con-capuccio',
      name: 'Felpa Unisex con Cappuccio',
      slug: 'felpa-unisex-con-cappuccio',
      image: '/images/hero-3.png',
      images: ['/images/hero-3.png'],
      price: 49.99,
      originalPrice: null,
      category: 'Più Venduti',
      categorySlug: 'best-sellers',
      badge: '⭐ Best Seller',
      badgeColor: 'text-yellow-500',
      description: 'Durable combination of ring-spun cotton and polyester hoodie.',
      features: ['80% Ringspun cotton, 20% polyester', 'Kangaroo pocket'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: [
        { name: 'Black', code: '#000000', colorClass: 'bg-black', imageKey: 'black' },
        { name: 'Navy', code: '#000080', colorClass: 'bg-blue-900', imageKey: 'navy' },
      ],
      rating: 4.8,
      reviews: 156,
      inStock: true,
      productCode: 'felpa-unisex-con-capuccio',
      baseCost: 16.9,
    },
    {
      id: 'tazza-bianca',
      name: 'Tazza',
      slug: 'tazza',
      image: '/images/hero-2.png',
      images: ['/images/hero-2.png'],
      price: 19.99,
      originalPrice: null,
      category: 'Nuovi Arrivi',
      categorySlug: 'new-arrivals',
      badge: '🔥 Hot',
      badgeColor: 'text-orange-500',
      description: 'White ceramic mug, microwave-safe.',
      features: ['Microwave safe', 'Food certified'],
      sizes: ['One Size'],
      colors: [{ name: 'White', code: '#FFFFFF', colorClass: 'bg-white border border-gray-300', imageKey: 'white' }],
      rating: 4.7,
      reviews: 89,
      inStock: true,
      productCode: 'tazza-bianca',
      baseCost: 5.5,
    },
  ];
}

// Initialize hoplixService if credentials are available
if (config.hoplixApiKey && config.hoplixApiSecret) {
  hoplixService.initialize(config.hoplixApiKey, config.hoplixApiSecret);
  console.log('✅ HoplixService initialized from productService');
}

export const productService = {
  async getAllProducts(): Promise<AppProduct[]> {
    console.log('🔍 productService.getAllProducts() called');
    console.log('🔍 config.useRealApi:', config.useRealApi);
    console.log('🔍 hoplixService.isConfigured():', hoplixService.isConfigured());
    
    if (!config.useRealApi) {
      console.log('📦 Using mock product data (API disabled by config)');
      return getMockProducts();
    }
    
    if (!hoplixService.isConfigured()) {
      console.warn('⚠️ Hoplix service not configured, falling back to mock data');
      return getMockProducts();
    }

    try {
      // Use the campaign ID from env or default
      const campaignId = process.env.HOPLIX_CAMPAIGN_ID || '00542388';
      
      console.log(`🌐 Fetching campaign: ${campaignId}`);
      const campaign = await hoplixService.getCampaign(campaignId);
      
      if (campaign && campaign.products) {
        console.log(`✅ Found ${campaign.products.length} products in campaign`);
        
        // Transform campaign products to AppProduct format
        const products: AppProduct[] = campaign.products.map((product: any) => {
          const firstColor = product['product-color']?.split(',')[0] || 'black';
          const previewKey = `front-${firstColor}`;
          const previewImage = product.preview?.[0]?.[previewKey] || '';
          
          // Generate slug from product name
          const slug = product['product-name'].toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
          
          return {
            id: product['product-id'],
            name: product['product-name'],
            slug: slug,
            image: previewImage || '/images/hero-1.png',
            images: [previewImage || '/images/hero-1.png'],
            price: parseFloat(product['product-price']),
            originalPrice: null,
            category: campaign.name || 'Featured',
            categorySlug: (campaign.name || 'featured').toLowerCase().replace(/\s+/g, '-'),
            badge: '🔥 New',
            badgeColor: 'text-orange-500',
            description: campaign.description || '',
            features: [
              `Product Code: ${product['product-code']}`,
              `Available Colors: ${product['product-color']}`,
              `Available Sizes: ${product['product-size']}`,
            ],
            sizes: product['product-size']?.split(',') || ['S', 'M', 'L', 'XL'],
            colors: product['product-color']?.split(',').map((color: string) => ({
              name: color.charAt(0).toUpperCase() + color.slice(1),
              code: getColorCode(color),
              colorClass: `bg-${color}`,
              imageKey: color,
            })) || [],
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
      return getMockProducts();
    } catch (error) {
      console.error('❌ Error fetching from Hoplix API:', error);
      return getMockProducts();
    }
  },
  
  async getProduct(productCode: string): Promise<AppProduct | null> {
    console.log(`🔍 Getting product: ${productCode}`);
    
    if (!config.useRealApi) {
      const mockProducts = getMockProducts();
      return mockProducts.find(p => p.productCode === productCode) || null;
    }
    
    if (!hoplixService.isConfigured()) {
      const mockProducts = getMockProducts();
      return mockProducts.find(p => p.productCode === productCode) || null;
    }
    
    try {
      const result = await hoplixService.getProduct(productCode);
      if (result.product) {
        return transformToAppProduct(result.product, true);
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
};