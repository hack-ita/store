import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProductRating {
  average: number;
  count: number;
  userRating?: number; // Current user's own rating (0 = not rated)
}

interface RatingStore {
  ratings: Record<string, ProductRating>;
  rateProduct: (productId: string, rating: number) => void;
  getRating: (productId: string) => ProductRating;
}

// Seed ratings for a more realistic experience
const seedRatings: Record<string, ProductRating> = {};

export const useRatingStore = create<RatingStore>()(
  persist(
    (set, get) => ({
      ratings: seedRatings,

      rateProduct: (productId: string, rating: number) => {
        set((state) => {
          const existing = state.ratings[productId];
          if (!existing) {
            // First rating for this product
            return {
              ratings: {
                ...state.ratings,
                [productId]: {
                  average: rating,
                  count: 1,
                  userRating: rating,
                },
              },
            };
          }

          // If user already rated, adjust the average by removing old rating and adding new one
          let newAverage = existing.average;
          let newCount = existing.count;

          if (existing.userRating && existing.userRating > 0) {
            // User is changing their rating
            newAverage = ((newAverage * newCount) - existing.userRating + rating) / newCount;
          } else {
            // New user rating
            newCount += 1;
            newAverage = ((newAverage * (newCount - 1)) + rating) / newCount;
          }

          return {
            ratings: {
              ...state.ratings,
              [productId]: {
                average: Math.round(newAverage * 10) / 10,
                count: newCount,
                userRating: rating,
              },
            },
          };
        });
      },

      getRating: (productId: string): ProductRating => {
        const state = get().ratings;
        return state[productId] || { average: 0, count: 0 };
      },
    }),
    {
      name: 'product-ratings',
    }
  )
);