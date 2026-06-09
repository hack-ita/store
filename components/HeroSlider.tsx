'use client';

import { useState, useEffect, useCallback } from 'react';
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

  if (totalSlides === 0) {
    return null;
  }

  return (
    <section className="relative w-full h-screen overflow-hidden">
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
