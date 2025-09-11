import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useVRChatAPI } from '../hooks/useVRChatAPI'

// Componentes modulares refatorados
import VRChatAuth from '../components/VRChat/VRChatAuth'
import VRChatDashboard from '../components/VRChat/VRChatDashboard'
import FriendsList from '../components/VRChat/FriendsList'
import ActivityMonitor from '../components/VRChat/ActivityMonitor'
import WorldExplorer from '../components/VRChat/WorldExplorer'

// Componentes UI
import VRChatLoading from '../components/ui/VRChatLoading'
import WorldDetailsModal from '../components/VRChat/WorldDetailsModal'

import { 
  UserGroupIcon,
  GlobeAltIcon,
  ChartBarIcon,
  ClockIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  XMarkIcon
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

  // Estados principais da aplicação
  const [activeSection, setActiveSection] = useState('dashboard')
  const [dashboardData, setDashboardData] = useState(null)
  const [loadingDashboard, setLoadingDashboard] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)
  
  // Estados para dados específicos
  const [friends, setFriends] = useState([])
  const [activityLogs, setActivityLogs] = useState([])
  const [worlds, setWorlds] = useState([])
  const [favoriteWorlds, setFavoriteWorlds] = useState([])
  const [worldSearchQuery, setWorldSearchQuery] = useState('')
  
  // Estados para tracking de atividades
  const [friendsHistory, setFriendsHistory] = useState(new Map())
  const [friendsRefreshInterval, setFriendsRefreshInterval] = useState(null)

  // Auto-refresh amigos a cada 30 segundos quando conectado
  useEffect(() => {
    if (isConnected && !friendsRefreshInterval) {
      const interval = setInterval(async () => {
        try {
          const friendsResult = await getFriends()
          if (friendsResult.success && friendsResult.data?.friends) {
            detectFriendChanges(friendsResult.data.friends)
            setFriends(friendsResult.data.friends)
            setLastRefresh(new Date())
          }
        } catch (error) {
          console.error('Erro no auto-refresh:', error)
        }
      }, 30000)
      
      setFriendsRefreshInterval(interval)
    }

    return () => {
      if (friendsRefreshInterval) {
        clearInterval(friendsRefreshInterval)
        setFriendsRefreshInterval(null)
      }
    }
  }, [isConnected, getFriends, friendsRefreshInterval])

  // Função para detectar mudanças nos amigos
  const detectFriendChanges = useCallback((newFriends) => {
    if (!newFriends) return

    const newLogs = []
    
    newFriends.forEach(friend => {
      const previousData = friendsHistory.get(friend.id)
      
      if (previousData) {
        // Detectar mudanças de status
        if (previousData.status !== friend.status) {
          newLogs.push({
            id: `${friend.id}_status_${Date.now()}`,
            type: 'status_change',
            friendId: friend.id,
            friendName: friend.displayName,
            friendAvatar: friend.userIcon || friend.profilePicOverride,
            timestamp: new Date().toISOString(),
            details: {
              from: previousData.status,
              to: friend.status,
              context: `Status alterado de ${previousData.status} para ${friend.status}`
            },
            priority: 'medium'
          })
        }
        
        // Detectar mudanças de mundo/localização
        if (previousData.location !== friend.location) {
          newLogs.push({
            id: `${friend.id}_location_${Date.now()}`,
            type: 'world_change',
            friendId: friend.id,
            friendName: friend.displayName,
            friendAvatar: friend.userIcon || friend.profilePicOverride,
            timestamp: new Date().toISOString(),
            details: {
              fromWorld: previousData.location || 'Unknown',
              toWorld: friend.location || 'Unknown',
              context: `Mudou de "${previousData.location || 'Unknown'}" para "${friend.location || 'Unknown'}"`
            },
            priority: 'low'
          })
        }
        
        // Detectar mudanças de avatar
        if (previousData.currentAvatarImageUrl !== friend.currentAvatarImageUrl) {
          newLogs.push({
            id: `${friend.id}_avatar_${Date.now()}`,
            type: 'avatar_change',
            friendId: friend.id,
            friendName: friend.displayName,
            friendAvatar: friend.userIcon || friend.profilePicOverride,
            timestamp: new Date().toISOString(),
            details: {
              context: 'Avatar alterado'
            },
            priority: 'low'
          })
        }
      }
      
      // Atualizar histórico
      friendsHistory.set(friend.id, {
        status: friend.status,
        location: friend.location,
        currentAvatarImageUrl: friend.currentAvatarImageUrl,
        lastSeen: friend.last_login || friend.lastSeen,
        displayName: friend.displayName
      })
    })
    
    if (newLogs.length > 0) {
      setActivityLogs(prev => [...newLogs, ...prev].slice(0, 1000)) // Manter apenas 1000 logs
    }
    
    setFriendsHistory(new Map(friendsHistory))
  }, [friendsHistory])

  // Carregar dados do dashboard
  const loadDashboardData = useCallback(async () => {
    if (!isConnected) return
    
    setLoadingDashboard(true)
    try {
      const [friendsResult, worldsResult, statsResult] = await Promise.all([
        getFriends(),
        getRecentWorlds(),
        getStats()
      ])

      const data = {
        profile: connection?.currentUser || {},
        friends: friendsResult.data?.friends || [],
        recentWorlds: worldsResult.data?.recentWorlds || [],
        stats: statsResult.data || {}
      }

      setDashboardData(data)
      setFriends(data.friends)
      setLastRefresh(new Date())
      
      // Inicializar histórico de amigos se vazio
      if (friendsHistory.size === 0 && data.friends.length > 0) {
        const initialHistory = new Map()
        data.friends.forEach(friend => {
          initialHistory.set(friend.id, {
            status: friend.status,
            location: friend.location,
            currentAvatarImageUrl: friend.currentAvatarImageUrl,
            lastSeen: friend.last_login || friend.lastSeen,
            displayName: friend.displayName
          })
        })
        setFriendsHistory(initialHistory)
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setLoadingDashboard(false)
    }
  }, [isConnected, getFriends, getRecentWorlds, getStats, connection, friendsHistory])

  // Carregar dados quando conectado
  useEffect(() => {
    if (isConnected && !dashboardData) {
      loadDashboardData()
    }
  }, [isConnected, dashboardData, loadDashboardData])

  // Handlers para componentes
  const handleLoginSubmit = useCallback(async (credentials) => {
    return await initiateConnection(credentials)
  }, [initiateConnection])

  const handle2FASubmit = useCallback(async (twoFactorCode) => {
    return await complete2FAConnection(twoFactorCode)
  }, [complete2FAConnection])

  const handleRefresh = useCallback(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const handleFriendSelect = useCallback((friend) => {
    // Implementar lógica para selecionar amigo
    console.log('Amigo selecionado:', friend)
  }, [])

  const handleWorldSelect = useCallback((world) => {
    // Implementar lógica para entrar no mundo
    console.log('Mundo selecionado:', world)
  }, [])

  const handleToggleFavoriteWorld = useCallback((worldId) => {
    setFavoriteWorlds(prev => 
      prev.includes(worldId) 
        ? prev.filter(id => id !== worldId)
        : [...prev, worldId]
    )
  }, [])

  const handleExportActivityLogs = useCallback(() => {
    const dataStr = JSON.stringify(activityLogs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `vrchat-activity-logs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [activityLogs])

  // Seções de navegação
  const sections = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { id: 'friends', name: 'Amigos', icon: UserGroupIcon },
    { id: 'activity', name: 'Atividade', icon: ClockIcon },
    { id: 'worlds', name: 'Mundos', icon: GlobeAltIcon }
  ]

  // Renderizar conteúdo baseado na seção ativa
  const renderActiveSection = () => {
    if (!isConnected) return null

    switch (activeSection) {
      case 'dashboard':
        return (
          <VRChatDashboard
            profile={dashboardData?.profile}
            stats={dashboardData?.stats}
            recentWorlds={dashboardData?.recentWorlds}
            onRefresh={handleRefresh}
            loading={loadingDashboard}
          />
        )
      
      case 'friends':
        return (
          <FriendsList
            friends={friends}
            onFriendSelect={handleFriendSelect}
            onRefresh={handleRefresh}
            loading={loadingDashboard}
          />
        )
      
      case 'activity':
        return (
          <ActivityMonitor
            activityLogs={activityLogs}
            friends={friends}
            onRefresh={handleRefresh}
            loading={loadingDashboard}
            onExportLogs={handleExportActivityLogs}
          />
        )
      
      case 'worlds':
        return (
          <WorldExplorer
            worlds={worlds}
            favoriteWorlds={favoriteWorlds}
            onWorldSelect={handleWorldSelect}
            onToggleFavorite={handleToggleFavoriteWorld}
            onRefresh={handleRefresh}
            loading={loadingDashboard}
            searchQuery={worldSearchQuery}
            onSearchChange={setWorldSearchQuery}
          />
        )
      
      default:
        return null
    }
  }

  // Se não estiver conectado, mostrar tela de autenticação
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <VRChatAuth
            onLoginSubmit={handleLoginSubmit}
            on2FASubmit={handle2FASubmit}
            loading={loading || isConnecting}
            error={error}
            needs2FA={needs2FA}
            onClearError={clearError}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header fixo estilo rede social moderno */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo e perfil */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">VR</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">VRChat</h1>
              </div>
              
              {/* User info */}
              <div className="hidden md:flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                <img
                  src={connection?.currentUser?.userIcon || connection?.currentUser?.profilePicOverride}
                  alt={connection?.currentUser?.displayName}
                  className="w-8 h-8 rounded-full object-cover bg-gray-300 dark:bg-gray-600"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjMzc0MTUxIiByeD0iMTYiLz48cGF0aCBkPSJNMTYgOEMxMi40NiA4IDkuNiAxMC44NiA5LjYgMTQuNFMxMi40NiAyMC44IDE2IDIwLjhTMjIuNCAyNy45NCAyMi40IDE0LjRTMTkuNTQgOCAxNiA4Wk0xNiAxNy42QzE0LjIzIDE3LjYgMTIuOCAxNi4xNyAxMi44IDE0LjRTMTQuMjMgMTEuMiAxNiAxMS4yUzE5LjIgMTIuNjMgMTkuMiAxNC40UzE3Ljc3IDE3LjYgMTYgMTcuNloiIGZpbGw9IiM2QjcyODAiLz48L3N2Zz4='
                  }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {connection?.currentUser?.displayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {lastRefresh ? `Atualizado ${lastRefresh.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Carregando...'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={loadingDashboard}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Atualizar"
              >
                <ArrowPathIcon className={`w-5 h-5 ${loadingDashboard ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={disconnect}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Layout principal de três colunas estilo rede social */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Sidebar esquerda - Navegação */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              {/* Menu de navegação */}
              <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Menu</h3>
                <div className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          activeSection === section.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{section.name}</span>
                      </button>
                    )
                  })}
                </div>
              </nav>

              {/* Stats rápidas */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Estatísticas</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Amigos</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{friends.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Online</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {friends.filter(f => f.status !== 'offline').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Atividades</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{activityLogs.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Área central - Feed principal */}
          <div className="lg:col-span-6">
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {renderActiveSection()}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar direita - Amigos online */}
          <div className="lg:col-span-3">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Amigos Online</h3>
                    {friends.length > 0 && (() => {
                      const onlineFriends = friends.filter(f => f.status !== 'offline').length
                      return onlineFriends > 0 && (
                        <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium">{onlineFriends}</span>
                        </div>
                      )
                    })()}
                  </div>
                </div>
                
                {/* Lista de amigos online */}
                <div className="p-4">
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {loadingDashboard ? (
                      <div className="flex items-center justify-center py-8">
                        <VRChatLoading size="sm" type="user" showText={false} />
                      </div>
                    ) : friends.length === 0 ? (
                      <div className="text-center py-8">
                        <UserGroupIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum amigo online</p>
                      </div>
                    ) : (
                      friends
                        .filter(friend => friend.status !== 'offline')
                        .slice(0, 12)
                        .map((friend) => (
                          <motion.div
                            key={friend.id}
                            layout
                            className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors cursor-pointer group"
                            onClick={() => handleFriendSelect(friend)}
                          >
                            <div className="relative">
                              <img
                                src={friend.userIcon || friend.profilePicOverride}
                                alt={friend.displayName}
                                className="w-10 h-10 rounded-full object-cover bg-gray-200 dark:bg-gray-600"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRDFENUREIiByeD0iMjAiLz48cGF0aCBkPSJNMjAgMTBDMTUuNTggMTAgMTIgMTMuNTggMTIgMTggUzE1LjU4IDI2IDIwIDI2UzI4IDIyLjQyIDI4IDE4UzI0LjQyIDEwIDIwIDEwWk0yMCAyMkMxNy43OSAyMiAxNiAyMC4yMSAxNiAxOFMxNy43OSAxNCAyMCAxNFMyNCAyMS43OSAyNCAxOFMyMi4yMSAyMiAyMCAyMloiIGZpbGw9IiM5Q0E0QTgiLz48L3N2Zz4='
                                }}
                              />
                              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                                friend.status === 'online' ? 'bg-green-500' :
                                friend.status === 'active' ? 'bg-blue-500' :
                                friend.status === 'busy' ? 'bg-red-500' :
                                'bg-yellow-500'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-900 dark:text-white text-sm font-medium truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {friend.displayName}
                              </p>
                              <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                                {friend.location || 'Localização privada'}
                              </p>
                            </div>
                          </motion.div>
                        ))
                    )}
                  </div>
                  
                  {friends.filter(f => f.status !== 'offline').length > 12 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => setActiveSection('friends')}
                        className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                      >
                        Ver todos os amigos ({friends.filter(f => f.status !== 'offline').length})
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VRChatAPIPage
