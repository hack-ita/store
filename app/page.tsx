import HeroSlider from '@/components/HeroSlider';
import ProductSliderWrapper from '@/components/ProductSliderWrapper';
import ProductCustomizer from '@/components/ProductCustomizer';
import MixMatch from '@/components/MixMatch';
import MasonryGrid from '@/components/AllProducts';

export default function Home() {
  return (
    <main>
      <HeroSlider />
      
      <ProductSliderWrapper
        title="Ultime"
        subtitle="Scopri le ultime novità del nostro store"
        showWishlist={true}
      />
      
      <div>
        <ProductCustomizer />
        <MixMatch />
        <MasonryGrid 
          title="Tutti i Prodotti"
          subtitle="Scopri la nostra intera collezione"
          showWishlist={true}
        />
      </div>
    </main>
  );
}