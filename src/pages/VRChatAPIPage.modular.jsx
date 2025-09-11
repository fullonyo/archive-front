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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                VRChat API Dashboard
              </h1>
              <p className="text-gray-400">
                Conectado como <span className="text-purple-400">{connection?.currentUser?.displayName}</span>
                {lastRefresh && (
                  <span className="ml-4 text-sm">
                    Última atualização: {lastRefresh.toLocaleTimeString('pt-BR')}
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={loadingDashboard}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                {loadingDashboard ? (
                  <>
                    <VRChatLoading size="sm" type="refresh" showText={false} className="w-4 h-4 mr-2" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Atualizar
                  </>
                )}
              </button>
              
              <button
                onClick={disconnect}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <XMarkIcon className="w-4 h-4 mr-2" />
                Desconectar
              </button>
            </div>
          </div>
        </div>

        {/* Navegação de Seções */}
        <div className="mb-8">
          <div className="bg-gray-800 rounded-xl p-1 flex space-x-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <section.icon className="w-5 h-5 mr-2" />
                {section.name}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo da Seção Ativa */}
        <AnimatePresence mode="wait">
          {renderActiveSection()}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default VRChatAPIPage
