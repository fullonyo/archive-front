import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  UsersIcon,
  UserIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  EnvelopeIcon,
  IdentificationIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  HeartIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'
import React from 'react'

const ROLE_CONFIG = {
  SISTEMA: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  ADMIN: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  MODERATOR: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  CREATOR: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  USER: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' }
}

const RoleBadge = React.memo(({ role, level }) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.USER
  
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono font-semibold border ${config.bg} ${config.text} ${config.border}`}>
        {role}
      </span>
      <span className="text-xs text-slate-500 font-mono">
        Nv.{level}
      </span>
    </div>
  )
})

const UserCard = React.memo(({ user, onViewDetails }) => {
  const handleViewDetails = useCallback(() => {
    onViewDetails(user)
  }, [user, onViewDetails])

  const statusConfig = useMemo(() => ({
    isActive: user.isActive,
    bgClass: user.isActive ? 'bg-green-500/20' : 'bg-red-500/20',
    textClass: user.isActive ? 'text-green-400' : 'text-red-400',
    borderClass: user.isActive ? 'border-green-500/30' : 'border-red-500/30',
    label: user.isActive ? 'ATIVO' : 'INATIVO'
  }), [user.isActive])

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-5 hover:border-slate-600/50 transition-colors h-fit">
      {/* Main User Info */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
          <UserIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-lg truncate">{user.username || user.name || 'Usuário'}</h3>
              <p className="text-slate-400 text-sm font-mono truncate">{user.email}</p>
              <p className="text-slate-500 text-xs font-mono">ID: {user.id}</p>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-4">
              <RoleBadge role={user.role} level={user.permissionLevel} />
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono font-semibold border ${statusConfig.bgClass} ${statusConfig.textClass} ${statusConfig.borderClass}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>
          
          {/* User Details Grid - Always visible but compact */}
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div className="bg-slate-800/30 p-2.5 rounded border border-slate-700/30">
              <div className="flex items-center gap-2 mb-1">
                <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 font-medium text-xs">Cadastro</span>
              </div>
              <p className="text-slate-300 font-mono text-xs">
                {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit', 
                  year: '2-digit'
                })}
              </p>
            </div>
            <div className="bg-slate-800/30 p-2.5 rounded border border-slate-700/30">
              <div className="flex items-center gap-2 mb-1">
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 font-medium text-xs">Último Login</span>
              </div>
              <p className="text-slate-300 font-mono text-xs">
                {user.lastLogin 
                  ? new Date(user.lastLogin).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit'
                    })
                  : 'Nunca'
                }
              </p>
            </div>
          </div>

          {/* Quick Info - Always visible */}
          <div className="flex items-center justify-between text-xs mb-4 p-2 bg-slate-800/20 rounded">
            <span className="text-slate-400">
              <span className="font-medium">Nível:</span>{' '}
              <span className="text-slate-300 font-mono">{user.permissionLevel}</span>
            </span>
            <span className="text-slate-400">
              <span className="font-medium">Conta:</span>{' '}
              <span className="text-slate-300 font-mono">
                {Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))}d
              </span>
            </span>
            {user.assetsCount !== undefined && (
              <span className="text-slate-400">
                <span className="font-medium">Assets:</span>{' '}
                <span className="text-slate-300 font-mono">{user.assetsCount}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Button - Fixed at bottom */}
      <div className="flex items-center justify-end">
        <button
          onClick={handleViewDetails}
          className="flex items-center gap-2 px-4 py-2 bg-slate-600/20 border border-slate-500/30 text-slate-400 hover:text-slate-300 hover:bg-slate-600/30 rounded transition-colors font-mono text-sm"
        >
          <EyeIcon className="w-4 h-4" />
          <span>Ver Detalhes</span>
        </button>
      </div>
    </div>
  )
})

const UserDetailsModal = ({ user, isOpen, onClose }) => {
  const [userDetails, setUserDetails] = useState(null)
  const [userAssets, setUserAssets] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && user) {
      fetchUserDetails()
    }
  }, [isOpen, user])

  const fetchUserDetails = async () => {
    try {
      setLoading(true)
      
      const [profileResponse, assetsResponse] = await Promise.all([
        api.get(`/admin/users/${user.id}/profile`).catch(() => ({ data: { data: user } })),
        api.get(`/admin/users/${user.id}/assets`).catch(() => ({ data: { data: [], pagination: { total: 0 } } }))
      ])

      setUserDetails(profileResponse.data.data)
      setUserAssets(assetsResponse.data.data || [])
    } catch (error) {
      console.error('Erro ao buscar detalhes do usuário:', error)
      setUserDetails(user)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !user) return null

  const displayUser = userDetails || user
  const stats = displayUser.stats || {
    totalUploads: 0,
    totalDownloads: 0,
    totalFavorites: 0,
    totalReviews: 0,
    averageRating: 0
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Fixo */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center">
                {displayUser.avatarUrl ? (
                  <img 
                    src={displayUser.avatarUrl} 
                    alt={displayUser.username}
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <UserIcon className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{displayUser.username}</h2>
                <p className="text-slate-400 font-mono">{displayUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <RoleBadge role={displayUser.role} level={displayUser.permissionLevel} />
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    displayUser.isActive 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {displayUser.isActive ? 'ATIVO' : 'INATIVO'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Conteúdo Scrollável */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
                <span className="ml-3 text-slate-400">Carregando detalhes...</span>
              </div>
            )}

            {/* Estatísticas Principais */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg p-4 text-center">
                <CloudArrowUpIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-400">{stats.totalUploads}</div>
                <div className="text-xs text-slate-400">Uploads</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-lg p-4 text-center">
                <CloudArrowDownIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-400">{stats.totalDownloads}</div>
                <div className="text-xs text-slate-400">Downloads</div>
              </div>
              <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/30 rounded-lg p-4 text-center">
                <HeartIcon className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-400">{stats.totalFavorites}</div>
                <div className="text-xs text-slate-400">Favoritos</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-lg p-4 text-center">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-400">{stats.totalReviews}</div>
                <div className="text-xs text-slate-400">Reviews</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                <StarIcon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-400">{stats.averageRating.toFixed(1)}</div>
                <div className="text-xs text-slate-400">Rating Médio</div>
              </div>
            </div>

            {/* Bio do Usuário */}
            {displayUser.bio && (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
                  <DocumentTextIcon className="w-5 h-5 text-blue-400" />
                  <span>Biografia</span>
                </h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{displayUser.bio}</p>
              </div>
            )}

            {/* Redes Sociais */}
            {displayUser.socialLinks && Object.keys(displayUser.socialLinks).length > 0 && (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <GlobeAltIcon className="w-5 h-5 text-green-400" />
                  <span>Redes Sociais</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(displayUser.socialLinks).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-600/60 rounded-lg transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg flex items-center justify-center">
                        <GlobeAltIcon className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white group-hover:text-green-400 transition-colors capitalize">
                          {platform}
                        </div>
                        <div className="text-xs text-slate-400 font-mono truncate">{url}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Informações da Conta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações Básicas */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <IdentificationIcon className="w-5 h-5 text-indigo-400" />
                  <span>Informações da Conta</span>
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">ID:</span>
                    <span className="text-white font-mono">{displayUser.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tipo de Conta:</span>
                    <span className="text-white font-mono">{displayUser.accountType || 'FREE'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Verificado:</span>
                    <span className={`font-medium ${displayUser.isVerified ? 'text-green-400' : 'text-red-400'}`}>
                      {displayUser.isVerified ? 'SIM' : 'NÃO'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Google ID:</span>
                    <span className="text-white font-mono text-xs">
                      {displayUser.googleId ? `${displayUser.googleId.substring(0, 8)}...` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Datas Importantes */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <CalendarIcon className="w-5 h-5 text-purple-400" />
                  <span>Histórico</span>
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-slate-400 block">Conta criada:</span>
                    <span className="text-white font-mono">
                      {new Date(displayUser.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Última atualização:</span>
                    <span className="text-white font-mono">
                      {new Date(displayUser.updatedAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Último login:</span>
                    <span className="text-white font-mono">
                      {displayUser.lastLogin 
                        ? new Date(displayUser.lastLogin).toLocaleString('pt-BR')
                        : 'Nunca logou'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assets do Usuário */}
            {userAssets.length > 0 && (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <PhotoIcon className="w-5 h-5 text-cyan-400" />
                  <span>Assets Recentes ({userAssets.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                  {userAssets.slice(0, 6).map((asset) => (
                    <div 
                      key={asset.id}
                      className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3 hover:bg-slate-700/50 transition-colors"
                    >
                      <h4 className="text-sm font-medium text-white truncate mb-1">{asset.title}</h4>
                      <p className="text-xs text-slate-400 mb-2 truncate">{asset.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          {new Date(asset.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-400">{asset.downloadCount || 0} downloads</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            asset.isActive 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {asset.isActive ? 'ATIVO' : 'INATIVO'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {userAssets.length > 6 && (
                  <div className="mt-3 text-center">
                    <span className="text-slate-400 text-sm">
                      + {userAssets.length - 6} assets adicionais
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Informações Adicionais */}
            {displayUser.discord && (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-3">Informações Adicionais</h3>
                <div className="flex items-center space-x-3 p-3 bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-lg">
                  <svg className="w-6 h-6 text-[#5865F2]" viewBox="0 0 71 55" fill="currentColor">
                    <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-white">Discord</div>
                    <div className="text-sm text-slate-300 font-mono">{displayUser.discord}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

const UsersSection = ({ onBack }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const stats = useMemo(() => {
    const total = users.length
    const active = users.filter(u => u.isActive).length
    const inactive = total - active
    const byRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {})
    
    return {
      total,
      active,
      inactive,
      byRole,
      rolesCount: Object.keys(byRole).length
    }
  }, [users])

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.username?.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      user.name?.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      user.email?.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      user.role?.toLowerCase().includes((searchTerm || '').toLowerCase())
    )
  }, [users, searchTerm])

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando lista de usuários...')
      
      const response = await api.get('/admin/users')
      console.log('✅ Usuários recebidos:', response.data)
      
      const usersList = response.data.data || []
      setUsers(usersList)
      
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error)
      toast.error('Erro ao carregar lista de usuários')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleViewDetails = useCallback((user) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }, [])

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center">
            <UsersIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide font-mono">
              Listagem de Usuários
            </h2>
            <p className="text-slate-400 text-sm">
              Visualize e gerencie todos os usuários da plataforma ({stats.total} total)
            </p>
          </div>
        </div>
      </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-indigo-400">
                  {stats.total}
                </div>
                <div className="text-slate-400 text-sm font-mono uppercase">
                  Total
                </div>
              </div>
              <UsersIcon className="w-6 h-6 text-indigo-400" />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {stats.active}
                </div>
                <div className="text-slate-400 text-sm font-mono uppercase">
                  Ativos
                </div>
              </div>
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-400">
                  {stats.inactive}
                </div>
                <div className="text-slate-400 text-sm font-mono uppercase">
                  Inativos
                </div>
              </div>
              <XCircleIcon className="w-6 h-6 text-red-400" />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-400">
                  {stats.rolesCount}
                </div>
                <div className="text-slate-400 text-sm font-mono uppercase">
                  Roles
                </div>
              </div>
              <IdentificationIcon className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou role..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-slate-400/50"
          />
        </div>

        {/* Users List */}
        <div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 font-mono text-sm">
                {searchTerm ? 'Nenhum usuário encontrado para a busca' : 'Nenhum usuário cadastrado'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>

      {/* Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default React.memo(UsersSection)
