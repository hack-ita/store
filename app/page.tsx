import HeroSlider from '@/components/HeroSlider';
import ProductSliderWrapper from '@/components/ProductSliderWrapper';
import ProductCustomizer from '@/components/ProductCustomizer';
import CampaignSection from '@/components/CampaignSection';
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
        campaignIds={["00576556", "00576559", "00576585"]}
      />
      
      <div>
        <ProductCustomizer />
        <CampaignSection
          campaignIds={["00576621", "00576619", "00576618", "00576617", "00576612"]}
          title="Accessori"
          subtitle=""
          showWishlist={true}
        />
        <MixMatch />
        <MasonryGrid 
          title="Tutti i Prodotti"
          subtitle="Scopri la nostra intera collezione"
          showWishlist={true}
          // When no campaignIds is passed, uses global config (enabled/excluded)
          // campaignIds={["00560566"]}
        />
      </div>
    </main>
  );
}
