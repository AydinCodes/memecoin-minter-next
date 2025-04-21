'use client';

export default function TokenSkeleton() {
  return (
    <div className="bg-[#171717] rounded-xl overflow-hidden shadow-lg border border-gray-800 animate-pulse">
      {/* Image Skeleton */}
      <div className="h-48 bg-gray-800 relative flex items-center justify-center">
        <div className="w-20 h-20 bg-gray-700 rounded-full"></div>
      </div>
      
      {/* Content Skeleton */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="h-6 bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-16"></div>
          </div>
          <div className="h-6 bg-gray-700 rounded w-20"></div>
        </div>
        
        <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
        
        <div className="mb-4">
          <div className="h-3 bg-gray-700 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-700 rounded w-full"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="h-3 bg-gray-700 rounded w-20 mb-2"></div>
            <div className="h-5 bg-gray-700 rounded w-24"></div>
          </div>
          
          <div>
            <div className="h-3 bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-5 bg-gray-700 rounded w-28"></div>
          </div>
        </div>
        
        <div className="flex space-x-3 mb-4">
          <div className="h-5 w-5 bg-gray-700 rounded-full"></div>
          <div className="h-5 w-5 bg-gray-700 rounded-full"></div>
          <div className="h-5 w-5 bg-gray-700 rounded-full"></div>
        </div>
        
        <div className="flex justify-between space-x-2 mt-6">
          <div className="flex-1 h-10 bg-gray-700 rounded-full"></div>
          <div className="flex-1 h-10 bg-gray-700 rounded-full"></div>
          <div className="flex-1 h-10 bg-gray-700 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export function TokenSkeletonList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <TokenSkeleton />
      <TokenSkeleton />
      <TokenSkeleton />
    </div>
  );
}