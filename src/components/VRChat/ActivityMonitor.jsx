import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ClockIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  UserGroupIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  DocumentIcon,
  UserIcon,
  UserCircleIcon,
  PhotoIcon,
  TagIcon,
  CheckIcon,
  XMarkIcon,
  LockClosedIcon,
  ArrowPathIcon,
  MapPinIcon,
  Cog6ToothIcon,
  ClipboardIcon,
  MapIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import VRChatLoading from '../ui/VRChatLoading'

const ActivityMonitor = ({ 
  activityLogs = [], 
  friends = [],
  onRefresh,
  loading,
  onExportLogs
}) => {
  const [activityFilters, setActivityFilters] = useState({
    type: 'all',
    friend: 'all',
    timeRange: 'all',
    viewMode: 'timeline'
  })

  // Filtrar logs baseado nos filtros
  const filteredLogs = useMemo(() => {
    return activityLogs.filter(log => {
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
  }, [activityLogs, activityFilters])

  // Estatísticas de atividade
  const activityStats = useMemo(() => {
    return {
      total: filteredLogs.length,
      statusChanges: filteredLogs.filter(log => log.type === 'status_change').length,
      worldChanges: filteredLogs.filter(log => ['world_change', 'came_online', 'went_offline', 'joined_private'].includes(log.type)).length,
      avatarChanges: filteredLogs.filter(log => ['avatar_change', 'current_avatar_change'].includes(log.type)).length,
      profileChanges: filteredLogs.filter(log => ['description_change', 'bio_change', 'profile_picture_change', 'tags_change'].includes(log.type)).length
    }
  }, [filteredLogs])

  // Análise por amigo
  const friendActivityAnalysis = useMemo(() => {
    const analysis = filteredLogs.reduce((acc, log) => {
      if (!acc[log.friendId]) {
        acc[log.friendId] = {
          name: log.friendName,
          avatar: log.friendAvatar,
          count: 0,
          types: {}
        }
      }
      acc[log.friendId].count++
      acc[log.friendId].types[log.type] = (acc[log.friendId].types[log.type] || 0) + 1
      return acc
    }, {})
    
    return Object.entries(analysis)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 10)
  }, [filteredLogs])

  // Componente Network Visualization
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
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-400 flex items-center space-x-2">
            <GlobeAltIcon className="w-4 h-4" />
            <span>{friends.length} amigos conectados • {logs.length} atividades</span>
          </div>
          <button
            onClick={() => setSelectedFriend(null)}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              selectedFriend ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-400'
            }`}
            disabled={!selectedFriend}
          >
            Resetar seleção
          </button>
        </div>
        
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
                  
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeSize - 4}
                    fill="url(#avatar-pattern)"
                    className="cursor-pointer"
                    onClick={() => setSelectedFriend(isSelected ? null : friend.id)}
                  />
                  
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
              <div>
                <p className="text-sm text-gray-400 mb-2">Distribuição de atividades:</p>
                <div className="space-y-2">
                  {Object.entries(friendNodes[selectedFriend].types)
                    .sort(([,a], [,b]) => b - a)
                    .map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-xs text-gray-300">
                          {type === 'status_change' && 'Status'}
                          {type === 'world_change' && 'Mundos'}
                          {type === 'avatar_change' && 'Avatars'}
                          {type === 'description_change' && 'Descrição'}
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

  // Componente Heatmap Visualization
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
      const dayOfWeek = date.getDay() 
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
      if (intensity === 0) return 'rgba(75, 85, 99, 0.3)'
      
      const colors = [
        'rgba(59, 130, 246, 0.3)',   
        'rgba(16, 185, 129, 0.4)',   
        'rgba(245, 158, 11, 0.5)',   
        'rgba(239, 68, 68, 0.6)',    
        'rgba(220, 38, 38, 0.8)'     
      ]
      
      const index = Math.floor(intensity * (colors.length - 1))
      return colors[Math.min(index, colors.length - 1)]
    }
    
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const hourLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`)
    
    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-400 flex items-center space-x-2">
            <ChartBarIcon className="w-4 h-4 text-orange-500" />
            <span>Mapa de calor semanal • {logs.length} atividades • Pico: {maxActivity} atividades/hora</span>
          </div>
          <div className="flex items-center space-x-4">
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
        
        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
          <div className="relative" style={{ minWidth: '800px' }}>
            <div className="flex mb-2">
              <div className="w-12"></div>
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
            
            {dayNames.map((dayName, dayIndex) => (
              <div key={dayIndex} className="flex items-center mb-1">
                <div className="w-12 text-xs text-gray-400 text-right pr-2">
                  {dayName}
                </div>
                
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
        
        {/* Estatísticas detalhadas */}
        {selectedDay !== null && selectedHour !== null && (
          <div className="mt-6 bg-gray-700 rounded-xl p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <ClockIcon className="w-4 h-4" /> 
                {dayNames[selectedDay]} {selectedHour}:00
              </h4>
              <button
                onClick={() => {
                  setSelectedDay(null)
                  setSelectedHour(null)
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Atividades neste período:</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total:</span>
                    <span className="text-white font-medium">{activityMatrix[selectedDay][selectedHour].count}</span>
                  </div>
                  {Object.entries(activityMatrix[selectedDay][selectedHour].types).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span className="text-gray-300">
                        {type === 'status_change' && 'Status'}
                        {type === 'world_change' && 'Mundos'}
                        {type === 'avatar_change' && 'Avatars'}
                        {type === 'description_change' && 'Descrição'}
                        {type === 'bio_change' && 'Bio'}
                        {type === 'came_online' && 'Online'}
                        {type === 'went_offline' && 'Offline'}
                        {type === 'joined_private' && 'Privado'}:
                      </span>
                      <span className="text-white font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-2">Amigos ativos:</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {[...new Set(activityMatrix[selectedDay][selectedHour].logs.map(log => log.friendName))]
                    .slice(0, 8)
                    .map((friendName, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-gray-300">{friendName}</span>
                        <span className="text-gray-500">
                          ({activityMatrix[selectedDay][selectedHour].logs.filter(log => log.friendName === friendName).length})
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

  // Componente de visualização Flow Map
  const FlowMapVisualization = ({ logs }) => {
    const [selectedNode, setSelectedNode] = useState(null)
    
    // Agrupar logs por hora
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
    
    const getNodeSize = (count) => {
      if (count >= 10) return 'w-16 h-16'
      if (count >= 5) return 'w-12 h-12'
      if (count >= 2) return 'w-10 h-10'
      return 'w-8 h-8'
    }
    
    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-400">
            <MapPinIcon className="w-4 h-4 mr-1" /> {sortedNodes.length} nós temporais • {logs.length} atividades
          </div>
        </div>
        
        <div className="relative overflow-x-auto" style={{ minHeight: '400px' }}>
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 via-blue-500 to-green-500 transform -translate-y-1/2"></div>
          
          <div className="relative flex items-center justify-between" style={{ minWidth: '1200px', height: '400px' }}>
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="flex flex-col items-center relative">
                <div className="absolute top-0 w-px h-full bg-gray-700 opacity-30"></div>
                <div className="text-xs text-gray-500 mb-2">{i}:00</div>
                
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
                    <span className="text-white font-bold text-xs">
                      {timeNodes[`${i}:00`].count}
                    </span>
                    
                    {timeNodes[`${i}:00`].count >= 5 && (
                      <div className={`absolute inset-0 ${getNodeColor(timeNodes[`${i}:00`].types)} rounded-full animate-ping opacity-20`}></div>
                    )}
                  </div>
                )}
                
                {timeNodes[`${i}:00`] && timeNodes[`${i + 1}:00`] && (
                  <div className="absolute top-1/2 left-full w-8 h-0.5 bg-gradient-to-r from-current to-transparent opacity-60 transform -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {selectedNode && timeNodes[selectedNode] && (
          <div className="mt-6 bg-gray-700 rounded-xl p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <ClockIcon className="w-4 h-4" /> {selectedNode}
              </h4>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        {type === 'status_change' && 'Status'}
                        {type === 'world_change' && 'Mundos'}
                        {type === 'avatar_change' && 'Avatars'}
                        {type === 'description_change' && 'Descrição'}
                        {type === 'bio_change' && 'Bio'}
                        {type === 'came_online' && 'Online'}
                        {type === 'went_offline' && 'Offline'}
                        {type === 'joined_private' && 'Privado'}
                      </span>
                      <span className="text-white font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
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

  // Componente de timeline tradicional
  const TimelineView = ({ logs }) => (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {logs.map((log) => (
        <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
          <img
            src={log.friendAvatar}
            alt={log.friendName}
            className="w-10 h-10 rounded-full object-cover bg-gray-600 flex-shrink-0"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzc0MTUxIiByeD0iMjAiLz48cGF0aCBkPSJNMjAgMTBDMTUuNTggMTAgMTIgMTMuNTggMTIgMTggUzE1LjU4IDI2IDIwIDI2UzI4IDIyLjQyIDI4IDE4UzI0LjQyIDEwIDIwIDEwWk0yMCAyMkMxNy43OSAyMiAxNiAyMC4yMSAxNiAxOFMxNy43OSAxNCAyMCAxNFMyNCAyMy43OSAyNCAxOFMyMi4yMSAyMiAyMCAyMloiIGZpbGw9IiM2QjcyODAiLz48L3N2Zz4='
            }}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-white font-medium">{log.friendName}</p>
              <div className="flex items-center space-x-2">
                {log.priority === 'high' && <span className="text-red-400 text-xs">Alto</span>}
                {log.priority === 'medium' && <span className="text-yellow-400 text-xs">Médio</span>}
                {log.priority === 'low' && <span className="text-gray-400 text-xs">Baixo</span>}
                <span className="text-xs text-gray-400">
                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
            
            <div className="mt-1">
              {log.type === 'status_change' && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-300">
                    Status: <span className="text-yellow-400">{log.details.from}</span> → <span className="text-green-400">{log.details.to}</span>
                  </p>
                  <p className="text-xs text-gray-500">{log.details.context}</p>
                </div>
              )}
              
              {log.type === 'world_change' && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-300">
                    Mundo: <span className="text-blue-400">{log.details.fromWorld}</span> → <span className="text-green-400">{log.details.toWorld}</span>
                  </p>
                  <p className="text-xs text-gray-500">{log.details.context}</p>
                </div>
              )}
              
              {(log.type === 'description_change' || log.type === 'bio_change') && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-300">
                    {log.type === 'description_change' ? 'Descrição' : 'Bio'} alterada
                  </p>
                  <p className="text-xs text-gray-500">{log.details.context}</p>
                </div>
              )}
              
              {(log.type === 'avatar_change' || log.type === 'current_avatar_change') && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-300">
                    {log.type === 'avatar_change' ? 'Avatar principal' : 'Avatar atual'} alterado
                  </p>
                  <p className="text-xs text-gray-500">{log.details.context}</p>
                </div>
              )}
              
              {(log.type === 'came_online' || log.type === 'went_offline' || log.type === 'joined_private') && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-300">
                    {log.type === 'came_online' && <span className="text-green-400">Ficou online</span>}
                    {log.type === 'went_offline' && <span className="text-red-400">Ficou offline</span>}
                    {log.type === 'joined_private' && <span className="text-purple-400">Entrou em mundo privado</span>}
                  </p>
                  <p className="text-xs text-gray-500">{log.details.context}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
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
              onClick={onExportLogs}
              disabled={activityLogs.length === 0}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Exportar
            </button>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center"
            >
              {loading ? (
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
              <option value="status_change">Mudanças de status</option>
              <option value="description_change">Mudanças de descrição</option>
              <option value="bio_change">Mudanças de bio</option>
              <option value="world_change">Mudanças de mundo</option>
              <option value="went_offline">Ficou offline</option>
              <option value="came_online">Ficou online</option>
              <option value="joined_private">Entrou em privado</option>
              <option value="avatar_change">Mudanças de avatar</option>
              <option value="current_avatar_change">Avatar atual alterado</option>
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
              {friends.map(friend => (
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
            <Cog6ToothIcon className="w-5 h-5 mr-2" />
            Modo de Visualização
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActivityFilters(prev => ({ ...prev, viewMode: 'timeline' }))}
              className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2 ${
                activityFilters.viewMode === 'timeline' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <ClipboardIcon className="w-4 h-4" />
              <span>Timeline</span>
            </button>
            <button
              onClick={() => setActivityFilters(prev => ({ ...prev, viewMode: 'flowmap' }))}
              className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2 ${
                activityFilters.viewMode === 'flowmap' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span>Fluxo Temporal</span>
            </button>
            <button
              onClick={() => setActivityFilters(prev => ({ ...prev, viewMode: 'network' }))}
              className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2 ${
                activityFilters.viewMode === 'network' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <GlobeAltIcon className="w-4 h-4" />
              <span>Rede Social</span>
            </button>
            <button
              onClick={() => setActivityFilters(prev => ({ ...prev, viewMode: 'heatmap' }))}
              className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2 ${
                activityFilters.viewMode === 'heatmap' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <ChartBarIcon className="w-4 h-4" />
              <span>Mapa de Calor</span>
            </button>
          </div>
        </div>
        
        {/* Descrição do modo selecionado */}
        <div className="text-sm text-gray-400">
          {activityFilters.viewMode === 'timeline' && (
            <p>Lista cronológica detalhada de todas as atividades dos amigos com informações contextuais.</p>
          )}
          {activityFilters.viewMode === 'flowmap' && (
            <p>Visualização temporal em fluxo mostrando picos de atividade ao longo das horas do dia.</p>
          )}
          {activityFilters.viewMode === 'network' && (
            <p>Rede de conexões entre amigos baseada em atividades simultâneas e padrões comportamentais.</p>
          )}
          {activityFilters.viewMode === 'heatmap' && (
            <p>Mapa de calor semanal mostrando padrões de atividade por dia da semana e hora do dia.</p>
          )}
        </div>
      </div>

      {/* Visualização de Atividades */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            {activityFilters.viewMode === 'timeline' && (
              <>
                <ClipboardIcon className="w-5 h-5 text-orange-500" />
                <span>Timeline de Atividades</span>
              </>
            )}
            {activityFilters.viewMode === 'flowmap' && (
              <>
                <MapIcon className="w-5 h-5 text-purple-500" />
                <span>Mapa de Fluxo Temporal</span>
              </>
            )}
            {activityFilters.viewMode === 'network' && (
              <>
                <GlobeAltIcon className="w-5 h-5 text-blue-500" />
                <span>Rede de Conexões Sociais</span>
              </>
            )}
            {activityFilters.viewMode === 'heatmap' && (
              <>
                <ChartBarIcon className="w-5 h-5 text-green-500" />
                <span>Mapa de Calor de Atividades</span>
              </>
            )}
          </h3>
          
          {filteredLogs.length > 0 && (
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>{filteredLogs.length} atividades</span>
              {activityFilters.viewMode === 'heatmap' && (
                <span>• {Math.max(...filteredLogs.map(log => {
                  const date = new Date(log.timestamp)
                  return filteredLogs.filter(l => 
                    new Date(l.timestamp).getDay() === date.getDay() && 
                    new Date(l.timestamp).getHours() === date.getHours()
                  ).length
                }))} pico máximo</span>
              )}
              {activityFilters.viewMode === 'network' && (
                <span>• {[...new Set(filteredLogs.map(log => log.friendId))].length} amigos únicos</span>
              )}
            </div>
          )}
        </div>
        
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              {activityFilters.viewMode === 'timeline' && <ClipboardIcon className="w-16 h-16 text-gray-500" />}
              {activityFilters.viewMode === 'flowmap' && <MapIcon className="w-16 h-16 text-gray-500" />}
              {activityFilters.viewMode === 'network' && <GlobeAltIcon className="w-16 h-16 text-gray-500" />}
              {activityFilters.viewMode === 'heatmap' && <ChartBarIcon className="w-16 h-16 text-gray-500" />}
            </div>
            <p className="text-gray-400 text-lg mb-2">Nenhuma atividade registrada ainda</p>
            <p className="text-sm text-gray-500">
              As atividades dos amigos aparecerão aqui conforme eles mudam de status, mundo ou avatar.
            </p>
            {(activityFilters.type !== 'all' || activityFilters.friend !== 'all' || activityFilters.timeRange !== 'all') && (
              <button
                onClick={() => setActivityFilters(prev => ({ 
                  ...prev, 
                  type: 'all', 
                  friend: 'all', 
                  timeRange: 'all' 
                }))}
                className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Limpar Filtros</span>
              </button>
            )}
          </div>
        ) : (
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activityFilters.viewMode === 'timeline' && (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TimelineView logs={filteredLogs} />
                </motion.div>
              )}
              {activityFilters.viewMode === 'flowmap' && (
                <motion.div
                  key="flowmap"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <FlowMapVisualization logs={filteredLogs} />
                </motion.div>
              )}
              {activityFilters.viewMode === 'network' && (
                <motion.div
                  key="network"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <NetworkVisualization logs={filteredLogs} />
                </motion.div>
              )}
              {activityFilters.viewMode === 'heatmap' && (
                <motion.div
                  key="heatmap"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <HeatmapVisualization logs={filteredLogs} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Estatísticas de Atividade Detalhadas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total</p>
              <p className="text-2xl font-bold text-white">{activityStats.total}</p>
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <p className="text-xl font-bold text-yellow-400">{activityStats.statusChanges}</p>
            </div>
            <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
              <ArrowPathIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Mundos</p>
              <p className="text-xl font-bold text-green-400">{activityStats.worldChanges}</p>
            </div>
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <GlobeAltIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avatars</p>
              <p className="text-xl font-bold text-pink-400">{activityStats.avatarChanges}</p>
            </div>
            <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Perfil</p>
              <p className="text-xl font-bold text-purple-400">{activityStats.profileChanges}</p>
            </div>
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Análise de Atividade por Amigo */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <UserGroupIcon className="w-4 h-4 mr-2" />
          Análise por Amigo (Top 10 mais ativos)
        </h3>
        <div className="space-y-3">
          {friendActivityAnalysis.map(([friendId, data]) => (
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
                    <span key={type} className="bg-gray-600 px-2 py-1 rounded flex items-center space-x-1">
                      {type === 'status_change' && <ArrowPathIcon className="w-3 h-3" />}
                      {type === 'world_change' && <GlobeAltIcon className="w-3 h-3" />}
                      {type === 'avatar_change' && <UserIcon className="w-3 h-3" />}
                      {type === 'description_change' && <DocumentTextIcon className="w-3 h-3" />}
                      <span>{count}</span>
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default ActivityMonitor
