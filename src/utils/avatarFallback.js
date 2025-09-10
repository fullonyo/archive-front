/**
 * Sistema de fallback para avatares
 * Gera avatares padrão quando falha o carregamento
 */

/**
 * Gera um avatar SVG baseado no nome do usuário
 */
export const generateFallbackAvatar = (username = 'U', size = 40) => {
  const name = username.trim() || 'U'
  const initials = getInitials(name)
  const color = getColorFromString(name)
  
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad-${color.id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color.start};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color.end};stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#grad-${color.id})" />
      <text x="${size/2}" y="${size/2 + 6}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold">${initials}</text>
    </svg>
  `
  
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * Obtém as iniciais do nome
 */
const getInitials = (name) => {
  const words = name.split(' ').filter(word => word.length > 0)
  if (words.length === 0) return 'U'
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

/**
 * Gera uma cor baseada na string
 */
const getColorFromString = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const colors = [
    { id: 'blue', start: '#3B82F6', end: '#1D4ED8' },
    { id: 'purple', start: '#8B5CF6', end: '#5B21B6' },
    { id: 'pink', start: '#EC4899', end: '#BE185D' },
    { id: 'green', start: '#10B981', end: '#047857' },
    { id: 'yellow', start: '#F59E0B', end: '#D97706' },
    { id: 'red', start: '#EF4444', end: '#DC2626' },
    { id: 'indigo', start: '#6366F1', end: '#4338CA' },
    { id: 'cyan', start: '#06B6D4', end: '#0891B2' },
    { id: 'orange', start: '#F97316', end: '#EA580C' },
    { id: 'teal', start: '#14B8A6', end: '#0F766E' }
  ]
  
  return colors[Math.abs(hash) % colors.length]
}

/**
 * Gera um avatar usando Canvas API (alternativa para SVG)
 */
export const generateCanvasAvatar = (username = 'U', size = 40) => {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = size
    canvas.height = size
    
    const name = username.trim() || 'U'
    const initials = getInitials(name)
    const color = getColorFromString(name)
    
    // Criar gradiente
    const gradient = ctx.createLinearGradient(0, 0, size, size)
    gradient.addColorStop(0, color.start)
    gradient.addColorStop(1, color.end)
    
    // Desenhar círculo
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI)
    ctx.fill()
    
    // Desenhar texto
    ctx.fillStyle = 'white'
    ctx.font = `bold ${size * 0.4}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(initials, size / 2, size / 2)
    
    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Error generating canvas avatar:', error)
    return generateFallbackAvatar(username, size) // Fallback para SVG
  }
}

/**
 * Lista de avatares padrão do VRChat como fallback
 */
const VRCHAT_DEFAULT_AVATARS = [
  'https://assets.vrchat.com/www/images/default_user_icon.png',
  'https://assets.vrchat.com/www/images/default_user_icon_blue.png',
  'https://assets.vrchat.com/www/images/default_user_icon_green.png',
  'https://assets.vrchat.com/www/images/default_user_icon_purple.png',
  'https://assets.vrchat.com/www/images/default_user_icon_red.png'
]

/**
 * Seleciona um avatar padrão do VRChat baseado no usuário
 */
export const getVRChatFallbackAvatar = (username = 'U') => {
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  return VRCHAT_DEFAULT_AVATARS[Math.abs(hash) % VRCHAT_DEFAULT_AVATARS.length]
}

/**
 * Sistema de fallback em cascata
 */
export const getFallbackAvatarUrl = (username = 'U', preferredMethod = 'svg') => {
  switch (preferredMethod) {
    case 'canvas':
      return generateCanvasAvatar(username)
    case 'vrchat':
      return getVRChatFallbackAvatar(username)
    case 'svg':
    default:
      return generateFallbackAvatar(username)
  }
}

export default {
  generateFallbackAvatar,
  generateCanvasAvatar,
  getVRChatFallbackAvatar,
  getFallbackAvatarUrl
}
