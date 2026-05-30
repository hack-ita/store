export default function Loading() {
  return (
    <div className="min-h-screen bg-light dark:bg-dark pt-30">
      <section className="py-12 px-5">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* Heading */}
          <div className="space-y-3 text-center">
            <div className="skeleton h-10 w-64 mx-auto" />
            <div className="skeleton h-5 w-48 mx-auto" />
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="skeleton aspect-square w-full rounded-lg" />
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-5 w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
