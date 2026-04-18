'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { useCartStore } from '@/lib/cartStore';

interface MasonryProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  originalPrice: number | null;
  badge?: string;
  badgeColor?: string;
  rating?: number;
  reviews?: number;
  campaignId?: string;
  productCode: string;
  campaignName?: string;
}

interface MasonryGridProps {
  title?: string;
  subtitle?: string;
  pageSize?: number;
  showWishlist?: boolean;
  onWishlistToggle?: (productId: string) => void;
  wishlistItems?: string[];
}

// Helper functions
function buildImageUrl(baseUrl: string, colorCode: string): string {
  if (!baseUrl) return '';
  return baseUrl.replace(/\/([^/]+)(\/\d+\/)$/, `/${colorCode}$2`);
}

function getBaseImageFromPreview(preview: Array<Record<string, string>> | undefined): string {
  if (!preview || !preview[0]) return '';
  const key = Object.keys(preview[0]).find(k => k.startsWith('front-'));
  return key ? preview[0][key] : '';
}

function transformProduct(p: any, campaignId: string, campaignName?: string): MasonryProduct {
  const baseImage = getBaseImageFromPreview(p.preview);
  const firstColor = p['product-color']?.split(',')[0]?.trim().toLowerCase() || 'black';
  const mainImage = buildImageUrl(baseImage, firstColor) || baseImage || '/images/hero-1.png';

  const nameLower = (p['product-name'] || '').toLowerCase();
  let badge = '';
  let badgeColor = '';
  
  if (nameLower.includes('hoodie') || nameLower.includes('felpa')) {
    badge = '⭐ Best Seller';
    badgeColor = 'text-yellow-500';
  } else if (nameLower.includes('new') || nameLower.includes('nuov')) {
    badge = '🔥 Novità';
    badgeColor = 'text-orange-500';
  } else if (nameLower.includes('sale') || nameLower.includes('offer')) {
    badge = '💸 Sconto';
    badgeColor = 'text-green-500';
  }

  return {
    id: p['product-id'],
    name: p['product-name'],
    slug: (p['product-name'] || '').toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
    price: parseFloat(p['product-price']) || 0,
    image: mainImage,
    originalPrice: null,
    badge,
    badgeColor,
    rating: 4.5,
    reviews: Math.floor(Math.random() * 100) + 10,
    campaignId,
    productCode: p['product-code'],
    campaignName,
  };
}

// Skeleton Loader Component
function SkeletonCard({ heightClass }: { heightClass: string }) {
  return (
    <div className="animate-pulse">
      <div className={`rounded-lg bg-gray-200 dark:bg-gray-800 w-full ${heightClass}`}></div>
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
      </div>
    </div>
  );
}

// Different height classes for masonry effect (only for the image container)
const imageHeightClasses = [
  'md:h-[400px]',  // Index 0: Tall
  'md:h-[340px]',  // Index 1: Medium
  'md:h-[460px]',  // Index 2: Extra tall
  'md:h-[320px]',  // Index 3: Short
  'md:h-[380px]',  // Index 4: Tall medium
  'md:h-[300px]',  // Index 5: Short
  'md:h-[440px]',  // Index 6: Very tall
  'md:h-[360px]',  // Index 7: Medium tall
];

// Get image height class based on index to create masonry pattern
function getMasonryImageHeight(index: number): string {
  const pattern = index % 8;
  return imageHeightClasses[pattern];
}

export default function MasonryGrid({ 
  title, 
  subtitle, 
  pageSize = 12,
  showWishlist = false,
  onWishlistToggle,
  wishlistItems = []
}: MasonryGridProps) {
  const [products, setProducts] = useState<MasonryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [error, setError] = useState<string | null>(null);

  // Fetch ALL products from ALL campaigns
  useEffect(() => {
    async function fetchAllCampaignProducts() {
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 MasonryGrid fetching all campaigns...');
        
        const listRes = await fetch('/api/campaigns/list');
        if (!listRes.ok) throw new Error('Failed to fetch campaigns list');
        
        const campaignsData = await listRes.json();
        
        let campaigns: any[] = [];
        if (Array.isArray(campaignsData)) campaigns = campaignsData;
        else if (Array.isArray(campaignsData.campaigns)) campaigns = campaignsData.campaigns;
        else if (Array.isArray(campaignsData.data)) campaigns = campaignsData.data;
        else if (campaignsData.id_campaign || campaignsData.campaign_id) campaigns = [campaignsData];
        
        if (campaigns.length === 0) {
          setError('Nessuna campagna trovata');
          setLoading(false);
          return;
        }
        
        console.log(`📋 Found ${campaigns.length} campaigns`);
        
        const results = await Promise.allSettled(
          campaigns.map(async (campaign: any) => {
            const campaignId = campaign.id_campaign || campaign.campaign_id || campaign.id || campaign.url;
            if (!campaignId) return [];
            
            try {
              const res = await fetch(`/api/campaigns/${campaignId}`);
              if (!res.ok) return [];
              const data = await res.json();
              
              if (data.campaign?.products) {
                return data.campaign.products.map((p: any) => 
                  transformProduct(p, campaignId, campaign.name || data.campaign.name)
                );
              }
              return [];
            } catch (err) {
              console.error(`Failed to fetch campaign ${campaignId}:`, err);
              return [];
            }
          })
        );
        
        const merged: MasonryProduct[] = results
          .filter((r): r is PromiseFulfilledResult<MasonryProduct[]> => r.status === 'fulfilled')
          .flatMap(r => r.value);
        
        const seen = new Set<string>();
        const unique = merged.filter(product => {
          const key = `${product.campaignId}_${product.productCode}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        
        console.log(`✅ Loaded ${unique.length} unique products`);
        setProducts(unique);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Errore nel caricamento dei prodotti');
      } finally {
        setLoading(false);
      }
    }
    
    fetchAllCampaignProducts();
  }, []);

  const handleWishlistToggle = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(productId);
    }
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + pageSize, products.length));
      setLoadingMore(false);
    }, 300);
  };

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;
  const remaining = products.length - visibleCount;

  if (loading) {
    return (
      <section className="py-16 px-5 bg-light dark:bg-dark bg-mask">
        <div className="max-w-7xl mx-auto">
          {title && (
            <div className="mb-10 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-dark dark:text-light mb-2">{title}</h2>
              {subtitle && <p className="text-dark/60 dark:text-light/60">{subtitle}</p>}
            </div>
          )}
          <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {Array.from({ length: pageSize }).map((_, i) => (
              <SkeletonCard key={i} heightClass={getMasonryImageHeight(i)} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-5 bg-light dark:bg-dark bg-mask">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <p className="text-dark/40 dark:text-light/40 text-sm">Riprova più tardi</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-16 px-5 bg-light dark:bg-dark bg-mask">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-dark/40 dark:text-light/40">Nessun prodotto disponibile al momento.</p>
          <p className="text-xs text-dark/30 dark:text-light/30 mt-1">Torna presto per le nuove collezioni.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-5 bg-light dark:bg-dark bg-mask">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        {(title || subtitle) && (
          <div className="mb-10 text-center">
            {title && (
              <h2 className="text-3xl lg:text-4xl font-bold text-dark dark:text-light mb-3">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-dark/60 dark:text-light/60 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Product Count and Instructions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full">
            <span className="text-xs text-primary/70">
              {typeof window !== 'undefined' && window.innerWidth < 768
                ? '📱 Tocca un prodotto per i dettagli'
                : '🖱️ Passa sopra per i dettagli'}
            </span>
          </div>
          <span className="text-sm text-dark/50 dark:text-light/50">
            {products.length} {products.length === 1 ? 'prodotto' : 'prodotti'}
          </span>
        </div>

        {/* CSS Columns Masonry Grid with varying image heights */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {visibleProducts.map((product, index) => {
            const imageHeight = getMasonryImageHeight(index);
            
            return (
              <div 
                key={product.id} 
                className="break-inside-avoid transition-all duration-300 hover:scale-[1.02]"
              >
                <ProductCard
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    image: product.image,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    badge: product.badge,
                    badgeColor: product.badgeColor,
                    rating: product.rating,
                    reviews: product.reviews,
                    campaignId: product.campaignId,
                  }}
                  showWishlist={showWishlist}
                  customHeight={imageHeight}
                />
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex flex-col items-center gap-4 mt-12 pt-4">
            <div className="text-sm text-dark/50 dark:text-light/50">
              Mostrati <span className="font-medium text-dark dark:text-light">{visibleCount}</span> di{' '}
              <span className="font-medium text-dark dark:text-light">{products.length}</span> prodotti
            </div>
            
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5"
            >
              {loadingMore ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Caricamento...
                </>
              ) : (
                <>
                  Carica altri {Math.min(remaining, pageSize)} prodotti
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-6 6-6-6m12-4l-6 6-6-6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}

        {/* End of products message */}
        {!hasMore && products.length > pageSize && (
          <div className="text-center mt-12 pt-4 text-sm text-dark/40 dark:text-light/40">
            🎉 Hai visto tutti i {products.length} prodotti
          </div>
        )}
      </div>
    </section>
  );
}