import React, { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  UserIcon,
  UserGroupIcon,
  ClockIcon,
  GlobeAltIcon,
  HeartIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowPathIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import VRChatLoading from '../ui/VRChatLoading'

const VRChatDashboard = ({ 
  profile, 
  stats, 
  recentWorlds = [], 
  friends = [],
  onRefresh, 
  loading 
}) => {
  // Calcular estatísticas em tempo real dos amigos
  const friendStats = useMemo(() => {
    if (!friends || !Array.isArray(friends)) {
      return {
        total: 0,
        online: 0,
        inWorlds: 0,
        private: 0
      }
    }

    return {
      total: friends.length,
      online: friends.filter(f => f.status && f.status !== 'offline').length,
      inWorlds: friends.filter(f => f.location && !f.location.includes('offline') && !f.location.includes('private')).length,
      private: friends.filter(f => f.location && f.location.includes('private')).length
    }
  }, [friends])

  // Calcular tempo desde último login se disponível
  const getLastSeenText = (profile) => {
    if (!profile?.last_login && !profile?.date_joined) return 'Desconhecido'
    
    const lastLogin = new Date(profile.last_login || profile.date_joined)
    const now = new Date()
    const diffMs = now - lastLogin
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 7) return `${diffDays} dias atrás`
    if (diffDays > 0) return `${diffDays}d atrás`
    if (diffHours > 0) return `${diffHours}h atrás`
    return 'Agora mesmo'
  }

  // Função para obter melhor URL de avatar disponível
  const getAvatarUrl = (profile) => {
    const urls = [
      profile.vrchatProfilePicUrl,
      profile.vrchatAvatarUrl, 
      profile.profilePicOverride,
      profile.userIcon,
      profile.currentAvatarImageUrl
    ].filter(Boolean)
    
    return urls[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjM0I0MDQ4IiByeD0iMzIiLz48cGF0aCBkPSJNMzIgMTZDMjQuOTU4IDE2IDIwIDIxLjk1OCAyMCAzMlMyNC45NTggNDggMzIgNDhTNDQgNDIuMDQyIDQ0IDMyUzM5LjA0MiAxNiAzMiAxNlpNMzIgNDBDMjguNjg2IDQwIDI2IDM3LjMxNCAyNiAzNFMyOC42ODYgMjggMzIgMjhTMzggMzAuNjg2IDM4IDM0UzM1LjMxNCA0MCAzMiA0MFoiIGZpbGw9IiM5Q0E0QTgiLz48L3N2Zz4='
  }

  // Debug dos dados recebidos
  useEffect(() => {
    console.log('🔍 VRChatDashboard - Dados recebidos:', {
      profile: profile,
      profileKeys: profile ? Object.keys(profile) : [],
      stats: stats,
      recentWorlds: recentWorlds,
      recentWorldsLength: recentWorlds?.length || 0,
      friends: friends?.length || 0,
      loading: loading
    })

    // Debug específico dos campos do perfil
    if (profile && Object.keys(profile).length > 0) {
      console.log('📋 Profile details:', {
        displayName: profile.vrchatDisplayName || profile.displayName,
        status: profile.vrchatStatus || profile.status,
        avatarUrl: profile.vrchatProfilePicUrl || profile.vrchatAvatarUrl,
        tags: profile.vrchatTags || profile.tags,
        location: profile.vrchatLocation || profile.location,
        statusDescription: profile.vrchatStatusDescription || profile.statusDescription
      })
    }
  }, [profile, stats, recentWorlds, friends, loading])

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header do Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Visão geral da sua atividade no VRChat
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">Atualizar</span>
        </button>
      </div>

      {/* Perfil Card Minimalista */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-2/3" />
            </div>
          </div>
        </div>
      ) : profile && Object.keys(profile).length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={getAvatarUrl(profile)}
                  alt={profile.vrchatDisplayName || profile.displayName || 'Usuário'}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjM0I0MDQ4IiByeD0iMzIiLz48cGF0aCBkPSJNMzIgMTZDMjQuOTU4IDE2IDIwIDIxLjk1OCAyMCAzMlMyNC45NTggNDggMzIgNDhTNDQgNDIuMDQyIDQ0IDMyUzM5LjA0MiAxNiAzMiAxNlpNMzIgNDBDMjguNjg2IDQwIDI2IDM3LjMxNCAyNiAzNFMyOC42ODYgMjggMzIgMjhTMzggMzAuNjg2IDM4IDM0UzM1LjMxNCA0MCAzMiA0MFoiIGZpbGw9IiM5Q0E0QTgiLz48L3N2Zz4='
                  }}
                />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 ${
                  (profile.vrchatStatus || profile.status) === 'online' ? 'bg-green-500' :
                  (profile.vrchatStatus || profile.status) === 'join me' ? 'bg-blue-500' :
                  (profile.vrchatStatus || profile.status) === 'ask me' ? 'bg-yellow-500' :
                  (profile.vrchatStatus || profile.status) === 'busy' ? 'bg-red-500' :
                  'bg-gray-400'
                }`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                    {profile.vrchatDisplayName || profile.displayName || 'Usuário'}
                  </h2>
                  {(profile.vrchatTags || profile.tags) && (profile.vrchatTags || profile.tags).includes('system_trust_trusted') && (
                    <div className="flex items-center space-x-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full">
                      <StarIcon className="w-3 h-3" />
                      <span className="text-xs font-medium">Trusted</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm">
                  <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full font-medium ${
                    (profile.vrchatStatus || profile.status) === 'online' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                    (profile.vrchatStatus || profile.status) === 'join me' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                    (profile.vrchatStatus || profile.status) === 'ask me' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    (profile.vrchatStatus || profile.status) === 'busy' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                    'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      (profile.vrchatStatus || profile.status) === 'online' ? 'bg-green-500 animate-pulse' :
                      (profile.vrchatStatus || profile.status) === 'join me' ? 'bg-blue-500' :
                      (profile.vrchatStatus || profile.status) === 'ask me' ? 'bg-yellow-500' :
                      (profile.vrchatStatus || profile.status) === 'busy' ? 'bg-red-500' :
                      'bg-gray-400'
                    }`} />
                    <span className="capitalize">
                      {(profile.vrchatStatus || profile.status) === 'join me' ? 'Join Me' :
                       (profile.vrchatStatus || profile.status) === 'ask me' ? 'Ask Me' :
                       (profile.vrchatStatus || profile.status) || 'Offline'}
                    </span>
                  </span>
                  
                  <span className="text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                    <CalendarIcon className="w-3 h-3" />
                    <span>{getLastSeenText(profile)}</span>
                  </span>
                </div>
              </div>
            </div>

            {(profile.vrchatLocation || profile.location) && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPinIcon className="w-4 h-4" />
                  <span>
                    {(profile.vrchatLocation || profile.location).includes('wrld_') ? 'Em mundo público' :
                     (profile.vrchatLocation || profile.location).includes('private') ? 'Mundo privado' :
                     (profile.vrchatLocation || profile.location) === 'offline' ? 'Offline' :
                     (profile.vrchatLocation || profile.location)}
                  </span>
                </div>
              </div>
            )}

            {(profile.vrchatStatusDescription || profile.statusDescription) && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  "{profile.vrchatStatusDescription || profile.statusDescription}"
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 text-center">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Dados do perfil não encontrados</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Verifique sua conexão com o VRChat
            </p>
          </div>
        </div>
      )}

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amigos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {friendStats.total}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <UserGroupIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Online</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {friendStats.online}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Em Mundos</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {friendStats.inWorlds}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <GlobeAltIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Privados</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {friendStats.private}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Mundos Recentes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Mundos Recentes</h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {recentWorlds?.length || 0} mundos
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <VRChatLoading size="lg" type="world" text="Carregando mundos..." />
            </div>
          ) : !recentWorlds || recentWorlds.length === 0 ? (
            <div className="text-center py-12">
              <GlobeAltIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhum mundo recente</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Visite alguns mundos no VRChat para vê-los aqui!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentWorlds.slice(0, 6).map((world, index) => (
                <motion.div
                  key={world.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer bg-gray-50 dark:bg-gray-700/30 rounded-lg overflow-hidden hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200"
                >
                  <div className="aspect-video relative overflow-hidden bg-gray-200 dark:bg-gray-600">
                    <img
                      src={world.imageUrl || world.thumbnailImageUrl}
                      alt={world.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiPjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMzc0MTUxIi8+PHBhdGggZD0iTTE2MCA3MEMxNDcuODUgNzAgMTM4IDc5Ljg1IDEzOCA5MlMxNDcuODUgMTE0IDE2MCAxMTRTMTgyIDEwNC4xNSAxODIgOTJTMTcyLjE1IDcwIDE2MCA3MFpNMTYwIDEwNEMxNTMuMzcgMTA0IDE0OCA5OC42MyAxNDggOTJTMTUzLjM3IDgwIDE2MCA4MFMxNzIgODUuMzcgMTcyIDkyUzE2Ni42MyAxMDQgMTYwIDEwNFoiIGZpbGw9IiM5Q0E0QTgiLz48L3N2Zz4='
                      }}
                    />
                    
                    {world.occupants !== undefined && (
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-medium">
                        <UsersIcon className="w-3 h-3 inline mr-1" />
                        {world.occupants}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-relaxed">
                      {world.name}
                    </h4>
                    {world.authorName && (
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                        por {world.authorName}
                      </p>
                    )}
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
