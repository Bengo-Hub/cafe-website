import { SkeletonMenuGrid } from '@/components/ui/Skeleton';

export default function MenuLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-4">
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-6 w-96 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Filter Buttons Skeleton */}
      <div className="mb-8 flex gap-2 overflow-x-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-10 w-32 bg-gray-200 rounded-full animate-pulse"
          />
        ))}
      </div>

      {/* Search Bar Skeleton */}
      <div className="mb-8">
        <div className="h-12 w-full max-w-md bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* Menu Grid Skeleton */}
      <SkeletonMenuGrid />
    </div>
  );
}
// Updated - minor tweak
