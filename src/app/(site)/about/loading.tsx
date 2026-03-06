import { SkeletonText } from '@/components/ui/Skeleton';


export default function AboutLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section Skeleton */}
      <div className="mb-16 space-y-6">
        <div className="h-12 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Values Section Skeleton */}
      <div className="mb-16">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3 p-6 border rounded-lg">
              <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
              <SkeletonText lines={2} />
            </div>
          ))}
        </div>
      </div>

      {/* Team Section Skeleton */}
      <div className="mb-16">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center space-y-3">
              <div className="h-48 w-48 bg-gray-200 rounded-full animate-pulse mx-auto" />
              <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mx-auto" />
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
