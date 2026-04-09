'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { useRef, useEffect, useState, useMemo } from 'react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

// Import the AppProduct type
import type { AppProduct } from '@/lib/services/productService';

interface ProductSliderProps {
  products?: AppProduct[]; // Accept products as prop from server component
  category?: string;
  title?: string;
  subtitle?: string;
  red?: boolean;
  showWishlist?: boolean;
  onWishlistToggle?: (productId: string) => void; // Changed to string for product code
  wishlistItems?: string[]; // Changed to string array for product codes
}

export default function ProductSlider({ 
  products: externalProducts,
  category = "Nuovi Arrivi", 
  title = "Categoria Prodotti",
  subtitle = "Scopri i nostri prodotti tecnologici",
  red = false,
  showWishlist = false,
  onWishlistToggle,
  wishlistItems = []
}: ProductSliderProps) {
  
  const [hasEnoughProducts, setHasEnoughProducts] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Use products from prop, or fallback to empty array
  const filteredProducts = useMemo(() => {
    if (externalProducts) return externalProducts;
    // Fallback to empty array if no products provided
    return [];
  }, [externalProducts]);
  
  // Check if product is in wishlist
  const isInWishlist = useMemo(() => {
    return (productId: string) => wishlistItems.includes(productId);
  }, [wishlistItems]);
  
  // Check screen size and product count
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      const threshold = mobile ? 2 : 4;
      setHasEnoughProducts(filteredProducts.length > threshold);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [filteredProducts.length]);

  // Handle wishlist toggle
  const handleWishlistToggle = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(productId);
    }
  };

  // Create refs for custom navigation
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // Product Card Component
  const ProductCard = ({ product }: { product: AppProduct }) => {
    const [imgError, setImgError] = useState(false);
    const inWishlist = isInWishlist(product.id);

    // Add logging for debugging
    console.log('Product image URL:', product.image);
    
    return (
      <div className="group border border-dark/20 dark:border-dark/60 rounded-md transition-transform hover:shadow-lg hover:-translate-y-1 duration-300 h-full flex flex-col relative">
        
        {/* Wishlist Button */}
        {showWishlist && (
          <button
            onClick={(e) => handleWishlistToggle(product.id, e)}
            className="absolute top-2 right-2 z-20 w-8 h-8 bg-white dark:bg-dark/80 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg 
              className={`w-4 h-4 transition-colors ${
                inWishlist 
                  ? 'text-red-500 fill-current' 
                  : 'text-gray-400 hover:text-red-500'
              }`} 
              viewBox="0 0 24 24" 
              fill={inWishlist ? "currentColor" : "none"}
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
  };

  // Show loading or empty state
  if (filteredProducts.length === 0) {
    return (
      <section className={`py-10 px-5 relative ${red ? 'bg-primary' : ''}`}>
        <div className="max-w-7xl mx-auto text-center py-12">
          <p className="text-dark/70 dark:text-light/70">
            Nessun prodotto disponibile in questa categoria.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-10 px-5 relative ${red ? 'bg-primary' : ''}`}>

      <div className="max-w-7xl mx-auto space-y-10 relative">
        
        {/* Heading - Only show if title is provided */}
        {title && (
          <div className="text-center">
            <h2 className="font-heading text-[max(40px,min(60px,4vw))] font-bold text-dark dark:text-light">
              {title} <span className={red ? 'text-dark dark:text-light' : 'text-primary'}>{category}</span>
            </h2>
            {subtitle && (
              <p className="text-dark/70 dark:text-light/70 mt-4 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Products Display */}
        <div className="relative">
          
          {/* Custom Navigation Buttons */}
          {hasEnoughProducts && (
            <>
              <button 
                ref={prevRef}
                aria-label="Previous slide" 
                className="prev-article cursor-pointer absolute -bottom-20 left-0 lg:left-60 xl:left-80 2xl:left-100 z-10"
              >
                <svg className="size-10 text-primary" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path className="fill-current" d="M15.2335 5.21967C15.5263 5.51256 15.5263 5.98744 15.2335 6.28033L9.51379 12L15.2335 17.7197C15.5263 18.0126 15.5263 18.4874 15.2335 18.7803C14.9406 19.0732 14.4657 19.0732 14.1728 18.7803L7.92279 12.5303C7.6299 12.2374 7.6299 11.7626 7.92279 11.4697L14.1728 5.21967C14.4657 4.92678 14.9406 4.92678 15.2335 5.21967Z" fill="#323544"/>
                </svg>
              </button>
              <button 
                ref={nextRef}
                aria-label="Next slide" 
                className="next-article cursor-pointer absolute -bottom-20 right-0 lg:right-60 xl:right-80 2xl:right-100 z-10"
              >
                <svg className="size-10 text-primary rotate-180" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path className="fill-current" d="M15.2335 5.21967C15.5263 5.51256 15.5263 5.98744 15.2335 6.28033L9.51379 12L15.2335 17.7197C15.5263 18.0126 15.5263 18.4874 15.2335 18.7803C14.9406 19.0732 14.4657 19.0732 14.1728 18.7803L7.92279 12.5303C7.6299 12.2374 7.6299 11.7626 7.92279 11.4697L14.1728 5.21967C14.4657 4.92678 14.9406 4.92678 15.2335 5.21967Z" fill="#323544"/>
                </svg>
              </button>
            </>
          )}

          {/* Conditional rendering: Swiper or Grid */}
          {hasEnoughProducts ? (
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={20}
              slidesPerView={2}
              navigation={{
                prevEl: prevRef.current,
                nextEl: nextRef.current,
              }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={filteredProducts.length > 4}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 30,
                },
              }}
              className="product-swiper"
              onInit={(swiper) => {
                if (swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
                  swiper.params.navigation.prevEl = prevRef.current;
                  swiper.params.navigation.nextEl = nextRef.current;
                  swiper.navigation.init();
                  swiper.navigation.update();
                }
              }}
            >
              {filteredProducts.map((product) => (
                <SwiperSlide key={product.id}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Spacer for navigation buttons */}
        {hasEnoughProducts && <div className="h-16"></div>}

      </div>
    </section>
  );
}