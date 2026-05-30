import { productService } from '@/lib/services/productService';
import { hoplixService } from '@/lib/services/hoplixService';
import { config } from '@/lib/config';
import CampaignSectionClient from './CampaignSectionClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'default-no-store';

// Initialize Hoplix service with credentials from config
if (config.hoplixApiKey && config.hoplixApiSecret) {
  hoplixService.initialize(config.hoplixApiKey, config.hoplixApiSecret);
}

interface CampaignSectionProps {
  campaignId?: string;
  campaignIds?: string[];
  title?: string;
  subtitle?: string;
  showWishlist?: boolean;
}

export default async function CampaignSection({
  campaignId,
  campaignIds,
  title = "Campagna",
  subtitle = "Scopri i prodotti di questa campagna",
  showWishlist = false,
}: CampaignSectionProps) {
  // Determine which campaign IDs to fetch
  const idsToFetch = campaignIds || (campaignId ? [campaignId] : []);
  
  if (idsToFetch.length === 0) {
    console.log('⚠️ CampaignSection - No campaign IDs provided');
    return (
      <CampaignSectionClient
        products={[]}
        title={title}
        subtitle={subtitle}
        campaignId=""
        showWishlist={showWishlist}
      />
    );
  }

  console.log(`🔍 CampaignSection - Fetching campaigns: ${idsToFetch.join(', ')}`);

  if (idsToFetch.length === 1) {
    // Single campaign - use existing logic
    const singleId = idsToFetch[0];
    const campaign = await hoplixService.getCampaign(singleId);
    // Only use campaign API data if title/subtitle were NOT explicitly provided
    const campaignName = (title === "Campagna" ? campaign?.name : undefined) || title;
    const campaignDescription = (subtitle === "Scopri i prodotti di questa campagna" ? campaign?.description : undefined) || subtitle;
    const products = await productService.getProductsByCampaign(singleId);

    console.log(`📦 CampaignSection - Found ${products.length} products for campaign "${campaignName}"`);

    return (
      <CampaignSectionClient
        products={products}
        title={campaignName}
        subtitle={campaignDescription}
        campaignId={singleId}
        showWishlist={showWishlist}
      />
    );
  }

  // Multiple campaigns - fetch all and merge
  const products = await productService.getProductsByCampaigns(idsToFetch);

  console.log(`📦 CampaignSection - Found ${products.length} products across ${idsToFetch.length} campaigns`);

  return (
    <CampaignSectionClient
      products={products}
      title={title}
      subtitle={subtitle}
      campaignId={idsToFetch.join(',')}
      showWishlist={showWishlist}
    />
  );
}