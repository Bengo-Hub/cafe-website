export default function ServicesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="mb-12 text-center space-y-4">
        <div className="h-12 w-64 bg-gray-200 rounded animate-pulse mx-auto" />
        <div className="h-6 w-96 bg-gray-200 rounded animate-pulse mx-auto" />
      </div>

      {/* Service Cards Skeleton */}
      <div className="space-y-16">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex flex-col ${
              i % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'
            } gap-8 items-center`}
          >
            <div className="w-full md:w-1/2">
              <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-12 w-40 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
