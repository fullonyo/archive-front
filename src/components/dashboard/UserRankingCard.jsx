import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  TrophyIcon,
  StarIcon,
  CloudArrowUpIcon,
  HeartIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { useTopUploaders } from '../../hooks/useTopUploaders'
import DefaultAvatar from '../ui/DefaultAvatar'
import UserRankingSkeleton from '../ui/Skeleton'
import ImageWithLoading from '../ui/ImageWithLoading'
import { getGoogleDriveImageUrl, handleImageError } from '../../utils/googleDriveUtils'
import { getProxiedImageUrl, needsProxy } from '../../utils/imageProxy'
import { formatUserStats, truncateText } from '../../utils/formatUtils'
import { useAvatarPreloader } from '../../hooks/useAvatarPreloader'

const RankBadge = ({ rank }) => {
  const getBadgeStyle = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-500/30 to-yellow-600/30 text-yellow-400 border-yellow-400/50 shadow-lg shadow-yellow-500/20'
      case 2:
        return 'bg-gradient-to-br from-gray-400/30 to-gray-500/30 text-gray-300 border-gray-300/50 shadow-lg shadow-gray-400/20'
      case 3:
        return 'bg-gradient-to-br from-amber-600/30 to-amber-700/30 text-amber-500 border-amber-500/50 shadow-lg shadow-amber-600/20'
      default:
        return 'bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 text-indigo-400 border-indigo-400/30'
    }
  }

  return (
    <div className={`w-6 h-6 flex items-center justify-center rounded-full border backdrop-blur-sm ${getBadgeStyle(rank)} shadow-lg`}>
      {rank <= 3 ? (
        <TrophyIcon className="w-3 h-3" />
      ) : (
        <span className="text-[10px] font-bold">{rank}</span>
      )}
    </div>
  )
}

const UserRankingCard = () => {
  const { data: topUsers = [], loading, error, refetch } = useTopUploaders(5)
  const { preloadAvatarsWithPriority } = useAvatarPreloader()

  // Precarrega avatares quando os dados carregam
  useEffect(() => {
    if (topUsers && topUsers.length > 0) {
      preloadAvatarsWithPriority(topUsers)
    }
  }, [topUsers, preloadAvatarsWithPriority])

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/40 backdrop-blur-xl rounded-xl p-4 border border-gray-700/30 flex flex-col hover:bg-gray-800/60 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-white">Top Uploaders</h2>
        <div className="flex items-center space-x-2">
          {error && (
            <button
              onClick={refetch}
              className="p-1 text-gray-400 hover:text-indigo-400 transition-colors"
              title="Tentar novamente"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          )}
          <Link 
            to="/rankings"
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium uppercase tracking-wide"
          >
            Ver todos
          </Link>
        </div>
      </div>

      <div className="space-y-2 overflow-hidden">
        {loading ? (
          <UserRankingSkeleton count={5} />
        ) : error ? (
          <div className="text-center py-6">
            <TrophyIcon className="w-8 h-8 mx-auto mb-2 text-red-400/50" />
            <p className="text-red-400 text-xs mb-2">Erro ao carregar ranking</p>
            <button 
              onClick={refetch}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : topUsers.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <TrophyIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Nenhum usuário encontrado</p>
          </div>
        ) : (
          topUsers.slice(0, 5).map((user, index) => {
            const formattedStats = formatUserStats(user.stats)
            
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link 
                  to={`/profile/${user.id}`} 
                  className="flex items-center space-x-4 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-200 border border-transparent hover:border-gray-700/50 min-w-0"
                >
                  <RankBadge rank={index + 1} />
                  
                  <div className="relative flex-shrink-0">
                    {user.avatar ? (
                      <ImageWithLoading
                        src={needsProxy(user.avatar) ? getProxiedImageUrl(user.avatar) : getGoogleDriveImageUrl(user.avatar)}
                        alt={user.username}
                        className="w-10 h-10 rounded-full border border-gray-700 group-hover:border-indigo-500/50 transition-colors"
                        loadingClassName="bg-gradient-to-br from-slate-800/50 via-slate-700/60 to-slate-900/50 rounded-full"
                        enableRetry={true}
                        maxRetries={2}
                        retryDelay={500}
                      />
                    ) : null}
                    <DefaultAvatar 
                      username={user.username} 
                      size="sm"
                      className={`border border-gray-700 group-hover:border-indigo-500/50 transition-colors ${user.avatar ? 'hidden' : 'flex'}`}
                    />
                    
                    {/* Crown for top 3 */}
                    {index < 3 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center"
                      >
                        <div className={`w-4 h-4 rounded-full ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          'bg-amber-600'
                        } shadow-lg`}>
                          <TrophyIcon className="w-2.5 h-2.5 text-white m-0.5" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors truncate mb-1 text-sm">
                      {truncateText(user.username, 14)}
                    </h3>
                    <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
                      <div className="flex items-center space-x-1 text-yellow-400">
                        <StarIconSolid className="w-3 h-3 flex-shrink-0" />
                        <span className="font-medium">{formattedStats.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-indigo-400">
                        <CloudArrowUpIcon className="w-3 h-3 flex-shrink-0" />
                        <span className="font-medium">{formattedStats.uploads}</span>
                      </div>
                      <div className="hidden sm:flex items-center space-x-1 text-pink-400">
                        <HeartIcon className="w-3 h-3 flex-shrink-0" />
                        <span className="font-medium">{formattedStats.likes}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}

export default UserRankingCard
