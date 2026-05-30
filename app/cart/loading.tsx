export default function Loading() {
  return (
    <div className="min-h-screen bg-light dark:bg-dark pt-30">
      <section className="py-12 px-5">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Title */}
          <div className="skeleton h-9 w-40" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl border border-dark/10 dark:border-light/10">
                  <div className="skeleton w-24 h-24 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-5 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton h-8 w-28 rounded-lg" />
                  </div>
                  <div className="skeleton h-6 w-16" />
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="space-y-4 p-6 rounded-xl border border-dark/10 dark:border-light/10 h-fit">
              <div className="skeleton h-6 w-32" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="skeleton h-4 w-20" />
                    <div className="skeleton h-4 w-16" />
                  </div>
                ))}
              </div>
              <div className="skeleton h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
