import React, { useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CloudArrowUpIcon,
  ClockIcon,
  UserIcon,
  EyeIcon,
  TagIcon,
  ArrowDownTrayIcon,
  HeartIcon,
  StarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { useCachedAPI } from '../../hooks/useCachedAPI'
import { assetsAPI } from '../../services/api'
import { CACHE_CONFIG } from '../../config/cache'
import { truncateText, formatNumber } from '../../utils/formatUtils'
import DefaultAvatar from '../ui/DefaultAvatar'
import VRChatLoading from '../ui/VRChatLoading'
import { getGoogleDriveImageUrl, handleImageError } from '../../utils/googleDriveUtils'

// Constantes para memoização - movidas para fora do componente
const ACTIVITY_ICONS = {
  upload: <CloudArrowUpIcon className="w-4 h-4 text-emerald-400" />,
  view: <EyeIcon className="w-4 h-4 text-blue-400" />,
  favorite: <HeartIcon className="w-4 h-4 text-pink-400" />,
  download: <ArrowDownTrayIcon className="w-4 h-4 text-indigo-400" />,
  default: <UserIcon className="w-4 h-4 text-gray-400" />
}

const CATEGORY_CONFIGS = {
  avatar: {
    icon: <UserIcon className="w-3 h-3" />,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  },
  clothes: {
    icon: <SparklesIcon className="w-3 h-3" />,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
  },
  clothing: {
    icon: <SparklesIcon className="w-3 h-3" />,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
  },
  accessory: {
    icon: <StarIcon className="w-3 h-3" />,
    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
  },
  accessories: {
    icon: <StarIcon className="w-3 h-3" />,
    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
  },
  default: {
    icon: <TagIcon className="w-3 h-3" />,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
  }
}

const DEFAULT_CATEGORY_CONFIG = {
  icon: <TagIcon className="w-3 h-3" />,
  color: 'text-gray-400 bg-gray-500/10 border-gray-500/20'
}

// Componente memoizado para item de atividade
const ActivityItem = React.memo(({ activity, index, getActivityIcon, getCategoryConfig, formatTimeAgo }) => {
  const categoryConfig = getCategoryConfig(activity.category?.name)
  
  // Handlers memoizados para eventos de imagem
  const handleThumbnailError = useCallback((e) => {
    handleImageError(e, activity.thumbnail, () => {
      e.target.style.display = 'none'
      const fallback = e.target.nextSibling
      if (fallback) fallback.style.display = 'flex'
    })
  }, [activity.thumbnail])

  const handleAvatarError = useCallback((e) => {
    e.target.style.display = 'none'
    const fallback = e.target.nextSibling
    if (fallback) fallback.style.display = 'flex'
  }, [])

  return (
    <motion.div
      key={activity.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-gray-800/20 hover:bg-gray-800/40 rounded-lg p-3 border border-gray-700/20 hover:border-gray-600/40 transition-all duration-200"
    >
      <div className="flex items-center space-x-3">
        {/* Thumbnail compacto */}
        <div className="relative flex-shrink-0">
          {activity.thumbnail ? (
            <img
              src={getGoogleDriveImageUrl(activity.thumbnail)}
              alt={activity.title}
              className="w-10 h-10 rounded-md object-cover border border-gray-600/50 group-hover:border-indigo-500/50 transition-colors shadow-sm"
              onError={handleThumbnailError}
            />
          ) : null}
          <div 
            className={`w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-md flex items-center justify-center border border-gray-600/50 ${
              activity.thumbnail ? 'hidden' : 'flex'
            }`}
          >
            <TagIcon className="w-4 h-4 text-gray-400" />
          </div>
          
          {/* Badge de atividade menor */}
          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border border-gray-900 flex items-center justify-center shadow-sm">
            {getActivityIcon(activity.type)}
          </div>
        </div>
        
        {/* Informações principais compactas */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <Link 
                to={`/asset/${activity.id}`}
                className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors block truncate leading-tight"
                title={activity.title}
              >
                {truncateText(activity.title, 30)}
              </Link>
              
              {/* Linha com usuário e tempo */}
              <div className="flex items-center justify-between mt-0.5">
                <div className="flex items-center space-x-1.5 min-w-0">
                  {activity.user?.avatar ? (
                    <img
                      src={getGoogleDriveImageUrl(activity.user.avatar)}
                      alt={activity.user.username}
                      className="w-3 h-3 rounded-full object-cover flex-shrink-0"
                      onError={handleAvatarError}
                    />
                  ) : null}
                  <DefaultAvatar 
                    username={activity.user?.username || 'User'} 
                    size="xs"
                    className={`w-3 h-3 text-[6px] flex-shrink-0 ${activity.user?.avatar ? 'hidden' : 'flex'}`}
                  />
                  <Link
                    to={`/profile/${activity.user?.id}`}
                    className="text-xs text-gray-400 hover:text-indigo-400 transition-colors font-medium truncate"
                  >
                    {truncateText(activity.user?.username || 'Usuário', 15)}
                  </Link>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Categoria e estatísticas em linha compacta */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-1.5 min-w-0 flex-1">
              {activity.category && (
                <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-xs font-medium border backdrop-blur-sm ${categoryConfig.color}`}>
                  {categoryConfig.icon}
                  <span className="truncate">{truncateText(activity.category.name, 10)}</span>
                </div>
              )}
              
              {activity.tags && activity.tags.length > 0 && (
                <div className="flex items-center space-x-1">
                  {activity.tags.slice(0, 2).map((tag, tagIndex) => (
                    <span 
                      key={tagIndex}
                      className="px-1.5 py-0.5 bg-gray-700/60 text-gray-300 text-xs rounded border border-gray-600/40 font-medium"
                    >
                      #{truncateText(tag, 8)}
                    </span>
                  ))}
                  {activity.tags.length > 2 && (
                    <span className="px-1 py-0.5 bg-gray-700/50 text-gray-400 text-xs rounded text-[10px] font-medium">
                      +{activity.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Estatísticas compactas */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {activity.stats.downloads > 0 && (
                <div className="flex items-center space-x-0.5 text-gray-400">
                  <ArrowDownTrayIcon className="w-2.5 h-2.5" />
                  <span className="text-[10px] font-medium">{formatNumber(activity.stats.downloads)}</span>
                </div>
              )}
              
              {activity.stats.favorites > 0 && (
                <div className="flex items-center space-x-0.5 text-pink-400">
                  <HeartIcon className="w-2.5 h-2.5" />
                  <span className="text-[10px] font-medium">{formatNumber(activity.stats.favorites)}</span>
                </div>
              )}
              
              {activity.stats.rating > 0 && (
                <div className="flex items-center space-x-0.5 text-yellow-400">
                  <StarSolidIcon className="w-2.5 h-2.5" />
                  <span className="text-[10px] font-medium">{activity.stats.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

ActivityItem.displayName = 'ActivityItem'

const RecentActivity = React.memo(() => {
  const { data: response, loading, error } = useCachedAPI(
    CACHE_CONFIG.RECENT_ACTIVITY,
    () => assetsAPI.getRecent({ limit: 5 }),
    []
  )

  // Funções memoizadas para evitar recriações desnecessárias
  const getActivityIcon = useCallback((type) => {
    return ACTIVITY_ICONS[type] || ACTIVITY_ICONS.default
  }, [])

  const getCategoryConfig = useCallback((categoryName) => {
    if (!categoryName) return DEFAULT_CATEGORY_CONFIG
    
    const category = categoryName.toLowerCase()
    
    if (CATEGORY_CONFIGS[category]) {
      return CATEGORY_CONFIGS[category]
    }
    
    for (const [key, config] of Object.entries(CATEGORY_CONFIGS)) {
      if (category.includes(key)) {
        return config
      }
    }
    
    return CATEGORY_CONFIGS.default
  }, [])

  const formatTimeAgo = useCallback((timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora há pouco'
    if (diffInHours < 24) return `${diffInHours}h atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d atrás`
    
    return time.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'short' 
    })
  }, [])

  const activities = useMemo(() => {
    if (response?.data?.success && response?.data?.data) {
      const rawData = Array.isArray(response.data.data) 
        ? response.data.data 
        : response.data.data.assets || []
      
      return rawData.map(asset => ({
        id: asset.id,
        type: 'upload',
        title: asset.title,
        user: asset.user,
        timestamp: asset.createdAt,
        thumbnail: asset.thumbnail || asset.imageUrls?.[0],
        category: asset.category,
        stats: {
          downloads: asset.downloadCount || 0,
          favorites: asset._count?.favorites || 0,
          views: asset.viewCount || 0,
          rating: asset.averageRating || 0
        },
        tags: asset.tags || [],
        description: asset.description
      }))
    }
    return []
  }, [response, error, loading])

  const displayActivities = useMemo(() => {
    return activities.slice(0, 6)
  }, [activities])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white flex items-center">
            <ClockIcon className="w-4 h-4 mr-2 text-indigo-400 flex-shrink-0" />
            <span>Atividade Recente</span>
          </h3>
        </div>
        <VRChatLoading 
          size="md" 
          type="default" 
          text="Carregando atividades..."
          className="rounded-lg min-h-[200px]"
        />
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50"
      >
        <div className="text-red-400 text-center py-6">
          <p className="text-xs">Erro ao carregar atividade recente</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:bg-gray-800/60 transition-all duration-300 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white flex items-center">
          <ClockIcon className="w-4 h-4 mr-2 text-indigo-400 flex-shrink-0" />
          <span className="truncate">Atividade Recente</span>
        </h3>
        <Link 
          to="/marketplace" 
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium flex-shrink-0"
        >
          Ver todos
        </Link>
      </div>
      
      <div className="flex-1 space-y-2 overflow-hidden">
        {displayActivities.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <UserIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Nenhuma atividade recente</p>
          </div>
        ) : (
          displayActivities.map((activity, index) => {
            const categoryConfig = getCategoryConfig(activity.category?.name)
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-gray-800/20 hover:bg-gray-800/40 rounded-lg p-3 border border-gray-700/20 hover:border-gray-600/40 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  {/* Thumbnail compacto */}
                  <div className="relative flex-shrink-0">
                    {activity.thumbnail ? (
                      <img
                        src={getGoogleDriveImageUrl(activity.thumbnail)}
                        alt={activity.title}
                        className="w-10 h-10 rounded-md object-cover border border-gray-600/50 group-hover:border-indigo-500/50 transition-colors shadow-sm"
                        onError={(e) => {
                          handleImageError(e, activity.thumbnail, () => {
                            e.target.style.display = 'none'
                            const fallback = e.target.nextSibling
                            if (fallback) fallback.style.display = 'flex'
                          })
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-md flex items-center justify-center border border-gray-600/50 ${
                        activity.thumbnail ? 'hidden' : 'flex'
                      }`}
                    >
                      <TagIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    
                    {/* Badge de atividade menor */}
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border border-gray-900 flex items-center justify-center shadow-sm">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>
                  
                  {/* Informações principais compactas */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/asset/${activity.id}`}
                          className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors block truncate leading-tight"
                          title={activity.title}
                        >
                          {truncateText(activity.title, 30)}
                        </Link>
                        
                        {/* Linha com usuário e tempo */}
                        <div className="flex items-center justify-between mt-0.5">
                          <div className="flex items-center space-x-1.5 min-w-0">
                            {activity.user?.avatar ? (
                              <img
                                src={getGoogleDriveImageUrl(activity.user.avatar)}
                                alt={activity.user.username}
                                className="w-3 h-3 rounded-full object-cover flex-shrink-0"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  const fallback = e.target.nextSibling
                                  if (fallback) fallback.style.display = 'flex'
                                }}
                              />
                            ) : null}
                            <DefaultAvatar 
                              username={activity.user?.username || 'User'} 
                              size="xs"
                              className={`w-3 h-3 text-[6px] flex-shrink-0 ${activity.user?.avatar ? 'hidden' : 'flex'}`}
                            />
                            <Link
                              to={`/profile/${activity.user?.id}`}
                              className="text-xs text-gray-400 hover:text-indigo-400 transition-colors font-medium truncate"
                            >
                              {truncateText(activity.user?.username || 'Usuário', 15)}
                            </Link>
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Categoria e estatísticas em linha compacta */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                        {activity.category && (
                          <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-xs font-medium border backdrop-blur-sm ${categoryConfig.color}`}>
                            {categoryConfig.icon}
                            <span className="truncate">{truncateText(activity.category.name, 10)}</span>
                          </div>
                        )}
                        
                        {activity.tags && activity.tags.length > 0 && (
                          <div className="flex items-center space-x-1">
                            {activity.tags.slice(0, 2).map((tag, tagIndex) => (
                              <span 
                                key={tagIndex}
                                className="px-1.5 py-0.5 bg-gray-700/60 text-gray-300 text-xs rounded border border-gray-600/40 font-medium"
                              >
                                #{truncateText(tag, 8)}
                              </span>
                            ))}
                            {activity.tags.length > 2 && (
                              <span className="px-1 py-0.5 bg-gray-700/50 text-gray-400 text-xs rounded text-[10px] font-medium">
                                +{activity.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Estatísticas compactas */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {activity.stats.downloads > 0 && (
                          <div className="flex items-center space-x-0.5 text-gray-400">
                            <ArrowDownTrayIcon className="w-2.5 h-2.5" />
                            <span className="text-[10px] font-medium">{formatNumber(activity.stats.downloads)}</span>
                          </div>
                        )}
                        
                        {activity.stats.favorites > 0 && (
                          <div className="flex items-center space-x-0.5 text-pink-400">
                            <HeartIcon className="w-2.5 h-2.5" />
                            <span className="text-[10px] font-medium">{formatNumber(activity.stats.favorites)}</span>
                          </div>
                        )}
                        
                        {activity.stats.rating > 0 && (
                          <div className="flex items-center space-x-0.5 text-yellow-400">
                            <StarSolidIcon className="w-2.5 h-2.5" />
                            <span className="text-[10px] font-medium">{activity.stats.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </motion.div>
  )
})

RecentActivity.displayName = 'RecentActivity'

export default RecentActivity
