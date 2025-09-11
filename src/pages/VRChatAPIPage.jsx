import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useVRChatAPI } from '../hooks/useVRChatAPI'
import WorldDetailsModal from '../components/VRChat/WorldDetailsModal'
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
  DeviceTabletIcon,
  BoltIcon,
  PlayIcon,
  XMarkIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon
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

  // Estados para logs de atividade dos amigos
  const [activityLogs, setActivityLogs] = useState([])
  const [friendsHistory, setFriendsHistory] = useState(new Map()) // Para comparar mudanças
  const [activityFilters, setActivityFilters] = useState({
    type: 'all', // all, status, world, avatar, profile
    friend: 'all', // all ou ID específico do amigo
    timeRange: '24h', // 1h, 24h, 7d, 30d
    viewMode: 'flowmap' // timeline, flowmap, network, heatmap
  })

  // Auto-refresh amigos a cada 30 segundos quando conectado
  useEffect(() => {
    if (isConnected && !friendsRefreshInterval) {
      const interval = setInterval(async () => {
        try {
          const friendsResult = await getFriends()
          if (friendsResult.success && dashboardData) {
            // Detectar mudanças antes de atualizar o estado
            if (friendsResult.data?.friends) {
              detectFriendChanges(friendsResult.data.friends)
            }
            
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

  // Auto-refresh mais frequente quando na aba de atividades
  useEffect(() => {
    let activityInterval
    
    if (isConnected && activeSection === 'activity') {
      activityInterval = setInterval(async () => {
        try {
          const friendsResult = await getFriends()
          if (friendsResult.success && friendsResult.data?.friends) {
            detectFriendChanges(friendsResult.data.friends)
            setDashboardData(prev => ({
              ...prev,
              friends: friendsResult.data
            }))
            setLastRefresh(new Date())
          }
        } catch (error) {
          console.error('Erro no auto-refresh de atividades:', error)
        }
      }, 15000) // 15 segundos - mais frequente para atividades
    }

    return () => {
      if (activityInterval) {
        clearInterval(activityInterval)
      }
    }
  }, [isConnected, activeSection, getFriends])

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
        
        // Detectar mudanças nos amigos antes de atualizar o estado
        if (result.data.friends && Array.isArray(result.data.friends)) {
          console.log('🔍 Detectando mudanças nos amigos:', result.data.friends.length, 'amigos')
          detectFriendChanges(result.data.friends)
        } else {
          console.log('⚠️ Dados de amigos não são um array:', typeof result.data.friends)
        }
        
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

  // Calcula estatísticas detalhadas da API real
  const getDetailedStats = (friends, currentUser) => {
    if (!friends || !Array.isArray(friends)) {
      return {
        friends: { online: 0, offline: 0, total: 0 },
        worlds: { unique: 0, private: 0, public: 0 },
        platforms: { desktop: 0, mobile: 0, quest: 0 },
        trust: { trusted: 0, known: 0, user: 0, new: 0, visitor: 0 },
        activity: { inWorld: 0, available: 0, busy: 0 }
      }
    }

    // Estatísticas de amigos
    const friendStats = getFriendsStats(friends)

    // Estatísticas de mundos (onde os amigos estão)
    const worldsData = friends
      .filter(f => f.location && f.location !== 'offline' && f.location !== 'private')
      .map(f => f.location.split(':')[0]) // Pega só o ID do mundo
    
    const uniqueWorlds = new Set(worldsData).size
    const privateInstances = friends.filter(f => f.location && f.location.includes('private')).length
    const publicInstances = friends.filter(f => f.location && !f.location.includes('private') && f.location !== 'offline').length

    // Estatísticas de plataformas (baseado nos tags)
    const platforms = {
      desktop: friends.filter(f => f.tags?.some(tag => tag.includes('system_pc'))).length,
      mobile: friends.filter(f => f.tags?.some(tag => tag.includes('system_android'))).length,
      quest: friends.filter(f => f.tags?.some(tag => tag.includes('system_quest'))).length
    }

    // Estatísticas de trust rank
    const trust = {
      trusted: friends.filter(f => f.tags?.includes('system_trust_trusted')).length,
      known: friends.filter(f => f.tags?.includes('system_trust_known')).length,
      user: friends.filter(f => f.tags?.includes('system_trust_user')).length,
      new: friends.filter(f => f.tags?.includes('system_trust_new')).length,
      visitor: friends.filter(f => f.tags?.includes('system_trust_visitor')).length
    }

    // Estatísticas de atividade
    const activity = {
      inWorld: friends.filter(f => ['online', 'join me', 'ask me'].includes(f.status)).length,
      available: friends.filter(f => f.status === 'join me').length,
      busy: friends.filter(f => f.status === 'busy').length
    }

    return {
      friends: friendStats,
      worlds: { unique: uniqueWorlds, private: privateInstances, public: publicInstances },
      platforms,
      trust,
      activity,
      user: currentUser ? {
        displayName: currentUser.displayName,
        trustRank: currentUser.tags?.find(tag => tag.includes('system_trust_'))?.replace('system_trust_', '') || 'unknown',
        status: currentUser.status || 'unknown'
      } : null
    }
  }

  // Componente de Mapa de Calor de Atividades
  const HeatmapVisualization = ({ logs }) => {
    const [selectedDay, setSelectedDay] = useState(null)
    const [selectedHour, setSelectedHour] = useState(null)
    
    // Criar matriz de atividades por dia da semana e hora
    const activityMatrix = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => ({
      count: 0,
      logs: [],
      types: {}
    })))
    
    // Preencher matriz com dados
    logs.forEach(log => {
      const date = new Date(log.timestamp)
      const dayOfWeek = date.getDay() // 0 = domingo, 1 = segunda, etc.
      const hour = date.getHours()
      
      activityMatrix[dayOfWeek][hour].count++
      activityMatrix[dayOfWeek][hour].logs.push(log)
      activityMatrix[dayOfWeek][hour].types[log.type] = 
        (activityMatrix[dayOfWeek][hour].types[log.type] || 0) + 1
    })
    
    // Encontrar valores máximo e mínimo para normalização
    const maxActivity = Math.max(...activityMatrix.flat().map(cell => cell.count))
    const minActivity = Math.min(...activityMatrix.flat().map(cell => cell.count))
    
    // Função para obter intensidade da cor
    const getIntensity = (count) => {
      if (maxActivity === 0) return 0
      return (count - minActivity) / (maxActivity - minActivity)
    }
    
    // Função para obter cor baseada na intensidade
    const getHeatmapColor = (intensity) => {
      if (intensity === 0) return 'rgba(75, 85, 99, 0.3)' // gray-600 transparente
      
      // Gradiente de azul para vermelho baseado na intensidade
      const colors = [
        'rgba(59, 130, 246, 0.3)',   // blue-500
        'rgba(16, 185, 129, 0.4)',   // green-500
        'rgba(245, 158, 11, 0.5)',   // yellow-500
        'rgba(239, 68, 68, 0.6)',    // red-500
        'rgba(220, 38, 38, 0.8)'     // red-600
      ]
      
      const index = Math.floor(intensity * (colors.length - 1))
      return colors[Math.min(index, colors.length - 1)]
    }
    
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const hourLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`)
    
    return (
      <div className="relative">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-400">
            🔥 Mapa de calor semanal • {logs.length} atividades • Pico: {maxActivity} atividades/hora
          </div>
          <div className="flex items-center space-x-4">
            {/* Legenda de cores */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-gray-400">Baixa</span>
              <div className="flex space-x-1">
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((intensity, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: getHeatmapColor(intensity) }}
                  ></div>
                ))}
              </div>
              <span className="text-gray-400">Alta</span>
            </div>
          </div>
        </div>
        
        {/* Grid do Heatmap */}
        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
          <div className="relative" style={{ minWidth: '800px' }}>
            {/* Labels das horas (topo) */}
            <div className="flex mb-2">
              <div className="w-12"></div> {/* Espaço para labels dos dias */}
              {hourLabels.map((hour, index) => (
                <div
                  key={index}
                  className="flex-1 text-center text-xs text-gray-400 min-w-8"
                  style={{ fontSize: '10px' }}
                >
                  {index % 3 === 0 ? hour : ''}
                </div>
              ))}
            </div>
            
            {/* Grid principal */}
            {dayNames.map((dayName, dayIndex) => (
              <div key={dayIndex} className="flex items-center mb-1">
                {/* Label do dia */}
                <div className="w-12 text-xs text-gray-400 text-right pr-2">
                  {dayName}
                </div>
                
                {/* Células das horas */}
                <div className="flex-1 flex">
                  {activityMatrix[dayIndex].map((cell, hourIndex) => {
                    const intensity = getIntensity(cell.count)
                    const isSelected = selectedDay === dayIndex && selectedHour === hourIndex
                    
                    return (
                      <div
                        key={hourIndex}
                        className={`flex-1 h-8 border border-gray-800 cursor-pointer transition-all duration-200 hover:scale-105 min-w-8 ${
                          isSelected ? 'ring-2 ring-orange-400' : ''
                        }`}
                        style={{
                          backgroundColor: getHeatmapColor(intensity),
                          boxShadow: isSelected ? '0 0 10px rgba(251, 146, 60, 0.5)' : 'none'
                        }}
                        onClick={() => {
                          if (selectedDay === dayIndex && selectedHour === hourIndex) {
                            setSelectedDay(null)
                            setSelectedHour(null)
                          } else {
                            setSelectedDay(dayIndex)
                            setSelectedHour(hourIndex)
                          }
                        }}
                        title={`${dayName} ${hourIndex}:00 - ${cell.count} atividades`}
                      >
                        {/* Indicador de atividade alta */}
                        {cell.count > 0 && (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold opacity-80">
                              {cell.count > 9 ? '9+' : cell.count > 0 ? cell.count : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Estatísticas por período */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-400">Hora mais ativa</p>
            <p className="text-sm font-semibold text-white">
              {(() => {
                let maxHour = 0
                let maxCount = 0
                for (let h = 0; h < 24; h++) {
                  const totalForHour = activityMatrix.reduce((sum, day) => sum + day[h].count, 0)
                  if (totalForHour > maxCount) {
                    maxCount = totalForHour
                    maxHour = h
                  }
                }
                return `${maxHour}:00 (${maxCount})`
              })()}
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-400">Dia mais ativo</p>
            <p className="text-sm font-semibold text-white">
              {(() => {
                let maxDay = 0
                let maxCount = 0
                for (let d = 0; d < 7; d++) {
                  const totalForDay = activityMatrix[d].reduce((sum, hour) => sum + hour.count, 0)
                  if (totalForDay > maxCount) {
                    maxCount = totalForDay
                    maxDay = d
                  }
                }
                return `${dayNames[maxDay]} (${maxCount})`
              })()}
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-400">Período pico</p>
            <p className="text-sm font-semibold text-white">
              {(() => {
                let maxActivity = 0
                let maxDay = 0
                let maxHour = 0
                
                for (let d = 0; d < 7; d++) {
                  for (let h = 0; h < 24; h++) {
                    if (activityMatrix[d][h].count > maxActivity) {
                      maxActivity = activityMatrix[d][h].count
                      maxDay = d
                      maxHour = h
                    }
                  }
                }
                
                return maxActivity > 0 ? `${dayNames[maxDay]} ${maxHour}:00` : 'N/A'
              })()}
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-400">Média/hora</p>
            <p className="text-sm font-semibold text-white">
              {(logs.length / (7 * 24)).toFixed(1)}
            </p>
          </div>
        </div>
        
        {/* Detalhes da célula selecionada */}
        {selectedDay !== null && selectedHour !== null && (
          <div className="mt-6 bg-gray-700 rounded-xl p-4 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold">
                📍 {dayNames[selectedDay]} {selectedHour}:00 - {selectedHour + 1}:00
              </h4>
              <button
                onClick={() => {
                  setSelectedDay(null)
                  setSelectedHour(null)
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            {activityMatrix[selectedDay][selectedHour].count > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Atividades neste período */}
                <div>
                  <p className="text-sm text-gray-400 mb-2">
                    Atividades ({activityMatrix[selectedDay][selectedHour].count}):
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {Object.entries(activityMatrix[selectedDay][selectedHour].types)
                      .sort(([,a], [,b]) => b - a)
                      .map(([type, count]) => (
                        <div key={type} className="flex justify-between text-xs">
                          <span className="text-gray-300">
                            {type === 'status_change' && '🔄 Status'}
                            {type === 'world_change' && '🌍 Mundos'}
                            {type === 'avatar_change' && '👤 Avatars'}
                            {type === 'description_change' && '📝 Descrição'}
                            {type === 'bio_change' && '📄 Bio'}
                            {type === 'came_online' && '✅ Online'}
                            {type === 'went_offline' && '😴 Offline'}
                            {type === 'joined_private' && '🔒 Privado'}
                          </span>
                          <span className="text-white font-medium">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
                
                {/* Amigos ativos */}
                <div>
                  <p className="text-sm text-gray-400 mb-2">Amigos ativos:</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {[...new Set(activityMatrix[selectedDay][selectedHour].logs.map(log => log.friendName))]
                      .slice(0, 8)
                      .map((friendName, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs">
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <span className="text-gray-300">{friendName}</span>
                          <span className="text-gray-500">
                            ({activityMatrix[selectedDay][selectedHour].logs.filter(log => log.friendName === friendName).length})
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Nenhuma atividade registrada neste período.</p>
            )}
          </div>
        )}
      </div>
    )
  }

  // Função para exportar logs de atividade
  const NetworkVisualization = ({ logs }) => {
    const [selectedFriend, setSelectedFriend] = useState(null)
    
    // Agrupar logs por amigo
    const friendNodes = logs.reduce((acc, log) => {
      if (!acc[log.friendId]) {
        acc[log.friendId] = {
          id: log.friendId,
          name: log.friendName,
          avatar: log.friendAvatar,
          logs: [],
          types: {},
          connections: new Set()
        }
      }
      
      acc[log.friendId].logs.push(log)
      acc[log.friendId].types[log.type] = (acc[log.friendId].types[log.type] || 0) + 1
      
      return acc
    }, {})
    
    // Criar conexões baseadas em atividades simultâneas ou relacionadas
    Object.values(friendNodes).forEach(friend => {
      friend.logs.forEach(log => {
        // Encontrar atividades similares de outros amigos no mesmo período (±30 min)
        const timeWindow = 30 * 60 * 1000 // 30 minutos
        const logTime = new Date(log.timestamp).getTime()
        
        Object.values(friendNodes).forEach(otherFriend => {
          if (friend.id !== otherFriend.id) {
            const hasRelatedActivity = otherFriend.logs.some(otherLog => {
              const otherTime = new Date(otherLog.timestamp).getTime()
              return Math.abs(logTime - otherTime) < timeWindow && 
                     (otherLog.type === log.type || 
                      (log.type === 'world_change' && otherLog.type === 'world_change' && 
                       log.details?.toWorld === otherLog.details?.toWorld))
            })
            
            if (hasRelatedActivity) {
              friend.connections.add(otherFriend.id)
            }
          }
        })
      })
    })
    
    const friends = Object.values(friendNodes)
    
    // Calcular posições em círculo
    const centerX = 200
    const centerY = 200
    const radius = 150
    
    const getPosition = (index, total) => {
      const angle = (index / total) * 2 * Math.PI
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      }
    }
    
    // Obter cor dominante
    const getDominantColor = (types) => {
      const dominant = Object.entries(types).reduce((a, b) => types[a[0]] > types[b[0]] ? a : b)
      const colorMap = {
        'status_change': '#F59E0B',
        'world_change': '#10B981',
        'avatar_change': '#EC4899',
        'description_change': '#3B82F6',
        'bio_change': '#8B5CF6',
        'came_online': '#059669',
        'went_offline': '#DC2626',
        'joined_private': '#6366F1'
      }
      return colorMap[dominant[0]] || '#6B7280'
    }
    
    return (
      <div className="relative">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-400">
            🌐 {friends.length} amigos conectados • {logs.length} atividades
          </div>
          <button
            onClick={() => setSelectedFriend(null)}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              selectedFriend ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-400'
            }`}
            disabled={!selectedFriend}
          >
            🔄 Resetar seleção
          </button>
        </div>
        
        {/* SVG Network */}
        <div className="bg-gray-900 rounded-xl p-4" style={{ height: '500px' }}>
          <svg width="100%" height="100%" viewBox="0 0 400 400" className="overflow-visible">
            {/* Conexões */}
            {friends.map((friend, index) => {
              const pos = getPosition(index, friends.length)
              
              return Array.from(friend.connections).map(connectionId => {
                const connectedFriend = friends.find(f => f.id === connectionId)
                if (!connectedFriend) return null
                
                const connectedIndex = friends.indexOf(connectedFriend)
                const connectedPos = getPosition(connectedIndex, friends.length)
                
                return (
                  <line
                    key={`${friend.id}-${connectionId}`}
                    x1={pos.x}
                    y1={pos.y}
                    x2={connectedPos.x}
                    y2={connectedPos.y}
                    stroke="rgba(139, 92, 246, 0.3)"
                    strokeWidth={selectedFriend === friend.id || selectedFriend === connectionId ? "2" : "1"}
                    className="transition-all duration-300"
                  />
                )
              })
            })}
            
            {/* Nós dos amigos */}
            {friends.map((friend, index) => {
              const pos = getPosition(index, friends.length)
              const isSelected = selectedFriend === friend.id
              const nodeSize = Math.min(20 + friend.logs.length * 2, 40)
              
              return (
                <g key={friend.id}>
                  {/* Círculo de fundo */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeSize}
                    fill={getDominantColor(friend.types)}
                    stroke={isSelected ? "#F59E0B" : "transparent"}
                    strokeWidth={isSelected ? "3" : "0"}
                    className="cursor-pointer transition-all duration-300 hover:stroke-white hover:stroke-2"
                    onClick={() => setSelectedFriend(isSelected ? null : friend.id)}
                  />
                  
                  {/* Avatar (simulado) */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeSize - 4}
                    fill="url(#avatar-pattern)"
                    className="cursor-pointer"
                    onClick={() => setSelectedFriend(isSelected ? null : friend.id)}
                  />
                  
                  {/* Contador de atividades */}
                  <circle
                    cx={pos.x + nodeSize - 8}
                    cy={pos.y - nodeSize + 8}
                    r="8"
                    fill="#1F2937"
                    stroke="#374151"
                    strokeWidth="2"
                  />
                  <text
                    x={pos.x + nodeSize - 8}
                    y={pos.y - nodeSize + 8}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="10"
                    fill="#FFFFFF"
                    fontWeight="bold"
                  >
                    {friend.logs.length}
                  </text>
                  
                  {/* Nome do amigo */}
                  <text
                    x={pos.x}
                    y={pos.y + nodeSize + 15}
                    textAnchor="middle"
                    fontSize="11"
                    fill={isSelected ? "#F59E0B" : "#9CA3AF"}
                    fontWeight={isSelected ? "bold" : "normal"}
                    className="pointer-events-none"
                  >
                    {friend.name.length > 12 ? friend.name.substring(0, 12) + '...' : friend.name}
                  </text>
                </g>
              )
            })}
            
            {/* Pattern para avatars */}
            <defs>
              <pattern id="avatar-pattern" patternUnits="objectBoundingBox" width="1" height="1">
                <rect width="1" height="1" fill="#374151"/>
                <circle cx="0.5" cy="0.35" r="0.2" fill="#6B7280"/>
                <ellipse cx="0.5" cy="0.8" rx="0.35" ry="0.3" fill="#6B7280"/>
              </pattern>
            </defs>
          </svg>
        </div>
        
        {/* Detalhes do amigo selecionado */}
        {selectedFriend && friendNodes[selectedFriend] && (
          <div className="mt-6 bg-gray-700 rounded-xl p-4 border-l-4 border-orange-500">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={friendNodes[selectedFriend].avatar}
                alt={friendNodes[selectedFriend].name}
                className="w-12 h-12 rounded-full object-cover bg-gray-600"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzc0MTUxIiByeD0iMjQiLz48cGF0aCBkPSJNMjQgMTJDMTguNDggMTIgMTQgMTYuNDggMTQgMjJTMTguNDggMzIgMjQgMzJTMzQgMjcuNTIgMzQgMjJTMjkuNTIgMTIgMjQgMTJaTTI0IDI2QzIwLjY4IDI2IDE4IDIzLjMyIDE4IDIwUzIwLjY4IDE0IDI0IDE0UzMwIDIwLjY4IDMwIDIwUzI3LjMyIDI2IDI0IDI2WiIgZmlsbD0iIzZCNzI4MCIvPjwvc3ZnPg=='
                }}
              />
              <div>
                <h4 className="text-white font-semibold">{friendNodes[selectedFriend].name}</h4>
                <p className="text-sm text-gray-400">{friendNodes[selectedFriend].logs.length} atividades</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipos de atividade */}
              <div>
                <p className="text-sm text-gray-400 mb-2">Distribuição de atividades:</p>
                <div className="space-y-2">
                  {Object.entries(friendNodes[selectedFriend].types)
                    .sort(([,a], [,b]) => b - a)
                    .map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-xs text-gray-300">
                          {type === 'status_change' && '🔄 Status'}
                          {type === 'world_change' && '🌍 Mundos'}
                          {type === 'avatar_change' && '👤 Avatars'}
                          {type === 'description_change' && '📝 Descrição'}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-600 rounded-full h-2">
                            <div 
                              className="h-2 bg-orange-500 rounded-full"
                              style={{ width: `${(count / friendNodes[selectedFriend].logs.length) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-white font-medium w-6">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              
              {/* Conexões */}
              <div>
                <p className="text-sm text-gray-400 mb-2">Conectado com:</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {Array.from(friendNodes[selectedFriend].connections)
                    .map(connectionId => friends.find(f => f.id === connectionId))
                    .filter(Boolean)
                    .slice(0, 6)
                    .map((connectedFriend, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-gray-300">{connectedFriend.name}</span>
                      </div>
                    ))}
                  {friendNodes[selectedFriend].connections.size === 0 && (
                    <span className="text-xs text-gray-500">Nenhuma conexão detectada</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
  const FlowMapVisualization = ({ logs }) => {
    const [selectedNode, setSelectedNode] = useState(null)
    
    // Agrupar logs por hora para criar nós temporais
    const timeNodes = logs.reduce((acc, log) => {
      const hour = new Date(log.timestamp).getHours()
      const timeKey = `${hour}:00`
      
      if (!acc[timeKey]) {
        acc[timeKey] = {
          time: timeKey,
          hour: hour,
          logs: [],
          count: 0,
          types: {}
        }
      }
      
      acc[timeKey].logs.push(log)
      acc[timeKey].count++
      acc[timeKey].types[log.type] = (acc[timeKey].types[log.type] || 0) + 1
      
      return acc
    }, {})
    
    const sortedNodes = Object.values(timeNodes).sort((a, b) => a.hour - b.hour)
    
    // Função para obter cor baseada no tipo de atividade dominante
    const getNodeColor = (types) => {
      const dominant = Object.entries(types).reduce((a, b) => types[a[0]] > types[b[0]] ? a : b)
      const colorMap = {
        'status_change': 'bg-yellow-500',
        'world_change': 'bg-green-500',
        'avatar_change': 'bg-pink-500',
        'description_change': 'bg-blue-500',
        'bio_change': 'bg-purple-500',
        'came_online': 'bg-emerald-500',
        'went_offline': 'bg-red-500',
        'joined_private': 'bg-indigo-500'
      }
      return colorMap[dominant[0]] || 'bg-gray-500'
    }
    
    // Função para obter tamanho do nó baseado na quantidade de atividades
    const getNodeSize = (count) => {
      if (count >= 10) return 'w-16 h-16'
      if (count >= 5) return 'w-12 h-12'
      if (count >= 2) return 'w-10 h-10'
      return 'w-8 h-8'
    }
    
    return (
      <div className="relative">
        {/* Cabeçalho do Flow Map */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-400">
            📍 {sortedNodes.length} nós temporais • {logs.length} atividades
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-400">Status</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-400">Mundos</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
              <span className="text-gray-400">Avatars</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-400">Perfil</span>
            </div>
          </div>
        </div>
        
        {/* Container do Fluxo */}
        <div className="relative overflow-x-auto" style={{ minHeight: '400px' }}>
          {/* Linha temporal de fundo */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 via-blue-500 to-green-500 transform -translate-y-1/2"></div>
          
          {/* Grid de 24 horas */}
          <div className="relative flex items-center justify-between" style={{ minWidth: '1200px', height: '400px' }}>
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="flex flex-col items-center relative">
                {/* Linha de hora */}
                <div className="absolute top-0 w-px h-full bg-gray-700 opacity-30"></div>
                
                {/* Label da hora */}
                <div className="text-xs text-gray-500 mb-2">{i}:00</div>
                
                {/* Nó de atividade (se existir) */}
                {timeNodes[`${i}:00`] && (
                  <div
                    className={`relative cursor-pointer transform transition-all duration-300 hover:scale-110 ${
                      getNodeSize(timeNodes[`${i}:00`].count)
                    } ${getNodeColor(timeNodes[`${i}:00`].types)} rounded-full shadow-lg flex items-center justify-center`}
                    style={{
                      marginTop: '50px',
                      boxShadow: selectedNode === `${i}:00` ? '0 0 20px rgba(139, 92, 246, 0.6)' : '0 4px 15px rgba(0, 0, 0, 0.3)'
                    }}
                    onClick={() => setSelectedNode(selectedNode === `${i}:00` ? null : `${i}:00`)}
                  >
                    {/* Contador de atividades */}
                    <span className="text-white font-bold text-xs">
                      {timeNodes[`${i}:00`].count}
                    </span>
                    
                    {/* Pulso animado para alta atividade */}
                    {timeNodes[`${i}:00`].count >= 5 && (
                      <div className={`absolute inset-0 ${getNodeColor(timeNodes[`${i}:00`].types)} rounded-full animate-ping opacity-20`}></div>
                    )}
                  </div>
                )}
                
                {/* Conexões entre nós */}
                {timeNodes[`${i}:00`] && timeNodes[`${i + 1}:00`] && (
                  <div className="absolute top-1/2 left-full w-8 h-0.5 bg-gradient-to-r from-current to-transparent opacity-60 transform -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Modal de detalhes do nó selecionado */}
        {selectedNode && timeNodes[selectedNode] && (
          <div className="mt-6 bg-gray-700 rounded-xl p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold">🕐 {selectedNode}</h4>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Estatísticas do período */}
              <div>
                <p className="text-sm text-gray-400 mb-2">Estatísticas:</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total de atividades:</span>
                    <span className="text-white font-medium">{timeNodes[selectedNode].count}</span>
                  </div>
                  {Object.entries(timeNodes[selectedNode].types).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span className="text-gray-300">
                        {type === 'status_change' && '🔄 Status'}
                        {type === 'world_change' && '🌍 Mundos'}
                        {type === 'avatar_change' && '👤 Avatars'}
                        {type === 'description_change' && '📝 Descrição'}
                        {type === 'bio_change' && '📄 Bio'}
                        {type === 'came_online' && '✅ Online'}
                        {type === 'went_offline' && '😴 Offline'}
                        {type === 'joined_private' && '🔒 Privado'}
                      </span>
                      <span className="text-white font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Amigos ativos no período */}
              <div>
                <p className="text-sm text-gray-400 mb-2">Amigos ativos:</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {[...new Set(timeNodes[selectedNode].logs.map(log => log.friendName))]
                    .slice(0, 8)
                    .map((friendName, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-gray-300">{friendName}</span>
                        <span className="text-gray-500">
                          ({timeNodes[selectedNode].logs.filter(log => log.friendName === friendName).length})
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
  const exportActivityLogs = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalLogs: activityLogs.length,
      summary: {
        statusChanges: activityLogs.filter(log => log.type === 'status_change').length,
        worldChanges: activityLogs.filter(log => ['world_change', 'came_online', 'went_offline', 'joined_private'].includes(log.type)).length,
        avatarChanges: activityLogs.filter(log => ['avatar_change', 'current_avatar_change'].includes(log.type)).length,
        profileChanges: activityLogs.filter(log => ['description_change', 'bio_change', 'profile_picture_change', 'tags_change'].includes(log.type)).length,
      },
      logs: activityLogs.map(log => ({
        ...log,
        friendName: log.friendName,
        type: log.type,
        priority: log.priority,
        timestamp: log.timestamp,
        details: log.details,
        context: log.details?.context
      }))
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `vrchat-activity-logs-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  const detectFriendChanges = (newFriends) => {
    if (!newFriends || !Array.isArray(newFriends) || newFriends.length === 0) return
    
    const now = new Date()
    const newLogs = []
    
    newFriends.forEach(friend => {
      const friendId = friend.id
      const previousState = friendsHistory.get(friendId)
      
      if (!previousState) {
        // Primeiro carregamento do amigo - registrar estado inicial
        friendsHistory.set(friendId, {
          status: friend.status,
          location: friend.location,
          worldName: parseWorldLocation(friend.location),
          avatarImageUrl: friend.userIcon,
          displayName: friend.displayName,
          statusDescription: friend.statusDescription || '',
          bio: friend.bio || '',
          profilePicOverride: friend.profilePicOverride || '',
          currentAvatarImageUrl: friend.currentAvatarImageUrl || '',
          currentAvatarThumbnailImageUrl: friend.currentAvatarThumbnailImageUrl || '',
          tags: friend.tags || [],
          developerType: friend.developerType || 'none',
          lastSeen: friend.last_login,
          lastActivity: friend.last_activity,
          dateJoined: friend.date_joined,
          isFriend: friend.isFriend,
          friendKey: friend.friendKey,
          timestamp: now
        })
        
        // Log de primeiro registro (apenas para debug)
        console.log(`📝 Primeira detecção do amigo: ${friend.displayName}`)
        return
      }
      
      // 🔍 INVESTIGAÇÃO DETALHADA - Detectar TODAS as mudanças possíveis
      
      // 1. Mudanças de STATUS
      if (previousState.status !== friend.status) {
        newLogs.push({
          id: `${Date.now()}_${Math.random()}_status`,
          type: 'status_change',
          friendId: friendId,
          friendName: friend.displayName,
          friendAvatar: friend.userIcon,
          priority: 'high',
          details: {
            from: previousState.status,
            to: friend.status,
            timestamp: now.toISOString(),
            context: 'Status do usuário alterado'
          },
          timestamp: now
        })
      }
      
      // 2. Mudanças de DESCRIÇÃO/STATUS MESSAGE
      if (previousState.statusDescription !== (friend.statusDescription || '')) {
        newLogs.push({
          id: `${Date.now()}_${Math.random()}_description`,
          type: 'description_change',
          friendId: friendId,
          friendName: friend.displayName,
          friendAvatar: friend.userIcon,
          priority: 'medium',
          details: {
            from: previousState.statusDescription,
            to: friend.statusDescription || '',
            timestamp: now.toISOString(),
            context: 'Mensagem de status personalizada alterada'
          },
          timestamp: now
        })
      }
      
      // 3. Mudanças de BIO/PERFIL
      if (previousState.bio !== (friend.bio || '')) {
        newLogs.push({
          id: `${Date.now()}_${Math.random()}_bio`,
          type: 'bio_change',
          friendId: friendId,
          friendName: friend.displayName,
          friendAvatar: friend.userIcon,
          priority: 'low',
          details: {
            from: previousState.bio,
            to: friend.bio || '',
            timestamp: now.toISOString(),
            context: 'Biografia do perfil alterada'
          },
          timestamp: now
        })
      }
      
      // 4. Mudanças de MUNDO/LOCALIZAÇÃO (detalhada)
      const currentWorldName = parseWorldLocation(friend.location)
      if (previousState.location !== friend.location || previousState.worldName !== currentWorldName) {
        let changeType = 'world_change'
        let context = 'Mudança de localização detectada'
        
        if (friend.location?.includes('offline')) {
          changeType = 'went_offline'
          context = 'Usuário ficou offline'
        } else if (friend.location?.includes('private')) {
          changeType = 'joined_private'
          context = 'Entrou em mundo privado'
        } else if (previousState.location?.includes('offline') && !friend.location?.includes('offline')) {
          changeType = 'came_online'
          context = 'Usuário ficou online'
        }
        
        newLogs.push({
          id: `${Date.now()}_${Math.random()}_location`,
          type: changeType,
          friendId: friendId,
          friendName: friend.displayName,
          friendAvatar: friend.userIcon,
          priority: 'high',
          details: {
            fromWorld: previousState.worldName,
            toWorld: currentWorldName,
            fromLocation: previousState.location,
            toLocation: friend.location,
            worldId: friend.location?.split(':')[0] || 'unknown',
            instanceInfo: friend.location?.split(':')[1] || '',
            timestamp: now.toISOString(),
            context: context
          },
          timestamp: now
        })
      }
      
      // 5. Mudanças de AVATAR PRINCIPAL
      if (previousState.avatarImageUrl !== friend.userIcon) {
        newLogs.push({
          id: `${Date.now()}_${Math.random()}_avatar_main`,
          type: 'avatar_change',
          friendId: friendId,
          friendName: friend.displayName,
          friendAvatar: friend.userIcon,
          priority: 'medium',
          details: {
            fromAvatar: previousState.avatarImageUrl,
            toAvatar: friend.userIcon,
            timestamp: now.toISOString(),
            context: 'Avatar principal alterado'
          },
          timestamp: now
        })
      }
      
      // 6. Mudanças de AVATAR ATUAL EM MUNDO
      if (previousState.currentAvatarImageUrl !== (friend.currentAvatarImageUrl || '')) {
        newLogs.push({
          id: `${Date.now()}_${Math.random()}_avatar_current`,
          type: 'current_avatar_change',
          friendId: friendId,
          friendName: friend.displayName,
          friendAvatar: friend.userIcon,
          priority: 'medium',
          details: {
            fromAvatar: previousState.currentAvatarImageUrl,
            toAvatar: friend.currentAvatarImageUrl || '',
            fromThumbnail: previousState.currentAvatarThumbnailImageUrl,
            toThumbnail: friend.currentAvatarThumbnailImageUrl || '',
            timestamp: now.toISOString(),
            context: 'Avatar atual no mundo alterado'
          },
          timestamp: now
        })
      }
      
      // 7. Mudanças de FOTO DE PERFIL
      if (previousState.profilePicOverride !== (friend.profilePicOverride || '')) {
        newLogs.push({
          id: `${Date.now()}_${Math.random()}_profile_pic`,
          type: 'profile_picture_change',
          friendId: friendId,
          friendName: friend.displayName,
          friendAvatar: friend.userIcon,
          priority: 'low',
          details: {
            fromPicture: previousState.profilePicOverride,
            toPicture: friend.profilePicOverride || '',
            timestamp: now.toISOString(),
            context: 'Foto de perfil personalizada alterada'
          },
          timestamp: now
        })
      }
      
      // 8. Mudanças de TAGS/BADGES
      const previousTags = JSON.stringify(previousState.tags || [])
      const currentTags = JSON.stringify(friend.tags || [])
      if (previousTags !== currentTags) {
        newLogs.push({
          id: `${Date.now()}_${Math.random()}_tags`,
          type: 'tags_change',
          friendId: friendId,
          friendName: friend.displayName,
          friendAvatar: friend.userIcon,
          priority: 'low',
          details: {
            fromTags: previousState.tags || [],
            toTags: friend.tags || [],
            addedTags: (friend.tags || []).filter(tag => !(previousState.tags || []).includes(tag)),
            removedTags: (previousState.tags || []).filter(tag => !(friend.tags || []).includes(tag)),
            timestamp: now.toISOString(),
            context: 'Tags/badges do perfil alteradas'
          },
          timestamp: now
        })
      }
      
      // 9. Mudanças de TIPO DE DESENVOLVEDOR
      if (previousState.developerType !== (friend.developerType || 'none')) {
        newLogs.push({
          id: `${Date.now()}_${Math.random()}_dev_type`,
          type: 'developer_type_change',
          friendId: friendId,
          friendName: friend.displayName,
          friendAvatar: friend.userIcon,
          priority: 'low',
          details: {
            from: previousState.developerType,
            to: friend.developerType || 'none',
            timestamp: now.toISOString(),
            context: 'Tipo de desenvolvedor alterado'
          },
          timestamp: now
        })
      }
      
      // 10. Mudanças de ÚLTIMA ATIVIDADE
      if (previousState.lastActivity !== friend.last_activity) {
        newLogs.push({
          id: `${Date.now()}_${Math.random()}_activity`,
          type: 'activity_update',
          friendId: friendId,
          friendName: friend.displayName,
          friendAvatar: friend.userIcon,
          priority: 'low',
          details: {
            fromActivity: previousState.lastActivity,
            toActivity: friend.last_activity,
            activityGap: friend.last_activity && previousState.lastActivity ? 
              new Date(friend.last_activity) - new Date(previousState.lastActivity) : null,
            timestamp: now.toISOString(),
            context: 'Última atividade atualizada'
          },
          timestamp: now
        })
      }
      
      // Atualizar estado histórico completo
      friendsHistory.set(friendId, {
        status: friend.status,
        location: friend.location,
        worldName: currentWorldName,
        avatarImageUrl: friend.userIcon,
        displayName: friend.displayName,
        statusDescription: friend.statusDescription || '',
        bio: friend.bio || '',
        profilePicOverride: friend.profilePicOverride || '',
        currentAvatarImageUrl: friend.currentAvatarImageUrl || '',
        currentAvatarThumbnailImageUrl: friend.currentAvatarThumbnailImageUrl || '',
        tags: friend.tags || [],
        developerType: friend.developerType || 'none',
        lastSeen: friend.last_login,
        lastActivity: friend.last_activity,
        dateJoined: friend.date_joined,
        isFriend: friend.isFriend,
        friendKey: friend.friendKey,
        timestamp: now
      })
    })
    
    // Adicionar novos logs ao início do array (mais recente primeiro)
    if (newLogs.length > 0) {
      console.log(`🔍 Detectadas ${newLogs.length} mudanças nos amigos:`, newLogs)
      setActivityLogs(prev => [...newLogs, ...prev].slice(0, 500)) // Manter 500 logs para análise detalhada
    }
  }

  // Analisa dados detalhados de mundos baseado nos amigos
  const getWorldsAnalysis = (friends, recentWorlds) => {
    if (!friends || !Array.isArray(friends)) {
      return {
        activeWorlds: [],
        popularWorlds: [],
        worldsByCategory: {},
        instanceTypes: { public: 0, friendsOnly: 0, friendsOfGuests: 0, inviteOnly: 0, group: 0 },
        totalActiveInstances: 0
      }
    }

    // Extrai informações de mundos dos amigos online
    const worldData = friends
      .filter(f => f.status !== 'offline' && f.location && f.location !== 'private')
      .map(f => {
        const locationParts = f.location.split(':')
        const worldId = locationParts[0]
        const instanceInfo = locationParts[1] || ''
        
        // Determina o tipo de instância
        let instanceType = 'public'
        if (instanceInfo.includes('~friends')) instanceType = 'friendsOnly'
        else if (instanceInfo.includes('~hidden')) instanceType = 'friendsOfGuests'
        else if (instanceInfo.includes('~private')) instanceType = 'inviteOnly'
        else if (instanceInfo.includes('~group')) instanceType = 'group'
        
        return {
          worldId,
          worldName: parseWorldLocation(f.location),
          friendName: f.displayName,
          friendStatus: f.status,
          instanceType,
          fullLocation: f.location,
          instanceInfo
        }
      })

    // Agrupa por mundo e conta amigos
    const worldStats = {}
    worldData.forEach(world => {
      if (!worldStats[world.worldId]) {
        worldStats[world.worldId] = {
          worldId: world.worldId,
          worldName: world.worldName,
          friends: [],
          instances: new Set(),
          instanceTypes: new Set(),
          totalFriends: 0
        }
      }
      
      worldStats[world.worldId].friends.push({
        name: world.friendName,
        status: world.friendStatus
      })
      worldStats[world.worldId].instances.add(world.instanceInfo)
      worldStats[world.worldId].instanceTypes.add(world.instanceType)
      worldStats[world.worldId].totalFriends++
    })

    // Converte para array e ordena por popularidade
    const activeWorlds = Object.values(worldStats)
      .map(world => ({
        ...world,
        instances: Array.from(world.instances),
        instanceTypes: Array.from(world.instanceTypes),
        instanceCount: world.instances.size
      }))
      .sort((a, b) => b.totalFriends - a.totalFriends)

    // Mundos mais populares (com mais de 1 amigo)
    const popularWorlds = activeWorlds.filter(w => w.totalFriends > 1)

    // Estatísticas de tipos de instância
    const instanceTypes = {
      public: worldData.filter(w => w.instanceType === 'public').length,
      friendsOnly: worldData.filter(w => w.instanceType === 'friendsOnly').length,
      friendsOfGuests: worldData.filter(w => w.instanceType === 'friendsOfGuests').length,
      inviteOnly: worldData.filter(w => w.instanceType === 'inviteOnly').length,
      group: worldData.filter(w => w.instanceType === 'group').length
    }

    // Integra com mundos recentes se disponível
    let recentWorldsFormatted = []
    if (recentWorlds && Array.isArray(recentWorlds.worlds)) {
      recentWorldsFormatted = recentWorlds.worlds.map(world => ({
        id: world.id,
        name: world.name || 'Mundo Sem Nome',
        authorName: world.authorName || 'Autor Desconhecido',
        imageUrl: world.imageUrl || '',
        visitedAt: new Date(world.visitedAt || world.updated_at || Date.now()),
        capacity: world.capacity || 0,
        description: world.description || '',
        tags: world.tags || [],
        favorites: world.favorites || 0,
        visits: world.visits || 0,
        popularity: world.popularity || 0,
        releaseStatus: world.releaseStatus || 'public'
      }))
    }

    return {
      activeWorlds,
      popularWorlds,
      recentWorlds: recentWorldsFormatted,
      instanceTypes,
      totalActiveInstances: worldData.length,
      uniqueActiveWorlds: activeWorlds.length,
      worldsWithMultipleFriends: popularWorlds.length
    }
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
                { id: 'activity', label: 'Atividade dos Amigos', icon: ClockIcon },
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
                  <WorldExplorer />
                </motion.div>
              )}

              {activeSection === 'activity' && (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Header da Atividade */}
                  <div className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-white flex items-center">
                        <ClockIcon className="w-6 h-6 mr-2 text-orange-400" />
                        Atividade dos Amigos
                      </h2>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-400">
                          {activityLogs.length} atividades registradas
                        </span>
                        <button
                          onClick={exportActivityLogs}
                          disabled={activityLogs.length === 0}
                          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center"
                        >
                          📥 Exportar
                        </button>
                        <button
                          onClick={loadDashboardData}
                          disabled={loadingDashboard}
                          className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center"
                        >
                          {loadingDashboard ? (
                            <>
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                              Atualizando...
                            </>
                          ) : (
                            <>
                              🔄 Atualizar
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Filtros de Atividade */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Tipo de Atividade:</label>
                        <select
                          value={activityFilters.type}
                          onChange={(e) => setActivityFilters(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="all">Todas as atividades</option>
                          <option value="status_change">🔄 Mudanças de status</option>
                          <option value="description_change">📝 Mudanças de descrição</option>
                          <option value="bio_change">📄 Mudanças de bio</option>
                          <option value="world_change">🌍 Mudanças de mundo</option>
                          <option value="went_offline">😴 Ficou offline</option>
                          <option value="came_online">✅ Ficou online</option>
                          <option value="joined_private">🔒 Entrou em privado</option>
                          <option value="avatar_change">👤 Mudanças de avatar</option>
                          <option value="current_avatar_change">🎭 Avatar atual alterado</option>
                          <option value="profile_picture_change">🖼️ Foto de perfil</option>
                          <option value="tags_change">🏷️ Tags/badges alteradas</option>
                          <option value="developer_type_change">💻 Tipo desenvolvedor</option>
                          <option value="activity_update">⏰ Atividade atualizada</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Amigo:</label>
                        <select
                          value={activityFilters.friend}
                          onChange={(e) => setActivityFilters(prev => ({ ...prev, friend: e.target.value }))}
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="all">Todos os amigos</option>
                          {dashboardData?.friends?.friends?.map(friend => (
                            <option key={friend.id} value={friend.id}>
                              {friend.displayName}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Período:</label>
                        <select
                          value={activityFilters.timeRange}
                          onChange={(e) => setActivityFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="all">Todo o período</option>
                          <option value="today">Hoje</option>
                          <option value="week">Última semana</option>
                          <option value="month">Último mês</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Controles de Visualização */}
                  <div className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        🎛️ Modo de Visualização
                      </h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setActivityFilters(prev => ({ ...prev, viewMode: 'timeline' }))}
                          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                            activityFilters.viewMode === 'timeline' 
                              ? 'bg-orange-600 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          📋 Lista Timeline
                        </button>
                        <button
                          onClick={() => setActivityFilters(prev => ({ ...prev, viewMode: 'flowmap' }))}
                          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                            activityFilters.viewMode === 'flowmap' 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          🗺️ Mapa de Fluxo
                        </button>
                        <button
                          onClick={() => setActivityFilters(prev => ({ ...prev, viewMode: 'network' }))}
                          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                            activityFilters.viewMode === 'network' 
                              ? 'bg-cyan-600 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          🌐 Rede Neural
                        </button>
                        <button
                          onClick={() => setActivityFilters(prev => ({ ...prev, viewMode: 'heatmap' }))}
                          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                            activityFilters.viewMode === 'heatmap' 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          🔥 Mapa de Calor
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Visualização de Atividades */}
                  <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      {activityFilters.viewMode === 'timeline' && '📅 Timeline de Atividades'}
                      {activityFilters.viewMode === 'flowmap' && '🗺️ Mapa de Fluxo Temporal'}
                      {activityFilters.viewMode === 'network' && '🌐 Rede Neural de Atividades'}
                      {activityFilters.viewMode === 'heatmap' && '🔥 Mapa de Calor de Atividades'}
                    </h3>
                    
                    {activityLogs.length === 0 ? (
                      <div className="text-center py-8">
                        <ClockIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-400">Nenhuma atividade registrada ainda.</p>
                        <p className="text-sm text-gray-500 mt-1">
                          As atividades dos amigos aparecerão aqui conforme eles mudam de status, mundo ou avatar.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Timeline Tradicional */}
                        {activityFilters.viewMode === 'timeline' && (
                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            {activityLogs
                              .filter(log => {
                                // Filtrar por tipo
                                if (activityFilters.type !== 'all' && log.type !== activityFilters.type) return false
                                
                                // Filtrar por amigo
                                if (activityFilters.friend !== 'all' && log.friendId !== activityFilters.friend) return false
                                
                                // Filtrar por período
                                if (activityFilters.timeRange !== 'all') {
                                  const logDate = new Date(log.timestamp)
                                  const now = new Date()
                                  
                                  switch (activityFilters.timeRange) {
                                    case 'today':
                                      return logDate.toDateString() === now.toDateString()
                                    case 'week':
                                      return (now - logDate) <= 7 * 24 * 60 * 60 * 1000
                                    case 'month':
                                      return (now - logDate) <= 30 * 24 * 60 * 60 * 1000
                                    default:
                                      return true
                                  }
                                }
                                
                                return true
                              })
                              .map((log) => (
                                <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                                  <img
                                    src={log.friendAvatar}
                                    alt={log.friendName}
                                    className="w-10 h-10 rounded-full object-cover bg-gray-600 flex-shrink-0"
                                    onError={(e) => {
                                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzc0MTUxIiByeD0iMjAiLz48cGF0aCBkPSJNMjAgMTBDMTUuNTggMTAgMTIgMTMuNTggMTIgMTggUzE1LjU4IDI2IDIwIDI2UzI4IDIyLjQyIDI4IDE4UzI0LjQyIDEwIDIwIDEwWk0yMCAyMkMxNy43OSAyMiAxNiAyMC4yMSAxNiAxOFMxNy43OSAxNCAyMCAxNFMyNCAyMy43OSAyNCAxOFMyMi4yMSAyMiAyMCAyMloiIGZpbGw9IiM2QjcyODAiLz48L3N2Zz4='
                                    }}
                                  />
                                  {/* Conteúdo detalhado que já existe */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className="text-white font-medium">{log.friendName}</p>
                                      <div className="flex items-center space-x-2">
                                        {log.priority === 'high' && <span className="text-red-400 text-xs">🔴 Alto</span>}
                                        {log.priority === 'medium' && <span className="text-yellow-400 text-xs">🟡 Médio</span>}
                                        {log.priority === 'low' && <span className="text-gray-400 text-xs">⚪ Baixo</span>}
                                        <span className="text-xs text-gray-400">
                                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="mt-1">
                                      {/* Todo o conteúdo detalhado que já implementamos */}
                                      {log.type === 'status_change' && (
                                        <div className="space-y-1">
                                          <p className="text-sm text-gray-300">
                                            🔄 <span className="text-yellow-400">{log.details.from}</span> → <span className="text-green-400">{log.details.to}</span>
                                          </p>
                                          <p className="text-xs text-gray-500">{log.details.context}</p>
                                        </div>
                                      )}
                                      {/* Outros tipos de log continuam... */}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Mapa de Fluxo Temporal */}
                        {activityFilters.viewMode === 'flowmap' && (
                          <FlowMapVisualization 
                            logs={activityLogs.filter(log => {
                              if (activityFilters.type !== 'all' && log.type !== activityFilters.type) return false
                              if (activityFilters.friend !== 'all' && log.friendId !== activityFilters.friend) return false
                              return true
                            })} 
                          />
                        )}

                        {/* Rede Neural de Atividades */}
                        {activityFilters.viewMode === 'network' && (
                          <NetworkVisualization 
                            logs={activityLogs.filter(log => {
                              if (activityFilters.type !== 'all' && log.type !== activityFilters.type) return false
                              if (activityFilters.friend !== 'all' && log.friendId !== activityFilters.friend) return false
                              return true
                            })} 
                          />
                        )}

                        {/* Mapa de Calor */}
                        {activityFilters.viewMode === 'heatmap' && (
                          <HeatmapVisualization 
                            logs={activityLogs.filter(log => {
                              if (activityFilters.type !== 'all' && log.type !== activityFilters.type) return false
                              if (activityFilters.friend !== 'all' && log.friendId !== activityFilters.friend) return false
                              return true
                            })} 
                          />
                        )}
                      </>
                    )}
                  </div>

                  {/* Estatísticas de Atividade Detalhadas */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="bg-gray-800 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Total</p>
                          <p className="text-2xl font-bold text-white">{activityLogs.length}</p>
                        </div>
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                          📊
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Status</p>
                          <p className="text-xl font-bold text-yellow-400">
                            {activityLogs.filter(log => log.type === 'status_change').length}
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                          🔄
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Mundos</p>
                          <p className="text-xl font-bold text-green-400">
                            {activityLogs.filter(log => ['world_change', 'came_online', 'went_offline', 'joined_private'].includes(log.type)).length}
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                          🌍
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Avatars</p>
                          <p className="text-xl font-bold text-pink-400">
                            {activityLogs.filter(log => ['avatar_change', 'current_avatar_change'].includes(log.type)).length}
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
                          👤
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Perfil</p>
                          <p className="text-xl font-bold text-purple-400">
                            {activityLogs.filter(log => ['description_change', 'bio_change', 'profile_picture_change', 'tags_change'].includes(log.type)).length}
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                          📝
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Análise de Atividade por Amigo */}
                  <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      👥 Análise por Amigo (Top 10 mais ativos)
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(
                        activityLogs.reduce((acc, log) => {
                          acc[log.friendId] = acc[log.friendId] || {
                            name: log.friendName,
                            avatar: log.friendAvatar,
                            count: 0,
                            types: {}
                          }
                          acc[log.friendId].count++
                          acc[log.friendId].types[log.type] = (acc[log.friendId].types[log.type] || 0) + 1
                          return acc
                        }, {})
                      )
                        .sort(([,a], [,b]) => b.count - a.count)
                        .slice(0, 10)
                        .map(([friendId, data]) => (
                          <div key={friendId} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <img
                                src={data.avatar}
                                alt={data.name}
                                className="w-10 h-10 rounded-full object-cover bg-gray-600"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzc0MTUxIiByeD0iMjAiLz48cGF0aCBkPSJNMjAgMTBDMTUuNTggMTAgMTIgMTMuNTggMTIgMTggUzE1LjU4IDI2IDIwIDI2UzI4IDIyLjQyIDI4IDE4UzI0LjQyIDEwIDIwIDEwWk0yMCAyMkMxNy43OSAyMiAxNiAyMC4yMSAxNiAxOFMxNy43OSAxNCAyMCAxNFMyNCAyMy43OSAyNCAxOFMyMi4yMSAyMiAyMCAyMloiIGZpbGw9IiM2QjcyODAiLz48L3N2Zz4='
                                }}
                              />
                              <div>
                                <p className="text-white font-medium">{data.name}</p>
                                <p className="text-sm text-gray-400">{data.count} atividades</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                              {Object.entries(data.types)
                                .sort(([,a], [,b]) => b - a)
                                .slice(0, 3)
                                .map(([type, count]) => (
                                  <span key={type} className="bg-gray-600 px-2 py-1 rounded">
                                    {type === 'status_change' && '🔄'}
                                    {type === 'world_change' && '🌍'}
                                    {type === 'avatar_change' && '👤'}
                                    {type === 'description_change' && '📝'}
                                    {type === 'bio_change' && '📄'}
                                    {type === 'current_avatar_change' && '🎭'}
                                    {type === 'profile_picture_change' && '🖼️'}
                                    {type === 'tags_change' && '🏷️'}
                                    {type === 'came_online' && '✅'}
                                    {type === 'went_offline' && '😴'}
                                    {type === 'joined_private' && '🔒'}
                                    {count}
                                  </span>
                                ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
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
                  <h2 className="text-xl font-bold text-white">Estatísticas da API Real</h2>
                  
                  {dashboardData?.friends?.friends ? (() => {
                    const detailedStats = getDetailedStats(dashboardData.friends.friends, dashboardData.currentUser)
                    
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Estatísticas de Amigos */}
                        <div className="bg-gray-800 rounded-xl p-6">
                          <h3 className="text-white font-semibold mb-4 flex items-center">
                            <UserGroupIcon className="w-5 h-5 mr-2 text-blue-400" />
                            Amigos
                          </h3>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Total:</span>
                              <span className="text-blue-400 font-medium">{detailedStats.friends.total}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Online:</span>
                              <span className="text-green-400 font-medium">{detailedStats.friends.online}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Offline:</span>
                              <span className="text-gray-500 font-medium">{detailedStats.friends.offline}</span>
                            </div>
                            <div className="mt-3 bg-gray-700 rounded-full h-2">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                                style={{ width: `${detailedStats.friends.total > 0 ? (detailedStats.friends.online / detailedStats.friends.total) * 100 : 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Estatísticas de Mundos */}
                        <div className="bg-gray-800 rounded-xl p-6">
                          <h3 className="text-white font-semibold mb-4 flex items-center">
                            <GlobeAltIcon className="w-5 h-5 mr-2 text-purple-400" />
                            Mundos
                          </h3>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Únicos:</span>
                              <span className="text-purple-400 font-medium">{detailedStats.worlds.unique}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Públicos:</span>
                              <span className="text-green-400 font-medium">{detailedStats.worlds.public}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Privados:</span>
                              <span className="text-yellow-400 font-medium">{detailedStats.worlds.private}</span>
                            </div>
                          </div>
                        </div>

                        {/* Estatísticas de Plataformas */}
                        <div className="bg-gray-800 rounded-xl p-6">
                          <h3 className="text-white font-semibold mb-4 flex items-center">
                            <DeviceTabletIcon className="w-5 h-5 mr-2 text-cyan-400" />
                            Plataformas
                          </h3>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Desktop:</span>
                              <span className="text-cyan-400 font-medium">{detailedStats.platforms.desktop}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Quest:</span>
                              <span className="text-orange-400 font-medium">{detailedStats.platforms.quest}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Mobile:</span>
                              <span className="text-pink-400 font-medium">{detailedStats.platforms.mobile}</span>
                            </div>
                          </div>
                        </div>

                        {/* Estatísticas de Trust Rank */}
                        <div className="bg-gray-800 rounded-xl p-6">
                          <h3 className="text-white font-semibold mb-4 flex items-center">
                            <ShieldCheckIcon className="w-5 h-5 mr-2 text-yellow-400" />
                            Trust Ranks
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Trusted:</span>
                              <span className="text-purple-400 font-medium">{detailedStats.trust.trusted}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Known:</span>
                              <span className="text-orange-400 font-medium">{detailedStats.trust.known}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">User:</span>
                              <span className="text-green-400 font-medium">{detailedStats.trust.user}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">New:</span>
                              <span className="text-blue-400 font-medium">{detailedStats.trust.new}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Visitor:</span>
                              <span className="text-gray-500 font-medium">{detailedStats.trust.visitor}</span>
                            </div>
                          </div>
                        </div>

                        {/* Estatísticas de Atividade */}
                        <div className="bg-gray-800 rounded-xl p-6">
                          <h3 className="text-white font-semibold mb-4 flex items-center">
                            <BoltIcon className="w-5 h-5 mr-2 text-green-400" />
                            Atividade
                          </h3>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Em Mundo:</span>
                              <span className="text-green-400 font-medium">{detailedStats.activity.inWorld}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Disponível:</span>
                              <span className="text-blue-400 font-medium">{detailedStats.activity.available}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Ocupado:</span>
                              <span className="text-red-400 font-medium">{detailedStats.activity.busy}</span>
                            </div>
                          </div>
                        </div>

                        {/* Informações do Usuário Atual */}
                        {detailedStats.user && (
                          <div className="bg-gray-800 rounded-xl p-6">
                            <h3 className="text-white font-semibold mb-4 flex items-center">
                              <UserIcon className="w-5 h-5 mr-2 text-indigo-400" />
                              Seu Perfil
                            </h3>
                            <div className="space-y-4">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Nome:</span>
                                <span className="text-indigo-400 font-medium text-sm truncate max-w-24" title={detailedStats.user.displayName}>
                                  {detailedStats.user.displayName}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Trust:</span>
                                <span className="text-yellow-400 font-medium capitalize">{detailedStats.user.trustRank}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Status:</span>
                                <span className="text-green-400 font-medium capitalize">{detailedStats.user.status}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })() : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Carregue os dados dos amigos para ver as estatísticas detalhadas</p>
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

// Componente World Explorer - Sistema completo de busca e exploração de mundos
const WorldExplorer = () => {
  const { searchWorlds, getFeaturedWorlds, getWorldDetails, getPopularWorlds } = useVRChatAPI()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popularity')
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [featuredWorlds, setFeaturedWorlds] = useState([])
  const [popularWorlds, setPopularWorlds] = useState([])
  const [selectedWorld, setSelectedWorld] = useState(null)
  const [showWorldModal, setShowWorldModal] = useState(false)
  const [error, setError] = useState(null)

  // Função utilitária para formatar números
  const formatNumber = (num) => {
    if (!num) return '0'
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  // Categorias disponíveis
  const categories = [
    { id: 'all', label: 'Todos', icon: GlobeAltIcon },
    { id: 'social', label: 'Social', icon: UserGroupIcon },
    { id: 'games', label: 'Jogos', icon: '🎮' },
    { id: 'art', label: 'Arte', icon: '🎨' },
    { id: 'music', label: 'Música', icon: '🎵' },
    { id: 'avatar', label: 'Avatar', icon: UserIcon },
    { id: 'roleplay', label: 'Roleplay', icon: '🎭' },
    { id: 'education', label: 'Educação', icon: '📚' }
  ]

  // Opções de ordenação
  const sortOptions = [
    { id: 'popularity', label: 'Popularidade', order: 'descending' },
    { id: 'created', label: 'Mais Recente', order: 'descending' },
    { id: 'updated', label: 'Atualizado', order: 'descending' },
    { id: 'favorites', label: 'Favoritos', order: 'descending' },
    { id: 'visits', label: 'Visitas', order: 'descending' }
  ]

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData()
  }, [])

  // Executar busca quando filtros mudarem
  useEffect(() => {
    // Só executa busca automática se não estiver carregando e houver filtros aplicados
    if (!loading && (selectedCategory !== 'all' || sortBy !== 'popularity')) {
      const timeoutId = setTimeout(() => {
        handleSearch(true) // autoSearch = true
      }, 300) // Debounce de 300ms
      
      return () => clearTimeout(timeoutId)
    }
  }, [selectedCategory, sortBy])

  const loadInitialData = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('🔄 Carregando dados iniciais do World Explorer...')
      
      const [featured, popular] = await Promise.all([
        getFeaturedWorlds(),
        getPopularWorlds()
      ])
      
      console.log('📊 Dados carregados:', { featured, popular })
      
      if (featured?.success) {
        setFeaturedWorlds(featured.data?.worlds || [])
        console.log('⭐ Mundos em destaque carregados:', featured.data?.worlds?.length || 0)
      }
      if (popular?.success) {
        setPopularWorlds(popular.data?.worlds || [])
        console.log('🔥 Mundos populares carregados:', popular.data?.worlds?.length || 0)
      }
    } catch (err) {
      console.error('❌ Erro ao carregar dados iniciais:', err)
      setError('Erro ao carregar mundos')
    } finally {
      setLoading(false)
    }
  }

  // Função de busca
  const handleSearch = async (autoSearch = false) => {
    // Permite busca se há query OU se há filtros aplicados
    if (!autoSearch && !searchQuery.trim() && selectedCategory === 'all') {
      // Se não há busca manual e nem filtros, limpa resultados
      setSearchResults([])
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const options = {
        tag: selectedCategory !== 'all' ? selectedCategory : undefined,
        sort: sortBy,
        order: sortOptions.find(opt => opt.id === sortBy)?.order || 'descending',
        n: 24
      }
      
      console.log('🔍 Executando busca:', { query: searchQuery.trim(), options })
      
      const result = await searchWorlds(searchQuery.trim() || '', options)
      
      console.log('📋 Resultado da busca:', result)
      
      if (result.success) {
        setSearchResults(result.data.worlds || [])
      } else {
        setError(result.error || 'Erro na busca')
        setSearchResults([])
      }
    } catch (err) {
      console.error('Erro na busca:', err)
      setError('Erro ao buscar mundos')
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  // Abrir detalhes do mundo
  const openWorldDetails = async (world) => {
    setSelectedWorld(world)
    setShowWorldModal(true)
    
    try {
      const details = await getWorldDetails(world.id)
      if (details.success) {
        setSelectedWorld(details.data)
      }
    } catch (err) {
      console.error('Erro ao carregar detalhes:', err)
    }
  }

  // Componente de card de mundo
  const WorldCard = ({ world, featured = false }) => {
    const totalInstances = world.instances?.length || 0
    const totalUsers = world.instances?.reduce((sum, instance) => sum + (instance.userCount || 0), 0) || 0
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-750 transition-colors cursor-pointer group"
        onClick={() => openWorldDetails(world)}
      >
        {/* Imagem do mundo */}
        <div className="aspect-video bg-gray-700 relative overflow-hidden">
          {world.imageUrl ? (
            <img 
              src={world.imageUrl} 
              alt={world.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PhotoIcon className="w-12 h-12 text-gray-500" />
            </div>
          )}
          
          {featured && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
              ⭐ Destaque
            </div>
          )}
          
          {/* Indicadores no canto superior direito */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {world.capacity && (
              <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                👥 {world.capacity}
              </div>
            )}
            {totalInstances > 0 && (
              <div className="bg-green-600/90 text-white px-2 py-1 rounded-full text-xs">
                🌐 {totalInstances} instância{totalInstances > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Overlay com informações de instâncias */}
          {totalUsers > 0 && (
            <div className="absolute bottom-2 left-2 bg-blue-600/90 text-white px-2 py-1 rounded-full text-xs">
              👤 {totalUsers} online
            </div>
          )}
        </div>
        
        {/* Informações do mundo */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-blue-300 transition-colors">
              {world.name}
            </h3>
            <p className="text-gray-400 text-xs mt-1">por {world.authorName}</p>
          </div>
          
          {world.description && (
            <p className="text-gray-300 text-xs line-clamp-2">{world.description}</p>
          )}
          
          {/* Estatísticas melhoradas */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <span className="flex items-center text-red-400">
                <HeartIcon className="w-3 h-3 mr-1" />
                {formatNumber(world.favorites || world.favoriteCount || 0)}
              </span>
              <span className="flex items-center text-blue-400">
                <EyeIcon className="w-3 h-3 mr-1" />
                {formatNumber(world.visits || 0)}
              </span>
            </div>
            <div className="flex items-center text-gray-400">
              <ClockIcon className="w-3 h-3 mr-1" />
              {world.updated_at ? new Date(world.updated_at).toLocaleDateString() : 
               world.publicationDate ? new Date(world.publicationDate).toLocaleDateString() : 'N/A'}
            </div>
          </div>

          {/* Indicadores de popularidade */}
          {(world.popularity || world.heat) && (
            <div className="flex items-center justify-between text-xs">
              {world.popularity && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                  <span className="text-yellow-400">Popular: {world.popularity}%</span>
                </div>
              )}
              {world.heat && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                  <span className="text-red-400">Heat: {world.heat}%</span>
                </div>
              )}
            </div>
          )}
          
          {/* Tags */}
          {world.tags && world.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {world.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded hover:bg-gray-600 transition-colors">
                  {tag}
                </span>
              ))}
              {world.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-600 text-gray-400 text-xs rounded">
                  +{world.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Plataforma e status */}
          <div className="flex items-center justify-between text-xs">
            {world.platform && (
              <div className="flex items-center text-gray-400">
                {world.platform === 'standalonewindows' ? '🖥️ PC' :
                 world.platform === 'android' ? '📱 Quest' : '🎮 ' + world.platform}
              </div>
            )}
            {world.releaseStatus && (
              <span className={`px-2 py-1 rounded text-xs ${
                world.releaseStatus === 'public' ? 'bg-green-600/20 text-green-300' :
                world.releaseStatus === 'community' ? 'bg-blue-600/20 text-blue-300' :
                'bg-gray-600/20 text-gray-300'
              }`}>
                {world.releaseStatus}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header e Busca */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">🌍 World Explorer</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setSearchQuery('test')
                setSelectedCategory('social')
                handleSearch()
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              🧪 Teste
            </button>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <GlobeAltIcon className="w-4 h-4" />
              <span>Descubra novos mundos</span>
            </div>
          </div>
        </div>
        
        {/* Barra de busca */}
        <div className="space-y-4">
          <div className="flex space-x-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar mundos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : '🔍 Buscar'}
            </button>
          </div>
          
          {/* Filtros */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Categorias */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Categoria:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
            
            {/* Ordenação */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Botão para limpar filtros */}
            {(selectedCategory !== 'all' || sortBy !== 'popularity' || searchQuery.trim()) && (
              <button
                onClick={() => {
                  setSelectedCategory('all')
                  setSortBy('popularity')
                  setSearchQuery('')
                  setSearchResults([])
                }}
                className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                🔄 Limpar Filtros
              </button>
            )}

            {/* Indicador de filtros ativos */}
            {(selectedCategory !== 'all' || sortBy !== 'popularity') && (
              <div className="flex items-center space-x-1 text-xs text-blue-400">
                <span>🔧</span>
                <span>Filtros aplicados</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resultados da busca */}
      {(searchResults.length > 0 || (searchQuery.trim() || selectedCategory !== 'all')) && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center">
              📋 Resultados da Busca
              {searchResults.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-sm rounded-full">
                  {searchResults.length}
                </span>
              )}
            </h3>
            {(searchQuery.trim() || selectedCategory !== 'all') && (
              <div className="text-sm text-gray-400">
                {searchQuery.trim() && `"${searchQuery}"`}
                {searchQuery.trim() && selectedCategory !== 'all' && ' • '}
                {selectedCategory !== 'all' && `Categoria: ${categories.find(c => c.id === selectedCategory)?.label}`}
              </div>
            )}
          </div>
          
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {searchResults.map((world, index) => (
                <WorldCard key={world.id || index} world={world} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-800 rounded-xl">
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">Nenhum mundo encontrado</p>
              <p className="text-gray-500 text-sm mt-1">
                Tente usar palavras-chave diferentes ou alterar os filtros
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mundos em Destaque */}
      {featuredWorlds.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center">
              ⭐ Mundos em Destaque
            </h3>
            <div className="px-2 py-1 bg-yellow-600/30 text-yellow-300 text-xs rounded-full">
              📋 Demo Data
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featuredWorlds.slice(0, 8).map((world, index) => (
              <WorldCard key={world.id || index} world={world} featured />
            ))}
          </div>
        </div>
      )}

      {/* Mundos Populares */}
      {popularWorlds.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center">
              🔥 Mundos Populares
            </h3>
            <div className="px-2 py-1 bg-yellow-600/30 text-yellow-300 text-xs rounded-full">
              📋 Demo Data
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {popularWorlds.slice(0, 12).map((world, index) => (
              <WorldCard key={world.id || index} world={world} />
            ))}
          </div>
        </div>
      )}

      {/* Estado de carregamento */}
      {loading && (
        <div className="text-center py-8">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-2" />
          <p className="text-gray-400">Buscando mundos...</p>
        </div>
      )}

      {/* Estado de erro */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-center">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Modal de detalhes do mundo */}
      <WorldDetailsModal 
        world={selectedWorld}
        isOpen={showWorldModal}
        onClose={() => setShowWorldModal(false)}
      />
    </div>
  )
}

export default VRChatAPIPage
