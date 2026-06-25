// Server-rendered skeleton fallback for Suspense boundaries.
// These are part of the initial HTML payload (FCP), so they don't penalize Lighthouse.

export function HeroSliderSkeleton() {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-gray-200 dark:bg-gray-800 animate-pulse" />
  );
}

export function ProductSliderSkeleton() {
  return (
    <section className="py-16 px-5 bg-light dark:bg-dark">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-96 max-w-full mx-auto" />
        </div>
        <div className="flex gap-5 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-62.5 flex-1 animate-pulse">
              <div className="aspect-4/5 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CampaignSectionSkeleton() {
  return (
    <section className="py-20 px-5 bg-linear-to-b from-light to-white dark:from-dark dark:to-accent">
      <div className="max-w-7xl mx-auto">
        <div className="mb-14 text-center animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-96 max-w-full mx-auto" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div className="aspect-4/5 bg-gray-200 dark:bg-gray-700" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductCustomizerSkeleton() {
  return (
    <section className="min-h-screen py-16 px-5 bg-primary dark:bg-primary relative overflow-hidden red-mask">
      <div className="max-w-7xl mx-auto relative z-10 flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-white">
          <div className="inline-block w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
          <p>Caricamento prodotti...</p>
        </div>
      </div>
    </section>
  );
}

export function MixMatchSkeleton() {
  return (
    <section className="py-20 px-5 bg-dark dark:bg-light light-mask">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 animate-pulse">
          <div className="h-4 bg-white/20 dark:bg-dark/20 rounded w-32 mx-auto mb-4" />
          <div className="h-10 bg-white/20 dark:bg-dark/20 rounded w-64 mx-auto mb-3" />
          <div className="h-5 bg-white/20 dark:bg-dark/20 rounded w-80 max-w-full mx-auto" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white/10 dark:bg-gray-900/50 rounded-2xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 dark:bg-dark/20" />
                  <div className="flex-1">
                    <div className="h-4 bg-white/20 dark:bg-dark/20 rounded w-24 mb-1" />
                    <div className="h-3 bg-white/20 dark:bg-dark/20 rounded w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-3 bg-white/10 dark:bg-gray-900/50 rounded-2xl p-5 animate-pulse">
            <div className="h-5 bg-white/20 dark:bg-dark/20 rounded w-32 mb-4" />
            <div className="aspect-square max-w-45 mx-auto bg-white/20 dark:bg-dark/20 rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function AllProductsSkeleton() {
  return (
    <section className="py-16 px-5 bg-light dark:bg-dark">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-2" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-96 max-w-full mx-auto" />
        </div>
        <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="break-inside-avoid animate-pulse">
              <div
                className="bg-gray-200 dark:bg-gray-700 w-full rounded-lg"
                style={{ height: [320, 260, 380, 300, 350, 280, 400, 290][i] }}
              />
              <div className="mt-3 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}