import HeroSlider from '@/components/HeroSlider';
import ProductSliderWrapper from '@/components/ProductSliderWrapper';
import ProductCustomizer from '@/components/ProductCustomizer';

export default function Home() {
  return (
    <main>
      <HeroSlider />
      
      <ProductSliderWrapper
        title="Ultime"
        subtitle="Scopri le ultime novità del nostro store"
        showWishlist={true}
      />
      
      {/* More sections will go here */}
      <div>
        {/* Placeholder for more content */}
        <ProductCustomizer />
        <ProductSliderWrapper
          title="Ultime"
          subtitle="Scopri le ultime novità del nostro store"
          showWishlist={true}
        />
      </div>
    </main>
  );
}