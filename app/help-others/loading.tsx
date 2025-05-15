export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg p-6 shadow">
                <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-24 bg-gray-300 rounded mb-4"></div>
                <div className="h-10 bg-gray-300 rounded w-1/3"></div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow">
                <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
                <div className="h-10 bg-gray-300 rounded mb-3"></div>
                <div className="h-10 bg-gray-300 rounded mb-3"></div>
                <div className="h-24 bg-gray-300 rounded mb-4"></div>
                <div className="h-10 bg-gray-300 rounded w-1/3"></div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow">
                <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 bg-gray-300 rounded"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
              </div>
              
              <div>
                <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
                <div className="h-80 bg-gray-300 rounded"></div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow">
                <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
                <div className="h-10 bg-gray-300 rounded mb-3"></div>
                <div className="h-40 bg-gray-300 rounded mb-3"></div>
                <div className="h-24 bg-gray-300 rounded mb-4"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow">
                <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-24 bg-gray-300 rounded"></div>
                  <div className="h-24 bg-gray-300 rounded"></div>
                  <div className="h-24 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 