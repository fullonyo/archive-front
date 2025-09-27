import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserGroupIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  ClockIcon,
  ChevronDownIcon,
  UsersIcon,
  XMarkIcon,
  MapPinIcon,
  UserIcon,
  EyeSlashIcon,
  ChartBarIcon,
  LinkIcon,
  InformationCircleIcon,
  MapIcon,
  ShieldCheckIcon,
  PhotoIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import VRChatLoading from '../ui/VRChatLoading'
import FriendDetailsModal from './FriendDetailsModal'
import { getTimeAgo, isRecentlyOnline, formatFullDate } from '../../utils/timeUtils'

const FriendsList = ({ 
  friends = [], 
  onRefresh, 
  loading, 
  onFriendSelect,
  activityLogs = [],
  getWorldDetails
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('status') // status, name, last-seen
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [showFriendModal, setShowFriendModal] = useState(false)
  const [worldCache, setWorldCache] = useState(new Map()) // Cache para nomes de mundos
  const [loadingWorlds, setLoadingWorlds] = useState(new Set()) // Set de mundos sendo carregados

  // Debug dos dados de amigos
  useEffect(() => {
    console.log('👥 FriendsList - Dados recebidos:', {
      friends: friends,
      friendsLength: friends?.length || 0,
      firstFriend: friends?.[0] || null,
      friendsFields: friends?.[0] ? Object.keys(friends[0]) : [],
      loading: loading
    })

    if (friends?.length > 0) {
      console.log('📋 Status distribution dos amigos:', {
        total: friends.length,
        statusBreakdown: friends.reduce((acc, friend) => {
          const status = friend.status || 'unknown'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {}),
        friendsList: friends.map(f => ({ name: f.displayName, status: f.status, location: f.location }))
      })
      
      console.log('📋 Sample friend details:', {
        displayName: friends[0].displayName,
        username: friends[0].username,
        status: friends[0].status,
        avatarUrl: friends[0].currentAvatarImageUrl || friends[0].userIcon,
        location: friends[0].location,
        tags: friends[0].tags
      })
    }
  }, [friends, loading])

  // Função para abrir modal de detalhes do amigo
  const openFriendModal = (friend) => {
    console.log('🔍 Abrindo modal para amigo:', friend)
    setSelectedFriend(friend)
    setShowFriendModal(true)
    if (onFriendSelect) {
      console.log('📞 Chamando onFriendSelect callback')
      onFriendSelect(friend)
    }
  }

  // Função para fechar modal
  const closeFriendModal = () => {
    setSelectedFriend(null)
    setShowFriendModal(false)
  }

  // Função para buscar e cachear detalhes do mundo
  const fetchWorldDetails = async (worldId) => {
    if (!worldId || !getWorldDetails || worldCache.has(worldId) || loadingWorlds.has(worldId)) {
      return worldCache.get(worldId) || null
    }

    try {
      setLoadingWorlds(prev => new Set([...prev, worldId]))
      console.log('🌍 Buscando detalhes do mundo:', worldId)
      
      const worldDetails = await getWorldDetails(worldId)
      console.log('🔍 Resposta da API para mundo:', { worldId, worldDetails, data: worldDetails?.data })
      
      if (worldDetails.success && worldDetails.data && worldDetails.data.world) {
        const worldName = worldDetails.data.world.name || `Mundo ${worldId.substring(5, 13).toUpperCase()}`
        setWorldCache(prev => new Map(prev.set(worldId, worldName)))
        console.log('✅ Mundo encontrado e cacheado:', { worldId, worldName })
        return worldName
      } else {
        console.warn('❌ Falha ao buscar mundo:', { worldId, success: worldDetails?.success, error: worldDetails?.error, structure: worldDetails?.data })
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do mundo:', error)
    } finally {
      setLoadingWorlds(prev => {
        const newSet = new Set(prev)
        newSet.delete(worldId)
        return newSet
      })
    }
    
    return null
  }

  // Função para extrair nome do mundo da localização VRChat
  const parseWorldLocation = async (location, shouldFetch = true) => {
    console.log('parseWorldLocation debug:', { location, type: typeof location });
    
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
        
        // Verificar cache primeiro
        if (worldCache.has(worldId)) {
          return worldCache.get(worldId) + instanceInfo
        }
        
        // Verificar mundos conhecidos
        const knownName = knownWorlds[worldId]
        if (knownName) {
          setWorldCache(prev => new Map(prev.set(worldId, knownName)))
          return knownName + instanceInfo
        }
        
        // Se deve buscar na API e não está carregando, buscar
        if (shouldFetch && getWorldDetails) {
          fetchWorldDetails(worldId).then(worldName => {
            if (worldName) {
              // Forçar re-render para atualizar o nome
              setWorldCache(prev => new Map(prev))
            }
          })
        }
        
        // Retornar nome temporário enquanto carrega ou se não pode buscar
        if (worldId.includes('wrld_')) {
          const shortId = worldId.substring(5, 13)
          const tempName = `Mundo ${shortId.toUpperCase()}`
          if (loadingWorlds.has(worldId)) {
            return `${tempName} (Carregando...)${instanceInfo}`
          }
          return tempName + instanceInfo
        }
      }
      
      return location.length > 35 ? location.substring(0, 35) + '...' : location || 'Mundo Desconhecido'
    } catch (error) {
      console.error('Erro em parseWorldLocation:', error)
      return location.length > 35 ? location.substring(0, 35) + '...' : location
    }
  }

  // Componente para nome do mundo dinâmico
  const WorldName = ({ location }) => {
    const [worldName, setWorldName] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    
    useEffect(() => {
      const getWorldName = async () => {
        console.log('🏷️ WorldName component processando:', location)
        
        if (!location || location === 'offline') {
          setWorldName('Offline')
          return
        }
        if (location === 'private') {
          setWorldName('Mundo Privado')
          return
        }
        
        // Extrair worldId da location
        if (location.includes('wrld_')) {
          const parts = location.split(':')
          const worldId = parts[0]
          let instanceInfo = ''
          
          if (parts.length > 1) {
            const instancePart = parts[1]
            if (instancePart.includes('~public')) instanceInfo = ' (Público)'
            else if (instancePart.includes('~friends')) instanceInfo = ' (Amigos)'
            else if (instancePart.includes('~invite')) instanceInfo = ' (Apenas Convite)'
            else if (instancePart.includes('~group')) instanceInfo = ' (Grupo)'
            else if (instancePart.includes('~private')) instanceInfo = ' (Privado)'
          }
          
          // Verificar cache primeiro
          if (worldCache.has(worldId)) {
            console.log('📋 Cache hit para mundo:', worldId, worldCache.get(worldId))
            setWorldName(worldCache.get(worldId) + instanceInfo)
            return
          }
          
          // Verificar mundos conhecidos
          const knownWorlds = {
            'wrld_4432ea9b-729c-46e3-8eaf-846aa0a37fdd': 'The Great Pug',
            'wrld_6caf5200-70ac-4b8a-aa8d-89c0d5317530': 'Club Orion',
            'wrld_858dfdfc-1b48-4e1e-8a43-f0edc611e5fe': 'Murder 4',
            'wrld_ba913a96-fac4-4048-a062-9aa5db092812': 'The Black Cat'
          }
          
          const knownName = knownWorlds[worldId]
          if (knownName) {
            console.log('📚 Mundo conhecido encontrado:', knownName)
            setWorldCache(prev => new Map(prev.set(worldId, knownName)))
            setWorldName(knownName + instanceInfo)
            return
          }
          
          // Se tem getWorldDetails, buscar na API
          if (getWorldDetails && !loadingWorlds.has(worldId)) {
            setIsLoading(true)
            const shortId = worldId.substring(5, 13)
            setWorldName(`Mundo ${shortId.toUpperCase()}${instanceInfo} (Carregando...)`)
            
            try {
              const apiWorldName = await fetchWorldDetails(worldId)
              if (apiWorldName) {
                console.log('🌐 Nome obtido da API:', apiWorldName)
                setWorldName(apiWorldName + instanceInfo)
              } else {
                setWorldName(`Mundo ${shortId.toUpperCase()}${instanceInfo}`)
              }
            } catch (error) {
              console.error('❌ Erro ao buscar mundo:', error)
              setWorldName(`Mundo ${shortId.toUpperCase()}${instanceInfo}`)
            } finally {
              setIsLoading(false)
            }
          } else {
            // Fallback para ID abreviado
            const shortId = worldId.substring(5, 13)
            setWorldName(`Mundo ${shortId.toUpperCase()}${instanceInfo}`)
          }
        } else {
          setWorldName(location.length > 35 ? location.substring(0, 35) + '...' : location)
        }
      }
      
      getWorldName()
    }, [location]) // Removido worldCache da dependência para evitar loops infinitos
    
    // Reagir a mudanças no cache separadamente
    useEffect(() => {
      if (location && location.includes('wrld_')) {
        const worldId = location.split(':')[0]
        if (worldCache.has(worldId)) {
          const parts = location.split(':')
          let instanceInfo = ''
          
          if (parts.length > 1) {
            const instancePart = parts[1]
            if (instancePart.includes('~public')) instanceInfo = ' (Público)'
            else if (instancePart.includes('~friends')) instanceInfo = ' (Amigos)'
            else if (instancePart.includes('~invite')) instanceInfo = ' (Apenas Convite)'
            else if (instancePart.includes('~group')) instanceInfo = ' (Grupo)'
            else if (instancePart.includes('~private')) instanceInfo = ' (Privado)'
          }
          
          const cachedName = worldCache.get(worldId) + instanceInfo
          if (worldName !== cachedName && !worldName.includes('(Carregando...)')) {
            console.log('🔄 Atualizando nome do cache:', cachedName)
            setWorldName(cachedName)
          }
        }
      }
    }, [worldCache.size, location]) // Reagir ao tamanho do cache mudando
    
    if (isLoading && !worldName) {
      return <span className="text-gray-400">Carregando...</span>
    }
    
    return <span>{worldName || 'Mundo Desconhecido'}</span>
  }

  // Componente de Card de Amigo Moderno
  const ModernFriendCard = React.forwardRef(({ friend, index }, ref) => {
    const [isHovered, setIsHovered] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)
    
    const friendActivities = activityLogs.filter(log => log.friendId === friend.id)
    const lastActivity = friendActivities[0]
    
    const getStatusColor = (status) => {
      const statusLower = (status || 'offline').toLowerCase()
      switch (statusLower) {
        case 'active': 
        case 'online': return 'bg-green-500'
        case 'join me': return 'bg-blue-500'
        case 'busy': return 'bg-red-500'
        case 'ask me': return 'bg-yellow-500'
        case 'away': return 'bg-yellow-500'
        case 'offline': 
        default: return 'bg-gray-500'
      }
    }
    
    const cardDelay = viewSettings.enableAnimations ? index * 50 : 0
    
    const sizeConfig = {
      comfortable: { avatar: 'w-16 h-16', padding: 'p-4', spacing: 'space-y-3' },
      compact: { avatar: 'w-12 h-12', padding: 'p-3', spacing: 'space-y-2' },
      dense: { avatar: 'w-10 h-10', padding: 'p-2', spacing: 'space-y-1' }
    }
    
    const config = sizeConfig[viewSettings.cardDensity] || sizeConfig.comfortable
    
    return (
      <motion.div
        ref={ref}
        initial={viewSettings.enableAnimations ? { opacity: 0, y: 20, scale: 0.9 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: cardDelay / 1000 }}
        whileHover={viewSettings.enableAnimations ? { y: -5, scale: 1.02 } : {}}
        className={`
          relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden
          border border-gray-700 hover:border-orange-500/50 transition-all duration-300
          ${isHovered ? 'shadow-xl shadow-orange-500/20' : 'shadow-lg'}
          cursor-pointer group
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => openFriendModal(friend)}
      >
        <div className={`relative ${config.padding}`}>
          <div className={`flex items-start ${config.spacing}`}>
            <div className="relative flex-shrink-0">
              <div className={`
                relative ${config.avatar} rounded-full overflow-hidden
                ${!imageLoaded ? 'bg-gray-700 animate-pulse' : ''}
                ${viewSettings.enableAnimations ? 'group-hover:scale-110 transition-transform duration-300' : ''}
              `}>
                <img
                  src={friend.currentAvatarImageUrl || friend.userIcon || friend.profilePicOverride || 'https://d348imysud55la.cloudfront.net/icons/default_user_icon.png'}
                  alt={friend.displayName}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzc0MTUxIiByeD0iMzIiLz48cGF0aCBkPSJNMzIgMTZDMjQuOTU4IDE2IDIwIDIxLjk1OCAyMCAzMlMyNC45NTggNDggMzIgNDhTNDQgNDIuMDQyIDQ0IDMyUzM5LjA0MiAxNiAzMiAxNlpNMzIgNDBDMjguNjg2IDQwIDI2IDM3LjMxNCAyNiAzNFMyOC42ODYgMjggMzIgMjhTMzggMzAuNjg2IDM4IDM0UzM1LjMxNCA0MCAzMiA0MFoiIGZpbGw9IiM2QjcyODAiLz48L3N2Zz4='
                    setImageLoaded(true)
                  }}
                />
              </div>
              
              <div className={`
                absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-800
                ${getStatusColor(friend.status)}
                ${viewSettings.enableAnimations ? 'animate-pulse' : ''}
              `}></div>
              
              {friendActivities.length > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{friendActivities.length > 9 ? '9+' : friendActivities.length}</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg truncate group-hover:text-orange-400 transition-colors">
                {friend.displayName}
              </h3>
              <p className="text-gray-400 text-sm truncate">@{friend.username}</p>
              
              <div className="flex items-center space-x-2 mt-1">
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${(friend.status || 'offline') === 'offline' ? 'bg-gray-700 text-gray-300' : 'bg-green-700 text-green-200'}
                `}>
                  {(friend.status || 'offline') === 'offline' ? 'Offline' : 
                   friend.status === 'active' ? 'Online' :
                   friend.status === 'online' ? 'Online' :
                   friend.status === 'busy' ? 'Ocupado' :
                   friend.status === 'join me' ? 'Join Me' :
                   friend.status === 'ask me' ? 'Ask Me' :
                   friend.status === 'away' ? 'Ausente' : 'Disponível'}
                </span>
                
                {/* Mostrar tempo offline para amigos offline */}
                {(friend.status === 'offline' || !friend.status) && friend.last_login && (
                  <span className="text-xs text-gray-500 flex items-center space-x-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>{getTimeAgo(friend.last_login)}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {friend.location && !friend.location.includes('offline') && viewSettings.cardDensity !== 'dense' && (
          <div className={`${config.padding} pb-2`}>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">
                  <WorldName location={friend.location} />
                </span>
              </div>
              {!friend.location.includes('private') && viewSettings.cardDensity === 'comfortable' && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  ID: {friend.location.split(':')[0]}
                </p>
              )}
            </div>
          </div>
        )}
        
        <div className={config.padding}>
          {lastActivity && viewSettings.cardDensity !== 'dense' && (
            <div className="bg-gray-700/30 rounded-lg p-2 mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-xs text-gray-400">
                  Última atividade: {new Date(lastActivity.timestamp).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1">
                {lastActivity.type === 'status_change' && 'Mudou status'}
                {lastActivity.type === 'world_change' && 'Mudou de mundo'}
                {lastActivity.type === 'avatar_change' && 'Mudou avatar'}
              </p>
            </div>
          )}
          
          {viewSettings.cardDensity === 'comfortable' && (
            <div className={`
              flex items-center justify-between
              ${isHovered && viewSettings.enableAnimations ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
              transition-opacity duration-300
            `}>
              <div className="flex space-x-2">
                {friend.status !== 'offline' && (
                  <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    <GlobeAltIcon className="w-3 h-3" />
                  </button>
                )}
                <button className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                <button className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                  <UserIcon className="w-3 h-3" />
                </button>
              </div>
              
              {friend.status !== 'offline' && (
                <span className="text-xs text-gray-500 flex items-center space-x-1">
                  <ClockIcon className="w-3 h-3" />
                  <span>Online</span>
                </span>
              )}
            </div>
          )}
        </div>
        
        {viewSettings.enableAnimations && (
          <div className={`
            absolute inset-0 bg-gradient-to-r from-orange-500/10 to-purple-500/10
            opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
          `}></div>
        )}
      </motion.div>
    )
  })
  
  const filteredFriends = useMemo(() => {
    console.log('🔍 Filtrando amigos:', { 
      originalFriends: friends?.length || 0, 
      statusFilter, 
      searchTerm 
    })
    
    if (!friends || !Array.isArray(friends)) return []
    
    let filtered = friends.filter(friend => {
      // Filtro de busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        if (!friend.displayName?.toLowerCase().includes(searchLower)) {
          return false
        }
      }
      
      // Filtro de status
      if (statusFilter !== 'all') {
        const friendStatus = friend.status || 'offline'
        if (statusFilter === 'online' && friendStatus === 'offline') return false
        if (statusFilter === 'offline' && friendStatus !== 'offline') return false
        if (statusFilter !== 'online' && statusFilter !== 'offline' && friendStatus !== statusFilter) return false
      }
      
      return true
    })
    
    console.log('✅ Amigos após filtro:', {
      filteredCount: filtered.length,
      statusBreakdown: filtered.reduce((acc, friend) => {
        const status = friend.status || 'unknown'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {})
    })
    
    // Ordenação: sempre colocar online primeiro, depois offline
    filtered.sort((a, b) => {
      // Primeiro, ordenar por status (online primeiro)
      const getStatusPriority = (status) => {
        const priorities = {
          'online': 1,
          'active': 2,
          'join me': 3,
          'ask me': 4,
          'away': 5,
          'busy': 6,
          'offline': 7
        }
        return priorities[status] || 7
      }
      
      const priorityA = getStatusPriority(a.status || 'offline')
      const priorityB = getStatusPriority(b.status || 'offline')
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }
      
      // Se mesmo status, ordenar por nome
      return (a.displayName || '').localeCompare(b.displayName || '')
    })
    
    console.log('📋 Amigos ordenados:', filtered.map(f => ({ 
      name: f.displayName, 
      status: f.status || 'undefined' 
    })))
    
    return filtered
  }, [friends, searchTerm, statusFilter, sortBy])

  // Estatísticas dos amigos
  const stats = useMemo(() => {
    if (!friends || !Array.isArray(friends)) {
      return { total: 0, online: 0, offline: 0 }
    }
    
    const total = friends.length
    const online = friends.filter(f => f.status && f.status !== 'offline').length
    const offline = friends.filter(f => !f.status || f.status === 'offline').length
    
    return { total, online, offline }
  }, [friends])

  // Componente de card de amigo simplificado
  const FriendCard = ({ friend }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors cursor-pointer border border-gray-700/30"
      onClick={() => openFriendModal(friend)}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img
            src={friend.currentAvatarImageUrl || friend.userIcon || friend.profilePicOverride || 'https://d348imysud55la.cloudfront.net/icons/default_user_icon.png'}
            alt={friend.displayName}
            className="w-12 h-12 rounded-full object-cover bg-gray-600"
            onError={(e) => {
              if (e.target.src !== 'https://d348imysud55la.cloudfront.net/icons/default_user_icon.png') {
                e.target.src = 'https://d348imysud55la.cloudfront.net/icons/default_user_icon.png'
              }
            }}
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
            friend.status === 'online' ? 'bg-green-500' :
            friend.status === 'active' ? 'bg-blue-500' :
            friend.status === 'busy' ? 'bg-red-500' :
            friend.status === 'join me' ? 'bg-green-400' :
            friend.status === 'ask me' ? 'bg-yellow-500' :
            'bg-gray-500'
          }`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">{friend.displayName}</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full ${
              friend.status === 'online' ? 'bg-green-600/20 text-green-400' :
              friend.status === 'active' ? 'bg-blue-600/20 text-blue-400' :
              friend.status === 'busy' ? 'bg-red-600/20 text-red-400' :
              friend.status === 'join me' ? 'bg-green-500/20 text-green-300' :
              friend.status === 'ask me' ? 'bg-yellow-600/20 text-yellow-400' :
              'bg-gray-600/20 text-gray-400'
            }`}>
              {friend.status === 'join me' ? 'Join Me' :
               friend.status === 'ask me' ? 'Ask Me' :
               friend.status.charAt(0).toUpperCase() + friend.status.slice(1)}
            </span>
            
            {/* Tempo offline para amigos offline */}
            {(friend.status === 'offline' || !friend.status) && friend.last_login && (
              <span className="text-xs text-gray-500 flex items-center space-x-1">
                <ClockIcon className="w-3 h-3" />
                <span>{getTimeAgo(friend.last_login)}</span>
              </span>
            )}
            
            {/* Indicador de plataforma */}
            {friend.tags && (
              <>
                {friend.tags.some(tag => tag.includes('system_pc')) && (
                  <ComputerDesktopIcon className="w-4 h-4 text-blue-400" title="PC" />
                )}
                {friend.tags.some(tag => tag.includes('system_android') || tag.includes('system_quest')) && (
                  <DeviceTabletIcon className="w-4 h-4 text-green-400" title="Quest/Mobile" />
                )}
              </>
            )}
          </div>
          
          {/* Localização */}
          {friend.location && friend.status !== 'offline' && (
            <p className="text-gray-400 text-xs mt-1 truncate">
              📍 {friend.location}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )

  // Funções auxiliares
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'online': return 'bg-green-500'
      case 'join me': return 'bg-blue-500'
      case 'ask me': return 'bg-orange-500'
      case 'busy': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'online': return <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
      case 'join me': return <PlusIcon className="w-3 h-3" />
      case 'ask me': return <QuestionMarkCircleIcon className="w-3 h-3" />
      case 'busy': return <MinusIcon className="w-3 h-3" />
      default: return null
    }
  }

  return (
    <motion.div
      key="friends"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header e controles avançados */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-3">
              <UserGroupIcon className="w-8 h-8 text-orange-500" />
              <span>Amigos ({filteredFriends.length}/{friends.length})</span>
            </h2>
            <div className="text-gray-400 flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>{stats.online} online</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span>{stats.offline} offline</span>
              </span>
            </div>
          </div>
        </div>
        
        {/* Filtros Avançados */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="lg:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar amigos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Filtro por Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Todos Status</option>
              <option value="online">Online</option>
              <option value="join me">Join Me</option>
              <option value="busy">Ocupado</option>
              <option value="ask me">Ask Me</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          
          {/* Ordenação */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="name">Nome</option>
              <option value="status">Status</option>
              <option value="last-seen">Última Vez</option>
            </select>
          </div>
        </div>

        {/* Configurações de Performance */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="bg-green-600/20 text-green-400 px-3 py-1 rounded-full flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{stats.online} online</span>
            </div>
            <div className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full flex items-center space-x-2">
              <GlobeAltIcon className="w-4 h-4" />
              <span>{filteredFriends.filter(f => f.location && !f.location.includes('offline') && !f.location.includes('private')).length} em mundos</span>
            </div>
            <div className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full flex items-center space-x-2">
              <EyeSlashIcon className="w-4 h-4" />
              <span>{filteredFriends.filter(f => f.location?.includes('private')).length} em privado</span>
            </div>
            <div className="bg-orange-600/20 text-orange-400 px-3 py-1 rounded-full flex items-center space-x-2">
              <ChartBarIcon className="w-4 h-4" />
              <span>{activityLogs.length} atividades registradas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de amigos */}
      <div>
        {loading ? (
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700/30">
            <VRChatLoading 
              size="lg" 
              type="user" 
              text="Carregando amigos..." 
            />
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700/30">
            <UserGroupIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {searchTerm ? 'Nenhum amigo encontrado' : 'Nenhum amigo na lista'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {searchTerm ? 'Tente buscar por outro nome' : 'Conecte-se para ver seus amigos do VRChat'}
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                }}
                className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Limpar Filtros</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredFriends.map((friend, index) => (
                <FriendCard key={friend.id} friend={friend} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal de detalhes do amigo */}
      <FriendDetailsModal
        friend={selectedFriend}
        isOpen={showFriendModal}
        onClose={closeFriendModal}
      />
    </motion.div>
  )
}

export default FriendsList
