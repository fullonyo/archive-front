/**
 * Utility functions for formatting numbers and data display
 */

/**
 * Format rating number to display with appropriate precision
 * @param {number} rating - Rating value to format
 * @returns {string} - Formatted rating string
 */
export const formatRating = (rating) => {
  if (!rating && rating !== 0) return '0.0'
  
  const num = parseFloat(rating)
  
  // If it's a whole number, show with .0
  if (num === Math.floor(num)) {
    return num.toFixed(1)
  }
  
  // If it has decimals, show max 1 decimal place
  return num.toFixed(1)
}

/**
 * Format large numbers with K, M abbreviations
 * @param {number} num - Number to format
 * @returns {string} - Formatted number string
 */
export const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  
  const numValue = parseInt(num)
  
  if (numValue >= 1000000) {
    return (numValue / 1000000).toFixed(1) + 'M'
  }
  if (numValue >= 1000) {
    return (numValue / 1000).toFixed(1) + 'K'
  }
  
  return numValue.toString()
}

/**
 * Format large numbers for display without abbreviations
 * @param {number} num - Number to format
 * @returns {string} - Formatted number string with thousand separators
 */
export const formatNumberFull = (num) => {
  if (!num && num !== 0) return '0'
  
  return parseInt(num).toLocaleString('pt-BR')
}

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 20) => {
  if (!text) return ''
  
  if (text.length <= maxLength) return text
  
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Format stats object for consistent display
 * @param {object} stats - Stats object from API
 * @returns {object} - Formatted stats object
 */
export const formatUserStats = (stats) => {
  if (!stats) {
    return {
      rating: '0.0',
      uploads: '0',
      likes: '0'
    }
  }
  
  return {
    rating: formatRating(stats.rating),
    uploads: formatNumber(stats.uploads),
    likes: formatNumber(stats.likes)
  }
}
