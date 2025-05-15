'use client'

import { useState, useEffect, useRef } from 'react'

// Leaflet will be imported dynamically

type Post = {
  id: number
  type: string
  content: string
  category: string
  user?: {
    id: number
    name: string
    lat: number
    lon: number
    country: string
    profile: {
      avatar: string
    }
  }
  distance?: number
  priority?: string
  urgency?: string
  tags?: string[]
  location?: { lat: number, lon: number }
  status?: string
  lifeSpoke?: string
}

type MapProps = {
  location: {
    lat: number
    lon: number
    country: string
  }
  posts: Post[]
  fullScreen?: boolean
}

export default function MapComponent({ location, posts, fullScreen = false }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return
    
    let isMounted = true
    let mapInstance: any = null
    
    const loadLeaflet = async () => {
      try {
        // Dynamically import Leaflet
        const L = (await import('leaflet')).default
        
        // Add Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        
        // Wait for CSS to load
        setTimeout(() => {
          // Check if component is still mounted
          if (!isMounted || !mapRef.current) return
          
          // Create map instance
          mapInstance = L.map(mapRef.current).setView([location.lat, location.lon], fullScreen ? 8 : 10)
          
          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(mapInstance)
          
          // Add user location marker
          L.marker([location.lat, location.lon])
            .addTo(mapInstance)
            .bindPopup(`
              <div style="text-align: center;">
                <div style="font-weight: bold;">Your Location</div>
                <div style="font-size: 0.75rem; color: #666;">
                  ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}
                </div>
              </div>
            `)
          
          // Add priority circles
          const radiuses = [1, 2, 4, 8, 16, 32]
          for (const radius of radiuses) {
            L.circle([location.lat, location.lon], {
              radius: radius * 1000,
              fillColor: 'blue',
              fillOpacity: 0.05,
              color: 'blue',
              opacity: 0.2,
              weight: 1
            }).addTo(mapInstance)
          }
          
          // Add post markers
          for (const post of posts) {
            const postLat = post.location?.lat || post.user?.lat
            const postLon = post.location?.lon || post.user?.lon
            
            if (!postLat || !postLon) continue
            
            // Create marker with popup
            L.marker([postLat, postLon])
              .addTo(mapInstance)
              .bindPopup(`
                <div style="max-width: 200px;">
                  <div style="font-weight: bold; margin-bottom: 4px;">${post.user?.name || 'Anonymous'}</div>
                  <div style="font-size: 0.75rem; color: #666; margin-bottom: 4px;">
                    ${post.distance ? `${post.distance.toFixed(2)} km away` : ''} 
                    ${post.priority ? ` · ${post.priority}` : ''}
                  </div>
                  <p style="margin: 4px 0;">${post.content}</p>
                  <div style="margin-top: 8px;">
                    <button style="background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; border: none; cursor: pointer;">
                      Connect
                    </button>
                  </div>
                </div>
              `)
          }
          
          setLoading(false)
        }, 500); // Short delay to allow CSS to load
      } catch (error) {
        console.error("Error loading map:", error)
        setLoading(false)
      }
    }
    
    loadLeaflet()
    
    // Cleanup function
    return () => {
      isMounted = false
      if (mapInstance) {
        mapInstance.remove()
      }
    }
  }, [location, posts, fullScreen])
  
  return (
    <div className="h-full relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 z-10">
          <p className="dark:text-white">Loading map...</p>
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" />
    </div>
  )
} 