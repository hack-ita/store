// Root loading skeleton — shown during home-page navigation / slow server render.
// Server-rendered: IS the FCP, so no Lighthouse penalty.
export default function Loading() {
  return (
    <div className="min-h-screen bg-light dark:bg-dark">
      {/* Hero skeleton */}
      <div className="relative w-full h-[60vh] min-h-[400px] skeleton" />

      {/* Section heading */}
      <div className="max-w-7xl mx-auto px-5 py-16 space-y-10">
        <div className="flex flex-col items-center gap-3">
          <div className="skeleton h-8 w-48 rounded-full" />
          <div className="skeleton h-5 w-80" />
        </div>

        {/* Masonry-style product grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="break-inside-avoid space-y-3">
              <div
                className="skeleton w-full rounded-lg"
                style={{ height: [320, 260, 380, 300, 350, 280, 400, 290][i] }}
              />
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-5 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
