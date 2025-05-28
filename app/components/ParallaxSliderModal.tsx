'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  XMarkIcon, 
  PlusIcon, 
  PhotoIcon, 
  TrashIcon,
  EyeIcon,
  PencilIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Parallax, Navigation, Pagination } from 'swiper/modules'
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

interface ParallaxSliderModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (slides: SlideData[]) => void
  initialSlides?: SlideData[]
}

export default function ParallaxSliderModal({ isOpen, onClose, onSave, initialSlides = [] }: ParallaxSliderModalProps) {
  const [slides, setSlides] = useState<SlideData[]>(initialSlides)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [editingSlide, setEditingSlide] = useState<SlideData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const swiperRef = useRef<any>(null)

  useEffect(() => {
    if (isOpen) {
      setSlides(initialSlides)
      setCurrentSlideIndex(0)
      setIsPreviewMode(false)
      setEditingSlide(null)
    }
  }, [isOpen, initialSlides])

  if (!isOpen) return null

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageURL = event.target?.result as string
        addNewSlide(imageURL)
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  const addNewSlide = (imageURL: string = '') => {
    const newSlide: SlideData = {
      id: `slide-${Date.now()}-${Math.random()}`,
      imageURL,
      title: 'New Slide Title',
      caption: 'Add your slide description here...',
      parallaxLayers: [
        {
          id: `layer-${Date.now()}-1`,
          content: 'Overlay Text',
          parallaxOffset: '-300',
          zIndex: 10
        }
      ]
    }
    setSlides(prev => [...prev, newSlide])
    setCurrentSlideIndex(slides.length)
    setEditingSlide(newSlide)
  }

  const updateSlide = (slideId: string, updates: Partial<SlideData>) => {
    setSlides(prev => prev.map(slide => 
      slide.id === slideId ? { ...slide, ...updates } : slide
    ))
    if (editingSlide?.id === slideId) {
      setEditingSlide(prev => prev ? { ...prev, ...updates } : null)
    }
  }

  const deleteSlide = (slideId: string) => {
    setSlides(prev => prev.filter(slide => slide.id !== slideId))
    if (currentSlideIndex >= slides.length - 1) {
      setCurrentSlideIndex(Math.max(0, slides.length - 2))
    }
    setEditingSlide(null)
  }

  const moveSlide = (slideId: string, direction: 'up' | 'down') => {
    const slideIndex = slides.findIndex(s => s.id === slideId)
    if (slideIndex === -1) return
    
    const newIndex = direction === 'up' ? slideIndex - 1 : slideIndex + 1
    if (newIndex < 0 || newIndex >= slides.length) return
    
    const newSlides = [...slides]
    const [movedSlide] = newSlides.splice(slideIndex, 1)
    newSlides.splice(newIndex, 0, movedSlide)
    setSlides(newSlides)
  }

  const addParallaxLayer = (slideId: string) => {
    const newLayer = {
      id: `layer-${Date.now()}-${Math.random()}`,
      content: 'New Layer',
      parallaxOffset: '-100',
      zIndex: 5
    }
    
    updateSlide(slideId, {
      parallaxLayers: [...(slides.find(s => s.id === slideId)?.parallaxLayers || []), newLayer]
    })
  }

  const updateLayer = (slideId: string, layerId: string, updates: Partial<typeof slides[0]['parallaxLayers'][0]>) => {
    const slide = slides.find(s => s.id === slideId)
    if (!slide) return
    
    const updatedLayers = slide.parallaxLayers.map(layer =>
      layer.id === layerId ? { ...layer, ...updates } : layer
    )
    
    updateSlide(slideId, { parallaxLayers: updatedLayers })
  }

  const deleteLayer = (slideId: string, layerId: string) => {
    const slide = slides.find(s => s.id === slideId)
    if (!slide) return
    
    const updatedLayers = slide.parallaxLayers.filter(layer => layer.id !== layerId)
    updateSlide(slideId, { parallaxLayers: updatedLayers })
  }

  const handleSave = () => {
    onSave(slides)
  }

  const currentSlide = slides[currentSlideIndex]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">Parallax Slider Editor</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  isPreviewMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <EyeIcon className="h-4 w-4 mr-1 inline" />
                {isPreviewMode ? 'Exit Preview' : 'Preview'}
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Slider
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[70vh]">
          {/* Sidebar - Slide Management */}
          {!isPreviewMode && (
            <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Slides ({slides.length})</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      <PhotoIcon className="h-4 w-4 inline mr-1" />
                      Upload
                    </button>
                    <button
                      onClick={() => addNewSlide()}
                      className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                    >
                      <PlusIcon className="h-4 w-4 inline mr-1" />
                      Add
                    </button>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Slide List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      currentSlideIndex === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => setCurrentSlideIndex(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          {slide.imageURL && (
                            <img
                              src={slide.imageURL}
                              alt=""
                              className="w-8 h-8 rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {slide.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {slide.parallaxLayers.length} layers
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            moveSlide(slide.id, 'up')
                          }}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <ArrowUpIcon className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            moveSlide(slide.id, 'down')
                          }}
                          disabled={index === slides.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <ArrowDownIcon className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingSlide(slide)
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <PencilIcon className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSlide(slide.id)
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {slides.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <PhotoIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No slides yet</p>
                    <p className="text-xs">Upload an image or add a slide to get started</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Content - Preview or Editor */}
          <div className="flex-1 flex flex-col">
            {/* Swiper Preview */}
            <div className="flex-1 bg-gray-900 relative">
              {slides.length > 0 ? (
                <Swiper
                  ref={swiperRef}
                  modules={[Parallax, Navigation, Pagination]}
                  speed={800}
                  parallax={true}
                  navigation={true}
                  pagination={{ clickable: true }}
                  onSlideChange={(swiper) => setCurrentSlideIndex(swiper.activeIndex)}
                  className="h-full"
                >
                  {slides.map((slide, index) => (
                    <SwiperSlide key={slide.id} className="relative">
                      {/* Background Image */}
                      {slide.imageURL && (
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${slide.imageURL})` }}
                          data-swiper-parallax="-23%"
                        />
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-30" />
                      
                      {/* Content */}
                      <div className="relative z-10 h-full flex flex-col justify-center items-center text-white p-8">
                        <h2 
                          className="text-4xl font-bold mb-4 text-center"
                          data-swiper-parallax="-300"
                        >
                          {slide.title}
                        </h2>
                        <p 
                          className="text-xl text-center max-w-2xl"
                          data-swiper-parallax="-100"
                        >
                          {slide.caption}
                        </p>
                        
                        {/* Parallax Layers */}
                        {slide.parallaxLayers.map((layer) => (
                          <div
                            key={layer.id}
                            className="absolute text-white font-medium"
                            data-swiper-parallax={layer.parallaxOffset}
                            style={{ zIndex: layer.zIndex }}
                          >
                            {layer.content}
                          </div>
                        ))}
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <PhotoIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl mb-2">No slides to preview</p>
                    <p className="text-gray-300">Add some slides to see the parallax effect</p>
                  </div>
                </div>
              )}
            </div>

            {/* Slide Editor Panel */}
            {!isPreviewMode && currentSlide && (
              <div className="bg-white border-t border-gray-200 p-4 max-h-60 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slide Title
                    </label>
                    <input
                      type="text"
                      value={currentSlide.title}
                      onChange={(e) => updateSlide(currentSlide.id, { title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Background Image URL
                    </label>
                    <input
                      type="url"
                      value={currentSlide.imageURL}
                      onChange={(e) => updateSlide(currentSlide.id, { imageURL: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Caption
                    </label>
                    <textarea
                      value={currentSlide.caption}
                      onChange={(e) => updateSlide(currentSlide.id, { caption: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Parallax Layers */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Parallax Layers</h4>
                    <button
                      onClick={() => addParallaxLayer(currentSlide.id)}
                      className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                    >
                      <PlusIcon className="h-3 w-3 inline mr-1" />
                      Add Layer
                    </button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {currentSlide.parallaxLayers.map((layer) => (
                      <div key={layer.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-50 rounded">
                        <input
                          type="text"
                          value={layer.content}
                          onChange={(e) => updateLayer(currentSlide.id, layer.id, { content: e.target.value })}
                          placeholder="Layer content"
                          className="col-span-5 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <input
                          type="text"
                          value={layer.parallaxOffset}
                          onChange={(e) => updateLayer(currentSlide.id, layer.id, { parallaxOffset: e.target.value })}
                          placeholder="-300"
                          className="col-span-2 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <input
                          type="number"
                          value={layer.zIndex}
                          onChange={(e) => updateLayer(currentSlide.id, layer.id, { zIndex: parseInt(e.target.value) || 0 })}
                          placeholder="10"
                          className="col-span-2 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <button
                          onClick={() => deleteLayer(currentSlide.id, layer.id)}
                          className="col-span-1 p-1 text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 