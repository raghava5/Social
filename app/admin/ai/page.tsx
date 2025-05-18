import AIModelDashboard from '@/app/components/admin/AIModelDashboard'

export const metadata = {
  title: 'AI System Management | Seven Spokes Admin',
  description: 'Monitor and manage AI models and data processing'
}

export default function AIAdminPage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">AI System Management</h1>
        <p className="text-gray-600 mt-1">
          Monitor AI model performance, process tracking data, and manage recommendation engines
        </p>
      </div>

      <AIModelDashboard />
      
      <div className="mt-12 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-lg mb-2">Process Event Data</h3>
            <p className="text-gray-600 text-sm mb-4">
              Manually trigger processing of collected activity tracking data to update user profiles
              and recommendation models.
            </p>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              onClick={() => alert('This would trigger the event processing')}
            >
              Process Events
            </button>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-lg mb-2">Retrain Recommendation Models</h3>
            <p className="text-gray-600 text-sm mb-4">
              Manually trigger retraining of recommendation models using the latest user profile data.
            </p>
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              onClick={() => alert('This would trigger model retraining')}
            >
              Retrain Models
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 