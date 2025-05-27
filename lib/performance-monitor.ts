// 🚀 Performance Monitoring Utility
// Tracks API response times and identifies bottlenecks

interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map()
  private enabled: boolean = process.env.NODE_ENV === 'development'

  start(name: string, metadata?: Record<string, any>): void {
    if (!this.enabled) return

    this.metrics.set(name, {
      name,
      startTime: Date.now(),
      metadata
    })
  }

  end(name: string): number | null {
    if (!this.enabled) return null

    const metric = this.metrics.get(name)
    if (!metric) {
      console.warn(`⚠️ Performance metric "${name}" not found`)
      return null
    }

    const endTime = Date.now()
    const duration = endTime - metric.startTime

    metric.endTime = endTime
    metric.duration = duration

    // Log slow operations
    if (duration > 1000) {
      console.warn(`🐌 SLOW OPERATION: ${name} took ${duration}ms`, metric.metadata)
    } else if (duration > 500) {
      console.log(`⚠️ Moderate delay: ${name} took ${duration}ms`)
    } else {
      console.log(`✅ ${name} completed in ${duration}ms`)
    }

    return duration
  }

  // Get performance summary
  getSummary(): PerformanceMetric[] {
    return Array.from(this.metrics.values()).filter(m => m.duration !== undefined)
  }

  // Clear all metrics
  clear(): void {
    this.metrics.clear()
  }

  // Get metrics for a specific API endpoint
  getAPIMetrics(endpoint: string): PerformanceMetric[] {
    return this.getSummary().filter(m => m.name.includes(endpoint))
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Utility function for timing async operations
export async function timeOperation<T>(
  name: string, 
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  performanceMonitor.start(name, metadata)
  
  try {
    const result = await operation()
    performanceMonitor.end(name)
    return result
  } catch (error) {
    performanceMonitor.end(name)
    throw error
  }
}

// Decorator for API routes
export function withPerformanceMonitoring(
  handler: (req: any, res?: any) => Promise<any>
) {
  return async function (req: any, res?: any) {
    const startTime = Date.now()
    const endpoint = req.url || 'unknown'
    
    console.log(`📡 API Request: ${req.method} ${endpoint}`)
    
    try {
      const result = await handler(req, res)
      const duration = Date.now() - startTime
      
      if (duration > 2000) {
        console.error(`🚨 CRITICAL: ${endpoint} took ${duration}ms - REQUIRES OPTIMIZATION`)
      } else if (duration > 1000) {
        console.warn(`🐌 SLOW: ${endpoint} took ${duration}ms`)
      } else {
        console.log(`✅ ${endpoint} completed in ${duration}ms`)
      }
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`❌ ${endpoint} failed after ${duration}ms:`, error)
      throw error
    }
  }
}

// Database query performance monitoring
export async function monitorDatabaseQuery<T>(
  queryName: string,
  query: () => Promise<T>
): Promise<T> {
  return timeOperation(`DB: ${queryName}`, query)
}

// Client-side performance monitoring
export function measureClientPerformance(name: string): () => void {
  if (typeof window === 'undefined') return () => {}
  
  const startTime = performance.now()
  
  return () => {
    const duration = performance.now() - startTime
    console.log(`🖥️ Client: ${name} took ${duration.toFixed(2)}ms`)
    
    // Report to analytics if needed
    if (duration > 100) {
      console.warn(`⚠️ Slow client operation: ${name} (${duration.toFixed(2)}ms)`)
    }
  }
}

export default performanceMonitor 