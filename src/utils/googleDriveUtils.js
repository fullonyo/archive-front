/**
 * Utility functions for handling Google Drive URLs
 */

/**
 * Validate if a Google Drive file ID seems legitimate
 * @param {string} fileId - Google Drive file ID
 * @returns {boolean} - Whether the file ID seems valid
 */
const isValidGoogleDriveFileId = (fileId) => {
  if (!fileId || typeof fileId !== 'string') return false
  
  // Google Drive file IDs are typically 28-44 characters long
  if (fileId.length < 20 || fileId.length > 50) return false
  
  // Should contain only alphanumeric characters, hyphens, and underscores
  if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) return false
  
  // Check for obviously fake/test IDs
  const invalidPatterns = [
    /^test/i,
    /^fake/i,
    /^example/i,
    /^dummy/i,
    /^placeholder/i,
    /^1234/,
    /^abcd/i,
    /^0000/,
    /^1111/,
    /^aaaa/i,
    /^xxxx/i
  ]
  
  return !invalidPatterns.some(pattern => pattern.test(fileId))
}
/**
 * Convert Google Drive URL to optimal format for image display
 * @param {string} url - Original Google Drive URL
 * @returns {string|null} - Optimized URL for image display
 */
export const getGoogleDriveImageUrl = (url) => {
  try {
    // Validation checks
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      console.log('⚠️ getGoogleDriveImageUrl: Invalid URL provided:', url)
      return null
    }
    
    const trimmedUrl = url.trim()
    
    // Check for common invalid values
    const invalidValues = ['null', 'undefined', 'false', 'true', 'NaN']
    if (invalidValues.includes(trimmedUrl.toLowerCase())) {
      console.log('⚠️ getGoogleDriveImageUrl: URL contains invalid value:', trimmedUrl)
      return null
    }
    
    // Se já é uma URL direta otimizada, verificar se o file ID é válido
    if (trimmedUrl.includes('googleusercontent.com')) {
      const fileIdMatch = trimmedUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        if (!isValidGoogleDriveFileId(fileId)) {
          console.log('⚠️ getGoogleDriveImageUrl: Invalid Google Drive file ID detected:', fileId)
          return null
        }
      }
      console.log('✅ getGoogleDriveImageUrl: URL already optimized and valid:', trimmedUrl)
      return trimmedUrl
    }
    
    // Se já contém export=view, verificar file ID
    if (trimmedUrl.includes('export=view')) {
      const fileIdMatch = trimmedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        if (!isValidGoogleDriveFileId(fileId)) {
          console.log('⚠️ getGoogleDriveImageUrl: Invalid Google Drive file ID in export URL:', fileId)
          return null
        }
      }
      console.log('✅ getGoogleDriveImageUrl: Export URL valid:', trimmedUrl)
      return trimmedUrl
    }
    
    // If it's a regular HTTP URL but not Google Drive, return as-is
    if ((trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) && 
        !trimmedUrl.includes('drive.google.com') && 
        !trimmedUrl.includes('docs.google.com')) {
      console.log('ℹ️ getGoogleDriveImageUrl: Non-Google Drive URL, returning as-is:', trimmedUrl)
      return trimmedUrl
    }
    
    // Extrair ID do Google Drive de diferentes formatos
    let fileId = null
    
    // Formato: https://drive.google.com/uc?export=download&id=ID
    if (trimmedUrl.includes('id=')) {
      const parts = trimmedUrl.split('id=')
      if (parts.length > 1) {
        fileId = parts[1].split('&')[0]
      }
    }
    // Formato: https://drive.google.com/file/d/ID/view
    else if (trimmedUrl.includes('/file/d/')) {
      const parts = trimmedUrl.split('/file/d/')
      if (parts.length > 1) {
        fileId = parts[1].split('/')[0]
      }
    }
    
    if (!fileId) {
      console.log('⚠️ getGoogleDriveImageUrl: Could not extract file ID from URL:', trimmedUrl)
      return null // Return null instead of original URL for Google Drive URLs without valid ID
    }
    
    // Validate extracted file ID
    if (!isValidGoogleDriveFileId(fileId)) {
      console.log('⚠️ getGoogleDriveImageUrl: Extracted file ID is invalid:', fileId)
      return null
    }
    
    // Retornar formato otimizado para exibição de imagens
    const optimizedUrl = `https://lh3.googleusercontent.com/d/${fileId}=w1920-h1080`
    console.log('✅ getGoogleDriveImageUrl: Generated optimized URL:', optimizedUrl)
    return optimizedUrl
  } catch (error) {
    console.error('❌ getGoogleDriveImageUrl: Error processing URL:', error, 'URL:', url)
    return null // Return null instead of original URL on error
  }
}

/**
 * Get optimized Google Drive URL specifically for banners
 * @param {string} url - Original Google Drive URL  
 * @returns {string|null} - Optimized URL for banner display
 */
export const getGoogleDriveBannerUrl = (url) => {
  if (!url) return null
  
  // Extrair fileId
  let fileId = null
  
  if (url.includes('id=')) {
    fileId = url.split('id=')[1].split('&')[0]
  } else if (url.includes('/file/d/')) {
    fileId = url.split('/file/d/')[1].split('/')[0]
  }
  
  // Para banners, usar formato de alta resolução
  return fileId ? `https://lh3.googleusercontent.com/d/${fileId}=w1920-h1080-c` : url
}

/**
 * Get fallback Google Drive URL for images
 * @param {string} url - Original Google Drive URL
 * @returns {string|null} - Alternative URL format
 */
export const getGoogleDriveFallbackUrl = (url) => {
  if (!url) return null
  
  // Extrair fileId da URL
  let fileId = null
  
  if (url.includes('id=')) {
    fileId = url.split('id=')[1].split('&')[0]
  } else if (url.includes('/file/d/')) {
    fileId = url.split('/file/d/')[1].split('/')[0]
  }
  
  // Retornar formato alternativo usando Google User Content
  return fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : null
}

/**
 * Get alternative Google Drive URL formats (excluding the original)
 * @param {string} url - Original Google Drive URL
 * @returns {Array<string>} - Array of alternative URL formats
 */
export const getGoogleDriveAlternativeUrls = (url) => {
  if (!url) return []
  
  let fileId = null
  
  if (url.includes('id=')) {
    fileId = url.split('id=')[1].split('&')[0]
  } else if (url.includes('/file/d/')) {
    fileId = url.split('/file/d/')[1].split('/')[0]
  } else if (url.includes('googleusercontent.com/d/')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      fileId = match[1];
    }
  }
  
  if (!fileId || !isValidGoogleDriveFileId(fileId)) {
    console.log('⚠️ getGoogleDriveAlternativeUrls: Invalid or missing file ID, no alternatives generated')
    return []
  }
  
  // Generate all possible URLs
  const allUrls = [
    `https://drive.google.com/uc?export=view&id=${fileId}`,
    `https://lh3.googleusercontent.com/d/${fileId}`,
    `https://drive.google.com/uc?export=download&id=${fileId}`,
    `https://lh3.googleusercontent.com/d/${fileId}=w240-h240-c`,
    `https://drive.google.com/file/d/${fileId}/view`,
    `https://lh3.googleusercontent.com/d/${fileId}=s200-c`
  ]
  
  // Filter out the original URL to avoid duplicates
  const alternatives = allUrls.filter(altUrl => altUrl !== url)
  console.log(`🔄 getGoogleDriveAlternativeUrls: Generated ${alternatives.length} alternatives for file ID: ${fileId}`)
  return alternatives
}

/**
 * Handle image error with automatic fallback
 * @param {Event} e - Error event from img element
 * @param {string} originalUrl - Original image URL
 * @param {Function} onAllFailed - Callback when all URLs fail
 */
export const handleImageError = (e, originalUrl, onAllFailed) => {
  const img = e.target
  
  // Tentar URL alternativa uma vez
  if (!img.dataset.retried) {
    img.dataset.retried = 'true'
    const fallbackUrl = getGoogleDriveFallbackUrl(originalUrl)
    
    if (fallbackUrl) {
      img.src = fallbackUrl
      return
    }
  }
  
  // Se tudo falhar, executar callback
  if (onAllFailed) {
    onAllFailed()
  }
}
