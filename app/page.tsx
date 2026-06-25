import { Suspense, lazy } from 'react';
import HeroSlider from '@/components/HeroSlider';
import ProductSliderWrapper from '@/components/ProductSliderWrapper';
import CampaignSection from '@/components/CampaignSection';
import {
  ProductSliderSkeleton,
  CampaignSectionSkeleton,
  ProductCustomizerSkeleton,
  MixMatchSkeleton,
  AllProductsSkeleton,
} from '@/components/SectionSkeleton';

// Dynamically import heavy client components so they don't block initial render
const ProductCustomizer = lazy(() => import('@/components/ProductCustomizer'));
const MixMatch = lazy(() => import('@/components/MixMatch'));
const MasonryGrid = lazy(() => import('@/components/AllProducts'));

export default function Home() {
  return (
    <main>
      <HeroSlider />
      
      <Suspense fallback={<ProductSliderSkeleton />}>
        <ProductSliderWrapper
          title="Ultime"
          subtitle="Scopri le ultime novità del nostro store"
          showWishlist={true}
          campaignIds={["00576556", "00576559", "00576585"]}
        />
      </Suspense>
      
      <div>
        <Suspense fallback={<ProductCustomizerSkeleton />}>
          <ProductCustomizer />
        </Suspense>
        
        <Suspense fallback={<CampaignSectionSkeleton />}>
          <CampaignSection
            campaignIds={["00576621", "00576619", "00576618", "00576617", "00576612", "00580303"]}
            title="Accessori"
            subtitle=""
            showWishlist={true}
          />
        </Suspense>
        
        <Suspense fallback={<MixMatchSkeleton />}>
          <MixMatch />
        </Suspense>
        
        <Suspense fallback={<AllProductsSkeleton />}>
          <MasonryGrid 
            title="Tutti i Prodotti"
            subtitle="Scopri la nostra intera collezione"
            showWishlist={true}
            // When no campaignIds is passed, uses global config (enabled/excluded)
            // campaignIds={["00560566"]}
          />
        </Suspense>
      </div>
    </main>
  );
}
