/**
 * Utilitários para validação robusta de URLs de avatar
 */

/**
 * Validate if a Google Drive file ID seems legitimate
 * @param {string} fileId - Google Drive file ID
 * @returns {boolean} - Whether the file ID seems valid
 */
export const isValidGoogleDriveFileId = (fileId) => {
  if (!fileId || typeof fileId !== 'string') return false
  
  // Google Drive file IDs are typically 25-44 characters long
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
    /^xxxx/i,
    /^sample/i,
    /^invalid/i
  ]
  
  return !invalidPatterns.some(pattern => pattern.test(fileId))
}

/**
 * Extract Google Drive file ID from various URL formats
 * @param {string} url - Google Drive URL
 * @returns {string|null} - Extracted file ID or null
 */
export const extractGoogleDriveFileId = (url) => {
  if (!url || typeof url !== 'string') return null
  
  let fileId = null
  
  // Try different URL patterns
  const patterns = [
    // https://drive.google.com/uc?export=download&id=FILE_ID
    /[?&]id=([a-zA-Z0-9_-]+)/,
    // https://drive.google.com/file/d/FILE_ID/view
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    // https://lh3.googleusercontent.com/d/FILE_ID
    /googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/,
    // https://docs.google.com/document/d/FILE_ID
    /docs\.google\.com\/[^\/]+\/d\/([a-zA-Z0-9_-]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      fileId = match[1]
      break
    }
  }
  
  return fileId
}

/**
 * Comprehensive validation for avatar URLs
 * @param {string} url - URL to validate
 * @param {string} context - Context for logging (e.g., username)
 * @returns {boolean} - Whether the URL is valid
 */
export const isValidAvatarUrl = (url, context = 'unknown') => {
  // Basic validation
  if (!url) return false
  if (typeof url !== 'string') return false
  if (url.trim().length === 0) return false
  
  const trimmedUrl = url.trim()
  
  // Check for common invalid string values
  const invalidValues = [
    'null', 'undefined', 'false', 'true', 'NaN', '{}', '[]', 
    'object Object', '[object Object]', 'none', 'empty'
  ]
  if (invalidValues.includes(trimmedUrl.toLowerCase())) {
    console.log(`⚠️ Avatar validation[${context}]: Invalid string value detected: "${trimmedUrl}"`)
    return false
  }
  
  // Data URLs are valid
  if (trimmedUrl.startsWith('data:')) {
    return trimmedUrl.startsWith('data:image/')
  }
  
  // Relative URLs are valid
  if (trimmedUrl.startsWith('/')) {
    return trimmedUrl.includes('.')
  }
  
  // Must be HTTP/HTTPS for external URLs
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    console.log(`⚠️ Avatar validation[${context}]: URL must start with http:// or https://: "${trimmedUrl}"`)
    return false
  }
  
  // Special validation for Google Drive URLs
  if (trimmedUrl.includes('drive.google.com') || 
      trimmedUrl.includes('googleusercontent.com') || 
      trimmedUrl.includes('docs.google.com')) {
    
    const fileId = extractGoogleDriveFileId(trimmedUrl)
    if (!fileId) {
      console.log(`⚠️ Avatar validation[${context}]: Could not extract file ID from Google Drive URL: "${trimmedUrl}"`)
      return false
    }
    
    if (!isValidGoogleDriveFileId(fileId)) {
      console.log(`⚠️ Avatar validation[${context}]: Invalid Google Drive file ID: "${fileId}"`)
      return false
    }
    
    console.log(`✅ Avatar validation[${context}]: Valid Google Drive URL with file ID: "${fileId}"`)
    return true
  }
  
  // For other URLs, basic validation
  if (!trimmedUrl.includes('.')) {
    console.log(`⚠️ Avatar validation[${context}]: URL must contain a domain: "${trimmedUrl}"`)
    return false
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /localhost:\d+\/[^\/]*$/,  // localhost without file extension
    /127\.0\.0\.1:\d+\/[^\/]*$/,  // local IP without file extension
    /\.(exe|bat|cmd|sh|php|asp|jsp)$/i,  // Executable files
    /javascript:/i,  // JavaScript URLs
    /data:(?!image\/)/i  // Non-image data URLs
  ]
  
  if (suspiciousPatterns.some(pattern => pattern.test(trimmedUrl))) {
    console.log(`⚠️ Avatar validation[${context}]: Suspicious URL pattern detected: "${trimmedUrl}"`)
    return false
  }
  
  console.log(`✅ Avatar validation[${context}]: URL passed validation: "${trimmedUrl}"`)
  return true
}

/**
 * Quick check if URL has failed before (for cache optimization)
 * @param {string} url - URL to check
 * @returns {boolean} - Whether URL is known to be invalid
 */
export const isKnownInvalidUrl = (url) => {
  if (!url || typeof url !== 'string') return true
  
  // Check against known invalid patterns immediately
  const knownInvalidPatterns = [
    /^null$/i,
    /^undefined$/i,
    /^false$/i,
    /^true$/i,
    /^\d+$/,  // Just numbers
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i,  // UUIDs
    /googleusercontent\.com\/d\/1[fF][cC][gG]_1[lL][fF][mM]/i,  // Known bad file ID pattern
    /googleusercontent\.com\/d\/1fCg_1LfMlCH5I_BcCggRkL94rB7l00vB/i,  // Specific failing URL
    /googleusercontent\.com\/d\/[a-zA-Z0-9_-]*test[a-zA-Z0-9_-]*/i,  // Test file IDs
    /googleusercontent\.com\/d\/[a-zA-Z0-9_-]*example[a-zA-Z0-9_-]*/i,  // Example file IDs
    /googleusercontent\.com\/d\/[a-zA-Z0-9_-]*dummy[a-zA-Z0-9_-]*/i  // Dummy file IDs
  ]
  
  const trimmedUrl = url.trim().toLowerCase()
  const isKnownInvalid = knownInvalidPatterns.some(pattern => pattern.test(trimmedUrl))
  
  if (isKnownInvalid) {
    console.log(`⚡ isKnownInvalidUrl: Detected known invalid pattern in: "${url}"`)
  }
  
  return isKnownInvalid
}
