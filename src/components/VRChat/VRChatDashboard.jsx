import React from 'react'
import { motion } from 'framer-motion'
import { 
  UserGroupIcon,
  ClockIcon,
  GlobeAltIcon,
  HeartIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline'
import VRChatLoading from '../ui/VRChatLoading'

const VRChatDashboard = ({ profile, stats, recentWorlds, onRefresh, loading }) => {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Perfil Card - Estilo minimalista */}
      {profile && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <img
                src={profile.profilePicOverride || profile.userIcon}
                alt={profile.displayName}
                className="w-16 h-16 rounded-full object-cover bg-gray-200 dark:bg-gray-600"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRDFENUREIiByeD0iMzIiLz48cGF0aCBkPSJNMzIgMTZDMjQuOTU4IDE2IDIwIDIxLjk1OCAyMCAzMlMyNC45NTggNDggMzIgNDhTNDQgNDIuMDQyIDQ0IDMyUzM5LjA0MiAxNiAzMiAxNlpNMzIgNDBDMjguNjg2IDQwIDI2IDM3LjMxNCAyNiAzNFMyOC42ODYgMjggMzIgMjhTMzggMzAuNjg2IDM4IDM0UzM1LjMxNCA0MCAzMiA0MFoiIGZpbGw9IiM5Q0E0QTgiLz48L3N2Zz4='
                }}
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.displayName}</h2>
                <p className="text-gray-600 dark:text-gray-400">@{profile.username}</p>
                
                <div className="flex items-center space-x-3 mt-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    profile.status === 'online' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    profile.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    profile.status === 'busy' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-1 ${
                      profile.status === 'online' ? 'bg-green-500' :
                      profile.status === 'active' ? 'bg-blue-500' :
                      profile.status === 'busy' ? 'bg-red-500' :
                      'bg-gray-400'
                    }`} />
                    {profile.status === 'online' && 'Online'}
                    {profile.status === 'active' && 'Ativo'} 
                    {profile.status === 'busy' && 'Ocupado'}
                    {profile.status === 'offline' && 'Offline'}
                  </span>
                  
                  {profile.location && (
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <GlobeAltIcon className="w-4 h-4 mr-1" />
                      {profile.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {profile.bio && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid - Estilo clean */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Amigos</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats?.totalFriends || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Online</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats?.onlineFriends || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <GlobeAltIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mundos</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats?.worldsVisited || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <HeartIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Favoritos</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats?.favoriteWorlds || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mundos Recentes - Estilo feed */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mundos Recentes</h3>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <VRChatLoading size="md" type="world" showText={false} />
            </div>
          ) : !recentWorlds || recentWorlds.length === 0 ? (
            <div className="text-center py-12">
              <GlobeAltIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Nenhum mundo recente encontrado</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Visite alguns mundos no VRChat para vê-los aqui!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentWorlds.slice(0, 6).map((world, index) => (
                <motion.div
                  key={world.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-600 relative overflow-hidden">
                      <img
                        src={world.imageUrl || world.thumbnailImageUrl}
                        alt={world.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiPjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjNGNEY2Ii8+PHBhdGggZD0iTTE2MCA3MEMxNDcuODUgNzAgMTM4IDc5Ljg1IDEzOCA5MlMxNDcuODUgMTE0IDE2MCAxMTRTMTgyIDEwNC4xNSAxODIgOTJTMTcyLjE1IDcwIDE2MCA3MFpNMTYwIDEwNEMxNTMuMzcgMTA0IDE0OCA5OC42MyAxNDggOTJTMTUzLjM3IDgwIDE2MCA4MFMxNzIgODUuMzcgMTcyIDkyUzE2Ni42MyAxMDQgMTYwIDEwNFoiIGZpbGw9IiM5Q0E0QTgiLz48L3N2Zz4='
                        }}
                      />
                      
                      {world.occupants !== undefined && (
                        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs">
                          <UsersIcon className="w-3 h-3 inline mr-1" />
                          {world.occupants}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {world.name}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                        por {world.authorName}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default VRChatDashboard
