import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { getGoogleDriveImageUrl, getGoogleDriveAlternativeUrls } from '../utils/googleDriveUtils'
import { useAvatarCache } from '../utils/avatarCache'
import { isValidAvatarUrl, isKnownInvalidUrl } from '../utils/avatarValidation'
import { getProxiedImageUrl, getProxiedUrlVariants, needsProxy } from '../utils/imageProxy'

/**
 * Hook para gerenciar carregamento de avatar com múltiplos fallbacks
 * @param {string} avatarUrl - URL do avatar
 * @param {string} username - Nome do usuário para fallback
 * @param {string} instanceId - ID único da instância (para evitar conflitos)
 * @returns {object} Estado do avatar
 */
export const useAvatarLoader = (avatarUrl, username, instanceId = '') => {
  // Create a unique identifier for this instance (usar useMemo com dependências certas)
  const hookId = useMemo(() => {
    return `${username || 'unknown'}-${instanceId || 'default'}`
  }, [username, instanceId])
  
  // Initialize avatar cache
  const { isInCache, getFromCache, addToCache, markAsFailed, hasFailed } = useAvatarCache()

  const [imageState, setImageState] = useState(() => {
    // Quick check for known invalid URLs
    if (isKnownInvalidUrl(avatarUrl)) {
      console.log(`⚡ Avatar[${hookId}]: Known invalid URL detected immediately: "${avatarUrl}"`)
      return {
        isLoading: false,
        hasError: true,
        showImage: false,
        imageUrl: null,
        attemptIndex: 0,
        alternativeUrls: []
      }
    }

    const isValid = isValidAvatarUrl(avatarUrl, hookId)
    console.log(`🔍 Avatar[${hookId}]: Initial validation for "${avatarUrl}": ${isValid}`)
    
    // Check cache first if URL is valid
    if (isValid) {
      const cached = getFromCache(avatarUrl)
      if (cached) {
        console.log(`📦 Avatar[${hookId}]: Using cached result for ${username}:`, cached.status)
        return {
          isLoading: false,
          hasError: cached.status === 'failed',
          showImage: cached.status === 'success',
          imageUrl: cached.status === 'success' ? cached.url : null,
          attemptIndex: 0,
          alternativeUrls: cached.status === 'failed' ? [] : getGoogleDriveAlternativeUrls(avatarUrl)
        }
      }
    }
    
    return {
      isLoading: isValid,
      hasError: false,
      showImage: isValid,
      imageUrl: isValid ? (needsProxy(avatarUrl) ? getProxiedImageUrl(avatarUrl) : getGoogleDriveImageUrl(avatarUrl)) : null,
      attemptIndex: 0,
      alternativeUrls: isValid ? getProxiedUrlVariants(avatarUrl) : []
    }
  })
  
  // Use ref to track if we're already processing this URL to avoid duplicates
  const currentProcessingUrl = useRef(null)
  const lastProcessedUrl = useRef(null) // Para evitar re-processamento da mesma URL

  // Reset state when avatar URL changes
  useEffect(() => {
    // Evitar re-processar a mesma URL
    if (lastProcessedUrl.current === avatarUrl) {
      return
    }
    
    lastProcessedUrl.current = avatarUrl
    console.log(`🔍 Avatar[${hookId}]: Processing new avatarUrl: "${avatarUrl}"`)
    
    // Quick check for known invalid URLs
    if (isKnownInvalidUrl(avatarUrl)) {
      console.log(`⚡ Avatar[${hookId}]: Known invalid URL: "${avatarUrl}"`)
      if (currentProcessingUrl.current) {
        currentProcessingUrl.current = null
      }
      setImageState({
        isLoading: false,
        hasError: true,
        showImage: false,
        imageUrl: null,
        attemptIndex: 0,
        alternativeUrls: []
      })
      return
    }
    
    // Don't process if no avatar URL provided or invalid values
    if (!isValidAvatarUrl(avatarUrl, hookId)) {
      if (currentProcessingUrl.current) {
        currentProcessingUrl.current = null
        console.log(`❌ Avatar[${hookId}]: Clearing image for ${username} - invalid URL: "${avatarUrl}"`)
      }
      
      setImageState({
        isLoading: false,
        hasError: false,
        showImage: false,
        imageUrl: null,
        attemptIndex: 0,
        alternativeUrls: []
      })
      return
    }
    
    // Only process if URL changed
    if (avatarUrl && avatarUrl !== currentProcessingUrl.current) {
      currentProcessingUrl.current = avatarUrl
      console.log(`🖼️ Avatar[${hookId}]: Starting load process for ${username}:`, avatarUrl)
      
      const alternatives = needsProxy(avatarUrl) ? getProxiedUrlVariants(avatarUrl) : getGoogleDriveAlternativeUrls(avatarUrl)
      console.log(`🔄 Avatar[${hookId}]: Generated ${alternatives.length} alternative URLs for ${username}`)
      
      setImageState({
        isLoading: true,
        hasError: false,
        showImage: true,
        imageUrl: needsProxy(avatarUrl) ? getProxiedImageUrl(avatarUrl) : getGoogleDriveImageUrl(avatarUrl),
        attemptIndex: 0,
        alternativeUrls: alternatives
      })
    }
  }, [avatarUrl, username, hookId])

  const handleImageLoad = useCallback(() => {
    try {
      // Só fazer log uma vez por URL/usuário
      const logKey = `${hookId}-${avatarUrl}`
      if (!window.avatarLoadLogs) window.avatarLoadLogs = new Set()
      if (!window.avatarLoadLogs.has(logKey)) {
        console.log(`✅ Avatar[${hookId}]: Successfully loaded for ${username}`)
        window.avatarLoadLogs.add(logKey)
      }
      
      // Add successful load to cache
      const currentUrl = currentProcessingUrl.current || avatarUrl
      if (currentUrl) {
        addToCache(currentUrl, currentUrl, 'success')
      }
      
      setImageState(prev => ({
        ...prev,
        isLoading: false,
        hasError: false,
        showImage: true
      }))
    } catch (error) {
      console.error(`💥 Avatar[${hookId}]: Error handling image load for ${username}:`, error)
      setImageState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true,
        showImage: false
      }))
    }
  }, [username, hookId, addToCache, avatarUrl]) // Removido imageState.imageUrl das dependências

  const handleImageError = useCallback(() => {
    try {
      // If the original avatar URL is invalid, don't try alternatives
      if (!isValidAvatarUrl(currentProcessingUrl.current, hookId)) {
        console.log(`💀 Avatar[${hookId}]: Original URL invalid, skipping alternatives for ${username}`)
        setImageState(prev => ({
          ...prev,
          isLoading: false,
          hasError: true,
          showImage: false
        }))
        return
      }
      
      const currentAttempt = imageState.attemptIndex + 1
      const totalAttempts = imageState.alternativeUrls.length + 1
      
      console.log(`❌ Avatar[${hookId}]: Load error for ${username}, attempt ${currentAttempt}/${totalAttempts}`)
      
      // Try next alternative URL
      if (imageState.attemptIndex < imageState.alternativeUrls.length) {
        const nextUrl = imageState.alternativeUrls[imageState.attemptIndex]
        console.log(`🔄 Avatar[${hookId}]: Trying alternative ${currentAttempt} for ${username}:`, nextUrl)
        
        setImageState(prev => ({
          ...prev,
          imageUrl: nextUrl,
          attemptIndex: prev.attemptIndex + 1,
          isLoading: true,
          hasError: false
        }))
        return
      }
      
      // If all alternatives fail, show default avatar
      console.log(`💀 Avatar[${hookId}]: All ${totalAttempts} attempts failed for ${username}, showing fallback`)
      
      // Mark original URL as failed in cache
      if (currentProcessingUrl.current) {
        markAsFailed(currentProcessingUrl.current)
      }
      
      setImageState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true,
        showImage: false
      }))
    } catch (error) {
      console.error(`💥 Avatar[${hookId}]: Error handling image error for ${username}:`, error)
      setImageState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true,
        showImage: false
      }))
    }
  }, [username, imageState.attemptIndex, imageState.alternativeUrls, hookId, markAsFailed])

  const retry = useCallback(() => {
    if (avatarUrl) {
      console.log(`🔄 Avatar[${hookId}]: Manual retry initiated for ${username}`)
      currentProcessingUrl.current = null // Reset to allow reprocessing
      const alternatives = needsProxy(avatarUrl) ? getProxiedUrlVariants(avatarUrl) : getGoogleDriveAlternativeUrls(avatarUrl)
      setImageState({
        isLoading: true,
        hasError: false,
        showImage: true,
        imageUrl: needsProxy(avatarUrl) ? getProxiedImageUrl(avatarUrl) : getGoogleDriveImageUrl(avatarUrl),
        attemptIndex: 0,
        alternativeUrls: alternatives
      })
    }
  }, [avatarUrl, username, hookId])

  return {
    ...imageState,
    onLoad: handleImageLoad,
    onError: handleImageError,
    retry
  }
}
