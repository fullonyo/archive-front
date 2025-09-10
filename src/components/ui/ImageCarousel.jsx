import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { getGoogleDriveImageUrl, handleImageError } from '../../utils/googleDriveUtils'
import { getProxiedImageUrl, needsProxy } from '../../utils/imageProxy'
import ImageWithLoading from './ImageWithLoading'

const ImageCarousel = ({ 
  images = [], 
  aspectRatio = '4/3', 
  showControls = true,
  showDots = true,
  className = '',
  fallbackImage = `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop&crop=center&auto=format&q=80`
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Process images with Google Drive optimization and proxy
  const processedImages = useMemo(() => {
    try {
      if (!images || !Array.isArray(images) || images.length === 0) {
        return []
      }
      return images.map(url => {
        if (typeof url === 'string' && url.trim()) {
          // Use proxy for external URLs, especially Google Drive
          if (needsProxy(url)) {
            return getProxiedImageUrl(url)
          }
          return getGoogleDriveImageUrl(url)
        }
        return null
      }).filter(Boolean)
    } catch (error) {
      console.error('Error processing images:', error)
      return []
    }
  }, [images])
  
  // If no images provided, use fallback (also process through proxy if needed)
  const processedFallback = needsProxy(fallbackImage) ? getProxiedImageUrl(fallbackImage) : fallbackImage
  const displayImages = processedImages.length > 0 ? processedImages : [processedFallback]
  const hasMultipleImages = displayImages.length > 1

  // Calculate aspect ratio style
  const getAspectRatioStyle = (ratio) => {
    try {
      if (ratio === '4/3') return { aspectRatio: '4/3' }
      if (ratio === '16/9') return { aspectRatio: '16/9' }
      if (ratio === '1/1') return { aspectRatio: '1/1' }
      // Default fallback
      return { aspectRatio: '4/3' }
    } catch (error) {
      return { aspectRatio: '4/3' }
    }
  }

  const nextImage = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % displayImages.length)
  }

  const prevImage = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)
  }

  const goToImage = (index, e) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex(index)
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Main image container */}
      <div 
        className="relative overflow-hidden bg-gray-800"
        style={getAspectRatioStyle(aspectRatio)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="w-full h-full"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <ImageWithLoading
              src={displayImages[currentIndex]}
              alt={`Asset image ${currentIndex + 1}`}
              className="w-full h-full"
              onError={(e) => {
                handleImageError(e, displayImages[currentIndex], () => {
                  e.target.src = fallbackImage
                })
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {showControls && hasMultipleImages && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Image counter */}
        {hasMultipleImages && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {currentIndex + 1}/{displayImages.length}
          </div>
        )}
      </div>

      {/* Dots indicator */}
      {showDots && hasMultipleImages && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
          {displayImages.map((_, index) => (
            <button
              key={index}
              onClick={(e) => goToImage(index, e)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageCarousel
