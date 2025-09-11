import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon,
  UserIcon,
  ClockIcon,
  GlobeAltIcon,
  MapPinIcon,
  InformationCircleIcon,
  PhotoIcon,
  TagIcon,
  ShieldCheckIcon,
  LinkIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

const FriendDetailsModal = ({ friend, isOpen, onClose }) => {
  if (!friend || !isOpen) return null

  const getStatusInfo = (status) => {
    switch (status) {
      case 'online':
        return { color: 'bg-green-500', pulse: true, text: 'Online', textColor: 'text-green-400', bgColor: 'bg-green-500/10' }
      case 'join me':
        return { color: 'bg-purple-500', pulse: true, text: 'Me Junte', textColor: 'text-purple-400', bgColor: 'bg-purple-500/10' }
      case 'ask me':
        return { color: 'bg-yellow-500', pulse: true, text: 'Me Pergunte', textColor: 'text-yellow-400', bgColor: 'bg-yellow-500/10' }
      case 'active':
        return { color: 'bg-blue-500', pulse: false, text: 'Ativo', textColor: 'text-blue-400', bgColor: 'bg-blue-500/10' }
      case 'busy':
        return { color: 'bg-orange-500', pulse: false, text: 'Ocupado', textColor: 'text-orange-400', bgColor: 'bg-orange-500/10' }
      default:
        return { color: 'bg-gray-500', pulse: false, text: 'Offline', textColor: 'text-gray-500', bgColor: 'bg-gray-500/10' }
    }
  }

  const statusInfo = getStatusInfo(friend.status)
  const displayName = friend.displayName || friend.username || 'Nome não disponível'
  
  const getAvatarUrl = () => {
    const urls = [
      friend.currentAvatarImageUrl,
      friend.currentAvatarThumbnailImageUrl,
      friend.profilePicOverride,
      friend.userIcon,
      'https://d348imysud55la.cloudfront.net/icons/default_user_icon.png'
    ].filter(Boolean)
    
    return urls[0] || 'https://d348imysud55la.cloudfront.net/icons/default_user_icon.png'
  }
  
  const avatarUrl = getAvatarUrl()
  
  // Função para extrair nome do mundo
  const parseWorldLocation = (location) => {
    if (!location || location === 'offline') return 'Offline'
    if (location === 'private') return 'Mundo Privado'
    
    try {
      const knownWorlds = {
        'wrld_4432ea9b-729c-46e3-8eaf-846aa0a37fdd': 'The Great Pug',
        'wrld_6caf5200-70ac-4b8a-aa8d-89c0d5317530': 'Club Orion',
        'wrld_858dfdfc-1b48-4e1e-8a43-f0edc611e5fe': 'Murder 4',
        'wrld_ba913a96-fac4-4048-a062-9aa5db092812': 'The Black Cat'
      }
      
      let worldId = null
      let instanceInfo = ''
      
      if (location.includes('wrld_')) {
        const parts = location.split(':')
        worldId = parts[0]
        
        if (parts.length > 1) {
          const instancePart = parts[1]
          if (instancePart.includes('~public')) instanceInfo = ' (Público)'
          else if (instancePart.includes('~friends')) instanceInfo = ' (Amigos)'
          else if (instancePart.includes('~invite')) instanceInfo = ' (Apenas Convite)'
          else if (instancePart.includes('~group')) instanceInfo = ' (Grupo)'
          else if (instancePart.includes('~private')) instanceInfo = ' (Privado)'
        }
        
        const knownName = knownWorlds[worldId]
        if (knownName) return knownName + instanceInfo
        
        if (worldId.includes('wrld_')) {
          const shortId = worldId.substring(5, 13)
          return `Mundo ${shortId.toUpperCase()}${instanceInfo}`
        }
      }
      
      return location.length > 35 ? location.substring(0, 35) + '...' : location || 'Mundo Desconhecido'
    } catch (error) {
      return location.length > 35 ? location.substring(0, 35) + '...' : location
    }
  }
  
  const worldLocation = parseWorldLocation(friend.location)
  
  // Função para formatar tags
  const formatTag = (tag) => {
    return tag
      .replace('system_', '')
      .replace('language_', 'Idioma: ')
      .replace('_', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'Não disponível'
    return new Date(dateString).toLocaleString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Função para detectar e formatar idiomas com bandeiras
  const getLanguageInfo = (tags) => {
    if (!tags || !Array.isArray(tags)) return []
    
    const languageMap = {
      'language_eng': { 
        name: 'English', 
        code: 'EN',
        flag: (
          <svg className="w-5 h-5" viewBox="0 0 24 16" fill="none">
            <rect width="24" height="16" fill="#012169"/>
            <path d="M0 0l24 16M24 0L0 16" stroke="#ffffff" strokeWidth="1.6"/>
            <path d="M10 0v16M0 5.33h24M0 10.67h24" stroke="#ffffff" strokeWidth="0.8"/>
            <path d="M0 0l24 16M24 0L0 16" stroke="#C8102E" strokeWidth="0.8"/>
            <path d="M12 0v16M0 8h24" stroke="#C8102E" strokeWidth="1.6"/>
          </svg>
        )
      },
      'language_por': { 
        name: 'Português', 
        code: 'PT',
        flag: (
          <svg className="w-5 h-5" viewBox="0 0 24 16" fill="none">
            <rect width="24" height="16" fill="#009639"/>
            <rect x="0" width="9.6" height="16" fill="#009639"/>
            <polygon points="9.6,0 24,8 9.6,16" fill="#FEDD00"/>
            <circle cx="10.8" cy="8" r="2.4" fill="#012169"/>
          </svg>
        )
      },
      'language_esp': { 
        name: 'Español', 
        code: 'ES',
        flag: (
          <svg className="w-5 h-5" viewBox="0 0 24 16" fill="none">
            <rect width="24" height="16" fill="#C60B1E"/>
            <rect y="4" width="24" height="8" fill="#FFC400"/>
          </svg>
        )
      },
      'language_fra': { 
        name: 'Français', 
        code: 'FR',
        flag: (
          <svg className="w-5 h-5" viewBox="0 0 24 16" fill="none">
            <rect width="8" height="16" fill="#002395"/>
            <rect x="8" width="8" height="16" fill="#ffffff"/>
            <rect x="16" width="8" height="16" fill="#ED2939"/>
          </svg>
        )
      },
      'language_jpn': { 
        name: '日本語', 
        code: 'JP',
        flag: (
          <svg className="w-5 h-5" viewBox="0 0 24 16" fill="none">
            <rect width="24" height="16" fill="#ffffff"/>
            <circle cx="12" cy="8" r="4.8" fill="#BC002D"/>
          </svg>
        )
      },
    }

    const languages = []
    
    tags.forEach(tag => {
      if (tag.startsWith('language_') && languageMap[tag]) {
        languages.push(languageMap[tag])
      }
    })

    return languages
  }

  // Função para formatar links sociais
  const formatSocialLink = (url) => {
    if (!url) return null

    const socialPlatforms = {
      'discord.com': {
        name: 'Discord',
        color: 'text-indigo-400 hover:text-indigo-300',
        bgColor: 'bg-indigo-500/10 hover:bg-indigo-500/20',
        borderColor: 'border-indigo-500/30',
        displayName: 'Discord',
      },
      'instagram.com': {
        name: 'Instagram',
        color: 'text-pink-400 hover:text-pink-300',
        bgColor: 'bg-pink-500/10 hover:bg-pink-500/20',
        borderColor: 'border-pink-500/30',
        extractUsername: (url) => {
          const match = url.match(/instagram\.com\/([^/?]+)/)
          return match ? `@${match[1]}` : 'Instagram'
        }
      },
      'twitter.com': {
        name: 'Twitter',
        color: 'text-blue-400 hover:text-blue-300',
        bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
        borderColor: 'border-blue-500/30',
        extractUsername: (url) => {
          const match = url.match(/twitter\.com\/([^/?]+)/)
          return match ? `@${match[1]}` : 'Twitter'
        }
      },
    }

    const domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
    
    let platform = null
    for (const [key, value] of Object.entries(socialPlatforms)) {
      if (domain.includes(key)) {
        platform = { ...value, domain: key }
        break
      }
    }

    if (!platform) {
      platform = {
        name: 'Link Externo',
        color: 'text-gray-400 hover:text-gray-300',
        bgColor: 'bg-gray-500/10 hover:bg-gray-500/20',
        borderColor: 'border-gray-500/30',
        displayName: domain.length > 20 ? domain.substring(0, 20) + '...' : domain
      }
    }

    let displayName = platform.displayName
    if (platform.extractUsername) {
      displayName = platform.extractUsername(url)
    }
    if (!displayName) {
      displayName = platform.name
    }

    return {
      url,
      platform: platform.name,
      displayName,
      color: platform.color,
      bgColor: platform.bgColor,
      borderColor: platform.borderColor
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-20 h-20 rounded-full object-cover bg-gray-600"
                    onError={(e) => {
                      if (e.target.src !== 'https://d348imysud55la.cloudfront.net/icons/default_user_icon.png') {
                        e.target.src = 'https://d348imysud55la.cloudfront.net/icons/default_user_icon.png'
                      }
                    }}
                  />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-800 ${statusInfo.color} ${
                    statusInfo.pulse ? 'animate-pulse' : ''
                  }`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{displayName}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.textColor} ${statusInfo.bgColor} border border-current border-opacity-20`}>
                      {statusInfo.text}
                    </span>
                    {friend.developerType && friend.developerType !== 'none' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-orange-400 bg-orange-500/10 border border-orange-500/20">
                        Developer
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            
            {/* Status & Description */}
            {(friend.statusDescription || worldLocation !== 'Offline') && (
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <InformationCircleIcon className="w-5 h-5 mr-2 text-blue-400" />
                  Status Atual
                </h3>
                <div className="space-y-2">
                  {friend.statusDescription && (
                    <div>
                      <p className="text-sm text-gray-400">Descrição:</p>
                      <p className="text-white">{friend.statusDescription}</p>
                    </div>
                  )}
                  {worldLocation && worldLocation !== 'Offline' && (
                    <div>
                      <p className="text-sm text-gray-400">Localização:</p>
                      <p className="text-white flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-2 text-green-400" />
                        {worldLocation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bio */}
            {friend.bio && (
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-purple-400" />
                  Biografia
                </h3>
                <div className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                  {friend.bio}
                </div>
              </div>
            )}

            {/* Idiomas */}
            {(() => {
              const languages = getLanguageInfo(friend.tags)
              return languages.length > 0 && (
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center">
                    <GlobeAltIcon className="w-5 h-5 mr-2 text-green-400" />
                    Idiomas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400"
                        title={lang.name}
                      >
                        {lang.flag}
                        <span className="text-sm font-medium">{lang.code}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Bio Links */}
            {friend.bioLinks && friend.bioLinks.length > 0 && (
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <LinkIcon className="w-5 h-5 mr-2 text-blue-400" />
                  Links Sociais
                </h3>
                <div className="flex flex-wrap gap-2">
                  {friend.bioLinks.map((link, index) => {
                    const socialLink = formatSocialLink(link)
                    if (!socialLink) return null
                    
                    return (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${socialLink.bgColor} ${socialLink.borderColor} ${socialLink.color}`}
                        title={`${socialLink.platform}: ${socialLink.displayName}`}
                      >
                        <span className="text-sm font-medium">{socialLink.displayName}</span>
                      </a>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Avatar Atual */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <PhotoIcon className="w-5 h-5 mr-2 text-green-400" />
                Avatar Atual
              </h3>
              <div className="flex items-center space-x-4">
                {friend.currentAvatarThumbnailImageUrl && (
                  <img
                    src={friend.currentAvatarThumbnailImageUrl}
                    alt="Avatar atual"
                    className="w-16 h-16 rounded-lg object-cover bg-gray-600"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                )}
                <div className="flex-1">
                  {friend.currentAvatarTags && friend.currentAvatarTags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {friend.currentAvatarTags.slice(0, 5).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                          {formatTag(tag)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">Avatar personalizado</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tags do Sistema */}
            {friend.tags && (() => {
              const systemTags = friend.tags.filter(tag => 
                (tag.includes('trust_') || tag.includes('_access')) && 
                !tag.includes('language_')
              )
              
              return systemTags.length > 0 && (
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center">
                    <ShieldCheckIcon className="w-5 h-5 mr-2 text-yellow-400" />
                    Trust & Acesso
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {systemTags.map((tag, index) => {
                      const isTrust = tag.includes('trust_')
                      const isAccess = tag.includes('_access')
                      
                      let colorClass = 'bg-gray-600/30 text-gray-300 border-gray-500/30'
                      if (isTrust) colorClass = 'bg-green-600/20 text-green-300 border-green-500/30'
                      else if (isAccess) colorClass = 'bg-purple-600/20 text-purple-300 border-purple-500/30'
                      
                      return (
                        <span key={index} className={`px-3 py-1 text-sm rounded-lg border ${colorClass}`}>
                          {formatTag(tag)}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

            {/* Atividade */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2 text-orange-400" />
                Atividade
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Última atividade:</span>
                  <span className="text-white">{formatDate(friend.last_activity)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Último login:</span>
                  <span className="text-white">{formatDate(friend.last_login)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Plataforma:</span>
                  <span className="text-white">
                    {friend.last_platform?.replace('standalonewindows', 'PC') || 'Desconhecida'}
                  </span>
                </div>
              </div>
            </div>

            {/* ID do Usuário */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <Cog6ToothIcon className="w-5 h-5 mr-2 text-gray-400" />
                ID do Usuário
              </h3>
              <div className="text-sm">
                <p className="text-gray-400 mb-1">User ID:</p>
                <p className="text-white font-mono text-xs bg-gray-800/50 p-2 rounded break-all">
                  {friend.id}
                </p>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 bg-gray-800/50">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default FriendDetailsModal
