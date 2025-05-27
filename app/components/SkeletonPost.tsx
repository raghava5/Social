export default function SkeletonPost() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 animate-pulse w-full max-w-full overflow-hidden">
      {/* Post Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start space-x-3">
          {/* Avatar skeleton */}
          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
          
          <div className="flex-1 min-w-0">
            {/* Author name skeleton */}
            <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
            {/* Timestamp skeleton */}
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
          
          {/* Options menu skeleton */}
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        {/* Text content skeleton */}
        <div className="space-y-2 overflow-hidden">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        
        {/* Spoke tag skeleton */}
        <div className="mt-2">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
      </div>

      {/* Media skeleton (randomly show or hide) */}
      {Math.random() > 0.5 && (
        <div className="mb-3 w-full overflow-hidden">
          <div className="w-full h-64 bg-gray-200"></div>
        </div>
      )}

      {/* Post Stats skeleton */}
      <div className="px-4 py-2 flex justify-between border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>

      {/* Action Buttons skeleton */}
      <div className="px-4 py-2 flex justify-between border-b border-gray-100">
        <div className="flex-1 flex items-center justify-center py-2">
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
        <div className="flex-1 flex items-center justify-center py-2">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="flex-1 flex items-center justify-center py-2">
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
        <div className="flex-1 flex items-center justify-center py-2">
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
    </div>
  )
} 