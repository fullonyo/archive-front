import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PhotoIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { getGoogleDriveAlternativeUrls } from '../../utils/googleDriveUtils'
import { getProxiedUrlVariants, needsProxy } from '../../utils/imageProxy'
import { useImageCache } from '../../utils/imageCache'

const ImageWithLoading = ({ 
  src, 
  alt, 
  className = '', 
  fallbackIcon: FallbackIcon = PhotoIcon,
  loadingClassName = '',
  onLoad = null,
  onError = null,
  enableRetry = true,
  retryDelay = 1000,
  maxRetries = 3,
  ...props 
}) => {
  const [imageState, setImageState] = useState('loading') // loading, loaded, error, retrying
  const [showSkeleton, setShowSkeleton] = useState(true)
  const [currentSrc, setCurrentSrc] = useState(src)
  const [alternativeUrls, setAlternativeUrls] = useState([])
  const [attemptIndex, setAttemptIndex] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  const imgRef = useRef(null)
  const timeoutRef = useRef(null)
  const loadTimeoutRef = useRef(null)
  const { isInCache, addToCache, getFromCache, isValidUrl, preloadImage: cachePreloadImage } = useImageCache()

  // Preload image in the background
  const preloadImageLocal = useCallback((url) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(url)
      img.onerror = () => reject(new Error(`Failed to load ${url}`))
      img.src = url
    })
  }, [])

  // Reset state when src changes
  useEffect(() => {
    // Clear any existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current)

    if (src && isValidUrl(src)) {
      // Check cache first
      const cached = getFromCache(src)
      if (cached) {
        if (cached.status === 'success') {
          setImageState('loaded')
          setShowSkeleton(false)
          setCurrentSrc(src)
          return
        } else if (cached.status === 'error') {
          // Try alternatives for cached errors
          console.log(`Using cached error result for: ${src}, trying alternatives`)
        }
      }

      setImageState('loading')
      setShowSkeleton(true)
      setCurrentSrc(src)
      setAttemptIndex(0)
      setRetryCount(0)
      
      // Get alternative URLs for fallback with proxy support
      let alternatives = []
      if (needsProxy(src)) {
        alternatives = getProxiedUrlVariants(src)
      } else {
        alternatives = getGoogleDriveAlternativeUrls(src)
      }
      setAlternativeUrls(alternatives)

      // Add to cache as loading
      addToCache(src, 'loading')

      // Set a loading timeout to prevent infinite loading
      loadTimeoutRef.current = setTimeout(() => {
        if (imageState === 'loading') {
          console.log(`Image loading timeout for: ${src}`)
          addToCache(src, 'error', 'Timeout')
          handleError(new Error('Loading timeout'))
        }
      }, 10000) // 10 second timeout
    } else {
      setImageState('error')
      setShowSkeleton(false)
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current)
    }
  }, [src, isValidUrl, getFromCache, addToCache, needsProxy])

  const handleLoad = useCallback((e) => {
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current)
    
    setImageState('loaded')
    // Add successful load to cache
    addToCache(currentSrc, 'success')
    // Shorter delay for quicker transition
    setTimeout(() => setShowSkeleton(false), 150)
    
    if (onLoad) {
      onLoad(e)
    }
  }, [onLoad, currentSrc, addToCache])

  const handleError = useCallback(async (e) => {
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current)
    
    console.log(`Image load failed for: ${currentSrc}, attempt ${attemptIndex + 1}`)
    
    // Add failed URL to cache
    addToCache(currentSrc, 'error', 'Load failed')
    
    // Try alternative URLs if available
    if (attemptIndex < alternativeUrls.length) {
      const nextUrl = alternativeUrls[attemptIndex]
      console.log(`Trying alternative URL ${attemptIndex + 1}/${alternativeUrls.length}: ${nextUrl}`)
      setAttemptIndex(prev => prev + 1)
      setCurrentSrc(nextUrl)
      return
    }
    
    // Try retry with delay if enabled and retries left
    if (enableRetry && retryCount < maxRetries) {
      setImageState('retrying')
      setRetryCount(prev => prev + 1)
      
      timeoutRef.current = setTimeout(() => {
        console.log(`Retrying image load (${retryCount + 1}/${maxRetries}) for: ${src}`)
        setImageState('loading')
        setAttemptIndex(0)
        setCurrentSrc(src)
      }, retryDelay * (retryCount + 1)) // Exponential backoff
      return
    }
    
    // All alternatives and retries failed
    console.log('All image URLs and retries failed, showing error state')
    addToCache(src, 'error', 'All attempts failed')
    setImageState('error')
    setShowSkeleton(false)
    
    if (onError) {
      onError(e)
    }
  }, [currentSrc, attemptIndex, alternativeUrls, enableRetry, retryCount, maxRetries, retryDelay, src, onError, addToCache])

  // Manual retry function
  const retryLoad = useCallback(() => {
    setImageState('loading')
    setShowSkeleton(true)
    setAttemptIndex(0)
    setRetryCount(0)
    setCurrentSrc(src)
  }, [src])

  if (!src || src === 'null' || src === 'undefined') {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 ${className}`}>
        <FallbackIcon className="w-1/3 h-1/3 text-slate-500" />
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* VRChat-style Loading Skeleton */}
      <AnimatePresence>
        {showSkeleton && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-800/40 to-cyan-700/30 ${loadingClassName}`}
          >
            {/* Animated gradient shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%] animate-[shimmer_2.5s_ease-in-out_infinite]" />
            
            {/* VR-style loading indicator */}
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
              <motion.div
                className="relative"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 360]
                }}
                transition={{ 
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" }
                }}
              >
                <SparklesIcon className="w-8 h-8 text-cyan-400" />
                <motion.div
                  className="absolute inset-0 bg-cyan-400 blur-md opacity-40"
                  animate={{ opacity: [0.2, 0.6, 0.2] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
              </motion.div>
              
              {/* Loading text with typewriter effect */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-cyan-300/80 font-medium tracking-wider uppercase"
              >
                {imageState === 'retrying' ? `Retry ${retryCount}/${maxRetries}...` : 'Loading Asset...'}
              </motion.div>
              
              {/* Progress dots */}
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      imageState === 'retrying' ? 'bg-yellow-400/60' : 'bg-cyan-400/60'
                    }`}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actual Image with smooth entrance */}
      <motion.img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className="w-full h-full object-cover"
        style={{
          opacity: imageState === 'loaded' && !showSkeleton ? 1 : 0
        }}
        initial={{ scale: 1.02, opacity: 0 }}
        animate={{ 
          scale: imageState === 'loaded' && !showSkeleton ? 1 : 1.02,
          opacity: imageState === 'loaded' && !showSkeleton ? 1 : 0
        }}
        transition={{ 
          duration: 0.4, 
          ease: "easeOut"
        }}
        onLoad={handleLoad}
        onError={handleError}
        crossOrigin="anonymous"
        {...props}
      />

      {/* Error State with VR theme and retry option */}
      {imageState === 'error' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-900/20 to-slate-900"
        >
          <motion.div
            initial={{ y: 10 }}
            animate={{ y: 0 }}
            className="text-center"
          >
            <FallbackIcon className="w-12 h-12 text-red-400/60 mx-auto mb-2" />
            <span className="text-xs text-red-300/60 font-medium tracking-wide mb-2 block">
              Asset unavailable
            </span>
            {enableRetry && (
              <button
                onClick={retryLoad}
                className="text-xs text-cyan-400 hover:text-cyan-300 underline transition-colors"
              >
                Try again
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default ImageWithLoading
