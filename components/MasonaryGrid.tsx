'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/lib/cartStore';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  baseImage: string;
  colors: Array<{ name: string; code: string; colorClass: string; imageKey: string }>;
  sizes: string[];
  description?: string;
  campaignId?: string;
}

interface MasonryGridProps {
  campaignId: string;
  campaignName?: string;
}

// Helper functions (same as in your other components)
function buildImageUrl(baseUrl: string, colorCode: string): string {
  if (!baseUrl) return '';
  return baseUrl.replace(/\/([^/]+)(\/\d+\/)$/, `/${colorCode}$2`);
}

function getBaseImageFromPreview(preview: Array<Record<string, string>> | undefined): string {
  if (!preview || !preview[0]) return '';
  const key = Object.keys(preview[0]).find(k => k.startsWith('front-'));
  return key ? preview[0][key] : '';
}

const FALLBACK_IMAGE = '/images/hero-1.png';

export default function MasonryGrid({ campaignId, campaignName = 'Prodotti' }: MasonryGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Record<string, string>>({});
  const [selectedSize, setSelectedSize] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const expandedRef = useRef<HTMLDivElement | null>(null);

  // Fetch products from campaign
  useEffect(() => {
    async function fetchCampaignProducts() {
      try {
        setLoading(true);
        setError(null);
        console.log(`🔍 MasonryGrid fetching campaign: ${campaignId}`);
        
        const res = await fetch(`/api/campaigns/${campaignId}`);
        if (!res.ok) throw new Error('Failed to fetch campaign');
        
        const data = await res.json();
        
        if (data.campaign?.products) {
          const transformed: Product[] = data.campaign.products.map((p: any) => {
            const baseImage = getBaseImageFromPreview(p.preview);
            const firstColor = p['product-color']?.split(',')[0]?.trim().toLowerCase() || 'black';
            const mainImage = buildImageUrl(baseImage, firstColor) || baseImage || FALLBACK_IMAGE;

            const colors = (p['product-color'] || '').split(',')
              .map((c: string) => c.trim().toLowerCase()).filter(Boolean)
              .map((c: string) => ({ 
                name: c.charAt(0).toUpperCase() + c.slice(1), 
                code: c, 
                colorClass: `bg-${c}`, 
                imageKey: c 
              }));

            const sizes = (p['product-size'] || '').split(',').map((s: string) => s.trim()).filter(Boolean);

            if (colors.length === 0) colors.push({ name: 'Black', code: 'black', colorClass: 'bg-black', imageKey: 'black' });
            if (sizes.length === 0) sizes.push('M');

            return {
              id: p['product-id'],
              name: p['product-name'],
              slug: p['product-name'].toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
              price: parseFloat(p['product-price']),
              image: mainImage,
              baseImage,
              colors,
              sizes,
              description: data.campaign.description || `High-quality ${p['product-name']}.`,
              campaignId: campaignId,
            };
          });
          
          console.log(`✅ Loaded ${transformed.length} products for campaign ${campaignId}`);
          setProducts(transformed);
        } else {
          setError('Nessun prodotto trovato in questa campagna');
        }
      } catch (err) {
        console.error('Error fetching campaign products:', err);
        setError('Errore nel caricamento dei prodotti');
      } finally {
        setLoading(false);
      }
    }
    
    fetchCampaignProducts();
  }, [campaignId]);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle click outside to collapse
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (expandedRef.current && !expandedRef.current.contains(event.target as Node)) {
        setExpandedId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (productId: string) => {
    if (expandedId === productId) {
      setExpandedId(null);
    } else {
      setExpandedId(productId);
      // Initialize default color and size for this product
      const product = products.find(p => p.id === productId);
      if (product && !selectedColor[productId]) {
        setSelectedColor(prev => ({ ...prev, [productId]: product.colors[0]?.imageKey || 'black' }));
        setSelectedSize(prev => ({ ...prev, [productId]: product.sizes[0] || 'M' }));
      }
    }
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const colorKey = selectedColor[product.id] || product.colors[0]?.imageKey || 'black';
    const colorName = product.colors.find(c => c.imageKey === colorKey)?.name || 'Black';
    const size = selectedSize[product.id] || product.sizes[0] || 'M';
    
    // Build the image URL for selected color
    const displayImage = product.baseImage 
      ? buildImageUrl(product.baseImage, colorKey) || product.image
      : product.image;
    
    setIsAdding(product.id);
    
    addItem({
      id: `${product.id}_${colorKey}_${size}_masonry`,
      productId: product.id,
      name: `${product.name} — ${colorName} / ${size}`,
      price: product.price,
      image: displayImage,
      quantity: 1,
      slug: product.slug,
      campaignId: product.campaignId,
      size: size,
      color: colorName,
    });
    
    setTimeout(() => setIsAdding(null), 1000);
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-16 px-5 bg-light dark:bg-dark">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-dark/60 dark:text-light/60">Caricamento prodotti...</p>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-16 px-5 bg-light dark:bg-dark">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-dark/60 dark:text-light/60 text-sm">Prova a ricaricare la pagina</p>
        </div>
      </section>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <section className="py-16 px-5 bg-light dark:bg-dark">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-dark/60 dark:text-light/60">Nessun prodotto disponibile in questa campagna</p>
        </div>
      </section>
    );
  }

  // Get hover/click instruction text
  const instructionText = isMobile ? '📱 Clicca per i dettagli' : '🖱️ Passa sopra per i dettagli';

  return (
    <section className="py-16 px-5 bg-light dark:bg-dark">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-dark dark:text-light mb-3">
            {campaignName}
          </h2>
          <p className="text-dark/60 dark:text-light/60 max-w-2xl mx-auto">
            Scopri la nostra collezione {campaignName.toLowerCase()}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <span className="text-sm text-primary font-medium">{instructionText}</span>
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {products.map((product) => {
            const isExpanded = expandedId === product.id;
            const currentColor = selectedColor[product.id] || product.colors[0]?.imageKey || 'black';
            const currentSize = selectedSize[product.id] || product.sizes[0] || 'M';
            const displayImage = product.baseImage 
              ? buildImageUrl(product.baseImage, currentColor) || product.image
              : product.image;
            
            const cardClasses = `
              break-inside-avoid
              rounded-2xl
              overflow-hidden
              bg-white dark:bg-gray-900
              border border-dark/10 dark:border-light/10
              transition-all duration-500 ease-[cubic-bezier(0.34,1.2,0.64,1)]
              cursor-pointer
              ${isExpanded 
                ? 'scale-105 shadow-2xl ring-2 ring-primary z-20 relative' 
                : 'hover:scale-[1.02] hover:shadow-lg hover:z-10'
              }
            `;

            return (
              <div
                key={product.id}
                ref={isExpanded ? expandedRef : null}
                className={cardClasses}
                onClick={() => handleToggle(product.id)}
                style={{
                  animation: isExpanded ? 'bounceIn 0.5s cubic-bezier(0.34, 1.2, 0.64, 1)' : undefined,
                }}
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <Image
                    src={displayImage}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />
                  
                  {/* Quick add badge on hover (desktop only) */}
                  {!isExpanded && !isMobile && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg transform translate-y-4 hover:translate-y-0 transition-transform duration-300">
                        👆 Clicca per dettagli
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info - Always visible */}
                <div className="p-4">
                  <h3 className="font-semibold text-dark dark:text-light text-base line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-primary font-bold text-xl">€{product.price.toFixed(2)}</p>
                </div>

                {/* Expanded Details - Animated slide down */}
                <div
                  className={`
                    overflow-hidden transition-all duration-500 ease-in-out
                    ${isExpanded ? 'max-h-125 opacity-100' : 'max-h-0 opacity-0'}
                  `}
                >
                  <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-800 space-y-4">
                    
                    {/* Description */}
                    {product.description && (
                      <p className="text-sm text-dark/70 dark:text-light/70 line-clamp-3">
                        {product.description}
                      </p>
                    )}

                    {/* Color Selection */}
                    {product.colors.length > 0 && (
                      <div>
                        <label className="text-xs font-medium text-dark/60 dark:text-light/60 mb-2 block">
                          Colore: {product.colors.find(c => c.imageKey === currentColor)?.name || 'Seleziona'}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {product.colors.map((color) => (
                            <button
                              key={color.code}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedColor(prev => ({ ...prev, [product.id]: color.imageKey }));
                              }}
                              className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                                currentColor === color.imageKey
                                  ? 'border-primary scale-110 ring-2 ring-primary ring-offset-2'
                                  : 'border-transparent hover:scale-105'
                              }`}
                              style={{ backgroundColor: color.code }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Size Selection */}
                    {product.sizes.length > 0 && (
                      <div>
                        <label className="text-xs font-medium text-dark/60 dark:text-light/60 mb-2 block">
                          Taglia: {currentSize}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {product.sizes.map((size) => (
                            <button
                              key={size}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSize(prev => ({ ...prev, [product.id]: size }));
                              }}
                              className={`min-w-10 h-10 px-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                                currentSize === size
                                  ? 'bg-primary text-white shadow-md'
                                  : 'bg-gray-100 dark:bg-gray-800 text-dark dark:text-light hover:bg-primary/20'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Price and Add to Cart */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className="text-xs text-dark/50 dark:text-light/50">Totale</span>
                        <span className="text-2xl font-bold text-primary block">€{product.price.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={isAdding === product.id}
                        className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {isAdding === product.id ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Aggiungo...
                          </>
                        ) : (
                          <>
                            🛒 Aggiungi
                          </>
                        )}
                      </button>
                    </div>

                    {/* View Product Link */}
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="block text-center text-xs text-primary hover:underline mt-2"
                    >
                      Vedi dettaglio prodotto →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add bounce animation keyframes */}
      <style jsx>{`
        @keyframes bounceIn {
          0% {
            transform: scale(0.95);
            opacity: 0;
          }
          60% {
            transform: scale(1.08);
          }
          100% {
            transform: scale(1.05);
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}