import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowPathIcon, UserGroupIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { useVRChatAPI } from '../../hooks/useVRChatAPI'

const WorldDetailsModal = ({ world, isOpen, onClose }) => {
  // Todos os hooks devem vir primeiro
  const { getWorldInstances } = useVRChatAPI()
  const [instances, setInstances] = useState([])
  const [loadingInstances, setLoadingInstances] = useState(false)

  const loadInstances = useCallback(async () => {
    if (!world?.id) return
    
    console.log('🔄 Iniciando carregamento de instâncias para:', world.id)
    setLoadingInstances(true)
    
    try {
      const result = await getWorldInstances(world.id)
      console.log('📡 Resultado da busca de instâncias:', result)
      
      if (result?.success) {
        setInstances(result.data?.instances || [])
        console.log('✅ Instâncias carregadas:', result.data?.instances?.length || 0)
      } else {
        console.log('⚠️ Erro na resposta:', result?.error || 'Erro desconhecido')
        setInstances([])
      }
    } catch (err) {
      console.error('❌ Erro ao carregar instâncias:', err)
      setInstances([])
    } finally {
      setLoadingInstances(false)
    }
  }, [world?.id, getWorldInstances])

  // Efeito único para gerenciar carregamento e timer
  useEffect(() => {
    let timer = null
    
    if (isOpen && world?.id) {
      console.log('🌐 Modal aberto, carregando instâncias para:', world.name)
      
      // Carrega imediatamente
      loadInstances()
      
      // Configura timer para atualização automática
      timer = setInterval(() => {
        console.log('⏰ Atualizando instâncias automaticamente...')
        loadInstances()
      }, 30000)
    } else {
      // Limpa instâncias quando modal fecha
      setInstances([])
    }
    
    // Cleanup function
    return () => {
      if (timer) {
        console.log('🧹 Limpando timer de instâncias')
        clearInterval(timer)
      }
    }
  }, [isOpen, world?.id, loadInstances])

  // Função para formatar o tipo de instância
  const getInstanceTypeInfo = (type) => {
    switch (type) {
      case 'public':
        return { color: 'bg-green-600 text-green-100', icon: '🌍', label: 'Público' }
      case 'friends':
        return { color: 'bg-blue-600 text-blue-100', icon: '👥', label: 'Amigos' }
      case 'friendsOfGuests':
        return { color: 'bg-purple-600 text-purple-100', icon: '👥+', label: 'Amigos+' }
      case 'invite':
      case 'inviteOnly':
        return { color: 'bg-red-600 text-red-100', icon: '📩', label: 'Convite' }
      case 'group':
        return { color: 'bg-orange-600 text-orange-100', icon: '🏢', label: 'Grupo' }
      default:
        return { color: 'bg-gray-600 text-gray-100', icon: '❓', label: type }
    }
  }

  // Função para formatar a região
  const getRegionFlag = (region) => {
    switch (region) {
      case 'us': return '🇺🇸'
      case 'eu': return '🇪🇺'
      case 'jp': return '🇯🇵'
      case 'asi': return '🌏'
      default: return '🌍'
    }
  }

  // Early return após todos os hooks
  if (!isOpen || !world) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{world.name}</h2>
              <p className="text-gray-400">por {world.authorName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Imagem do mundo */}
            <div className="space-y-4">
              {world.imageUrl && (
                <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden">
                  <img 
                    src={world.imageUrl} 
                    alt={world.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Galeria de imagens adicionais */}
              {world.previewImages && world.previewImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {world.previewImages.slice(0, 6).map((img, index) => (
                    <div key={index} className="aspect-video bg-gray-700 rounded overflow-hidden">
                      <img 
                        src={img} 
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Informações detalhadas */}
            <div className="space-y-6">
              {/* Descrição */}
              {world.description && (
                <div>
                  <h3 className="text-white font-semibold mb-2">📄 Descrição</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{world.description}</p>
                </div>
              )}

              {/* Estatísticas */}
              <div>
                <h3 className="text-white font-semibold mb-3">📊 Estatísticas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Favoritos</p>
                    <p className="text-white font-semibold">{world.favorites || world.favoriteCount || 0}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Visitas</p>
                    <p className="text-white font-semibold">{world.visits || 0}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Capacidade</p>
                    <p className="text-white font-semibold">{world.capacity || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Criado</p>
                    <p className="text-white font-semibold text-xs">
                      {world.created_at ? new Date(world.created_at).toLocaleDateString() : 
                       world.publicationDate ? new Date(world.publicationDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {world.tags && world.tags.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">🏷️ Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {world.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Instâncias ativas (do world object) */}
              {world.instances && world.instances.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">🌐 Instâncias Básicas</h3>
                  <div className="space-y-2">
                    {world.instances.slice(0, 5).map((instance, index) => (
                      <div key={index} className="bg-gray-700/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm">{instance.name || `Instância ${index + 1}`}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            instance.type === 'public' ? 'bg-green-600 text-green-100' :
                            instance.type === 'friends' ? 'bg-blue-600 text-blue-100' :
                            instance.type === 'friendsOfGuests' ? 'bg-purple-600 text-purple-100' :
                            instance.type === 'invite' ? 'bg-red-600 text-red-100' :
                            'bg-gray-600 text-gray-100'
                          }`}>
                            {instance.type}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs mt-1">
                          {instance.userCount || instance.users || 0} usuários online
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instâncias em Tempo Real */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold flex items-center">
                    🌐 Instâncias em Tempo Real
                    {loadingInstances && (
                      <ArrowPathIcon className="w-4 h-4 ml-2 animate-spin text-blue-400" />
                    )}
                  </h3>
                  <button
                    onClick={loadInstances}
                    disabled={loadingInstances}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors disabled:opacity-50"
                  >
                    {loadingInstances ? 'Atualizando...' : '🔄 Atualizar'}
                  </button>
                </div>
                
                {instances.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {instances.map((instance, index) => {
                      const typeInfo = getInstanceTypeInfo(instance.type)
                      const regionFlag = getRegionFlag(instance.region)
                      
                      return (
                        <div key={instance.id || index} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="text-white font-medium text-sm">
                                  {instance.name || instance.shortName || `Instância ${index + 1}`}
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs ${typeInfo.color}`}>
                                  {typeInfo.icon} {typeInfo.label}
                                </span>
                              </div>
                              <p className="text-gray-400 text-xs">
                                {regionFlag} {instance.region?.toUpperCase() || 'Região desconhecida'} • 
                                ID: {instance.id?.split('~')[0] || 'N/A'}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-1 text-sm">
                                <UserGroupIcon className="w-4 h-4 text-blue-400" />
                                <span className="text-white font-bold">{instance.userCount || 0}</span>
                                <span className="text-gray-400">/{instance.capacity || 16}</span>
                              </div>
                              {instance.full && (
                                <span className="text-xs text-red-400">Lotado</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Informações detalhadas da instância */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {/* Plataformas */}
                            {instance.platforms && (
                              <div>
                                <p className="text-gray-400 mb-1">Plataformas:</p>
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(instance.platforms).map(([platform, count]) => (
                                    <span key={platform} className="px-2 py-1 bg-gray-600 text-gray-300 rounded">
                                      {platform === 'standalonewindows' ? '🖥️ PC' :
                                       platform === 'android' ? '📱 Quest' :
                                       platform === 'queststandalone' ? '🥽 Quest' : platform}: {count}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Status adicional */}
                            <div>
                              <p className="text-gray-400 mb-1">Status:</p>
                              <div className="flex flex-wrap gap-1">
                                {instance.canRequestInvite && (
                                  <span className="px-2 py-1 bg-blue-600 text-blue-100 rounded">
                                    📨 Aceita convites
                                  </span>
                                )}
                                {instance.queueEnabled && (
                                  <span className="px-2 py-1 bg-yellow-600 text-yellow-100 rounded">
                                    ⏳ Fila: {instance.queueSize || 0}
                                  </span>
                                )}
                                {instance.createdAt && (
                                  <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded">
                                    🕐 {new Date(instance.createdAt).toLocaleTimeString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Amigos na instância */}
                          {instance.friends && instance.friends.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-600">
                              <p className="text-gray-400 text-xs mb-2">👥 Amigos nesta instância:</p>
                              <div className="flex flex-wrap gap-1">
                                {instance.friends.map((friend, friendIndex) => (
                                  <span 
                                    key={friendIndex} 
                                    className="px-2 py-1 bg-green-600/20 text-green-300 rounded text-xs"
                                  >
                                    {friend.displayName || friend.username}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-700/30 rounded-lg">
                    <GlobeAltIcon className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">Nenhuma instância ativa encontrada</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Este mundo pode não ter instâncias públicas no momento
                    </p>
                  </div>
                )}
                
                {/* Indicador de atualização automática */}
                <div className="mt-3 text-center">
                  <p className="text-gray-500 text-xs">
                    🔄 Atualização automática a cada 30 segundos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default WorldDetailsModal
