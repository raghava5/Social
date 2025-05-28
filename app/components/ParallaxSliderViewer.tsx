'use client'

import { useEffect, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Parallax, Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/parallax'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface SlideData {
  id: string
  imageURL: string
  title: string
  caption: string
  parallaxLayers: Array<{
    id: string
    content: string
    parallaxOffset: string
    zIndex: number
  }>
}

interface ParallaxSliderViewerProps {
  slides: SlideData[]
  autoplay?: boolean
  height?: string
  className?: string
}

export default function ParallaxSliderViewer({ 
  slides, 
  autoplay = false, 
  height = '400px',
  className = '' 
}: ParallaxSliderViewerProps) {
  const swiperRef = useRef<any>(null)

  if (!slides || slides.length === 0) {
    return null
  }

  return (
    <div className={`rounded-lg overflow-hidden shadow-lg ${className}`} style={{ height }}>
      <Swiper
        ref={swiperRef}
        modules={[Parallax, Navigation, Pagination, ...(autoplay ? [Autoplay] : [])]}
        speed={800}
        parallax={true}
        navigation={true}
        pagination={{ 
          clickable: true,
          bulletClass: 'swiper-pagination-bullet opacity-50 bg-white',
          bulletActiveClass: 'swiper-pagination-bullet-active opacity-100'
        }}
        autoplay={autoplay ? {
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        } : false}
        loop={slides.length > 1}
        className="h-full"
        style={{
          '--swiper-navigation-color': '#ffffff',
          '--swiper-pagination-color': '#ffffff',
        } as any}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative">
            {/* Background Image with Parallax */}
            {slide.imageURL && (
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${slide.imageURL})` }}
                data-swiper-parallax="-23%"
              />
            )}
            
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/30" />
            
            {/* Main Content */}
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-white p-6 md:p-8 text-center">
              {/* Title with Parallax */}
              <h2 
                className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 max-w-4xl leading-tight"
                data-swiper-parallax="-300"
                style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                {slide.title}
              </h2>
              
              {/* Caption with Parallax */}
              <p 
                className="text-lg md:text-xl lg:text-2xl max-w-3xl leading-relaxed"
                data-swiper-parallax="-100"
                style={{
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                }}
              >
                {slide.caption}
              </p>
              
              {/* Custom Parallax Layers */}
              {slide.parallaxLayers.map((layer) => (
                <div
                  key={layer.id}
                  className="absolute text-white font-medium text-lg md:text-xl"
                  data-swiper-parallax={layer.parallaxOffset}
                  style={{ 
                    zIndex: layer.zIndex,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {layer.content}
                </div>
              ))}
            </div>
            
            {/* Slide indicator */}
            <div className="absolute top-4 right-4 z-20 bg-black/30 text-white px-2 py-1 rounded text-sm">
              {slides.indexOf(slide) + 1} / {slides.length}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
} 