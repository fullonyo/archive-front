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

              {/* Bio Links */}
              {friend.bioLinks && friend.bioLinks.length > 0 && (
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center">
                    <LinkIcon className="w-5 h-5 mr-2 text-blue-400" />
                    Links
                  </h3>
                  <div className="space-y-2">
                    {friend.bioLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        {link.replace(/^https?:\/\//, '')}
                      </a>
                    ))}
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

              {/* Tags do Usuário */}
              {friend.tags && friend.tags.length > 0 && (
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center">
                    <ShieldCheckIcon className="w-5 h-5 mr-2 text-yellow-400" />
                    Conquistas & Acesso
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {friend.tags.map((tag, index) => {
                      const isLanguage = tag.includes('language_')
                      const isTrust = tag.includes('trust_')
                      const isAccess = tag.includes('_access')
                      
                      let colorClass = 'bg-gray-600 text-gray-300'
                      if (isLanguage) colorClass = 'bg-blue-600/30 text-blue-300 border-blue-500/30'
                      else if (isTrust) colorClass = 'bg-green-600/30 text-green-300 border-green-500/30'
                      else if (isAccess) colorClass = 'bg-purple-600/30 text-purple-300 border-purple-500/30'
                      
                      return (
                        <span key={index} className={`px-2 py-1 text-xs rounded border ${colorClass}`}>
                          {formatTag(tag)}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Atividade */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2 text-orange-400" />
                  Atividade
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Última atividade:</p>
                    <p className="text-white">{formatDate(friend.last_activity)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Último login:</p>
                    <p className="text-white">{formatDate(friend.last_login)}</p>
                  </div>
                  {friend.last_mobile && (
                    <div>
                      <p className="text-gray-400">Último mobile:</p>
                      <p className="text-white">{formatDate(friend.last_mobile)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-400">Plataforma:</p>
                    <p className="text-white capitalize">
                      {friend.last_platform?.replace('standalonewindows', 'PC (Windows)') || 'Desconhecida'}
                    </p>
                  </div>
                </div>
              </div>

              {/* ID do Usuário */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <Cog6ToothIcon className="w-5 h-5 mr-2 text-gray-400" />
                  Informações Técnicas
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-400">ID do Usuário:</p>
                    <p className="text-white font-mono text-xs bg-gray-800 p-2 rounded break-all">{friend.id}</p>
                  </div>
                  {friend.friendKey && (
                    <div>
                      <p className="text-gray-400">Chave de Amizade:</p>
                      <p className="text-white font-mono text-xs bg-gray-800 p-2 rounded break-all">{friend.friendKey}</p>
                    </div>
                  )}
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
