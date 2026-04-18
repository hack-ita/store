'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';

interface CategoryClientProps {
  initialCampaign: any;
  initialProducts: any[];
  slug: string;
}

export default function CategoryClient({ initialCampaign, initialProducts, slug }: CategoryClientProps) {
  const [campaign] = useState(initialCampaign);
  const [products, setProducts] = useState(initialProducts);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'>('name-asc');

  useEffect(() => {
    console.log(`📦 CategoryClient - ${products?.length || 0} prodotti per la campagna:`, campaign?.name);
  }, [products, campaign]);

  // Safe sort products
  const getSortedProducts = () => {
    if (!products || products.length === 0) return [];
    
    const sorted = [...products];
    
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-desc':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'name-asc':
        return sorted.sort((a, b) => {
          const nameA = a?.name || '';
          const nameB = b?.name || '';
          return nameA.localeCompare(nameB);
        });
      case 'name-desc':
        return sorted.sort((a, b) => {
          const nameA = a?.name || '';
          const nameB = b?.name || '';
          return nameB.localeCompare(nameA);
        });
      default:
        return sorted;
    }
  };

  const sortedProducts = getSortedProducts();

  // Render description as HTML (trusted content from Hoplix)
  const renderDescription = () => {
    if (!campaign?.description) return null;
    return <div dangerouslySetInnerHTML={{ __html: campaign.description }} className="prose prose-sm dark:prose-invert max-w-none" />;
  };

  if (!campaign || !products || products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark pt-40 bg-mask">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-dark dark:text-light">Categoria non trovata</h1>
          <p className="text-dark/70 dark:text-light/70 mb-6">La categoria che stai cercando non esiste o non contiene prodotti.</p>
          <Link href="/" className="text-primary hover:underline">Torna alla home</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-light dark:bg-dark py-12 px-5 pt-40 bg-mask">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-dark/60 dark:text-light/60">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-dark dark:text-light">{campaign.name || 'Categoria'}</span>
        </div>

        {/* Category Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-dark dark:text-light mb-4">
            {campaign.name || 'Categoria'}
          </h1>
          {campaign.description && (
            <div className="text-dark/70 dark:text-light/70 max-w-2xl mx-auto">
              {renderDescription()}
            </div>
          )}
          <p className="text-dark/50 dark:text-light/50 mt-2">
            {products.length} {products.length === 1 ? 'prodotto' : 'prodotti'}
          </p>
        </div>

        {/* Sort Options */}
        {products.length > 0 && (
          <div className="flex justify-end mb-6">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)} 
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-dark dark:text-light focus:outline-none focus:border-primary"
            >
              <option value="name-asc">Nome: A → Z</option>
              <option value="name-desc">Nome: Z → A</option>
              <option value="price-asc">Prezzo: più basso</option>
              <option value="price-desc">Prezzo: più alto</option>
            </select>
          </div>
        )}

        {/* Products Grid - Using ProductCard with wishlist support */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {sortedProducts.map((product) => {
            const productImage = product?.images?.[0] || product?.image || '/images/hero-1.png';
            
            return (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  image: productImage,
                  price: product.price,
                  originalPrice: product.originalPrice,
                  badge: product.badge || (product.originalPrice ? '💸 In Offerta' : ''),
                  badgeColor: product.badgeColor || (product.originalPrice ? 'text-green-500' : 'text-orange-500'),
                  rating: product.rating || 4.5,
                  reviews: product.reviews || 0,
                  campaignId: product.campaignId,
                }}
                red={false}
                showWishlist={true}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}