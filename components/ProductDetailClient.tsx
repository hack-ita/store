'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DOMPurify from 'dompurify';

interface ProductDetailClientProps {
  initialProduct: {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice: number | null;
    description: string;
    features: string[];
    image: string;
    images: string[];
    sizes: string[];
    colors: Array<{ name: string; code: string; colorClass: string; imageKey: string }>;
    category: string;
    categorySlug: string;
    badge?: string;
    badgeColor?: string;
    rating: number;
    reviews: number;
    inStock: boolean;
    productCode: string;
  };
}

// Zoom on Hover Component
function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  return (
    <div
      ref={imageContainerRef}
      className="relative aspect-square w-full overflow-hidden rounded-2xl cursor-zoom-in"
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
      onMouseMove={handleMouseMove}
    >
      <div className="relative w-full h-full">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain transition-transform duration-200"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      
      {/* Zoom Lens Effect */}
      {isZoomed && (
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
            backgroundSize: '200%',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
    </div>
  );
}

// Helper to capitalize words
function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

// Helper to format feature text
function formatFeature(feature: string): string {
  if (feature.toLowerCase().startsWith('product code:')) {
    const parts = feature.split(':');
    if (parts.length === 2) {
      return `${parts[0]}: ${parts[1].trim().toUpperCase()}`;
    }
  }
  if (feature.toLowerCase().startsWith('available colors:')) {
    const parts = feature.split(':');
    if (parts.length === 2) {
      const colors = parts[1].split(',').map(c => c.trim().charAt(0).toUpperCase() + c.trim().slice(1)).join(', ');
      return `${parts[0]}: ${colors}`;
    }
  }
  if (feature.toLowerCase().startsWith('available sizes:')) {
    const parts = feature.split(':');
    if (parts.length === 2) {
      const sizes = parts[1].split(',').map(s => s.trim()).join(', ');
      return `${parts[0]}: ${sizes}`;
    }
  }
  return feature;
}

export default function ProductDetailClient({ initialProduct }: ProductDetailClientProps) {
  const [product] = useState(initialProduct);
  const [selectedSize, setSelectedSize] = useState(
    product?.sizes?.find((s: string) => s === 'M') || product?.sizes?.[0] || ''
  );
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Sanitize and render HTML description
  const renderDescription = () => {
    if (!product?.description) return null;
    const sanitizedHtml = DOMPurify.sanitize(product.description);
    return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} className="prose prose-sm dark:prose-invert max-w-none" />;
  };

  const handleAddToCart = () => {
    console.log('Adding to cart:', {
      product,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-dark dark:text-light">Prodotto non trovato</h1>
          <Link href="/" className="text-primary hover:underline">Torna alla home</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-light dark:bg-dark mt-20">
      {/* Product Detail Section */}
      <section className="py-12 px-5">
        <div className="max-w-7xl mx-auto">
          
          {/* Breadcrumb */}
          <div className="mb-8 text-sm text-dark/60 dark:text-light/60">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link href={`/categories/${product.categorySlug}`} className="hover:text-primary">
              {product.category}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-dark dark:text-light">{product.name}</span>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* LEFT: Product Images with Zoom */}
            <div className="space-y-4">
              <ZoomableImage src={product.images[activeImage] || product.image} alt={product.name} />
              
              {/* Thumbnail Gallery */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        activeImage === idx ? 'border-primary' : 'border-transparent hover:border-primary/50'
                      }`}
                    >
                      <Image src={img} alt={`${product.name} view ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Product Info */}
            <div className="space-y-6">
              
              {/* Badge and Title */}
              <div>
                {product.badge && (
                  <span className={`inline-block mb-3 px-3 py-1 rounded-full text-sm font-bold ${product.badgeColor} bg-white dark:bg-dark/80 shadow-sm`}>
                    {product.badge}
                  </span>
                )}
                <h1 className="text-3xl lg:text-4xl font-bold text-dark dark:text-light mb-2">
                  {capitalizeWords(product.name)}
                </h1>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-dark/60 dark:text-light/60">({product.reviews} recensioni)</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">€{product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-lg text-dark/50 dark:text-light/50 line-through">€{product.originalPrice.toFixed(2)}</span>
                )}
              </div>

              {/* Description */}
              <div className="text-dark/70 dark:text-light/70 leading-relaxed">{renderDescription()}</div>

              {/* Size Selection */}
              {product.sizes.length > 0 && product.sizes[0] !== 'One Size' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-dark dark:text-light">Taglia</h3>
                    <button onClick={() => setShowSizeGuide(true)} className="text-sm text-primary hover:underline">Guida alle taglie</button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map(size => (
                      <button key={size} onClick={() => setSelectedSize(size)} className={`w-12 h-12 rounded-lg font-medium transition-all ${selectedSize === size ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-dark dark:text-light hover:bg-primary/20'}`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.colors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-dark dark:text-light">Colore</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map(color => (
                      <button key={color.name} onClick={() => setSelectedColor(color)} className={`w-10 h-10 rounded-full transition-all ${selectedColor?.name === color.name ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-dark scale-110' : 'hover:scale-105'} ${color.colorClass}`} title={color.name} />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-dark/20 dark:border-light/20 rounded-lg">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">-</button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">+</button>
                  </div>
                  <button onClick={handleAddToCart} className="flex-1 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Aggiungi al Carrello
                  </button>
                </div>
                <p className="text-sm text-dark/50 dark:text-light/50 text-center">{product.inStock ? '✅ Disponibile' : '❌ Esaurito'}</p>
              </div>

              {/* Features */}
              <div className="border-t border-dark/10 dark:border-light/10 pt-6">
                <h3 className="font-semibold mb-3 text-dark dark:text-light">Caratteristiche</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-dark/70 dark:text-light/70">
                      <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {formatFeature(feature)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full animate-fadeIn">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Guida alle Taglie</h2>
              <button onClick={() => setShowSizeGuide(false)} className="text-gray-400 hover:text-primary text-2xl transition-colors">✕</button>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 font-semibold">Taglia</th>
                      <th className="text-left py-2 font-semibold">Petto (cm)</th>
                      <th className="text-left py-2 font-semibold">Lunghezza (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 dark:border-gray-800"><td className="py-2 font-medium">XS</td><td className="py-2">86-91</td><td className="py-2">66</td></tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800"><td className="py-2 font-medium">S</td><td className="py-2">91-96</td><td className="py-2">68</td></tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800"><td className="py-2 font-medium">M</td><td className="py-2">96-101</td><td className="py-2">70</td></tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800"><td className="py-2 font-medium">L</td><td className="py-2">101-106</td><td className="py-2">72</td></tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800"><td className="py-2 font-medium">XL</td><td className="py-2">106-111</td><td className="py-2">74</td></tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800"><td className="py-2 font-medium">XXL</td><td className="py-2">111-116</td><td className="py-2">76</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}