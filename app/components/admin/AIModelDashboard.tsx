'use client'

import { useState, useEffect } from 'react'
import {
  ArrowPathIcon,
  ChartBarIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  UserIcon,
  BoltIcon
} from '@heroicons/react/24/outline'

interface AIModelMetrics {
  eventCount: number
  processedEventCount: number
  userProfileCount: number
  recommendationCount: number
  recommendationClickRate: number
  lastProcessed: string
}

interface ModelPerformance {
  type: string
  accuracy: number
  coverage: number
  lastUpdated: string
}

export default function AIModelDashboard() {
  const [metrics, setMetrics] = useState<AIModelMetrics | null>(null)
  const [models, setModels] = useState<ModelPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [processingEvents, setProcessingEvents] = useState(false)
  const [processResult, setProcessResult] = useState<string | null>(null)

  useEffect(() => {
    fetchMetrics()
  }, [])

  async function fetchMetrics() {
    try {
      setLoading(true)
      
      // In a real implementation, this would call your API
      // For demo purposes, we're using mock data
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Mock data
      setMetrics({
        eventCount: 12467,
        processedEventCount: 12104,
        userProfileCount: 278,
        recommendationCount: 8941,
        recommendationClickRate: 0.32,
        lastProcessed: new Date().toISOString()
      })
      
      setModels([
        {
          type: 'Content Recommendation',
          accuracy: 0.78,
          coverage: 0.92,
          lastUpdated: new Date().toISOString()
        },
        {
          type: 'User Embedding',
          accuracy: 0.84,
          coverage: 0.88,
          lastUpdated: new Date().toISOString()
        },
        {
          type: 'Next Action Prediction',
          accuracy: 0.71,
          coverage: 0.85,
          lastUpdated: new Date().toISOString()
        }
      ])
    } catch (error) {
      console.error('Error fetching AI metrics:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function processEvents() {
    try {
      setProcessingEvents(true)
      setProcessResult(null)
      
      // In production, this would be an authenticated API call
      const response = await fetch('/api/ai/process-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AI_PROCESSOR_PUBLIC_KEY}`
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process events')
      }
      
      setProcessResult(`Successfully processed ${data.processedCount} events`)
      
      // Refresh metrics after processing
      fetchMetrics()
    } catch (error) {
      console.error('Error processing events:', error)
      setProcessResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setProcessingEvents(false)
    }
  }
  
  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">AI System Dashboard</h2>
        <div className="flex space-x-2">
          <button
            onClick={fetchMetrics}
            className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 flex items-center"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Refresh
          </button>
          
          <button
            onClick={processEvents}
            disabled={processingEvents}
            className={`px-3 py-1 text-sm text-white rounded flex items-center ${
              processingEvents ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <BoltIcon className="h-4 w-4 mr-1" />
            {processingEvents ? 'Processing...' : 'Process Events'}
          </button>
        </div>
      </div>
      
      {processResult && (
        <div className={`mb-4 p-3 rounded text-sm ${
          processResult.startsWith('Error') 
            ? 'bg-red-50 text-red-800' 
            : 'bg-green-50 text-green-800'
        }`}>
          {processResult}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <MetricCard 
          title="Total Events"
          value={metrics?.eventCount.toLocaleString() || '0'}
          icon={<DocumentDuplicateIcon className="h-5 w-5 text-blue-500" />}
          color="blue"
        />
        
        <MetricCard 
          title="Processed Events"
          value={metrics?.processedEventCount.toLocaleString() || '0'}
          subtext={metrics ? `${((metrics.processedEventCount / metrics.eventCount) * 100).toFixed(1)}%` : ''}
          icon={<DocumentTextIcon className="h-5 w-5 text-green-500" />}
          color="green"
        />
        
        <MetricCard 
          title="User Profiles"
          value={metrics?.userProfileCount.toLocaleString() || '0'}
          icon={<UserIcon className="h-5 w-5 text-purple-500" />}
          color="purple"
        />
        
        <MetricCard 
          title="Recommendations Served"
          value={metrics?.recommendationCount.toLocaleString() || '0'}
          icon={<ChartBarIcon className="h-5 w-5 text-indigo-500" />}
          color="indigo"
        />
        
        <MetricCard 
          title="Recommendation CTR"
          value={`${(metrics?.recommendationClickRate || 0) * 100}%`}
          icon={<BoltIcon className="h-5 w-5 text-amber-500" />}
          color="amber"
        />
        
        <MetricCard 
          title="Last Processed"
          value={metrics?.lastProcessed 
            ? new Date(metrics.lastProcessed).toLocaleTimeString() 
            : 'Never'}
          subtext={metrics?.lastProcessed 
            ? new Date(metrics.lastProcessed).toLocaleDateString() 
            : ''}
          icon={<ArrowPathIcon className="h-5 w-5 text-gray-500" />}
          color="gray"
        />
      </div>
      
      <h3 className="text-lg font-medium text-gray-800 mb-4">Model Performance</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Model Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Accuracy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coverage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {models.map((model, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {model.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                      <div 
                        className={`bg-${getAccuracyColor(model.accuracy)}-500 h-2.5 rounded-full`} 
                        style={{ width: `${model.accuracy * 100}%` }}
                      ></div>
                    </div>
                    {(model.accuracy * 100).toFixed(1)}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(model.coverage * 100).toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(model.lastUpdated).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 0.8) return 'green'
  if (accuracy >= 0.6) return 'yellow'
  return 'red'
}

interface MetricCardProps {
  title: string
  value: string
  subtext?: string
  icon: JSX.Element
  color: string
}

function MetricCard({ title, value, subtext, icon, color }: MetricCardProps) {
  return (
    <div className={`p-4 border rounded-lg bg-${color}-50 border-${color}-100`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`p-2 rounded-md bg-${color}-100`}>
          {icon}
        </div>
      </div>
    </div>
  )
} 