// lib/config.ts
export const config = {
  hoplixApiKey: process.env.HOPLIX_API_KEY,
  hoplixApiSecret: process.env.HOPLIX_API_SECRET,
  useRealApi: process.env.NEXT_PUBLIC_USE_REAL_API === 'true',
};

// Log config on server-side only
if (typeof window === 'undefined') {
  console.log('🔧 Config loaded:', {
    useRealApi: config.useRealApi,
    hasApiKey: !!config.hoplixApiKey,
    hasApiSecret: !!config.hoplixApiSecret,
  });
}