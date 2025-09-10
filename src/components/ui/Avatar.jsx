import React from 'react'
import { useAvatarLoader } from '../../hooks/useAvatarLoader'
import DefaultAvatar from './DefaultAvatar'

/**
 * Componente Avatar robusto com carregamento e fallback
 */
const Avatar = ({ 
  avatarUrl, 
  username = 'User', 
  size = 'md', 
  className = '', 
  userId = null,
  instanceId = '',
  ...props 
}) => {
  try {
    const { imageUrl, showImage, isLoading, hasError, onLoad, onError } = useAvatarLoader(
      avatarUrl, 
      username, 
      instanceId || `${userId ? `user-${userId}` : 'default'}-${size}`
    )

    // Gerar key única baseada em userId e avatarUrl (sem Date.now() para evitar re-renders infinitos)
    const imageKey = `avatar-${userId || 'anonymous'}-${avatarUrl ? btoa(avatarUrl).slice(0, 10) : 'nourl'}`

    const sizeClasses = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
      xl: 'w-16 h-16 text-lg',
      '2xl': 'w-32 h-32 text-4xl'
    }

    const avatarSize = sizeClasses[size] || sizeClasses.md
    
    // Extract text size for DefaultAvatar
    const textSizeMatch = avatarSize.match(/text-\w+/)
    const textSize = textSizeMatch ? textSizeMatch[0] : 'text-sm'

    return (
      <div className={`relative ${avatarSize} ${className}`} {...props}>
        {/* Imagem do avatar - só renderizar se temos uma URL válida */}
        {showImage && imageUrl && !hasError && (
          <img
            key={imageKey}
            src={imageUrl}
            alt={username || 'Avatar'}
            className={`w-full h-full object-cover ${className.includes('w-full h-full') ? 'rounded-none' : 'rounded-xl'} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            onLoad={() => {
              onLoad()
            }}
            onError={(e) => {
              onError()
            }}
            style={{ display: 'block' }}
          />
        )}
        
        {/* Avatar padrão como fallback - sempre presente */}
        <DefaultAvatar
          username={username}
          size={size}
          className={`w-full h-full ring-0 ${showImage && !isLoading && !hasError ? 'hidden' : 'flex'} ${textSize} ${className.includes('w-full h-full') ? 'rounded-none' : ''}`}
        />
        
        {/* Loading indicator */}
        {isLoading && showImage && !hasError && (
          <div className={`absolute inset-0 bg-gray-800/50 ${className.includes('w-full h-full') ? 'rounded-none' : 'rounded-xl'} flex items-center justify-center`}>
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error(`Avatar component error for ${username}:`, error)
    
    // Fallback completo em caso de erro
    return (
      <div className={`relative ${className}`} {...props}>
        <DefaultAvatar
          username={username}
          size={size}
          className="w-full h-full"
        />
      </div>
    )
  }
}

export default Avatar
