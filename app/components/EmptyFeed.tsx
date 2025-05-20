import { PencilIcon } from '@heroicons/react/24/outline'

export default function EmptyFeed() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg shadow">
      <div className="w-16 h-16 mb-4 text-gray-400">
        <PencilIcon className="w-full h-full" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900">
        You haven't posted anything yet
      </h3>
      <p className="mb-6 text-gray-600">
        Start by sharing your first thought!
      </p>
      <button
        onClick={() => document.getElementById('create-post-input')?.focus()}
        className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Create Your First Post
      </button>
    </div>
  )
} 
 