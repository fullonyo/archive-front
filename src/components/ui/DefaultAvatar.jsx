import React, { useState, useEffect } from 'react'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { generateFallbackAvatar } from '../../utils/avatarFallback'

const DefaultAvatar = ({ username, size = 'md', className = '', preferSvg = true }) => {
  const [avatarUrl, setAvatarUrl] = useState(null)

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-32 h-32 text-3xl'
  }

  const getSizeInPixels = (size) => {
    const sizeMap = {
      sm: 32,
      md: 48,
      lg: 64,
      xl: 80,
      '2xl': 128
    }
    return sizeMap[size] || 48
  }

  useEffect(() => {
    if (preferSvg && username) {
      const sizeInPixels = getSizeInPixels(size)
      const svgUrl = generateFallbackAvatar(username, sizeInPixels)
      setAvatarUrl(svgUrl)
    }
  }, [username, size, preferSvg])

  // Se preferir SVG e temos uma URL, mostrar a imagem
  if (preferSvg && avatarUrl) {
    return (
      <div className={`${sizeClasses[size]} ${className} ${className.includes('rounded-none') ? 'rounded-none' : 'rounded-xl'} overflow-hidden flex-shrink-0 shadow-lg border border-white/10`}>
        <img 
          src={avatarUrl} 
          alt={username} 
          className="w-full h-full object-cover"
          onError={() => setAvatarUrl(null)} // Fallback para modo CSS se SVG falhar
        />
      </div>
    )
  }

  // Gerar cor baseada no username de forma mais robusta
  const getAvatarColor = (name) => {
    if (!name || typeof name !== 'string') return 'bg-gray-600'
    
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-green-500 to-green-600', 
      'bg-gradient-to-br from-yellow-500 to-yellow-600',
      'bg-gradient-to-br from-red-500 to-red-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-teal-500 to-teal-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-cyan-500 to-cyan-600'
    ]
    
    // Hash mais robusto
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return colors[Math.abs(hash) % colors.length]
  }

  // Pegar iniciais do username de forma mais robusta
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '?'
    
    const cleanName = name.trim()
    if (cleanName.length === 0) return '?'
    
    // Handle special cases like 'sistema'
    if (cleanName.toLowerCase() === 'sistema') return 'SYS'
    
    const words = cleanName.split(/\s+/).filter(word => word.length > 0)
    
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
    } else if (cleanName.length >= 2) {
      return cleanName.slice(0, 2).toUpperCase()
    } else {
      return cleanName[0].toUpperCase()
    }
  }

  const colorClass = getAvatarColor(username)
  const initials = getInitials(username)

  return (
    <div className={`${sizeClasses[size]} ${colorClass} ${className} ${className.includes('rounded-none') ? 'rounded-none' : 'rounded-xl'} flex items-center justify-center flex-shrink-0 shadow-lg border border-white/10`}>
      <span className="font-bold text-white select-none drop-shadow-lg">
        {initials}
      </span>
    </div>
  )
}

export default DefaultAvatar
