'use client';

import { useState } from 'react';
import { useRatingStore } from '@/lib/ratingStore';

interface RatingDisplayProps {
  productId: string;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

const sizeMap = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
};

export default function RatingDisplay({
  productId,
  showCount = true,
  size = 'sm',
  interactive = false,
  onRate,
}: RatingDisplayProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const ratings = useRatingStore((state) => state.ratings);
  const rateProduct = useRatingStore((state) => state.rateProduct);

  const rating = ratings[productId];
  const average = rating?.average || 0;
  const count = rating?.count || 0;
  const userRating = rating?.userRating || 0;

  const displayRating = userRating > 0 ? userRating : average;
  const filledStars = Math.floor(displayRating);
  const hasHalfStar = displayRating - filledStars >= 0.5;

  const handleClick = (star: number) => {
    if (!interactive) return;
    rateProduct(productId, star);
    if (onRate) onRate(star);
  };

  const starSize = sizeMap[size];

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const effectiveHover = interactive ? hoverRating : 0;
          const isFilled = effectiveHover > 0 ? star <= effectiveHover : star <= displayRating;
          const isHalf = !isFilled && star === filledStars + 1 && hasHalfStar && effectiveHover === 0;

          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`${starSize} transition-all ${
                interactive ? 'cursor-pointer hover:scale-125' : 'cursor-default'
              } ${isFilled || isHalf ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
            >
              <svg
                viewBox="0 0 20 20"
                fill={isFilled ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={isFilled ? '0' : '1.5'}
                className="w-full h-full"
              >
                {isHalf ? (
                  <>
                    <defs>
                      <linearGradient id={`half-${productId}-${star}`}>
                        <stop offset="50%" stopColor="currentColor" />
                        <stop offset="50%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                      fill={`url(#half-${productId}-${star})`}
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                  </>
                ) : (
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                )}
              </svg>
            </button>
          );
        })}
      </div>
      {showCount && (
        <span className="text-xs text-dark/50 dark:text-light/50">
          ({count})
        </span>
      )}
    </div>
  );
}