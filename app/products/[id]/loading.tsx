export default function Loading() {
  return (
    <div className="min-h-screen bg-light dark:bg-dark pt-30">
      <section className="py-12 px-5">
        <div className="max-w-7xl mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8">
            <div className="skeleton h-4 w-10" />
            <div className="skeleton h-4 w-3" />
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-4 w-3" />
            <div className="skeleton h-4 w-32" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Left: image + thumbnails */}
            <div className="space-y-4">
              <div className="skeleton aspect-square w-full rounded-2xl" />
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton aspect-square rounded-lg" />
                ))}
              </div>
            </div>

            {/* Right: product info */}
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="skeleton h-6 w-24 rounded-full" />
                <div className="skeleton h-10 w-3/4" />
                <div className="skeleton h-5 w-32" />
              </div>

              <div className="skeleton h-10 w-28" />

              <div className="space-y-2">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-5/6" />
                <div className="skeleton h-4 w-4/6" />
              </div>

              {/* Size selector */}
              <div className="space-y-3">
                <div className="skeleton h-5 w-16" />
                <div className="flex gap-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton w-12 h-12 rounded-lg" />
                  ))}
                </div>
              </div>

              {/* Color selector */}
              <div className="space-y-3">
                <div className="skeleton h-5 w-14" />
                <div className="flex gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton w-10 h-10 rounded-full" />
                  ))}
                </div>
              </div>

              {/* Add to cart */}
              <div className="flex gap-4 pt-4">
                <div className="skeleton h-14 w-32 rounded-lg" />
                <div className="skeleton h-14 flex-1 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
