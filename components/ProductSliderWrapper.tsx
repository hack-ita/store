// components/ProductSliderWrapper.tsx
export const dynamic = 'force-dynamic';
export const fetchCache = 'default-no-store';

import { productService } from '@/lib/services/productService';
import { hoplixService } from '@/lib/services/hoplixService';
import { config } from '@/lib/config';
import ProductSlider from './ProductSlider';

// Initialize Hoplix service with credentials from config
if (config.hoplixApiKey && config.hoplixApiSecret) {
  hoplixService.initialize(config.hoplixApiKey, config.hoplixApiSecret);
  console.log('✅ Hoplix service initialized from config');
} else {
  console.warn('⚠️ Missing API credentials in config');
}

interface ProductSliderWrapperProps {
  category?: string;
  title?: string;
  subtitle?: string;
  red?: boolean;
  showWishlist?: boolean;
  wishlistItems?: string[];
}

export default async function ProductSliderWrapper({ 
  category,
  title = "Categoria Prodotti",
  subtitle = "Scopri i nostri prodotti tecnologici",
  red = false,
  showWishlist = false,
  wishlistItems = []
}: ProductSliderWrapperProps) {
  
  console.log('🔍 Wrapper - category prop:', category);
  console.log('🔍 Wrapper - useRealApi:', config.useRealApi);
  
  const allProducts = await productService.getAllProducts();
  
  console.log(`📦 Wrapper - Total products fetched: ${allProducts.length}`);
  
  const filteredProducts = (category && category.trim() !== "") 
    ? allProducts.filter(product => product.category === category)
    : allProducts;
  
  console.log(`📦 Wrapper - Filtered products: ${filteredProducts.length} (category: ${category || 'ALL'})`);
  
  if (filteredProducts.length > 0) {
    console.log('📦 First product sample:', {
      name: filteredProducts[0].name,
      category: filteredProducts[0].category,
      price: filteredProducts[0].price,
    });
  }
  
  return (
    <ProductSlider
      products={filteredProducts}
      category={category || 'All Products'}
      title={title}
      subtitle={subtitle}
      red={red}
      showWishlist={showWishlist}
      wishlistItems={wishlistItems}
    />
  );
}