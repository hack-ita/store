'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { useRef, useEffect, useState, useMemo } from 'react';
import ProductCard from './ProductCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

// Import the AppProduct type
import type { AppProduct } from '@/lib/services/productService';

interface ProductSliderProps {
  products?: AppProduct[];
  category?: string;
  title?: string;
  subtitle?: string;
  red?: boolean;
  showWishlist?: boolean;
  onWishlistToggle?: (productId: string) => void;
  wishlistItems?: string[];
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
  
  const filteredProducts = useMemo(() => {
    if (externalProducts) return externalProducts;
    return [];
  }, [externalProducts]);
  
  const isInWishlist = useMemo(() => {
    return (productId: string) => wishlistItems.includes(productId);
  }, [wishlistItems]);
  
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

  const handleWishlistToggle = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(productId);
    }
  };

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  if (filteredProducts.length === 0) {
    return (
      <section className={`py-10 px-5 relative bg-mask ${red ? 'bg-primary' : ''}`}>
        <div className="max-w-7xl mx-auto text-center py-12">
          <p className="text-dark/70 dark:text-light/70">
            Nessun prodotto disponibile in questa categoria.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-10 px-5 relative bg-mask ${red ? 'bg-primary' : ''}`}>
      <div className="max-w-7xl mx-auto space-y-10 relative">
        
        {title && (
          <div className="text-center">
            <h2 className="font-heading text-[max(40px,min(60px,4vw))] font-bold text-dark dark:text-light">
              <span className={red ? 'text-dark dark:text-light' : 'text-primary'}>{title}</span> Products
            </h2>
            {subtitle && (
              <p className="text-dark/70 dark:text-light/70 mt-4 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="relative">
          
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
                    }}
                    red={red}
                    showWishlist={showWishlist}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
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
                  }}
                  red={red}
                  showWishlist={showWishlist}
                />
              ))}
            </div>
          )}
        </div>

        {hasEnoughProducts && <div className="h-16"></div>}

      </div>
    </section>
  );
}