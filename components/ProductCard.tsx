'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    originalPrice: number | null;
    badge?: string;
    badgeColor?: string;
    rating?: number;
    reviews?: number;
  };
  red?: boolean;
  showWishlist?: boolean;
  onWishlistToggle?: (productId: string, e: React.MouseEvent) => void;
  isInWishlist?: boolean;
}

export default function ProductCard({ 
  product, 
  red = false, 
  showWishlist = false,
  onWishlistToggle,
  isInWishlist = false
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(product.id, e);
    }
  };

  return (
    <div className="group border border-dark/20 dark:border-dark/60 rounded-md transition-transform hover:shadow-lg hover:-translate-y-1 duration-300 h-full flex flex-col relative">
      
      {/* Wishlist Button */}
      {showWishlist && (
        <button
          onClick={handleWishlistClick}
          className="absolute top-2 right-2 z-20 w-8 h-8 bg-white dark:bg-dark/80 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg 
            className={`w-4 h-4 transition-colors ${
              isInWishlist 
                ? 'text-red-500 fill-current' 
                : 'text-gray-400 hover:text-red-500'
            }`} 
            viewBox="0 0 24 24" 
            fill={isInWishlist ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      )}
      
      {/* Product Image */}
      <Link href={`/products/${product.slug}`} className="block flex-1">
        <div className="overflow-hidden rounded-t-md relative">
          <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-800">
            {!imgError && product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                🖼️
              </div>
            )}
          </div>
          
          {product.badge && (
            <div className={`absolute top-2 left-2 ${product.badgeColor} bg-white dark:bg-dark/80 px-2 py-1 rounded text-xs font-bold shadow-md z-10`}>
              {product.badge}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className={`flex flex-col gap-y-3 p-4 rounded-b-md grow ${red ? 'bg-light dark:bg-dark' : ''}`}>
          <h3 className="min-h-12 text-base font-semibold text-dark dark:text-light line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating Stars */}
          {product.rating !== undefined && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-dark/50 dark:text-light/50">
                ({product.reviews || 0})
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 mt-auto">
            <span className="text-xl font-bold text-primary">
              €{product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-dark/50 dark:text-light/50 line-through">
                €{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div>
            <span className="inline-flex items-center justify-center w-full gap-2 text-sm font-medium bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-2 rounded-md transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Aggiungi
            </span>
          </div>
        </div>
      </Link>

      {/* Hover Bar */}
      <div className="relative">
        <div className={`h-1 w-full rounded-b-md overflow-hidden relative
                    after:absolute after:inset-0 ${red ? 'after:bg-light dark:after:bg-dark bg-primary' : 'after:bg-primary bg-dark/20 dark:bg-light/20'}
                    after:-translate-x-full
                    after:animate-underline-slide`}>
        </div>
      </div>
    </div>
  );
}