/**
 * Utility functions for handling image proxy to avoid CORS issues
 */

// Get API base URL from environment or use default
const getApiBase = () => {
  if (typeof window !== 'undefined' && window.location) {
    // In browser environment, construct from current location
    const protocol = window.location.protocol
    const hostname = window.location.hostname
    const port = hostname === 'localhost' ? '5000' : window.location.port
    return `${protocol}//${hostname}${port ? `:${port}` : ''}/api`
  }
  // Fallback for development
  return 'http://localhost:5000/api'
}

const API_BASE = getApiBase()

/**
 * Convert a Google Drive or other external URL to use our proxy
 * @param {string} imageUrl - Original image URL
 * @returns {string} Proxied image URL
 */
export function getProxiedImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return null
  }
  
  // If already a local URL, return as-is
  if (imageUrl.startsWith('/') || imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1')) {
    return imageUrl
  }
  
  // For external URLs (including Google Drive), use proxy
  const encodedUrl = encodeURIComponent(imageUrl)
  return `${API_BASE}/proxy/image?url=${encodedUrl}`
}

/**
 * Check if an image URL needs proxying
 * @param {string} imageUrl - Image URL to check
 * @returns {boolean} True if needs proxying
 */
export function needsProxy(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return false
  }
  
  // Local URLs don't need proxy
  if (imageUrl.startsWith('/') || imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1')) {
    return false
  }
  
  // Google Drive URLs need proxy
  if (imageUrl.includes('drive.google.com') || imageUrl.includes('googleusercontent.com')) {
    return true
  }
  
  // Any other external URL needs proxy to avoid CORS
  return imageUrl.startsWith('http')
}

/**
 * Get multiple proxy URL variants for fallback purposes
 * @param {string} imageUrl - Original image URL
 * @returns {string[]} Array of proxy URLs with different strategies
 */
export function getProxiedUrlVariants(imageUrl) {
  if (!imageUrl || !needsProxy(imageUrl)) {
    return [imageUrl].filter(Boolean)
  }
  
  // For Google Drive, try multiple URL formats through proxy
  if (imageUrl.includes('drive.google.com') || imageUrl.includes('googleusercontent.com')) {
    const fileId = extractGoogleDriveId(imageUrl)
    if (fileId) {
      const variants = [
        `https://drive.google.com/uc?export=download&id=${fileId}`,
        `https://lh3.googleusercontent.com/d/${fileId}=w1920-h1080`,
        `https://drive.google.com/thumbnail?id=${fileId}&sz=w1920-h1080`,
        `https://drive.google.com/uc?export=view&id=${fileId}`,
        imageUrl // Original URL as fallback
      ]
      
      // Convert each variant to proxy URL
      return variants.map(url => getProxiedImageUrl(url))
    }
  }
  
  // For other URLs, just return the proxied version
  return [getProxiedImageUrl(imageUrl)]
}

/**
 * Extract Google Drive file ID from various URL formats
 * @param {string} url - Google Drive URL
 * @returns {string|null} File ID or null if not found
 */
function extractGoogleDriveId(url) {
  if (!url) return null
  
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)/, // New format: /d/FILE_ID
    /id=([a-zA-Z0-9_-]+)/, // Query parameter format: id=FILE_ID
    /file\/d\/([a-zA-Z0-9_-]+)/, // File format: /file/d/FILE_ID
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

/**
 * Create a fallback image URL for when proxy fails
 * @param {string} text - Text to generate avatar from (username, etc.)
 * @returns {string} Data URL for generated avatar
 */
export function createFallbackAvatar(text = 'U') {
  try {
    // Only create canvas if in browser environment
    if (typeof document === 'undefined') {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzY2NjYiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5VPC90ZXh0Pjwvc3ZnPg=='
    }
    
    // Create a simple colored avatar with initials
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 100
    canvas.height = 100
    
    // Generate color based on text
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    const hue = Math.abs(hash) % 360
    ctx.fillStyle = `hsl(${hue}, 70%, 50%)`
    ctx.fillRect(0, 0, 100, 100)
    
    // Add text
    ctx.fillStyle = 'white'
    ctx.font = 'bold 40px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text.charAt(0).toUpperCase(), 50, 50)
    
    return canvas.toDataURL()
  } catch (error) {
    console.warn('Failed to create fallback avatar:', error)
    // Return a simple SVG fallback
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzY2NjYiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5VPC90ZXh0Pjwvc3ZnPg=='
  }
}

/**
 * Preload an image through proxy to warm up the cache
 * @param {string} imageUrl - Image URL to preload
 * @returns {Promise<boolean>} Promise that resolves to success status
 */
export function preloadProxiedImage(imageUrl) {
  return new Promise((resolve) => {
    if (!needsProxy(imageUrl)) {
      // For non-proxy images, use standard preloading
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = imageUrl
      return
    }
    
    const proxiedUrl = getProxiedImageUrl(imageUrl)
    if (!proxiedUrl) {
      resolve(false)
      return
    }
    
    const img = new Image()
    img.onload = () => {
      console.log('✅ Preloaded proxied image:', imageUrl)
      resolve(true)
    }
    img.onerror = () => {
      console.log('❌ Failed to preload proxied image:', imageUrl)
      resolve(false)
    }
    img.src = proxiedUrl
  })
}

export default {
  getProxiedImageUrl,
  needsProxy,
  getProxiedUrlVariants,
  createFallbackAvatar,
  preloadProxiedImage
}
