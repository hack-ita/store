'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/lib/cartStore'; // Add this import

// Types for API data
interface HoplixProduct {
  'product-id': string;
  'product-name': string;
  'product-code': string;
  'product-price': string;
  'product-color': string;
  'product-size': string;
  preview?: Array<Record<string, string>>;
}

// Extended product type with color-specific images
interface ProductType {
  id: string;
  name: string;
  price: number;
  images: Record<string, string>;
  availableColors: ColorType[];
  availableSizes: string[];
  slug?: string; // Add slug for product links
}

interface ColorType {
  name: string;
  code: string;
  colorClass: string;
  imageKey: string;
}

type ModalType = 'product' | 'size' | 'color' | 'size-chart' | null;

// Size chart data - hardcoded as API doesn't provide this
const sizeChartData = {
  'T-Shirt Unisex': {
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    chest: ['86-91', '91-96', '96-101', '101-106', '106-111', '111-116'],
    length: ['66', '68', '70', '72', '74', '76'],
  },
  'Felpa Unisex': {
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    chest: ['86-91', '91-96', '96-101', '101-106', '106-111', '111-116'],
    length: ['66', '68', '70', '72', '74', '76'],
  },
  'Hoodie': {
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    chest: ['86-91', '91-96', '96-101', '101-106', '106-111', '111-116'],
    length: ['66', '68', '70', '72', '74', '76'],
  },
  default: {
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    chest: ['86-91', '91-96', '96-101', '101-106', '106-111', '111-116'],
    length: ['66', '68', '70', '72', '74', '76'],
  },
};

// Helper to get the base preview image URL
function getBasePreviewImage(product: HoplixProduct): string {
  if (product.preview && product.preview[0]) {
    const anyFrontKey = Object.keys(product.preview[0]).find(key => key.startsWith('front-'));
    if (anyFrontKey) {
      return product.preview[0][anyFrontKey];
    }
  }
  return '';
}

// Helper to build a color-specific image URL by swapping the color segment
function buildImageUrl(baseUrl: string, colorCode: string): string {
  if (!baseUrl) return '';
  return baseUrl.replace(/\/([^/]+)(\/\d+\/)$/, `/${colorCode}$2`);
}

// Helper to parse colors from API response
function parseColors(colorString: string): ColorType[] {
  if (!colorString) return [];

  const colorNames = colorString.split(',');
  return colorNames.map(name => ({
    name: name.trim().charAt(0).toUpperCase() + name.trim().slice(1),
    code: name.trim().toLowerCase(),
    colorClass: `bg-${name.trim().toLowerCase()}`,
    imageKey: name.trim().toLowerCase(),
  }));
}

// Helper to parse sizes from API response
function parseSizes(sizeString: string): string[] {
  if (!sizeString) return [];

  const sizes = sizeString.split(',').map(s => s.trim());

  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];
  sizes.sort((a, b) => {
    const indexA = sizeOrder.indexOf(a);
    const indexB = sizeOrder.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });

  return sizes;
}

// Helper to generate slug from product name
function generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
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
      className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-2xl cursor-zoom-in"
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
      onMouseMove={handleMouseMove}
    >
      <div className="relative w-full h-full">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain drop-shadow-2xl dark:drop-shadow-lg transition-transform duration-200"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
      </div>
      
      {/* Zoom Lens Effect */}
      {isZoomed && (
        <div
          className="absolute inset-0 pointer-events-none"
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

export default function ProductCustomizer() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState<ColorType | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false); // Add loading state
  const [addedMessage, setAddedMessage] = useState(false); // Add success state

  // Get cart functions
  const addItem = useCartStore((state) => state.addItem);

  // Derive current image directly from selected product + color
  const currentImage =
    (selectedColor && selectedProduct?.images[selectedColor.imageKey]) ||
    (selectedProduct ? Object.values(selectedProduct.images)[0] : null) ||
    '/images/hero-1.png';

  // Get size chart for current product
  const getSizeChart = () => {
    if (!selectedProduct) return sizeChartData.default;
    
    const productName = selectedProduct.name;
    const matchedKey = Object.keys(sizeChartData).find(key => 
      productName.toLowerCase().includes(key.toLowerCase())
    );
    
    return matchedKey ? sizeChartData[matchedKey as keyof typeof sizeChartData] : sizeChartData.default;
  };

  // Fetch campaign data from API
  useEffect(() => {
    async function fetchCampaign() {
      try {
        setLoading(true);
        setError(null);
        
        const campaignId = '00560566';
        
        console.log(`🔍 Customizer fetching campaign: ${campaignId}`);
        const response = await fetch(`/api/campaigns/${campaignId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 Full campaign data received:', data);

        if (data.campaign && data.campaign.products && data.campaign.products.length > 0) {
          const campaignProducts: HoplixProduct[] = data.campaign.products;
          console.log(`📦 Found ${campaignProducts.length} products`);

          const transformedProducts: ProductType[] = campaignProducts.map((product: HoplixProduct) => {
            const availableColors = parseColors(product['product-color']);
            const availableSizes = parseSizes(product['product-size']);
            const slug = generateSlug(product['product-name']);

            const baseImage = getBasePreviewImage(product);
            const images: Record<string, string> = {};
            
            availableColors.forEach((color) => {
              const colorUrl = buildImageUrl(baseImage, color.imageKey);
              images[color.imageKey] = colorUrl || baseImage || '/images/hero-1.png';
            });

            if (availableColors.length === 0 && baseImage) {
              images['default'] = baseImage;
            }

            return {
              id: product['product-id'],
              name: product['product-name'],
              price: parseFloat(product['product-price']),
              images,
              availableColors,
              availableSizes,
              slug,
            };
          });

          setProducts(transformedProducts);

          if (transformedProducts.length > 0) {
            const firstProduct = transformedProducts[0];
            setSelectedProduct(firstProduct);

            if (firstProduct.availableSizes.length > 0) {
              const defaultSize = firstProduct.availableSizes.includes('M')
                ? 'M'
                : firstProduct.availableSizes[0];
              setSelectedSize(defaultSize);
            }

            if (firstProduct.availableColors.length > 0) {
              setSelectedColor(firstProduct.availableColors[0]);
            }
          }
        } else {
          console.warn('No products found in campaign');
          setError('Nessun prodotto disponibile in questa campagna');
        }
      } catch (error) {
        console.error('Error fetching campaign for customizer:', error);
        setError('Errore nel caricamento dei prodotti');
      } finally {
        setLoading(false);
      }
    }

    fetchCampaign();
  }, []);

  const handleProductChange = (product: ProductType) => {
    setSelectedProduct(product);

    if (product.availableSizes.length > 0) {
      const defaultSize = product.availableSizes.includes('M')
        ? 'M'
        : product.availableSizes[0];
      setSelectedSize(defaultSize);
    } else {
      setSelectedSize('');
    }

    if (product.availableColors.length > 0) {
      setSelectedColor(product.availableColors[0]);
    } else {
      setSelectedColor(null);
    }

    setActiveModal(null);
  };

  const handleColorChange = (color: ColorType) => {
    setSelectedColor(color);
    setActiveModal(null);
  };

  // UPDATED: Working Add to Cart function
  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    setIsAdding(true);
    
    // Create unique ID based on product + size + color
    const cartItemId = `${selectedProduct.id}_${selectedSize}_${selectedColor?.code || 'default'}`;
    
    // Get the current image for this color
    const productImage = selectedColor 
      ? selectedProduct.images[selectedColor.imageKey] 
      : Object.values(selectedProduct.images)[0];
    
    // Build product name with options
    let productName = selectedProduct.name;
    if (selectedSize) {
      productName += ` - Taglia ${selectedSize}`;
    }
    if (selectedColor) {
      productName += ` (${selectedColor.name})`;
    }
    
    // Add to cart
    addItem({
      id: cartItemId,
      productId: selectedProduct.id,
      name: productName,
      price: selectedProduct.price,
      image: productImage || '/images/hero-1.png',
      quantity: quantity,
      slug: selectedProduct.slug,
      size: selectedSize,
      color: selectedColor?.name,
    });
    
    // Show success message
    setAddedMessage(true);
    
    // Reset button after 1.5 seconds
    setTimeout(() => {
      setIsAdding(false);
      setAddedMessage(false);
    }, 1500);
  };

  if (loading) {
    return (
      <section className="min-h-screen py-16 px-5 bg-primary dark:bg-primary relative overflow-hidden transition-colors duration-300">
        <div className="max-w-7xl mx-auto relative z-10 flex items-center justify-center min-h-[60vh]">
          <div className="text-center text-white">
            <div className="inline-block w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
            <p>Caricamento prodotti...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen py-16 px-5 bg-primary dark:bg-primary relative overflow-hidden transition-colors duration-300">
        <div className="max-w-7xl mx-auto relative z-10 text-center text-white">
          <p className="text-xl mb-4">{error}</p>
          <p className="text-white/80">Verifica che la campagna abbia prodotti configurati correttamente.</p>
        </div>
      </section>
    );
  }

  if (!selectedProduct || products.length === 0) {
    return (
      <section className="min-h-screen py-16 px-5 bg-primary dark:bg-primary relative overflow-hidden transition-colors duration-300">
        <div className="max-w-7xl mx-auto relative z-10 text-center text-white">
          <p>Nessun prodotto disponibile</p>
        </div>
      </section>
    );
  }

  const sizeChart = getSizeChart();

  return (
    <>
      <section className="min-h-screen py-16 px-5 bg-primary dark:bg-primary relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 opacity-10 dark:opacity-5">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-[max(40px,min(60px,4vw))] font-bold text-white dark:text-white">
              Personalizza il tuo <span className="text-white/90 dark:text-white/90">Merch</span>
            </h1>
            <p className="text-white/80 dark:text-white/80 mt-4 max-w-2xl mx-auto">
              Seleziona le opzioni per personalizzare il tuo capo HackITa
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

            {/* LEFT PANEL - Image Container with Zoom */}
            <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-2xl p-8 flex items-center justify-center border border-white/20 dark:border-white/10 transition-all">
              <ZoomableImage src={currentImage} alt={`${selectedProduct.name} in ${selectedColor?.name || 'selected color'}`} />
            </div>

            {/* RIGHT PANEL - Selection Tabs */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl dark:shadow-xl overflow-hidden transition-colors duration-300">
              <div className="p-8 space-y-4">

                {/* HackITa Brand Header */}
                <div className="text-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full">
                    <span className="text-2xl">⚡</span>
                    <span className="font-semibold text-primary dark:text-primary">HackITa Original</span>
                  </div>
                </div>

                {/* Product Selection Tab */}
                <button
                  onClick={() => setActiveModal('product')}
                  className="w-full group"
                >
                  <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-primary/20 rounded-xl transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        👕
                      </div>
                      <div className="text-left">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Prodotto</div>
                        <div className="text-lg font-semibold text-gray-800 dark:text-white">
                          {selectedProduct.name}
                        </div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>

                {/* Size Selection Tab */}
                {selectedProduct.availableSizes.length > 0 && (
                  <button
                    onClick={() => setActiveModal('size')}
                    className="w-full group"
                  >
                    <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-primary/20 rounded-xl transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                          📏
                        </div>
                        <div className="text-left">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Taglia</div>
                          <div className="text-lg font-semibold text-gray-800 dark:text-white">
                            {selectedSize || 'Seleziona'}
                          </div>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                )}

                {/* Color Selection Tab */}
                {selectedProduct.availableColors.length > 0 && (
                  <button
                    onClick={() => setActiveModal('color')}
                    className="w-full group"
                  >
                    <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-primary/20 rounded-xl transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                          🎨
                        </div>
                        <div className="text-left">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Colore</div>
                          <div className="flex items-center gap-2">
                            {selectedColor && (
                              <>
                                <div className={`w-5 h-5 rounded-full ${selectedColor.colorClass} ring-1 ring-gray-300 dark:ring-gray-600`} />
                                <span className="text-lg font-semibold text-gray-800 dark:text-white">
                                  {selectedColor.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                )}

                {/* Size Chart Link */}
                <div className="text-center">
                  <button
                    onClick={() => setActiveModal('size-chart')}
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    📏 Guida alle taglie
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>

                {/* Quantity Selector */}
                <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-2xl">
                        🔢
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Quantità</div>
                        <div className="text-lg font-semibold text-gray-800 dark:text-white">
                          {quantity}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors text-xl shadow-sm dark:shadow-none"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-800 dark:text-white">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors text-xl shadow-sm dark:shadow-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price & Checkout - UPDATED with working button */}
                <div className="p-5 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 dark:border-primary/30 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 dark:text-gray-300">Totale:</span>
                    <span className="text-2xl font-bold text-primary dark:text-primary">
                      €{(selectedProduct.price * quantity).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="w-full py-4 rounded-xl bg-primary text-white font-semibold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl dark:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isAdding ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Aggiungo...
                      </>
                    ) : addedMessage ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Aggiunto!
                      </>
                    ) : (
                      <>
                        🛒 Aggiungi al Carrello
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL - Product Selection */}
      {activeModal === 'product' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-fadeIn shadow-2xl transition-colors">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Scegli Prodotto</h2>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary text-2xl transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {products.map(product => {
                  const previewImage = Object.values(product.images)[0] || '/images/hero-1.png';
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleProductChange(product)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedProduct.id === product.id
                          ? 'border-primary bg-primary/10 dark:bg-primary/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50'
                      }`}
                    >
                      <div className="aspect-square relative mb-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Image
                          src={previewImage}
                          alt={product.name}
                          fill
                          className="object-contain p-2"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          unoptimized
                        />
                      </div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">{product.name}</h3>
                      <p className="text-primary font-bold">€{product.price}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL - Size Selection */}
      {activeModal === 'size' && selectedProduct && selectedProduct.availableSizes.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full animate-fadeIn shadow-2xl transition-colors">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Scegli Taglia</h2>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary text-2xl transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-3">
                {selectedProduct.availableSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setActiveModal(null);
                    }}
                    className={`py-3 rounded-xl font-medium transition-all ${
                      selectedSize === size
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary/20 dark:hover:bg-primary/30'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL - Color Selection */}
      {activeModal === 'color' && selectedProduct && selectedProduct.availableColors.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full animate-fadeIn shadow-2xl transition-colors">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Scegli Colore</h2>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary text-2xl transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {selectedProduct.availableColors.map(color => (
                  <button
                    key={color.code}
                    onClick={() => handleColorChange(color)}
                    className={`p-3 rounded-xl text-center transition-all ${
                      selectedColor?.code === color.code
                        ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900 bg-primary/10 dark:bg-primary/20'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className={`w-full h-12 rounded-lg mb-2 ${color.colorClass} ring-1 ring-inset ring-gray-300 dark:ring-gray-600 shadow-sm`} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL - Size Chart */}
      {activeModal === 'size-chart' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-fadeIn shadow-2xl transition-colors">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Guida alle Taglie</h2>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary text-2xl transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-2 font-semibold">Taglia</th>
                      <th className="text-left py-3 px-2 font-semibold">Petto (cm)</th>
                      <th className="text-left py-3 px-2 font-semibold">Lunghezza (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeChart.sizes.map((size, index) => (
                      <tr key={size} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 px-2 font-medium">{size}</td>
                        <td className="py-2 px-2">{sizeChart.chest[index]}</td>
                        <td className="py-2 px-2">{sizeChart.length[index]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-500 dark:text-gray-400">
                <p>⚠️ Le misure sono in centimetri e possono variare leggermente a seconda del capo.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}