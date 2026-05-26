import HeroSlider from '@/components/HeroSlider';
import ProductSliderWrapper from '@/components/ProductSliderWrapper';
import ProductCustomizer from '@/components/ProductCustomizer';
import MixMatch from '@/components/MixMatch';
import MasonryGrid from '@/components/AllProducts';
import CampaignSection from '@/components/CampaignSection';
import { config } from '@/lib/config';

export default function Home() {
  const campaignId = config.hoplixCampaignId || process.env.HOPLIX_CAMPAIGN_ID || '00560566';

  return (
    <main>
      <HeroSlider />
      
      <ProductSliderWrapper
        title="Ultime"
        subtitle="Scopri le ultime novità del nostro store"
        showWishlist={true}
        campaignIds={["00576556", "00576559", "00576585", "00576589", "00576590", "00576591", "00576593", "00576595", "00576597", "00576601", "00576606"]}
      />
      
      <div>
        <ProductCustomizer />
        <CampaignSection
          // Use campaignIds to show multiple campaigns in one section
          // campaignIds={["00560566", "00560567", "00560568"]}
          // Or keep the single campaignId for backward compatibility
          campaignId="00560566"
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