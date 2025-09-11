import React from 'react'
import { motion } from 'framer-motion'
import { 
  UserGroupIcon,
  ClockIcon,
  GlobeAltIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline'
import VRChatLoading from '../ui/VRChatLoading'

const VRChatDashboard = ({ 
  connection, 
  dashboardData, 
  lastRefresh, 
  onRefresh, 
  loading 
}) => {
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

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Perfil Card */}
      {connection && (
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
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
                    {connection.vrchatStatus === 'online' ? 'Online' :
                     connection.vrchatStatus === 'active' ? 'Ativo' :
                     'Offline'}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Atualizar dados"
            >
              {loading ? (
                <VRChatLoading 
                  size="sm" 
                  type="refresh" 
                  showText={false}
                  className="w-5 h-5"
                />
              ) : (
                <ArrowPathIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {lastRefresh && (
            <p className="text-xs text-gray-500 mt-3">
              Última atualização: {new Date(lastRefresh).toLocaleString('pt-BR')}
            </p>
          )}
        </div>
      )}

      {/* Quick Stats */}
      {dashboardData?.stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <UserGroupIcon className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {dashboardData.stats.totalFriends || 0}
                </p>
                <p className="text-sm text-gray-400">Amigos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <ClockIcon className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {dashboardData.stats.hoursPlayed || 0}h
                </p>
                <p className="text-sm text-gray-400">Jogadas</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <GlobeAltIcon className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {dashboardData.stats.worldsVisited || 0}
                </p>
                <p className="text-sm text-gray-400">Mundos</p>
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
            {!dashboardData.recentWorlds.worlds?.length && (
              <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-600/30 text-gray-400">
                Sem conexão
              </div>
            )}
          </div>
          
          {dashboardData.recentWorlds.worlds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {dashboardData.recentWorlds.worlds.slice(0, 8).map((world, index) => (
                <WorldCard key={index} world={world} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <GlobeAltIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">Nenhum mundo recente</p>
              <p className="text-sm text-gray-500 mt-1">
                Explore alguns mundos no VRChat para vê-los aqui
              </p>
            </div>
          )}
        </div>
      )}

      {/* Estado de carregamento para primeira carga */}
      {loading && !dashboardData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default VRChatDashboard
