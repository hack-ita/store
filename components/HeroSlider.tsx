'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

const heroImages = [
  {
    id: 1,
    src: '/images/hackita-slider.jpeg',
    alt: 'Hero Image 1',
  },
  {
    id: 2,
    src: '/images/hackita-slider2.jpeg',
    alt: 'Hero Image 2',
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = heroImages.length;

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  // --- Gesture navigation: horizontal mouse/trackpad scroll (desktop) + swipe (touch) ---
  const wheelLock = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      // Only react to horizontal scroll intent so vertical page scroll stays intact.
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 20) return;
      if (wheelLock.current) return;
      wheelLock.current = true;
      if (e.deltaX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      // Cooldown to avoid skipping multiple slides on a single fling.
      setTimeout(() => {
        wheelLock.current = false;
      }, 600);
    },
    [nextSlide, prevSlide]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      // Require a mostly-horizontal swipe past a threshold.
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
      touchStartX.current = null;
      touchStartY.current = null;
    },
    [nextSlide, prevSlide]
  );

  if (totalSlides === 0) {
    return null;
  }

  return (
    <section
      className="relative w-full aspect-video mt-31 lg:mt-0 lg:aspect-auto lg:h-screen overflow-hidden touch-pan-y select-none"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full h-full">
        {heroImages.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      {totalSlides > 1 && (
        <>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`rounded-full transition-all flex items-center justify-center ${
                  index === currentSlide
                    ? 'w-12 h-3'
                    : 'w-6 h-6 hover:bg-light/20'
                }`}
                style={{ minWidth: '24px', minHeight: '24px' }}
                aria-label={`Vai alla slide ${index + 1}`}
              >
                <span
                  className={`rounded-full transition-all ${
                    index === currentSlide
                      ? 'w-8 h-3 bg-light'
                      : 'w-2 h-2 bg-light/50 hover:bg-light/80'
                  }`}
                />
              </button>
            ))}
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-light/50 hover:text-light transition-colors"
            aria-label="Previous slide"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-light/50 hover:text-light transition-colors"
            aria-label="Next slide"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </section>
  );
}
