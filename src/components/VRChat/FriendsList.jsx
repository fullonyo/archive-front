import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserGroupIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  DeviceTabletIcon,
  XMarkIcon,
  Cog6ToothIcon,
  EyeSlashIcon,
  GlobeAltIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import VRChatLoading from '../ui/VRChatLoading'

const FriendsList = ({ 
  friends = [], 
  onRefresh, 
  loading, 
  lastRefresh,
  onFriendSelect,
  activityLogs = []
}) => {
  const [friendsFilter, setFriendsFilter] = useState({
    search: '',
    status: 'all',
    location: 'all',
    sortBy: 'name',
    viewMode: 'grid',
    showOnlineOnly: false
  })
  
  const [friendsViewSettings, setFriendsViewSettings] = useState({
    cardDensity: 'comfortable',
    enableAnimations: true,
    showDetails: true,
    showWorldPreviews: true
  })

  // Função para filtrar e organizar amigos
  const filteredAndSortedFriends = useMemo(() => {
    if (!friends || !Array.isArray(friends)) return []
    
    let filtered = friends.filter(friend => {
      // Filtro de busca por nome
      if (friendsFilter.search) {
        const searchTerm = friendsFilter.search.toLowerCase()
        if (!friend.displayName?.toLowerCase().includes(searchTerm)) {
          return false
        }
      }
      
      // Filtro por status
      if (friendsFilter.status !== 'all') {
        if (friendsFilter.status === 'online' && friend.status === 'offline') return false
        if (friendsFilter.status === 'offline' && friend.status !== 'offline') return false
        if (friendsFilter.status === 'busy' && friend.status !== 'busy') return false
        if (friendsFilter.status === 'away' && friend.status !== 'away') return false
      }
      
      // Filtro por localização
      if (friendsFilter.location !== 'all') {
        if (friendsFilter.location === 'in-world' && (!friend.location || friend.location.includes('offline') || friend.location.includes('private'))) return false
        if (friendsFilter.location === 'private' && !friend.location?.includes('private')) return false
        if (friendsFilter.location === 'offline' && !friend.location?.includes('offline')) return false
      }
      
      // Filtro apenas online
      if (friendsFilter.showOnlineOnly && friend.status === 'offline') return false
      
      return true
    })
    
    // Ordenação
    filtered.sort((a, b) => {
      switch (friendsFilter.sortBy) {
        case 'name':
          return (a.displayName || '').localeCompare(b.displayName || '')
        case 'status':
          // Online primeiro, depois por nome
          if (a.status === 'offline' && b.status !== 'offline') return 1
          if (a.status !== 'offline' && b.status === 'offline') return -1
          return (a.displayName || '').localeCompare(b.displayName || '')
        case 'last-seen':
          // Mais recente primeiro
          const aTime = new Date(a.last_login || 0).getTime()
          const bTime = new Date(b.last_login || 0).getTime()
          return bTime - aTime
        case 'activity':
          // Mais ativo primeiro (baseado em logs de atividade)
          const aActivity = activityLogs.filter(log => log.friendId === a.id).length
          const bActivity = activityLogs.filter(log => log.friendId === b.id).length
          return bActivity - aActivity
        default:
          return 0
      }
    })
    
    return filtered
  }, [friends, friendsFilter, activityLogs])

  // Estatísticas dos amigos
  const friendsStats = useMemo(() => {
    if (!friends || !Array.isArray(friends)) {
      return { online: 0, offline: 0, total: 0 }
    }
    
    const online = friends.filter(f => ['online', 'join me', 'ask me', 'active', 'busy'].includes(f.status)).length
    const offline = friends.filter(f => f.status === 'offline').length
    
    return { online, offline, total: friends.length }
  }, [friends])

  // Função para parsear localização do mundo
  const parseWorldLocation = (location) => {
    if (!location || location === 'offline') {
      return 'Offline'
    }
    
    if (location === 'private') {
      return 'Mundo Privado'
    }
    
    // Mundos conhecidos/populares
    const knownWorlds = {
      'wrld_4432ea9b-729c-46e3-8eaf-846aa0a37fdd': 'The Great Pug',
      'wrld_6caf5200-70ac-4b8a-aa8d-89c0d5317530': 'Club Orion',
      'wrld_858dfdfc-1b48-4e1e-8a43-f0edc611e5fe': 'Murder 4',
      'wrld_ba913a96-fac4-4048-a062-9aa5db092812': 'The Black Cat'
    }
    
    try {
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
        
        const knownName = knownWorlds[worldId]
        if (knownName) {
          return knownName + instanceInfo
        }
        
        if (worldId.includes('wrld_')) {
          const shortId = worldId.substring(5, 13)
          return `Mundo ${shortId.toUpperCase()}${instanceInfo}`
        }
      }
      
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

  // Componente de Card de Amigo
  const FriendCard = ({ friend, index }) => {
    const [imageLoaded, setImageLoaded] = useState(false)
    
    const friendActivities = activityLogs.filter(log => log.friendId === friend.id)
    const worldName = parseWorldLocation(friend.location)
    
    const getStatusColor = (status) => {
      switch (status) {
        case 'active': return 'bg-green-500'
        case 'join me': return 'bg-blue-500'
        case 'busy': return 'bg-red-500'
        case 'away': return 'bg-yellow-500'
        case 'offline': return 'bg-gray-500'
        default: return 'bg-gray-400'
      }
    }
    
    const cardDelay = friendsViewSettings.enableAnimations ? index * 50 : 0
    
    const sizeConfig = {
      comfortable: { avatar: 'w-16 h-16', padding: 'p-4', spacing: 'space-y-3' },
      compact: { avatar: 'w-12 h-12', padding: 'p-3', spacing: 'space-y-2' },
      dense: { avatar: 'w-10 h-10', padding: 'p-2', spacing: 'space-y-1' }
    }
    
    const config = sizeConfig[friendsViewSettings.cardDensity] || sizeConfig.comfortable
    
    return (
      <motion.div
        initial={friendsViewSettings.enableAnimations ? { opacity: 0, y: 20, scale: 0.9 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: cardDelay / 1000 }}
        whileHover={friendsViewSettings.enableAnimations ? { y: -5, scale: 1.02 } : {}}
        className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-orange-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-orange-500/20 cursor-pointer group"
        onClick={() => onFriendSelect(friend)}
      >
        {/* Header com Avatar e Status */}
        <div className={`relative ${config.padding}`}>
          <div className={`flex items-start ${config.spacing}`}>
            {/* Avatar Container */}
            <div className="relative flex-shrink-0">
              <div className={`
                relative ${config.avatar} rounded-full overflow-hidden
                ${!imageLoaded ? 'bg-gray-700 animate-pulse' : ''}
                ${friendsViewSettings.enableAnimations ? 'group-hover:scale-110 transition-transform duration-300' : ''}
              `}>
                <img
                  src={friend.userIcon}
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
              
              {/* Status Indicator */}
              <div className={`
                absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-800
                ${getStatusColor(friend.status)}
                ${friendsViewSettings.enableAnimations ? 'animate-pulse' : ''}
              `}></div>
              
              {/* Activity Indicator */}
              {friendActivities.length > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">
                    {friendActivities.length > 9 ? '9+' : friendActivities.length}
                  </span>
                </div>
              )}
            </div>
            
            {/* Info Principal */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg truncate group-hover:text-orange-400 transition-colors">
                {friend.displayName}
              </h3>
              <p className="text-gray-400 text-sm truncate">@{friend.username}</p>
              
              {/* Status Text */}
              <div className="flex items-center space-x-2 mt-1">
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${friend.status === 'offline' ? 'bg-gray-700 text-gray-300' : 'bg-green-700 text-green-200'}
                `}>
                  {friend.status === 'offline' ? 'Offline' : 
                   friend.status === 'active' ? 'Online' :
                   friend.status === 'busy' ? 'Ocupado' :
                   friend.status === 'away' ? 'Ausente' : 'Disponível'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* World Info (se estiver em um mundo) */}
        {friend.location && !friend.location.includes('offline') && friendsViewSettings.cardDensity !== 'dense' && (
          <div className={`${config.padding} pb-2`}>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">
                  {friend.location.includes('private') ? 'Mundo Privado' : worldName}
                </span>
              </div>
              {!friend.location.includes('private') && friendsViewSettings.cardDensity === 'comfortable' && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  ID: {friend.location.split(':')[0]}
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Hover Overlay Effect */}
        {friendsViewSettings.enableAnimations && (
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      key="friends"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header com controles avançados */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-3">
              <UserGroupIcon className="w-8 h-8 text-orange-500" />
              <span>Amigos {friends ? `(${filteredAndSortedFriends.length}/${friends.length})` : ''}</span>
            </h2>
            <p className="text-gray-400 flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>{friendsStats.online} online</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span>{friendsStats.offline} offline</span>
              </span>
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <VRChatLoading size="sm" type="refresh" showText={false} className="w-4 h-4" />
                  <span>Atualizando...</span>
                </>
              ) : (
                <>
                  <ArrowPathIcon className="w-4 h-4" />
                  <span>Atualizar</span>
                </>
              )}
            </button>
            
            {/* Configurações de Visualização */}
            <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setFriendsFilter(prev => ({ ...prev, viewMode: 'grid' }))}
                className={`p-2 rounded transition-colors ${
                  friendsFilter.viewMode === 'grid' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Visualização em Grade"
              >
                <DeviceTabletIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFriendsFilter(prev => ({ ...prev, viewMode: 'list' }))}
                className={`p-2 rounded transition-colors ${
                  friendsFilter.viewMode === 'list' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Visualização em Lista"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Filtros Avançados */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Busca */}
          <div className="lg:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar amigos..."
                value={friendsFilter.search}
                onChange={(e) => setFriendsFilter(prev => ({ ...prev, search: e.target.value }))}
                className="w-full bg-gray-700 text-white px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              {friendsFilter.search && (
                <button
                  onClick={() => setFriendsFilter(prev => ({ ...prev, search: '' }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Outros filtros */}
          <div>
            <select
              value={friendsFilter.status}
              onChange={(e) => setFriendsFilter(prev => ({ ...prev, status: e.target.value }))}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Todos Status</option>
              <option value="active">Online</option>
              <option value="join me">🎯 Join Me</option>
              <option value="busy">Ocupado</option>
              <option value="ask me">Ask Me</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          
          <div>
            <select
              value={friendsFilter.location}
              onChange={(e) => setFriendsFilter(prev => ({ ...prev, location: e.target.value }))}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Todas Localizações</option>
              <option value="in-world">Em Mundo</option>
              <option value="private">Privado</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          
          <div>
            <select
              value={friendsFilter.sortBy}
              onChange={(e) => setFriendsFilter(prev => ({ ...prev, sortBy: e.target.value }))}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="name">Nome</option>
              <option value="status">Status</option>
              <option value="last-seen">Última Vez</option>
              <option value="activity">Atividade</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={friendsFilter.showOnlineOnly}
                onChange={(e) => setFriendsFilter(prev => ({ ...prev, showOnlineOnly: e.target.checked }))}
                className="w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-gray-300">Só Online</span>
            </label>
          </div>
        </div>
        
        {/* Estatísticas Rápidas */}
        {filteredAndSortedFriends.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <div className="bg-green-600/20 text-green-400 px-3 py-1 rounded-full flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{filteredAndSortedFriends.filter(f => f.status !== 'offline').length} online</span>
            </div>
            <div className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full flex items-center space-x-2">
              <GlobeAltIcon className="w-4 h-4" />
              <span>{filteredAndSortedFriends.filter(f => f.location && !f.location.includes('offline') && !f.location.includes('private')).length} em mundos</span>
            </div>
            <div className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full flex items-center space-x-2">
              <EyeSlashIcon className="w-4 h-4" />
              <span>{filteredAndSortedFriends.filter(f => f.location?.includes('private')).length} em privado</span>
            </div>
            <div className="bg-orange-600/20 text-orange-400 px-3 py-1 rounded-full flex items-center space-x-2">
              <ChartBarIcon className="w-4 h-4" />
              <span>{activityLogs.length} atividades registradas</span>
            </div>
          </div>
        )}
      </div>

      {/* Grid de Amigos */}
      {filteredAndSortedFriends.length > 0 ? (
        <div className={`
          ${friendsFilter.viewMode === 'grid' && friendsViewSettings.cardDensity === 'comfortable' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' :
            friendsFilter.viewMode === 'grid' && friendsViewSettings.cardDensity === 'compact' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4' :
            friendsFilter.viewMode === 'grid' && friendsViewSettings.cardDensity === 'dense' ? 'grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3' :
            'space-y-3'}
          transition-all duration-300
        `}>
          <AnimatePresence mode="popLayout">
            {filteredAndSortedFriends.map((friend, index) => (
              <FriendCard 
                key={friend.id} 
                friend={friend} 
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div 
          className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center mb-4">
            <UserGroupIcon className="w-16 h-16 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Nenhum amigo encontrado</h3>
          <p className="text-gray-400 mb-6">
            {friendsFilter.search || friendsFilter.status !== 'all' || friendsFilter.location !== 'all' || friendsFilter.showOnlineOnly
              ? 'Tente ajustar os filtros para ver mais amigos.'
              : 'Conecte-se ao VRChat para ver seus amigos aqui.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {(friendsFilter.search || friendsFilter.status !== 'all' || friendsFilter.location !== 'all' || friendsFilter.showOnlineOnly) && (
              <button
                onClick={() => setFriendsFilter({
                  search: '',
                  status: 'all',
                  location: 'all',
                  sortBy: 'name',
                  viewMode: friendsFilter.viewMode,
                  showOnlineOnly: false
                })}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Limpar Filtros</span>
              </button>
            )}
            
            <button
              onClick={onRefresh}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <VRChatLoading size="sm" type="refresh" showText={false} className="w-4 h-4" />
                  <span>Carregando...</span>
                </>
              ) : (
                <>
                  <ArrowPathIcon className="w-4 h-4" />
                  <span>Atualizar Dados</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
      
      {lastRefresh && (
        <p className="text-xs text-gray-500 text-center">
          Última atualização: {new Date(lastRefresh).toLocaleString('pt-BR')}
        </p>
      )}
    </motion.div>
  )
}

export default FriendsList
