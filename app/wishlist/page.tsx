'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Mock wishlist data (will be replaced with actual state later)
const mockWishlistItems = [
  {
    id: 1,
    name: 'T-Shirt Tech HackITa',
    slug: 'tshirt-tech-hackita',
    image: '/images/hero-1.png',
    price: 29.99,
    originalPrice: 39.99,
    category: 'Nuovi Arrivi',
    badge: '🔥 Hot',
    badgeColor: 'text-orange-500',
    inStock: true,
  },
  {
    id: 3,
    name: 'Cover iPhone 15 Pro',
    slug: 'cover-iphone-15-pro',
    image: '/images/hero-3.png',
    price: 24.99,
    originalPrice: 34.99,
    category: 'Nuovi Arrivi',
    badge: '🔥 Hot',
    badgeColor: 'text-orange-500',
    inStock: true,
  },
  {
    id: 8,
    name: 'Tazza LED Termica',
    slug: 'tazza-led-termica',
    image: '/images/hero-3.png',
    price: 29.99,
    originalPrice: 59.99,
    category: 'In Offerta',
    badge: '💸 -50%',
    badgeColor: 'text-green-500',
    inStock: true,
  },
];

interface WishlistItem {
  id: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice: number | null;
  category: string;
  badge?: string;
  badgeColor?: string;
  inStock: boolean;
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(mockWishlistItems);
  const [addedToCart, setAddedToCart] = useState<number[]>([]);

  const removeFromWishlist = (id: number) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
  };

  const addToCart = (id: number) => {
    setAddedToCart(prev => [...prev, id]);
    setTimeout(() => {
      setAddedToCart(prev => prev.filter(itemId => itemId !== id));
    }, 2000);
    console.log('Added to cart:', id);
  };

  const moveAllToCart = () => {
    wishlistItems.forEach(item => {
      addToCart(item.id);
    });
  };

  if (wishlistItems.length === 0) {
    return (
      <main className="min-h-screen bg-light dark:bg-dark pt-36 pb-20 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">❤️</div>
          <h1 className="text-3xl font-bold mb-4 text-dark dark:text-light">
            La tua wishlist è vuota
          </h1>
          <p className="text-dark/70 dark:text-light/70 mb-8">
            Aggiungi i tuoi prodotti preferiti alla wishlist
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Esplora i prodotti →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-light dark:bg-dark pt-36 pb-12 px-5">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-dark dark:text-light mb-2">
              La tua Wishlist
            </h1>
            <p className="text-dark/70 dark:text-light/70">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'prodotto' : 'prodotti'} salvati
            </p>
          </div>
          <button
            onClick={moveAllToCart}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Aggiungi tutti al carrello
          </button>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="group bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
              {/* Product Image */}
              <Link href={`/products/${item.slug}`} className="block relative aspect-square overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {item.badge && (
                  <div className={`absolute top-3 left-3 ${item.badgeColor} bg-white dark:bg-dark/80 px-2 py-1 rounded text-xs font-bold shadow-md z-10`}>
                    {item.badge}
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeFromWishlist(item.id);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors z-10"
                  aria-label="Remove from wishlist"
                >
                  <svg className="w-4 h-4 text-red-500 fill-current" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </Link>

              {/* Product Info */}
              <div className="p-4">
                <Link href={`/products/${item.slug}`}>
                  <h3 className="font-semibold text-dark dark:text-light hover:text-primary transition-colors line-clamp-2 mb-2">
                    {item.name}
                  </h3>
                </Link>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl font-bold text-primary">
                    €{item.price.toFixed(2)}
                  </span>
                  {item.originalPrice && (
                    <span className="text-sm text-dark/50 dark:text-light/50 line-through">
                      €{item.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => addToCart(item.id)}
                  disabled={!item.inStock}
                  className={`w-full py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    addedToCart.includes(item.id)
                      ? 'bg-green-500 text-white'
                      : item.inStock
                      ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {addedToCart.includes(item.id) ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Aggiunto!
                    </>
                  ) : item.inStock ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Aggiungi al carrello
                    </>
                  ) : (
                    'Esaurito'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Recommended Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-6 text-dark dark:text-light">
            Potrebbero piacerti anche
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* You can add a product slider or recommendations here */}
            <p className="text-dark/60 dark:text-light/60 col-span-full text-center">
              Scopri altri prodotti nella nostra collezione
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}