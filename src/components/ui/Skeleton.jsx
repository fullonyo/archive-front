import React from 'react'
import { motion } from 'framer-motion'

/**
 * Skeleton loading específico para itens de usuário no ranking
 */
const UserRankingSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-2">
      {Array(count).fill(0).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center space-x-4 p-3 rounded-lg bg-gray-800/30 animate-pulse"
        >
          {/* Rank Badge Skeleton */}
          <div className="w-6 h-6 bg-gray-700/50 rounded-full flex-shrink-0"></div>
          
          {/* Avatar Skeleton */}
          <div className="w-10 h-10 bg-gray-700/50 rounded-full flex-shrink-0"></div>
          
          {/* Content Skeleton */}
          <div className="flex-1 min-w-0">
            {/* Username Skeleton */}
            <div className="h-4 bg-gray-700/50 rounded-md w-24 mb-2"></div>
            
            {/* Stats Skeleton */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-700/50 rounded"></div>
                <div className="h-3 bg-gray-700/50 rounded w-6"></div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-700/50 rounded"></div>
                <div className="h-3 bg-gray-700/50 rounded w-4"></div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-700/50 rounded"></div>
                <div className="h-3 bg-gray-700/50 rounded w-4"></div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/**
 * Skeleton loading para cards de estatística
 */
export const StatCardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {Array(count).fill(0).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-6 bg-gray-700/50 rounded w-12 mb-2"></div>
              <div className="h-3 bg-gray-700/50 rounded w-16"></div>
            </div>
            <div className="w-8 h-8 bg-gray-700/50 rounded-lg"></div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/**
 * Skeleton loading para listas de atividades recentes
 */
export const RecentActivitySkeleton = ({ count = 6 }) => {
  return (
    <div className="space-y-3">
      {Array(count).fill(0).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/30 animate-pulse"
        >
          <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex-shrink-0"></div>
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-gray-700/50 rounded w-32 mb-1"></div>
            <div className="h-3 bg-gray-700/50 rounded w-20"></div>
          </div>
          <div className="h-3 bg-gray-700/50 rounded w-12"></div>
        </motion.div>
      ))}
    </div>
  )
}

export default UserRankingSkeleton
