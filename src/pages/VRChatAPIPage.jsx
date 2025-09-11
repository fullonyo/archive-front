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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        {/* Header minimalista para auth */}
        <header className="w-full px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded"></div>
              <span className="text-lg font-medium text-gray-900 dark:text-white">VRChat API</span>
            </div>
          </div>
        </header>
        
        {/* Área de autenticação centralizada */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
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
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header minimalista full-width */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo minimalista */}
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded"></div>
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-lg font-medium text-gray-900 dark:text-white">VRChat</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">API</span>
              </div>
            </div>
            
            {/* User info compacta */}
            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center space-x-3">
                <img
                  src={connection?.currentUser?.userIcon || connection?.currentUser?.profilePicOverride}
                  alt={connection?.currentUser?.displayName}
                  className="w-7 h-7 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjI4IiBoZWlnaHQ9IjI4IiBmaWxsPSIjMzc0MTUxIiByeD0iMTQiLz48cGF0aCBkPSJNMTQgN0MxMS4yNCA3IDkgOS4yNCA5IDEyUzExLjI0IDE3IDE0IDE3UzE5IDI0Ljc2IDE5IDEyUzE2Ljc2IDcgMTQgN1pNMTQgMTQuOEMxMi43IDE0LjggMTEuNiAxMy43IDExLjYgMTJTMTIuNyA5LjIgMTQgOS4yUzE2LjQgMTAuMyAxNi4zIDEyUzE1LjMgMTQuOCAxNCA0LjhaIiBmaWxsPSIjNkI3MjgwIi8+PC9zdmc+'
                  }}
                />
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {connection?.currentUser?.displayName}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRefresh}
                  disabled={loadingDashboard}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                  title="Atualizar"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${loadingDashboard ? 'animate-spin' : ''}`} />
                </button>
                
                <button
                  onClick={disconnect}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Layout full-width com grid adaptativo */}
      <main className="w-full min-h-[calc(100vh-80px)]">
        <div className="grid grid-cols-12 gap-0 h-full">
          
          {/* Sidebar esquerda - Navegação minimalista */}
          <aside className="col-span-12 md:col-span-2 lg:col-span-2 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
            <div className="sticky top-20 p-4">
              {/* Menu de navegação vertical */}
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all group ${
                        activeSection === section.id
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="hidden lg:block">{section.name}</span>
                    </button>
                  )
                })}
              </nav>

              {/* Stats compactas */}
              <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex justify-between items-center">
                    <span>Amigos</span>
                    <span className="font-medium">{friends.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Online</span>
                    <span className="font-medium text-green-500">{friends.filter(f => f.status !== 'offline').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Logs</span>
                    <span className="font-medium">{activityLogs.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Área central - Feed principal expandido */}
          <main className="col-span-12 md:col-span-7 lg:col-span-7 bg-gray-50 dark:bg-gray-900 min-h-full">
            <div className="p-6">
              <AnimatePresence mode="wait">
                {renderActiveSection()}
              </AnimatePresence>
            </div>
          </main>

          {/* Sidebar direita - Amigos online compacta */}
          <aside className="col-span-12 md:col-span-3 lg:col-span-3 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
            <div className="sticky top-20 h-[calc(100vh-80px)] flex flex-col">
              
              {/* Header da sidebar */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">Online</h3>
                  {(() => {
                    const onlineFriends = friends.filter(f => f.status !== 'offline').length
                    return onlineFriends > 0 && (
                      <div className="flex items-center space-x-1.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">{onlineFriends}</span>
                      </div>
                    )
                  })()}
                </div>
              </div>
              
              {/* Lista de amigos - scrollável */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {loadingDashboard ? (
                    <div className="flex items-center justify-center py-8">
                      <VRChatLoading size="sm" type="user" showText={false} />
                    </div>
                  ) : friends.length === 0 ? (
                    <div className="text-center py-8">
                      <UserGroupIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum amigo</p>
                    </div>
                  ) : (
                    friends
                      .filter(friend => friend.status !== 'offline')
                      .map((friend) => (
                        <motion.div
                          key={friend.id}
                          layout
                          className="flex items-center space-x-2.5 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors cursor-pointer group"
                          onClick={() => handleFriendSelect(friend)}
                        >
                          <div className="relative">
                            <img
                              src={friend.userIcon || friend.profilePicOverride}
                              alt={friend.displayName}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjRDFENUREIiByeD0iMTYiLz48cGF0aCBkPSJNMTYgOEMxMi42NCA4IDEwIDEwLjY0IDEwIDEzUzEyLjY0IDE4IDE2IDE4UzIyIDIwLjM2IDIyIDE0UzE5LjM2IDggMTYgOFpNMTYgMTVDMTQuMzQgMTUgMTMgMTMuNjYgMTMgMTJTMTQuMzQgOSAxNiA5UzE5IDEwLjM0IDE5IDEyUzE3LjY2IDE1IDE2IDE1WiIgZmlsbD0iIzlDQTVBMCIvPjwvc3ZnPg=='
                              }}
                            />
                            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white dark:border-gray-900 ${
                              friend.status === 'online' ? 'bg-green-500' :
                              friend.status === 'active' ? 'bg-blue-500' :
                              friend.status === 'busy' ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 dark:text-white text-sm font-medium truncate">
                              {friend.displayName}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                              {friend.location ? 
                                (friend.location.includes('wrld_') ? 'Em mundo público' : 
                                 friend.location.includes('private') ? 'Privado' : 
                                 friend.location) : 'Desconhecido'}
                            </p>
                          </div>
                        </motion.div>
                      ))
                  )}
                </div>
                
                {/* Link para ver todos */}
                {friends.filter(f => f.status !== 'offline').length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={() => setActiveSection('friends')}
                      className="w-full text-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium py-2"
                    >
                      Ver todos ({friends.length})
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default VRChatAPIPage
