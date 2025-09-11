import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserGroupIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  DeviceTabletIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  ClockIcon,
  ChevronDownIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import VRChatLoading from '../ui/VRChatLoading'

const FriendsList = ({ 
  friends = [], 
  onRefresh, 
  loading, 
  onFriendSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('status') // status, name, last-seen

  // Filtrar e ordenar amigos
  const filteredFriends = useMemo(() => {
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
        if (statusFilter === 'online' && friend.status === 'offline') return false
        if (statusFilter === 'offline' && friend.status !== 'offline') return false
      }
      
      return true
    })
    
    // Ordenação
    filtered.sort((a, b) => {
      if (sortBy === 'status') {
        const statusPriority = {
          'online': 1, 'join me': 2, 'ask me': 3, 'active': 4, 'busy': 5, 'offline': 6
        }
        const priorityA = statusPriority[a.status] || 6
        const priorityB = statusPriority[b.status] || 6
        
        if (priorityA !== priorityB) return priorityA - priorityB
        return a.displayName.localeCompare(b.displayName)
      }
      
      if (sortBy === 'name') {
        return a.displayName.localeCompare(b.displayName)
      }
      
      return 0
    })
    
    return filtered
  }, [friends, searchTerm, statusFilter, sortBy])

  // Estatísticas dos amigos
  const stats = useMemo(() => {
    const total = friends.length
    const online = friends.filter(f => f.status !== 'offline').length
    const offline = friends.filter(f => f.status === 'offline').length
    
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
      onClick={() => onFriendSelect(friend)}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img
            src={friend.userIcon || friend.profilePicOverride}
            alt={friend.displayName}
            className="w-12 h-12 rounded-full object-cover bg-gray-600"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzc0MTUxIiByeD0iMjQiLz48cGF0aCBkPSJNMjQgMTJDMTguNDggMTIgMTQgMTYuNDggMTQgMjJTMTguNDggMzIgMjQgMzJTMzQgMjcuNTIgMzQgMjJTMjkuNTIgMTIgMjQgMTJaTTI0IDI4QzIwLjY5IDI4IDE4IDI1LjMxIDE4IDIyUzIwLjY5IDE2IDI0IDE2UzMwIDE4LjY5IDMwIDIyUzI3LjMxIDI4IDI0IDI4WiIgZmlsbD0iIzZCNzI4MCIvPjwvc3ZnPg=='
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

  return (
    <motion.div
      key="friends"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header e controles */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <UserGroupIcon className="w-6 h-6 mr-2 text-orange-400" />
            Amigos
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">
              {stats.online} online de {stats.total}
            </span>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Atualizar lista"
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Barra de busca */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar amigos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-600"
          />
        </div>

        {/* Filtros simples */}
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-600"
          >
            <option value="all">Todos os status</option>
            <option value="online">Apenas online</option>
            <option value="offline">Apenas offline</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-600"
          >
            <option value="status">Ordenar por status</option>
            <option value="name">Ordenar por nome</option>
          </select>
        </div>
      </div>

      {/* Estatísticas simples */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700/30">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-lg font-bold text-white">{stats.online}</p>
              <p className="text-sm text-gray-400">Online</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700/30">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <div>
              <p className="text-lg font-bold text-white">{stats.offline}</p>
              <p className="text-sm text-gray-400">Offline</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700/30">
          <div className="flex items-center space-x-2">
            <UserGroupIcon className="w-4 h-4 text-orange-400" />
            <div>
              <p className="text-lg font-bold text-white">{stats.total}</p>
              <p className="text-sm text-gray-400">Total</p>
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
          <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700/30">
            <UserGroupIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {searchTerm ? 'Nenhum amigo encontrado' : 'Nenhum amigo na lista'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {searchTerm ? 'Tente buscar por outro nome' : 'Conecte-se para ver seus amigos do VRChat'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredFriends.map((friend) => (
                <FriendCard key={friend.id} friend={friend} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default FriendsList
