import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrophyIcon,
  StarIcon,
  CloudArrowUpIcon,
  HeartIcon,
  ChartBarIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { 
  TrophyIcon as TrophySolid,
  StarIcon as StarSolid 
} from '@heroicons/react/24/solid'
import { usersAPI } from '../services/api'
import DefaultAvatar from '../components/ui/DefaultAvatar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { getGoogleDriveImageUrl, handleImageError } from '../utils/googleDriveUtils'

const RankingTabs = ({ activeTab, onTabChange, loading }) => {
  const tabs = [
    { 
      id: 'uploads', 
      icon: CloudArrowUpIcon, 
      label: 'Uploads', 
      description: 'Top criadores',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'downloads', 
      icon: ChartBarIcon, 
      label: 'Downloads', 
      description: 'Mais baixados',
      color: 'from-green-500 to-green-600'
    },
    { 
      id: 'likes', 
      icon: HeartIcon, 
      label: 'Likes', 
      description: 'Mais curtidos',
      color: 'from-pink-500 to-pink-600'
    },
    { 
      id: 'rating', 
      icon: StarIcon, 
      label: 'Rating', 
      description: 'Melhor avaliados',
      color: 'from-yellow-500 to-yellow-600'
    },
  ]

  return (
    <div className="w-full mb-6">
      <div className="flex flex-wrap gap-2 justify-center">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <motion.button
              key={tab.id}
              onClick={() => !loading && onTabChange(tab.id)}
              disabled={loading}
              whileHover={!loading && !isActive ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className={`
                group relative flex items-center gap-2 px-4 py-3 rounded-xl 
                transition-all duration-300 min-w-[140px] backdrop-blur-sm
                ${isActive 
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg shadow-black/25` 
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                }
                ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              <tab.icon className={`w-4 h-4 transition-colors ${
                isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
              }`} />
              <div className="text-left">
                <div className="font-semibold text-sm">{tab.label}</div>
                <div className="text-xs opacity-80">{tab.description}</div>
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

const RankBadge = ({ rank }) => {
  const getRankConfig = (rank) => {
    switch (rank) {
      case 1:
        return {
          icon: TrophySolid,
          gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
          shadow: 'shadow-yellow-500/40',
          border: 'border-yellow-400/50',
          glow: 'shadow-yellow-400/30'
        }
      case 2:
        return {
          icon: TrophySolid,
          gradient: 'from-gray-300 via-gray-400 to-gray-500',
          shadow: 'shadow-gray-400/40',
          border: 'border-gray-400/50',
          glow: 'shadow-gray-400/30'
        }
      case 3:
        return {
          icon: TrophySolid,
          gradient: 'from-amber-500 via-amber-600 to-amber-700',
          shadow: 'shadow-amber-600/40',
          border: 'border-amber-500/50',
          glow: 'shadow-amber-500/30'
        }
      default:
        return {
          icon: null,
          gradient: 'from-slate-600 to-slate-700',
          shadow: 'shadow-slate-600/20',
          border: 'border-slate-500/30',
          glow: ''
        }
    }
  }

  const config = getRankConfig(rank)

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: rank * 0.1 }}
      className={`
        relative w-14 h-14 flex items-center justify-center rounded-2xl
        bg-gradient-to-br ${config.gradient} ${config.shadow} ${config.border}
        border-2 backdrop-blur-sm ${config.glow}
      `}
    >
      {rank <= 3 ? (
        <config.icon className="w-7 h-7 text-white drop-shadow-sm" />
      ) : (
        <span className="text-white font-bold text-lg drop-shadow-sm">
          {rank}
        </span>
      )}
      
      {rank === 1 && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-transparent"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  )
}

const UserCard = ({ user, rank, metric }) => {
  const getMetricDisplay = (metric) => {
    const value = (() => {
      switch (metric) {
        case 'uploads':
          return user.stats?.uploads || 0
        case 'downloads':
          return user.stats?.downloads || 0
        case 'likes':
          return user.stats?.likes || 0
        case 'rating':
          return user.stats?.rating || 0
        default:
          return 0
      }
    })()

    const displayValue = metric === 'rating' 
      ? value.toFixed(1)
      : value >= 1000 
        ? `${(value / 1000).toFixed(1)}k`
        : value.toLocaleString()

    const icon = (() => {
      switch (metric) {
        case 'uploads':
          return <CloudArrowUpIcon className="w-5 h-5 text-blue-400" />
        case 'downloads':
          return <ChartBarIcon className="w-5 h-5 text-green-400" />
        case 'likes':
          return <HeartIcon className="w-5 h-5 text-pink-400" />
        case 'rating':
          return <StarSolid className="w-5 h-5 text-yellow-400" />
        default:
          return null
      }
    })()

    const label = (() => {
      switch (metric) {
        case 'uploads': return 'uploads'
        case 'downloads': return 'downloads'
        case 'likes': return 'likes'
        case 'rating': return 'rating'
        default: return metric
      }
    })()

    return { displayValue, icon, label }
  }

  const metricInfo = getMetricDisplay(metric)
  const isTopThree = rank <= 3

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: rank * 0.03,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      className="group"
    >
      <Link
        to={`/profile/${user.id}`}
        className={`
          flex items-center gap-6 p-6 rounded-3xl border backdrop-blur-sm
          transition-all duration-300 hover:scale-[1.01]
          ${isTopThree 
            ? 'bg-gradient-to-r from-white/10 to-white/5 border-white/20 hover:border-white/30 shadow-lg' 
            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
          }
          hover:shadow-xl hover:shadow-black/20
        `}
      >
        {/* Rank Badge */}
        <RankBadge rank={rank} />
        
        {/* User Avatar & Info */}
        <div className="flex items-center flex-1 min-w-0 gap-4">
          <div className="relative">
            {user.avatar ? (
              <img
                key={`${user.avatar}-${user.id}`}
                src={getGoogleDriveImageUrl(user.avatar)}
                alt={user.username}
                className={`
                  w-16 h-16 rounded-2xl object-cover transition-all duration-300
                  ${isTopThree 
                    ? 'border-3 border-white/30 group-hover:border-white/50' 
                    : 'border-2 border-white/20 group-hover:border-white/30'
                  }
                `}
                onError={(e) => {
                  handleImageError(e, user.avatar, () => {
                    e.target.style.display = 'none'
                    const defaultAvatar = e.target.nextSibling
                    if (defaultAvatar) defaultAvatar.style.display = 'flex'
                  })
                }}
              />
            ) : null}
            <DefaultAvatar 
              username={user.username} 
              size="lg" 
              className={`
                default-avatar transition-all duration-300 rounded-2xl
                ${isTopThree 
                  ? 'border-3 border-white/30 group-hover:border-white/50' 
                  : 'border-2 border-white/20 group-hover:border-white/30'
                }
                ${user.avatar ? 'hidden' : 'flex'}
              `} 
            />
            
            {/* Premium indicator for top 3 */}
            {isTopThree && (
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <StarSolid className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white truncate group-hover:text-blue-300 transition-colors">
              {user.username}
            </h3>
            
            {/* Stats Summary */}
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1 text-sm text-gray-400">
                <CloudArrowUpIcon className="w-4 h-4" />
                {user.stats?.uploads || 0}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-400">
                <StarSolid className="w-4 h-4 text-yellow-500" />
                {(user.stats?.rating || 0).toFixed(1)}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-400">
                <HeartIcon className="w-4 h-4" />
                {(user.stats?.likes || 0) >= 1000 
                  ? `${((user.stats?.likes || 0) / 1000).toFixed(1)}k`
                  : (user.stats?.likes || 0)
                }
              </span>
            </div>
          </div>
        </div>

        {/* Main Metric Display */}
        <motion.div 
          className={`
            flex items-center gap-4 px-6 py-4 rounded-2xl border
            ${isTopThree 
              ? 'bg-gradient-to-r from-white/10 to-white/5 border-white/20' 
              : 'bg-white/5 border-white/10'
            }
            group-hover:bg-white/10 transition-all duration-300
          `}
          whileHover={{ scale: 1.05 }}
        >
          {metricInfo.icon}
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {metricInfo.displayValue}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">
              {metricInfo.label}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

const RankingsPage = () => {
  const [activeTab, setActiveTab] = useState('uploads')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Cache para evitar refetch desnecessário
  const [rankingsCache, setRankingsCache] = useState({})

  // Filtrar usuários por busca
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users
    
    return users.filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [users, searchTerm])

  const fetchRankings = async (tab) => {
    // Verificar cache primeiro
    if (rankingsCache[tab] && Date.now() - rankingsCache[tab].timestamp < 300000) { // 5 min cache
      setUsers(rankingsCache[tab].data)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      let response
      switch (tab) {
        case 'downloads':
          response = await usersAPI.getTopByDownloads()
          break
        case 'likes':
          response = await usersAPI.getTopByLikes()
          break
        case 'rating':
          response = await usersAPI.getTopByRating()
          break
        case 'uploads':
        default:
          response = await usersAPI.getTopUploaders()
          break
      }
      
      const data = response.data.data || []
      setUsers(data)
      
      // Atualizar cache
      setRankingsCache(prev => ({
        ...prev,
        [tab]: {
          data,
          timestamp: Date.now()
        }
      }))
      
    } catch (err) {
      console.error('Error fetching rankings:', err)
      setError('Falha ao carregar rankings. Tente novamente.')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRankings(activeTab)
  }, [activeTab])

  const handleTabChange = (newTab) => {
    if (newTab !== activeTab) {
      setActiveTab(newTab)
      setSearchTerm('') // Limpar busca ao trocar tab
    }
  }

  return (
    <div className="min-h-screen w-full relative bg-gray-900 overflow-hidden">
      {/* Main Content */}
      <div className="relative z-20 pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-8">
          
          {/* Header Compacto e Moderno */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div 
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl mb-4 shadow-lg shadow-yellow-500/20"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <TrophySolid className="w-8 h-8 text-white" />
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
              Rankings
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Criadores mais talentosos da nossa comunidade
            </p>
          </motion.div>

          {/* Controles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            {/* Tabs */}
            <RankingTabs activeTab={activeTab} onTabChange={handleTabChange} loading={loading} />
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                />
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {loading ? (
                // Loading moderno
                <div className="space-y-4">
                  {[...Array(8)].map((_, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-6 p-6 bg-white/5 rounded-3xl border border-white/10 animate-pulse"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex-shrink-0" />
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="w-40 h-6 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl" />
                        <div className="w-60 h-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg" />
                      </div>
                      <div className="w-28 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex-shrink-0" />
                    </motion.div>
                  ))}
                </div>
                
              ) : error ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <TrophyIcon className="w-12 h-12 text-red-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Algo deu errado</h2>
                  <p className="text-gray-400 text-lg mb-6">{error}</p>
                  <button
                    onClick={() => fetchRankings(activeTab)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl transition-all duration-300 font-semibold hover:scale-105 shadow-lg"
                  >
                    Tentar Novamente
                  </button>
                </motion.div>
                
              ) : filteredUsers.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                    {searchTerm ? (
                      <MagnifyingGlassIcon className="w-12 h-12 text-gray-500" />
                    ) : (
                      <UserIcon className="w-12 h-12 text-gray-500" />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum ranking disponível'}
                  </h2>
                  <p className="text-gray-400 text-lg">
                    {searchTerm 
                      ? `Nenhum usuário encontrado para "${searchTerm}"`
                      : 'Ainda não há dados suficientes para exibir este ranking.'
                    }
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300"
                    >
                      Limpar busca
                    </button>
                  )}
                </motion.div>
                
              ) : (
                <>
                  <div className="space-y-3">
                    {filteredUsers.slice(0, 50).map((user, index) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        rank={index + 1}
                        metric={activeTab}
                      />
                    ))}
                  </div>
                  
                  {filteredUsers.length > 50 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center pt-8"
                    >
                      <p className="text-gray-400 text-sm">
                        Mostrando top 50 de {filteredUsers.length} usuários
                      </p>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default RankingsPage
