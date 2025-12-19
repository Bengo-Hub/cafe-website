import { SkeletonCard } from '@/components/ui/Skeleton';

export default function EventsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-4">
        <div className="h-12 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-6 w-96 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Calendar Skeleton */}
      <div className="mb-12">
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* Events Grid Skeleton */}
      <div className="mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
