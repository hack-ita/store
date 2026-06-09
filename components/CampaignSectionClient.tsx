'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/cartStore';
import { useWishlistStore } from '@/lib/wishlistStore';
import type { AppProduct } from '@/lib/services/productService';
import RatingDisplay from './RatingDisplay';

interface CampaignSectionClientProps {
  products: AppProduct[];
  title: string;
  subtitle?: string;
  campaignId: string;
  showWishlist?: boolean;
}

// ─── Product Card Sub-Component ─────────────────────────────────────────
function ProductCardItem({ product, index, campaignId }: {
  product: AppProduct;
  index: number;
  campaignId: string;
}) {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const wishlistItems = useWishlistStore((state) => state.items);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isInWishlist = wishlistItems.some(item => item.id === product.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    setIsAdding(true);

    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      slug: product.slug,
      campaignId: product.campaignId || campaignId,
    });

    setTimeout(() => setIsAdding(false), 500);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    toggleWishlist({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      slug: product.slug,
      campaignId: campaignId,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative bg-white dark:bg-accent rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Link wraps image area only */}
      <Link href={`/products/${product.slug}?campaign=${product.campaignId || campaignId}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-4/5 overflow-hidden bg-gray-50">
          {!imgError && product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className={`object-contain transition-transform duration-700 ease-out ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600 text-4xl">
              🖼️
            </div>
          )}

          {/* Gradient Overlay on Hover */}
          <div className={`absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />

          {/* Badge */}
          {product.badge && (
            <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow-lg bg-primary text-white`}>
              {product.badge}
            </div>
          )}

          {/* Quick Actions Overlay */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-4 flex gap-2 transition-all duration-500 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              aria-label={`Aggiungi ${product.name} al carrello`}
              className="flex-1 bg-white/90 hover:bg-white text-gray-900 text-sm font-semibold py-2.5 rounded-xl backdrop-blur-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? (
                <span className="flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Adding
                </span>
              ) : (
                'Quick Add'
              )}
            </button>
            <button
              onClick={handleWishlistClick}
              aria-label={isInWishlist ? `Rimuovi ${product.name} dalla lista desideri` : `Aggiungi ${product.name} alla lista desideri`}
              className={`w-11 h-11 bg-white/90 hover:bg-white rounded-xl backdrop-blur-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
                isInWishlist ? 'text-red-500' : 'text-gray-900'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill={isInWishlist ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>
      </Link>

      {/* Info outside Link so buttons don't trigger navigation */}
      <div className="p-4 space-y-2">
        <Link href={`/products/${product.slug}?campaign=${product.campaignId || campaignId}`}>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <RatingDisplay productId={product.id} size="sm" showCount={true} />

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">€{product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">€{product.originalPrice.toFixed(2)}</span>
          )}
        </div>

        {/* Add to Cart button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full mt-2 flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white text-sm font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {isAdding ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Aggiungo...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Aggiungi
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Skeleton Loading ──────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div className="aspect-4/5 bg-gray-200 dark:bg-gray-700" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper to strip HTML tags from a string
function stripHtml(html: string): string {
  if (!html) return '';
  // Use browser's native HTML parsing to safely extract text content
  // This handles all HTML tags and entities (like &#39;, &, etc.) correctly
  if (typeof document !== 'undefined') {
    const el = document.createElement('div');
    el.innerHTML = html;
    return el.textContent || el.innerText || '';
  }
  // Fallback for server-side: strip tags only
  return html.replace(/<[^>]*>/g, '').trim();
}

// ─── Main Section Component ────────────────────────────────────────────
export default function CampaignSectionClient({
  products,
  title,
  subtitle,
  campaignId,
  showWishlist = false,
}: CampaignSectionClientProps) {
  const [isClient, setIsClient] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const hasProducts = products.length > 0;

  if (!isClient) {
    return (
      <section className="py-20 px-5 bg-linear-to-b from-light to-white dark:from-dark dark:to-accent bg-mask">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-12 text-center animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4" />
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-96 max-w-full mx-auto" />
          </div>
          <SkeletonGrid />
        </div>
      </section>
    );
  }

  if (!hasProducts) {
    return (
      <section className="py-20 px-5 bg-linear-to-b from-light to-white dark:from-dark dark:to-accent bg-mask">
        <div className="max-w-7xl mx-auto text-center">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-dark dark:text-light mb-4">
              {title}
            </h2>
            {subtitle && (
              <p className="text-dark/50 dark:text-light/50 max-w-2xl mx-auto text-lg">
                {subtitle}
              </p>
            )}
          </div>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400">
            <span className="text-2xl">📦</span>
            <span>Nessun prodotto disponibile per questa campagna al momento.</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-20 px-5 bg-linear-to-b from-light to-white dark:from-dark dark:to-accent bg-mask">
      <div className="max-w-7xl mx-auto">
      {/* ─── Section Header ─── */}
        <div className="mb-14 text-center">
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-dark dark:text-light mb-4 leading-tight">
            {title}
          </h2>

          {subtitle && (
            <p className="text-dark/50 dark:text-light/50 max-w-2xl mx-auto text-lg leading-relaxed">
              {stripHtml(subtitle)}
            </p>
          )}
        </div>

        {/* ─── Product Grid ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {products.map((product, index) => (
            <ProductCardItem
              key={product.id}
              product={product}
              index={index}
              campaignId={campaignId}
            />
          ))}
        </div>
      </div>
    </section>
  );
}