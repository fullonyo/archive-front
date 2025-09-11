import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useVRChatAPI } from '../hooks/useVRChatAPI'
import { 
  LinkIcon,
  GlobeAltIcon,
  UserIcon,
  HeartIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  UserGroupIcon,
  MapIcon,
  ChartBarIcon,
  ClockIcon,
  PhotoIcon,
  CameraIcon,
  PlayIcon,
  XMarkIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

const VRChatAPIPage = () => {
  const { user } = useAuth()
  const {
    status,
    connection,
    loading,
    error,
    twoFARequired,
    pendingCredentials,
    isConnected,
    isConnecting,
    isDisconnected,
    hasError,
    needs2FA,
    rateLimited,
    initiateConnection,
    complete2FAConnection,
    disconnect,
    clearError,
    refresh,
    updateAuth,
    getFriends,
    getRecentWorlds,
    getStats,
    getDashboardData
  } = useVRChatAPI()

  const [showLoginForm, setShowLoginForm] = useState(false)
  const [loginData, setLoginData] = useState({ username: '', password: '', twoFactorAuth: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Estados para os dados
  const [dashboardData, setDashboardData] = useState(null)
  const [loadingDashboard, setLoadingDashboard] = useState(false)
  const [activeSection, setActiveSection] = useState('feed')
  const [friendsRefreshInterval, setFriendsRefreshInterval] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)
  
  // Estados para o modal de detalhes do amigo
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [showFriendModal, setShowFriendModal] = useState(false)

  // Auto-refresh amigos a cada 30 segundos quando conectado
  useEffect(() => {
    if (isConnected && !friendsRefreshInterval) {
      const interval = setInterval(async () => {
        try {
          const friendsResult = await getFriends()
          if (friendsResult.success && dashboardData) {
            setDashboardData(prev => ({
              ...prev,
              friends: friendsResult.data
            }))
            setLastRefresh(new Date())
          }
        } catch (error) {
          console.error('Erro no auto-refresh:', error)
        }
      }, 30000) // 30 segundos
      
      setFriendsRefreshInterval(interval)
    }

    return () => {
      if (friendsRefreshInterval) {
        clearInterval(friendsRefreshInterval)
        setFriendsRefreshInterval(null)
      }
    }
  }, [isConnected, getFriends, dashboardData, friendsRefreshInterval])

  // Carrega dados do dashboard quando conectado
  useEffect(() => {
    if (isConnected && !dashboardData) {
      loadDashboardData()
    }
  }, [isConnected, dashboardData])

  const loadDashboardData = async () => {
    if (loadingDashboard) return
    
    console.log('🔄 loadDashboardData: Iniciando carregamento...')
    setLoadingDashboard(true)
    try {
      const result = await getDashboardData()
      console.log('📦 loadDashboardData: Resultado completo:', result)
      
      if (result.success) {
        console.log('✅ loadDashboardData: Dados recebidos:', result.data)
        console.log('👥 loadDashboardData: Friends data:', result.data.friends)
        console.log('🌍 loadDashboardData: Recent worlds:', result.data.recentWorlds)
        
        setDashboardData(result.data)
        setLastRefresh(new Date())
      } else {
        console.error('❌ loadDashboardData: Falha:', result.error)
      }
    } catch (error) {
      console.error('❌ loadDashboardData: Erro ao carregar dashboard:', error)
    } finally {
      setLoadingDashboard(false)
    }
  }

  const handleConnect = async (e) => {
    e.preventDefault()
    
    if (!loginData.username || !loginData.password) return

    if (isSubmitting || loading) return

    setIsSubmitting(true)
    
    try {
      const result = await initiateConnection(loginData.username, loginData.password)
      
      if (result.success) {
        setShowLoginForm(false)
        setLoginData({ username: '', password: '', twoFactorAuth: '' })
      } else if (result.requires2FA) {
        setLoginData(prev => ({ ...prev, twoFactorAuth: '' }))
      }
    } catch (error) {
      console.error('Erro ao conectar:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handle2FASubmit = async (e) => {
    e.preventDefault()
    
    if (!loginData.twoFactorAuth) return

    if (isSubmitting || loading) return

    setIsSubmitting(true)
    
    try {
      const result = await complete2FAConnection(loginData.twoFactorAuth)
      
      if (result.success) {
        setShowLoginForm(false)
        setLoginData({ username: '', password: '', twoFactorAuth: '' })
      }
    } catch (error) {
      console.error('Erro no 2FA:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDisconnect = async () => {
    const result = await disconnect()
    if (result.success) {
      setDashboardData(null)
      setLastRefresh(null)
      if (friendsRefreshInterval) {
        clearInterval(friendsRefreshInterval)
        setFriendsRefreshInterval(null)
      }
    }
  }

  // Função para abrir modal de detalhes do amigo
  const openFriendModal = (friend) => {
    console.log('👤 Abrindo modal do amigo:', friend)
    setSelectedFriend(friend)
    setShowFriendModal(true)
  }

  // Função para fechar modal
  const closeFriendModal = () => {
    setSelectedFriend(null)
    setShowFriendModal(false)
  }

  // Função para extrair nome do mundo da localização VRChat
  const parseWorldLocation = (location) => {
    if (!location || location === 'offline') {
      return 'Offline'
    }
    
    if (location === 'private') {
      return 'Mundo Privado'
    }
    
    // VRChat location format: wrld_id:instance~type(users)
    // Exemplo: "wrld_4432ea9b-729c-46e3-8eaf-846aa0a37fdd:12345~friends(usr_example)"
    try {
      // Mundos conhecidos/populares - mapeamento mais extenso
      const knownWorlds = {
        'wrld_4432ea9b-729c-46e3-8eaf-846aa0a37fdd': 'The Great Pug',
        'wrld_6caf5200-70ac-4b8a-aa8d-89c0d5317530': 'Club Orion',
        'wrld_858dfdfc-1b48-4e1e-8a43-f0edc611e5fe': 'Murder 4',
        'wrld_ba913a96-fac4-4048-a062-9aa5db092812': 'The Black Cat',
        'wrld_4cf554b4-430c-4f8f-b53e-1f294eed230b': 'Furhub',
        'wrld_b1df8b52-2ca5-4d86-9c73-c4c3c5daa5e9': 'Japan Shrine',
        'wrld_32f2d0b7-6bb3-4e0c-9a8e-4e7c4f8e5c5c': 'VRChat Home',
        'wrld_68d8cea6-de7c-4f82-a9b0-8e6c8d8f9e1a': 'Tutorial World',
        'wrld_b1e8c9a2-7d3f-4e5b-9c8a-1f2e3d4c5b6a': 'Drinking Night',
        'wrld_5e8f9d2c-4b3a-1e9f-8c7d-2a3b4c5d6e7f': 'Movie & Chill'
      }
      
      // Extrai o world ID da localização
      let worldId = null
      let instanceInfo = ''
      
      if (location.includes('wrld_')) {
        // Separa o world ID do resto
        const parts = location.split(':')
        worldId = parts[0]
        
        // Extrai informações da instância
        if (parts.length > 1) {
          const instancePart = parts[1]
          
          // Detecta tipo de instância
          if (instancePart.includes('~public')) {
            instanceInfo = ' (Público)'
          } else if (instancePart.includes('~friends')) {
            instanceInfo = ' (Amigos)'
          } else if (instancePart.includes('~invite')) {
            instanceInfo = ' (Apenas Convite)'
          } else if (instancePart.includes('~group')) {
            instanceInfo = ' (Grupo)'
          } else if (instancePart.includes('~private')) {
            instanceInfo = ' (Privado)'
          }
        }
        
        // Verifica se é um mundo conhecido
        const knownName = knownWorlds[worldId]
        if (knownName) {
          return knownName + instanceInfo
        }
        
        // Se não é conhecido, cria nome baseado no ID
        if (worldId.includes('wrld_')) {
          const shortId = worldId.substring(5, 13) // Pega 8 caracteres após 'wrld_'
          return `Mundo ${shortId.toUpperCase()}${instanceInfo}`
        }
      }
      
      // Casos especiais para outras strings de localização
      if (location.includes('tutorial')) {
        return 'Tutorial World'
      }
      
      if (location.includes('home')) {
        return 'VRChat Home'
      }
      
      // Se não conseguir parsear, limpa e retorna versão mais legível
      const cleanLocation = location
        .replace(/wrld_[a-f0-9-]+/g, 'Mundo')
        .replace(/:[0-9]+/g, '')
        .replace(/~[^(]+/g, '')
        .replace(/\([^)]+\)/g, '')
        .trim()
      
      return cleanLocation.length > 35 ? cleanLocation.substring(0, 35) + '...' : cleanLocation || 'Mundo Desconhecido'
      
    } catch (error) {
      console.warn('Erro ao parsear localização:', error)
      return location.length > 35 ? location.substring(0, 35) + '...' : location
    }
  }

  // Função para ordenar amigos por status (online primeiro, offline por último)
  const sortFriendsByStatus = (friends) => {
    if (!friends || !Array.isArray(friends)) {
      console.log('🔍 sortFriendsByStatus: friends não é array válido:', friends)
      return []
    }
    
    console.log('🔄 sortFriendsByStatus: Ordenando', friends.length, 'amigos')
    console.log('🔍 Status originais:', friends.map(f => ({ name: f.displayName, status: f.status })))
    
    const statusPriority = {
      'online': 1,
      'join me': 2,
      'ask me': 3,
      'active': 4,
      'busy': 5,
      'offline': 10
    }
    
    const sortedFriends = [...friends].sort((a, b) => {
      const priorityA = statusPriority[a.status] || 10
      const priorityB = statusPriority[b.status] || 10
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }
      
      // Se mesmo status, ordena alfabeticamente
      return a.displayName.localeCompare(b.displayName)
    })
    
    console.log('✅ Amigos ordenados:', sortedFriends.map(f => ({ name: f.displayName, status: f.status, priority: statusPriority[f.status] || 10 })))
    
    return sortedFriends
  }

  // Calcula estatísticas dos amigos
  const getFriendsStats = (friends) => {
    if (!friends || !Array.isArray(friends)) {
      console.log('🔍 getFriendsStats: friends não é array válido:', friends)
      return { online: 0, offline: 0, total: 0 }
    }
    
    console.log('📊 getFriendsStats: Analisando', friends.length, 'amigos')
    console.log('📊 Status dos amigos:', friends.map(f => ({ name: f.displayName, status: f.status })))
    
    const online = friends.filter(f => ['online', 'join me', 'ask me', 'active', 'busy'].includes(f.status)).length
    const offline = friends.filter(f => f.status === 'offline').length
    
    const stats = { online, offline, total: friends.length }
    console.log('📊 Estatísticas calculadas:', stats)
    
    return stats
  }

  // Componente de amigo individual
  const FriendCard = ({ friend }) => {
    if (!friend) {
      console.warn('⚠️ FriendCard: friend object é null/undefined')
      return null
    }
    
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
    
    // Melhor fallback para avatares
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
    const worldLocation = parseWorldLocation(friend.location)
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        onClick={() => openFriendModal(friend)}
        className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-all duration-200 cursor-pointer ${
          friend.status === 'offline' ? 'bg-gray-800/30' : 'bg-gray-800/50'
        }`}
      >
        <div className="relative flex-shrink-0">
          <img
            src={avatarUrl}
            alt={displayName}
            className={`w-12 h-12 rounded-full object-cover bg-gray-600 transition-opacity ${
              friend.status === 'offline' ? 'opacity-60' : 'opacity-100'
            }`}
            onError={(e) => {
              // Fallback silencioso para imagens
              if (e.target.src !== 'https://d348imysud55la.cloudfront.net/icons/default_user_icon.png') {
                e.target.src = 'https://d348imysud55la.cloudfront.net/icons/default_user_icon.png'
              } else {
                // Se mesmo o fallback falhar, usar SVG inline
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzc0MTUxIiByeD0iMjAiLz48cGF0aCBkPSJNMjAgMTBDMTUuNTg4IDEwIDEyIDEzLjU4OCAxMiAxOFMxNS41ODggMjYgMjAgMjZTMjggMjIuNDEyIDI4IDE4UzI0LjQxMiAxMCAyMCAxMFpNMjAgMjJDMTcuNzkgMjIgMTYgMjAuMjEgMTYgMThTMTcuNzkgMTQgMjAgMTRTMjQgMTUuNzkgMjQgMThTMjIuMjEgMjIgMjAgMjJaIiBmaWxsPSIjNkI3MjgwIi8+PC9zdmc+'
              }
            }}
          />
          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${statusInfo.color} ${
            statusInfo.pulse ? 'animate-pulse' : ''
          }`} />
        </div>
        
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate mb-1 ${
                friend.status === 'offline' ? 'text-gray-400' : 'text-white'
              }`}>
                {displayName}
              </p>
              
              {/* Status description */}
              {friend.statusDescription && (
                <p className={`text-xs truncate mb-1 ${
                  friend.status === 'offline' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {friend.statusDescription}
                </p>
              )}
              
              {/* World location */}
              {worldLocation && worldLocation !== 'offline' && worldLocation !== 'private' && (
                <p className="text-gray-500 text-xs truncate flex items-center">
                  <span className="mr-1">📍</span>
                  {worldLocation}
                </p>
              )}
            </div>
            
            {/* Status badge fixo na direita */}
            <div className="flex-shrink-0 ml-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.textColor} ${statusInfo.bgColor} border border-current border-opacity-20`}>
                {statusInfo.text}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Componente mundo
  const WorldCard = ({ world }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors cursor-pointer"
    >
      <div className="aspect-video bg-gray-700 relative">
        <img
          src={world.imageUrl}
          alt={world.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMzc0MTUxIi8+PHBhdGggZD0iTTEwMCA0MEM4Ni4xOSA0MCA3NSA1MS4xOSA3NSA2NVM4Ni4xOSA4NSAxMDAgODVTMTI1IDczLjgxIDEyNSA2MFMxMTMuODEgNDAgMTAwIDQwWk0xMDAgNzVDOTEuNzIgNzUgODUgNjguMjggODUgNjBTOTEuNzIgNDUgMTAwIDQ1UzExNSA1MS43MiAxMTUgNjBTMTA4LjI4IDc1IDEwMCA3NVoiIGZpbGw9IiM2QjcyODAiLz48L3N2Zz4='
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-white text-sm font-medium truncate">{world.name}</p>
          <p className="text-gray-300 text-xs">por {world.authorName}</p>
        </div>
      </div>
    </motion.div>
  )

  // Componente do Modal de Detalhes do Amigo
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

    // Função para detectar e formatar idiomas com bandeiras SVG
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
        'language_deu': { 
          name: 'Deutsch', 
          code: 'DE',
          flag: (
            <svg className="w-5 h-5" viewBox="0 0 24 16" fill="none">
              <rect width="24" height="5.33" fill="#000000"/>
              <rect y="5.33" width="24" height="5.33" fill="#DD0000"/>
              <rect y="10.67" width="24" height="5.33" fill="#FFCE00"/>
            </svg>
          )
        },
        'language_ita': { 
          name: 'Italiano', 
          code: 'IT',
          flag: (
            <svg className="w-5 h-5" viewBox="0 0 24 16" fill="none">
              <rect width="8" height="16" fill="#009246"/>
              <rect x="8" width="8" height="16" fill="#ffffff"/>
              <rect x="16" width="8" height="16" fill="#CE2B37"/>
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
        'language_kor': { 
          name: '한국어', 
          code: 'KR',
          flag: (
            <svg className="w-5 h-5" viewBox="0 0 24 16" fill="none">
              <rect width="24" height="16" fill="#ffffff"/>
              <circle cx="12" cy="8" r="3.2" fill="#CD2E3A"/>
              <circle cx="12" cy="8" r="1.6" fill="#0047A0"/>
            </svg>
          )
        },
        'language_rus': { 
          name: 'Русский', 
          code: 'RU',
          flag: (
            <svg className="w-5 h-5" viewBox="0 0 24 16" fill="none">
              <rect width="24" height="5.33" fill="#ffffff"/>
              <rect y="5.33" width="24" height="5.33" fill="#0039A6"/>
              <rect y="10.67" width="24" height="5.33" fill="#D52B1E"/>
            </svg>
          )
        },
        'language_chn': { 
          name: '中文', 
          code: 'CN',
          flag: (
            <svg className="w-5 h-5" viewBox="0 0 24 16" fill="none">
              <rect width="24" height="16" fill="#DE2910"/>
              <polygon points="4,3 5,4 5,6 3,6 2,4" fill="#FFDE00"/>
              <polygon points="7,2 7.5,2.5 8,2 7.5,1.5" fill="#FFDE00"/>
              <polygon points="8,4 8.5,4.5 9,4 8.5,3.5" fill="#FFDE00"/>
              <polygon points="8,6 8.5,6.5 9,6 8.5,5.5" fill="#FFDE00"/>
              <polygon points="7,8 7.5,8.5 8,8 7.5,7.5" fill="#FFDE00"/>
            </svg>
          )
        },
        'language_nld': { 
          name: 'Nederlands', 
          code: 'NL',
          flag: (
            <svg className="w-5 h-5" viewBox="0 0 24 16" fill="none">
              <rect width="24" height="5.33" fill="#AE1C28"/>
              <rect y="5.33" width="24" height="5.33" fill="#ffffff"/>
              <rect y="10.67" width="24" height="5.33" fill="#21468B"/>
            </svg>
          )
        },
        'language_swe': { 
          name: 'Svenska', 
          code: 'SE',
          flag: (
            <svg className="w-5 h-5" viewBox="0 0 24 16" fill="none">
              <rect width="24" height="16" fill="#006AA7"/>
              <rect x="6" width="2" height="16" fill="#FECC00"/>
              <rect y="7" width="24" height="2" fill="#FECC00"/>
            </svg>
          )
        },
        'language_nor': { 
          name: 'Norsk', 
          code: 'NO',
          flag: (
            <svg className="w-5 h-5" viewBox="0 0 24 16" fill="none">
              <rect width="24" height="16" fill="#EF2B2D"/>
              <rect x="6" width="2" height="16" fill="#ffffff"/>
              <rect y="7" width="24" height="2" fill="#ffffff"/>
              <rect x="7" width="1" height="16" fill="#002868"/>
              <rect y="7.5" width="24" height="1" fill="#002868"/>
            </svg>
          )
        },
        'language_dan': { 
          name: 'Dansk', 
          code: 'DK',
          flag: (
            <svg className="w-5 h-5" viewBox="0 0 24 16" fill="none">
              <rect width="24" height="16" fill="#C60C30"/>
              <rect x="7" width="2" height="16" fill="#ffffff"/>
              <rect y="7" width="24" height="2" fill="#ffffff"/>
            </svg>
          )
        },
        'language_fin': { 
          name: 'Suomi', 
          code: 'FI',
          flag: (
            <svg className="w-5 h-5" viewBox="0 0 24 16" fill="none">
              <rect width="24" height="16" fill="#ffffff"/>
              <rect x="6" width="3" height="16" fill="#003580"/>
              <rect y="6.5" width="24" height="3" fill="#003580"/>
            </svg>
          )
        },
        'language_pol': { 
          name: 'Polski', 
          code: 'PL',
          flag: (
            <svg className="w-5 h-5" viewBox="0 0 24 16" fill="none">
              <rect width="24" height="8" fill="#ffffff"/>
              <rect y="8" width="24" height="8" fill="#DC143C"/>
            </svg>
          )
        }
      }

      const languages = []
      
      tags.forEach(tag => {
        if (tag.startsWith('language_') && languageMap[tag]) {
          languages.push(languageMap[tag])
        }
      })

      return languages
    }

    // Função inteligente para detectar e formatar links sociais
    const formatSocialLink = (url) => {
      if (!url) return null

      const socialPlatforms = {
        // Discord
        'discord.com': {
          name: 'Discord',
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 71 55" fill="currentColor">
              <g clipPath="url(#clip0)">
                <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
              </g>
            </svg>
          ),
          color: 'text-indigo-400 hover:text-indigo-300',
          bgColor: 'bg-indigo-500/10 hover:bg-indigo-500/20',
          borderColor: 'border-indigo-500/30',
          displayName: 'Discord',
        },
        'discordapp.com': {
          name: 'Discord',
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 71 55" fill="currentColor">
              <g clipPath="url(#clip0)">
                <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
              </g>
            </svg>
          ),
          color: 'text-indigo-400 hover:text-indigo-300',
          bgColor: 'bg-indigo-500/10 hover:bg-indigo-500/20',
          borderColor: 'border-indigo-500/30',
          displayName: 'Discord',
        },
        
        // Instagram
        'instagram.com': {
          name: 'Instagram',
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          ),
          color: 'text-pink-400 hover:text-pink-300',
          bgColor: 'bg-pink-500/10 hover:bg-pink-500/20',
          borderColor: 'border-pink-500/30',
          extractUsername: (url) => {
            const match = url.match(/instagram\.com\/([^/?]+)/)
            return match ? `@${match[1]}` : 'Instagram'
          }
        },
        
        // Twitch
        'twitch.tv': {
          name: 'Twitch',
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.149 0l-1.612 4.119v16.836h5.731v3.045h3.224l3.045-3.045h4.657l6.269-6.269v-14.686h-21.314zm19.164 13.612l-3.582 3.582h-5.731l-3.045 3.045v-3.045h-4.836v-15.045h17.194v11.463zm-3.582-9.253v6.789h-2.149v-6.789h2.149zm-5.731 0v6.789h-2.149v-6.789h2.149z"/>
            </svg>
          ),
          color: 'text-purple-400 hover:text-purple-300',
          bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
          borderColor: 'border-purple-500/30',
          extractUsername: (url) => {
            const match = url.match(/twitch\.tv\/([^/?]+)/)
            return match ? `@${match[1]}` : 'Twitch'
          }
        },
        
        // YouTube
        'youtube.com': {
          name: 'YouTube',
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          ),
          color: 'text-red-400 hover:text-red-300',
          bgColor: 'bg-red-500/10 hover:bg-red-500/20',
          borderColor: 'border-red-500/30',
          extractUsername: (url) => {
            const channelMatch = url.match(/youtube\.com\/@([^/?]+)/)
            const userMatch = url.match(/youtube\.com\/user\/([^/?]+)/)
            const channelIdMatch = url.match(/youtube\.com\/channel\/([^/?]+)/)
            
            if (channelMatch) return `@${channelMatch[1]}`
            if (userMatch) return `@${userMatch[1]}`
            if (channelIdMatch) return 'YouTube Channel'
            return 'YouTube'
          }
        },
        'youtu.be': {
          name: 'YouTube',
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          ),
          color: 'text-red-400 hover:text-red-300',
          bgColor: 'bg-red-500/10 hover:bg-red-500/20',
          borderColor: 'border-red-500/30',
          displayName: 'YouTube Video'
        },
        
        // Twitter/X
        'twitter.com': {
          name: 'Twitter',
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          ),
          color: 'text-blue-400 hover:text-blue-300',
          bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
          borderColor: 'border-blue-500/30',
          extractUsername: (url) => {
            const match = url.match(/twitter\.com\/([^/?]+)/)
            return match ? `@${match[1]}` : 'Twitter'
          }
        },
        'x.com': {
          name: 'X (Twitter)',
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          ),
          color: 'text-gray-400 hover:text-gray-300',
          bgColor: 'bg-gray-500/10 hover:bg-gray-500/20',
          borderColor: 'border-gray-500/30',
          extractUsername: (url) => {
            const match = url.match(/x\.com\/([^/?]+)/)
            return match ? `@${match[1]}` : 'X (Twitter)'
          }
        },
        
        // Spotify
        'open.spotify.com': {
          name: 'Spotify',
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          ),
          color: 'text-green-400 hover:text-green-300',
          bgColor: 'bg-green-500/10 hover:bg-green-500/20',
          borderColor: 'border-green-500/30',
          extractUsername: (url) => {
            if (url.includes('/user/')) {
              const match = url.match(/user\/([^/?]+)/)
              return match ? `@${match[1]}` : 'Perfil Spotify'
            }
            if (url.includes('/playlist/')) return 'Playlist Spotify'
            if (url.includes('/track/')) return 'Música Spotify'
            if (url.includes('/album/')) return 'Álbum Spotify'
            return 'Spotify'
          }
        },
        
        // TikTok
        'tiktok.com': {
          name: 'TikTok',
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          ),
          color: 'text-pink-400 hover:text-pink-300',
          bgColor: 'bg-pink-500/10 hover:bg-pink-500/20',
          borderColor: 'border-pink-500/30',
          extractUsername: (url) => {
            const match = url.match(/tiktok\.com\/@([^/?]+)/)
            return match ? `@${match[1]}` : 'TikTok'
          }
        },
        
        // Steam
        'steamcommunity.com': {
          name: 'Steam',
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.624 0 11.999-5.375 11.999-12S18.603.001 11.979.001zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54z"/>
            </svg>
          ),
          color: 'text-blue-400 hover:text-blue-300',
          bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
          borderColor: 'border-blue-500/30',
          extractUsername: (url) => {
            const profileMatch = url.match(/steamcommunity\.com\/profiles\/([^/?]+)/)
            const idMatch = url.match(/steamcommunity\.com\/id\/([^/?]+)/)
            
            if (idMatch) return `@${idMatch[1]}`
            if (profileMatch) return 'Perfil Steam'
            return 'Steam'
          }
        },
        
        // GitHub
        'github.com': {
          name: 'GitHub',
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          ),
          color: 'text-gray-400 hover:text-gray-300',
          bgColor: 'bg-gray-500/10 hover:bg-gray-500/20',
          borderColor: 'border-gray-500/30',
          extractUsername: (url) => {
            const match = url.match(/github\.com\/([^/?]+)/)
            return match ? `@${match[1]}` : 'GitHub'
          }
        },
        
        // Reddit
        'reddit.com': {
          name: 'Reddit',
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
            </svg>
          ),
          color: 'text-orange-400 hover:text-orange-300',
          bgColor: 'bg-orange-500/10 hover:bg-orange-500/20',
          borderColor: 'border-orange-500/30',
          extractUsername: (url) => {
            const userMatch = url.match(/reddit\.com\/u\/([^/?]+)/)
            const subredditMatch = url.match(/reddit\.com\/r\/([^/?]+)/)
            
            if (userMatch) return `u/${userMatch[1]}`
            if (subredditMatch) return `r/${subredditMatch[1]}`
            return 'Reddit'
          }
        },
        
        // LinkedIn
        'linkedin.com': {
          name: 'LinkedIn',
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          ),
          color: 'text-blue-600 hover:text-blue-500',
          bgColor: 'bg-blue-600/10 hover:bg-blue-600/20',
          borderColor: 'border-blue-600/30',
          extractUsername: (url) => {
            const match = url.match(/linkedin\.com\/in\/([^/?]+)/)
            return match ? `@${match[1]}` : 'LinkedIn'
          }
        },
        
        // VRChat
        'vrchat.com': {
          name: 'VRChat',
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          ),
          color: 'text-orange-400 hover:text-orange-300',
          bgColor: 'bg-orange-500/10 hover:bg-orange-500/20',
          borderColor: 'border-orange-500/30',
          displayName: 'VRChat Profile'
        }
      }

      // Detecta a plataforma pelo domínio
      const domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
      
      let platform = null
      for (const [key, value] of Object.entries(socialPlatforms)) {
        if (domain.includes(key)) {
          platform = { ...value, domain: key }
          break
        }
      }

      // Se não encontrou plataforma conhecida, usa padrão
      if (!platform) {
        platform = {
          name: 'Link Externo',
          icon: <LinkIcon className="w-5 h-5" />,
          color: 'text-gray-400 hover:text-gray-300',
          bgColor: 'bg-gray-500/10 hover:bg-gray-500/20',
          borderColor: 'border-gray-500/30',
          displayName: domain.length > 20 ? domain.substring(0, 20) + '...' : domain
        }
      }

      // Extrai nome de usuário se a plataforma suportar
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
        icon: platform.icon,
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
                          <MapIcon className="w-4 h-4 mr-2 text-green-400" />
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
                          <div className="flex-shrink-0">
                            {socialLink.icon}
                          </div>
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

              {/* Tags do Sistema - apenas trust levels e access */}
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

              {/* ID do Usuário - mais compacto */}
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

  // Se não estiver conectado, mostrar tela de login limpa
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <LinkIcon className="w-8 h-8 text-orange-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Conectar VRChat</h1>
            <p className="text-gray-400">Conecte sua conta para sincronizar dados</p>
          </div>

          {hasError && error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-6"
            >
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-400 text-sm font-medium">Erro na conexão</p>
                  <p className="text-red-300 text-xs mt-1">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {needs2FA ? (
            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Código de Verificação
                </label>
                <input
                  type="text"
                  value={loginData.twoFactorAuth}
                  onChange={(e) => setLoginData(prev => ({ ...prev, twoFactorAuth: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="Digite o código do seu email"
                  maxLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !loginData.twoFactorAuth}
                className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Verificando...' : 'Verificar Código'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email ou Username
                </label>
                <input
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !loginData.username || !loginData.password}
                className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Conectando...' : 'Conectar'}
              </button>
            </form>
          )}

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-400 text-sm font-medium">Autenticação Segura</p>
                <p className="text-blue-300 text-xs mt-1">
                  Suas credenciais são usadas apenas para autenticação e não são armazenadas.
                  Se você tem 2FA habilitado, será solicitado um código de verificação.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Layout principal quando conectado
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header minimalista */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <LinkIcon className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">VRChat</h1>
                <p className="text-xs text-gray-400">
                  {connection?.vrchatDisplayName} • {lastRefresh && `Atualizado ${new Date(lastRefresh).toLocaleTimeString()}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={loadDashboardData}
                disabled={loadingDashboard}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowPathIcon className={`w-4 h-4 ${loadingDashboard ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={handleDisconnect}
                className="text-sm text-gray-400 hover:text-red-400 transition-colors"
              >
                Desconectar
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
          
          {/* Sidebar esquerda - Navegação */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {[
                { id: 'feed', label: 'Feed', icon: UserIcon },
                { id: 'worlds', label: 'Mundos', icon: GlobeAltIcon },
                { id: 'stats', label: 'Estatísticas', icon: ChartBarIcon },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeSection === item.id
                        ? 'bg-orange-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Área central - Conteúdo principal */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeSection === 'feed' && (
                <motion.div
                  key="feed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Perfil Card */}
                  {connection && (
                    <div className="bg-gray-800 rounded-xl p-6">
                      <div className="flex items-center space-x-4">
                        <img
                          src={connection.vrchatAvatarUrl}
                          alt={connection.vrchatDisplayName}
                          className="w-16 h-16 rounded-full object-cover bg-gray-600"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzc0MTUxIiByeD0iMzIiLz48cGF0aCBkPSJNMzIgMTZDMjQuOTU4IDE2IDIwIDIxLjk1OCAyMCAzMlMyNC45NTggNDggMzIgNDhTNDQgNDIuMDQyIDQ0IDMyUzM5LjA0MiAxNiAzMiAxNlpNMzIgNDBDMjguNjg2IDQwIDI2IDM3LjMxNCAyNiAzNFMyOC42ODYgMjggMzIgMjhTMzggMzAuNjg2IDM4IDM0UzM1LjMxNCA0MCAzMiA0MFoiIGZpbGw9IiM2QjcyODAiLz48L3N2Zz4='
                          }}
                        />
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-white">{connection.vrchatDisplayName}</h2>
                          <p className="text-gray-400">@{connection.vrchatUsername}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              connection.vrchatStatus === 'online' ? 'bg-green-600 text-green-100' :
                              connection.vrchatStatus === 'active' ? 'bg-blue-600 text-blue-100' :
                              'bg-gray-600 text-gray-300'
                            }`}>
                              {connection.vrchatStatus === 'online' ? '🟢 Online' :
                               connection.vrchatStatus === 'active' ? '🔵 Ativo' :
                               '⚫ Offline'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Stats */}
                  {dashboardData?.stats && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <UserGroupIcon className="w-8 h-8 text-orange-400" />
                          <div>
                            <p className="text-2xl font-bold text-white">{dashboardData.stats.totalFriends}</p>
                            <p className="text-sm text-gray-400">Amigos</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <ClockIcon className="w-8 h-8 text-purple-400" />
                          <div>
                            <p className="text-2xl font-bold text-white">{dashboardData.stats.hoursPlayed}h</p>
                            <p className="text-sm text-gray-400">Jogadas</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mundos Recentes */}
                  {dashboardData?.recentWorlds?.worlds && (
                    <div className="bg-gray-800 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Mundos Recentes</h3>
                        {dashboardData.recentWorlds.mock !== undefined && (
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            dashboardData.recentWorlds.mock 
                              ? 'bg-yellow-600/30 text-yellow-300' 
                              : 'bg-green-600/30 text-green-300'
                          }`}>
                            {dashboardData.recentWorlds.mock ? '📋 Demo' : '🔗 Real'}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {dashboardData.recentWorlds.worlds.slice(0, 4).map((world, index) => (
                          <WorldCard key={index} world={world} />
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeSection === 'worlds' && (
                <motion.div
                  key="worlds"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Explorar Mundos</h2>
                    {dashboardData?.recentWorlds?.mock !== undefined && (
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        dashboardData.recentWorlds.mock 
                          ? 'bg-yellow-600/30 text-yellow-300 border border-yellow-500/50' 
                          : 'bg-green-600/30 text-green-300 border border-green-500/50'
                      }`}>
                        {dashboardData.recentWorlds.mock ? '📋 Dados Demo' : '🔗 Dados Reais'}
                      </div>
                    )}
                  </div>
                  
                  {dashboardData?.recentWorlds?.worlds && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                      {dashboardData.recentWorlds.worlds.map((world, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-750 transition-colors cursor-pointer"
                        >
                          <div className="aspect-video bg-gray-700 relative">
                            <img
                              src={world.imageUrl}
                              alt={world.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4">
                              <h3 className="text-white font-semibold text-lg mb-1">{world.name}</h3>
                              <p className="text-gray-300 text-sm mb-2">por {world.authorName}</p>
                              <p className="text-gray-400 text-xs">{world.description}</p>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between text-sm text-gray-400">
                              <span>Capacidade: {world.capacity}</span>
                              <span>{new Date(world.visitedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeSection === 'stats' && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-bold text-white">Estatísticas</h2>
                  
                  {dashboardData?.stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                      <div className="bg-gray-800 rounded-xl p-6">
                        <h3 className="text-white font-semibold mb-4">Atividade</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Horas Jogadas:</span>
                            <span className="text-purple-400 font-medium">{dashboardData.stats.hoursPlayed}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total de Fotos:</span>
                            <span className="text-pink-400 font-medium">{dashboardData.stats.totalPhotos}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Trust Rank:</span>
                            <span className="text-orange-400 font-medium">{dashboardData.stats.trustRank}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800 rounded-xl p-6">
                        <h3 className="text-white font-semibold mb-4">Conteúdo</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Amigos:</span>
                            <span className="text-orange-400 font-medium">{dashboardData.stats.totalFriends}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Mundos Visitados:</span>
                            <span className="text-blue-400 font-medium">{dashboardData.stats.totalWorlds}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Avatares:</span>
                            <span className="text-green-400 font-medium">{dashboardData.stats.totalAvatars}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800 rounded-xl p-6 sm:col-span-2">
                        <h3 className="text-white font-semibold mb-4">Informações da Conta</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Conta Criada:</span>
                            <span className="text-white">{new Date(dashboardData.stats.accountCreated).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Último Login:</span>
                            <span className="text-white">{new Date(dashboardData.stats.lastLogin).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar direita - Amigos */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-white">Amigos</h3>
                    {dashboardData?.friends?.friends && (() => {
                      const stats = getFriendsStats(dashboardData.friends.friends)
                      return stats.online > 0 && (
                        <div className="flex items-center space-x-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium">{stats.online}</span>
                        </div>
                      )
                    })()}
                  </div>
                  {dashboardData?.friends?.mock !== undefined && (
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      dashboardData.friends.mock 
                        ? 'bg-yellow-600/30 text-yellow-300' 
                        : 'bg-green-600/30 text-green-300'
                    }`}>
                      {dashboardData.friends.mock ? '📋 Mock' : '🔗 Real'}
                    </div>
                  )}
                </div>
                
                {/* Debug info - apenas em desenvolvimento */}
                {dashboardData?.friends && process.env.NODE_ENV === 'development' && (
                  <div className="mb-3 p-2 bg-gray-900/30 rounded text-xs text-gray-500 border-l-2 border-blue-500/30">
                    <div className="flex items-center justify-between">
                      <span>� {dashboardData.friends.total || 0} total | {dashboardData.friends.mock ? 'Mock' : 'Real'}</span>
                      <span>👥 {dashboardData.friends.friends?.length || 0} carregados</span>
                    </div>
                  </div>
                )}
                
                {/* Estatísticas dos amigos */}
                {dashboardData?.friends?.friends && (() => {
                  const stats = getFriendsStats(dashboardData.friends.friends)
                  return (
                    <div className="mb-4 p-4 bg-gradient-to-r from-gray-800/40 to-gray-700/40 rounded-lg border border-gray-700/30">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-white flex items-center">
                          <UserGroupIcon className="w-4 h-4 mr-2 text-blue-400" />
                          Amigos
                        </h4>
                        <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full">
                          {stats.total} total
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                            <span className="text-sm text-green-400 font-medium">Online</span>
                          </div>
                          <span className="text-sm text-white font-semibold">{stats.online}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-2.5 h-2.5 bg-gray-500 rounded-full"></div>
                            <span className="text-sm text-gray-400">Offline</span>
                          </div>
                          <span className="text-sm text-gray-300">{stats.offline}</span>
                        </div>
                        {/* Barra de progresso visual */}
                        <div className="mt-3 bg-gray-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                            style={{ width: `${stats.total > 0 ? (stats.online / stats.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )
                })()}
                
                {loadingDashboard ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-full" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-700 rounded mb-2" />
                          <div className="h-3 bg-gray-700 rounded w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    <AnimatePresence>
                      {(() => {
                        console.log('🔍 Renderização: dashboardData?.friends:', dashboardData?.friends)
                        console.log('🔍 Renderização: dashboardData?.friends?.friends:', dashboardData?.friends?.friends)
                        
                        const friendsArray = dashboardData?.friends?.friends
                        const sortedFriends = sortFriendsByStatus(friendsArray)
                        
                        console.log('🔍 Renderização: friendsArray final:', friendsArray)
                        console.log('🔍 Renderização: sortedFriends final:', sortedFriends)
                        
                        if (!sortedFriends || sortedFriends.length === 0) {
                          console.log('⚠️ Renderização: Nenhum amigo para renderizar')
                          return (
                            <p className="text-center text-gray-400 text-sm py-4">
                              {dashboardData?.friends ? 'Lista de amigos vazia' : 'Dados de amigos não carregados'}
                            </p>
                          )
                        }
                        
                        return sortedFriends.map((friend) => (
                          <FriendCard key={friend.id || friend.displayName} friend={friend} />
                        ))
                      })()}
                    </AnimatePresence>
                  </div>
                )}
                
                {lastRefresh && (
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Atualizado {new Date(lastRefresh).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalhes do amigo */}
      <FriendDetailsModal 
        friend={selectedFriend}
        isOpen={showFriendModal}
        onClose={closeFriendModal}
      />
    </div>
  )
}

export default VRChatAPIPage
