import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GlobeAltIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  UsersIcon,
  LockClosedIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  TrophyIcon,
  FireIcon,
  PhotoIcon,
  TagIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MapPinIcon,
  ClockIcon,
  StarIcon,
  UserGroupIcon,
  BeakerIcon,
  SparklesIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  RocketLaunchIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  CubeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import VRChatLoading from '../ui/VRChatLoading'

const WorldExplorer = ({ 
  worlds = [], 
  favoriteWorlds = [], 
  onWorldSelect, 
  onToggleFavorite,
  onRefresh,
  loading,
  searchQuery,
  onSearchChange
}) => {
  const [filters, setFilters] = useState({
    category: 'all',
    platform: 'all',
    capacity: 'all',
    features: [],
    sortBy: 'popularity',
    showFavoritesOnly: false
  })
  
  const [expandedWorlds, setExpandedWorlds] = useState(new Set())
  const [selectedWorld, setSelectedWorld] = useState(null)

  // Categorias de mundos
  const worldCategories = [
    { id: 'all', name: 'Todos os Mundos', icon: GlobeAltIcon },
    { id: 'social', name: 'Social', icon: UserGroupIcon },
    { id: 'game', name: 'Jogos', icon: TrophyIcon },
    { id: 'art', name: 'Arte & Museus', icon: PhotoIcon },
    { id: 'music', name: 'Música & Clube', icon: SparklesIcon },
    { id: 'roleplay', name: 'Roleplay', icon: BeakerIcon },
    { id: 'education', name: 'Educação', icon: LightBulbIcon },
    { id: 'tech', name: 'Tech Demo', icon: ComputerDesktopIcon },
    { id: 'avatar', name: 'Avatar World', icon: UserGroupIcon },
    { id: 'hangout', name: 'Hangout', icon: UsersIcon }
  ]

  // Features disponíveis
  const availableFeatures = [
    { id: 'quest_compatible', name: 'Quest Compatible', icon: DevicePhoneMobileIcon },
    { id: 'udon', name: 'Udon Scripting', icon: CubeIcon },
    { id: 'sdk3', name: 'SDK3', icon: RocketLaunchIcon },
    { id: 'mirrors', name: 'Espelhos', icon: EyeIcon },
    { id: 'video_players', name: 'Video Players', icon: PhotoIcon },
    { id: 'interactive', name: 'Interativo', icon: BeakerIcon },
    { id: 'multiplayer_game', name: 'Jogo Multiplayer', icon: TrophyIcon },
    { id: 'realistic', name: 'Realista', icon: CheckCircleIcon }
  ]

  // Filtrar e ordenar mundos
  const filteredWorlds = useMemo(() => {
    let filtered = worlds.filter(world => {
      // Filtro de busca
      if (searchQuery && !world.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !world.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !world.authorName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      
      // Filtro de categoria
      if (filters.category !== 'all' && world.category !== filters.category) return false
      
      // Filtro de plataforma
      if (filters.platform !== 'all') {
        if (filters.platform === 'pc' && !world.platforms.includes('StandaloneWindows')) return false
        if (filters.platform === 'quest' && !world.platforms.includes('Android')) return false
      }
      
      // Filtro de capacidade
      if (filters.capacity !== 'all') {
        const capacity = world.capacity || 0
        if (filters.capacity === 'small' && capacity > 8) return false
        if (filters.capacity === 'medium' && (capacity <= 8 || capacity > 20)) return false
        if (filters.capacity === 'large' && capacity <= 20) return false
      }
      
      // Filtro de features
      if (filters.features.length > 0) {
        const hasAllFeatures = filters.features.every(feature => 
          world.features && world.features.includes(feature)
        )
        if (!hasAllFeatures) return false
      }
      
      // Filtro de favoritos
      if (filters.showFavoritesOnly && !favoriteWorlds.includes(world.id)) return false
      
      return true
    })
    
    // Ordenação
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'popularity':
          return (b.occupants || 0) - (a.occupants || 0)
        case 'name':
          return a.name.localeCompare(b.name)
        case 'updated':
          return new Date(b.updated_at || b.updatedAt || 0) - new Date(a.updated_at || a.updatedAt || 0)
        case 'created':
          return new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0)
        case 'capacity':
          return (b.capacity || 0) - (a.capacity || 0)
        case 'favorites':
          const aFav = favoriteWorlds.includes(a.id) ? 1 : 0
          const bFav = favoriteWorlds.includes(b.id) ? 1 : 0
          return bFav - aFav
        default:
          return 0
      }
    })
    
    return filtered
  }, [worlds, favoriteWorlds, searchQuery, filters])

  // Toggle expansão de mundo
  const toggleExpandWorld = (worldId) => {
    const newExpanded = new Set(expandedWorlds)
    if (newExpanded.has(worldId)) {
      newExpanded.delete(worldId)
    } else {
      newExpanded.add(worldId)
    }
    setExpandedWorlds(newExpanded)
  }

  // Toggle feature filter
  const toggleFeatureFilter = (featureId) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }))
  }

  // Componente de cartão de mundo
  const WorldCard = ({ world }) => {
    const isExpanded = expandedWorlds.has(world.id)
    const isFavorite = favoriteWorlds.includes(world.id)
    
    return (
      <motion.div
        layout
        className="bg-gray-700 rounded-xl overflow-hidden hover:bg-gray-600 transition-colors"
      >
        <div className="relative">
          {/* Imagem do mundo */}
          <div className="aspect-video bg-gray-800 relative overflow-hidden">
            <img
              src={world.imageUrl || world.thumbnailImageUrl}
              alt={world.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiPjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMzc0MTUxIi8+PHBhdGggZD0iTTE2MCA3MEMxNDcuODUgNzAgMTM4IDc5Ljg1IDEzOCA5MlMxNDcuODUgMTE0IDE2MCAxMTRTMTgyIDEwNC4xNSAxODIgOTJTMTcyLjE1IDcwIDE2MCA3MFpNMTYwIDEwNEMxNTMuMzcgMTA0IDE0OCA5OC42MyAxNDggOTJTMTUzLjM3IDgwIDE2MCA4MFMxNzIgODUuMzcgMTcyIDkyUzE2Ni42MyAxMDQgMTYwIDEwNFoiIGZpbGw9IiM2QjcyODAiLz48L3N2Zz4='
              }}
            />
            
            {/* Overlay com informações */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Status e capacidade */}
            <div className="absolute top-3 left-3 flex items-center space-x-2">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                (world.occupants || 0) > 0 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-600 text-gray-300'
              }`}>
                <UsersIcon className="w-3 h-3 mr-1" />
                {world.occupants || 0}/{world.capacity || '?'}
              </div>
              
              {world.publicOccupants !== undefined && (
                <div className="px-2 py-1 bg-blue-600 rounded-full text-xs font-medium text-white">
                  <EyeIcon className="w-3 h-3 mr-1" />
                  {world.publicOccupants} público
                </div>
              )}
            </div>
            
            {/* Botões de ação */}
            <div className="absolute top-3 right-3 flex items-center space-x-2">
              <button
                onClick={() => onToggleFavorite(world.id)}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                  isFavorite 
                    ? 'bg-red-600 text-white' 
                    : 'bg-black/50 text-gray-300 hover:bg-black/70 hover:text-white'
                }`}
              >
                {isFavorite ? (
                  <HeartSolidIcon className="w-4 h-4" />
                ) : (
                  <HeartIcon className="w-4 h-4" />
                )}
              </button>
              
              <button
                onClick={() => onWorldSelect(world)}
                className="p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                <RocketLaunchIcon className="w-4 h-4" />
              </button>
            </div>
            
            {/* Indicadores de plataforma */}
            <div className="absolute bottom-3 right-3 flex items-center space-x-1">
              {world.platforms && world.platforms.includes('StandaloneWindows') && (
                <div className="p-1 bg-black/50 rounded backdrop-blur-sm">
                  <ComputerDesktopIcon className="w-3 h-3 text-blue-400" />
                </div>
              )}
              {world.platforms && world.platforms.includes('Android') && (
                <div className="p-1 bg-black/50 rounded backdrop-blur-sm">
                  <DevicePhoneMobileIcon className="w-3 h-3 text-green-400" />
                </div>
              )}
            </div>
          </div>
          
          {/* Informações básicas */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-white font-semibold text-lg leading-tight pr-2">
                {world.name}
              </h3>
              <button
                onClick={() => toggleExpandWorld(world.id)}
                className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
              >
                {isExpanded ? (
                  <ChevronUpIcon className="w-5 h-5" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            
            <p className="text-sm text-gray-400 mb-3">
              por <span className="text-blue-400">{world.authorName}</span>
            </p>
            
            <p className="text-sm text-gray-300 mb-3 line-clamp-2">
              {world.description}
            </p>
            
            {/* Tags básicas */}
            <div className="flex items-center space-x-2 mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                world.releaseStatus === 'public' 
                  ? 'bg-green-600 text-white'
                  : world.releaseStatus === 'hidden'
                  ? 'bg-gray-600 text-gray-300'
                  : 'bg-orange-600 text-white'
              }`}>
                {world.releaseStatus === 'public' && 'Público'}
                {world.releaseStatus === 'hidden' && 'Oculto'}
                {world.releaseStatus === 'private' && 'Privado'}
                {world.releaseStatus === 'ask' && 'Sob Pedido'}
              </span>
              
              {world.category && (
                <span className="px-2 py-1 bg-purple-600 rounded-full text-xs font-medium text-white">
                  {worldCategories.find(cat => cat.id === world.category)?.name || world.category}
                </span>
              )}
            </div>
            
            {/* Estatísticas rápidas */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <EyeIcon className="w-3 h-3 mr-1" />
                  {world.visits || 0} visitas
                </div>
                <div className="flex items-center">
                  <HeartIcon className="w-3 h-3 mr-1" />
                  {world.favorites || 0} favoritos
                </div>
              </div>
              
              {world.updated_at && (
                <div className="flex items-center">
                  <ClockIcon className="w-3 h-3 mr-1" />
                  {new Date(world.updated_at).toLocaleDateString('pt-BR')}
                </div>
              )}
            </div>
          </div>
          
          {/* Informações expandidas */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-600 p-4"
              >
                {/* Features e tags */}
                {world.tags && world.tags.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <TagIcon className="w-4 h-4 mr-1" />
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {world.tags.slice(0, 10).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                      {world.tags.length > 10 && (
                        <span className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-400">
                          +{world.tags.length - 10} mais
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Features técnicas */}
                {world.features && world.features.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <CubeIcon className="w-4 h-4 mr-1" />
                      Features
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {world.features.map((feature, index) => {
                        const featureInfo = availableFeatures.find(f => f.id === feature)
                        return (
                          <div key={index} className="flex items-center text-xs text-gray-300">
                            {featureInfo && <featureInfo.icon className="w-3 h-3 mr-1 text-blue-400" />}
                            <span>{featureInfo?.name || feature}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                {/* Instâncias ativas */}
                {world.instances && world.instances.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      Instâncias Ativas ({world.instances.length})
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {world.instances.slice(0, 5).map((instance, index) => (
                        <div key={index} className="flex items-center justify-between text-xs bg-gray-600 p-2 rounded">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              instance.type === 'public' ? 'bg-green-400' :
                              instance.type === 'friends+' ? 'bg-blue-400' :
                              instance.type === 'friends' ? 'bg-yellow-400' : 'bg-gray-400'
                            }`} />
                            <span className="text-gray-300">
                              {instance.name || `Instância ${index + 1}`}
                            </span>
                          </div>
                          <span className="text-gray-400">
                            {instance.userCount || 0}/{instance.capacity || world.capacity || '?'}
                          </span>
                        </div>
                      ))}
                      {world.instances.length > 5 && (
                        <div className="text-xs text-gray-400 text-center">
                          +{world.instances.length - 5} instâncias mais
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Botões de ação expandidos */}
                <div className="flex items-center space-x-2 pt-3 border-t border-gray-600">
                  <button
                    onClick={() => onWorldSelect(world)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <RocketLaunchIcon className="w-4 h-4 mr-2" />
                    Entrar no Mundo
                  </button>
                  
                  <button
                    onClick={() => setSelectedWorld(world)}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => navigator.clipboard.writeText(world.id)}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm transition-colors"
                  >
                    <ShareIcon className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      key="worlds"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header de Mundos */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <GlobeAltIcon className="w-6 h-6 mr-2 text-purple-400" />
            Explorar Mundos
          </h2>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-400">
              {filteredWorlds.length} de {worlds.length} mundos
            </span>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center"
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

        {/* Busca */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar mundos por nome, descrição ou autor..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Categoria */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Categoria:</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {worldCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Plataforma */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Plataforma:</label>
            <select
              value={filters.platform}
              onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value }))}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Todas as plataformas</option>
              <option value="pc">PC/Desktop</option>
              <option value="quest">Quest/Mobile</option>
            </select>
          </div>
          
          {/* Capacidade */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Capacidade:</label>
            <select
              value={filters.capacity}
              onChange={(e) => setFilters(prev => ({ ...prev, capacity: e.target.value }))}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Qualquer capacidade</option>
              <option value="small">Pequeno (até 8)</option>
              <option value="medium">Médio (9-20)</option>
              <option value="large">Grande (21+)</option>
            </select>
          </div>
          
          {/* Ordenação */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Ordenar por:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="popularity">Popularidade</option>
              <option value="name">Nome</option>
              <option value="updated">Atualizado recente</option>
              <option value="created">Criado recente</option>
              <option value="capacity">Capacidade</option>
              <option value="favorites">Favoritos primeiro</option>
            </select>
          </div>
        </div>

        {/* Features Filter */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400">Features:</label>
            <button
              onClick={() => setFilters(prev => ({ ...prev, showFavoritesOnly: !prev.showFavoritesOnly }))}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                filters.showFavoritesOnly 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {filters.showFavoritesOnly ? (
                <>
                  <HeartSolidIcon className="w-4 h-4 mr-1" />
                  Só Favoritos
                </>
              ) : (
                <>
                  <HeartIcon className="w-4 h-4 mr-1" />
                  Mostrar Favoritos
                </>
              )}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableFeatures.map(feature => (
              <button
                key={feature.id}
                onClick={() => toggleFeatureFilter(feature.id)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center ${
                  filters.features.includes(feature.id)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <feature.icon className="w-4 h-4 mr-1" />
                {feature.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Mundos */}
      <div className="space-y-4">
        {loading && worlds.length === 0 ? (
          <div className="text-center py-12">
            <VRChatLoading size="lg" type="loading" />
            <p className="text-gray-400 mt-4">Carregando mundos...</p>
          </div>
        ) : filteredWorlds.length === 0 ? (
          <div className="text-center py-12">
            <GlobeAltIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nenhum mundo encontrado</p>
            <p className="text-sm text-gray-500 mt-2">
              Tente ajustar os filtros ou termos de busca
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorlds.map(world => (
              <WorldCard key={world.id} world={world} />
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalhes do mundo (se necessário) */}
      <AnimatePresence>
        {selectedWorld && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedWorld(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{selectedWorld.name}</h3>
                <button
                  onClick={() => setSelectedWorld(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <img
                  src={selectedWorld.imageUrl}
                  alt={selectedWorld.name}
                  className="w-full aspect-video object-cover rounded-lg"
                />
                
                <p className="text-gray-300">{selectedWorld.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Autor:</p>
                    <p className="text-white">{selectedWorld.authorName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Capacidade:</p>
                    <p className="text-white">{selectedWorld.capacity || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Visitantes:</p>
                    <p className="text-white">{selectedWorld.visits || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Favoritos:</p>
                    <p className="text-white">{selectedWorld.favorites || 0}</p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      onWorldSelect(selectedWorld)
                      setSelectedWorld(null)
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Entrar no Mundo
                  </button>
                  <button
                    onClick={() => onToggleFavorite(selectedWorld.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      favoriteWorlds.includes(selectedWorld.id)
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {favoriteWorlds.includes(selectedWorld.id) ? 'Remover Favorito' : 'Favoritar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default WorldExplorer
