import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  UserIcon, 
  ClockIcon, 
  CheckIcon, 
  XMarkIcon, 
  EyeIcon, 
  UsersIcon,
  ShieldCheckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  PENDING: { 
    bg: 'bg-yellow-500/20', 
    text: 'text-yellow-400', 
    border: 'border-yellow-500/30', 
    label: 'PENDENTE',
    dot: 'bg-yellow-400'
  },
  APPROVED: { 
    bg: 'bg-green-500/20', 
    text: 'text-green-400', 
    border: 'border-green-500/30', 
    label: 'APROVADO',
    dot: 'bg-green-400'
  },
  REJECTED: { 
    bg: 'bg-red-500/20', 
    text: 'text-red-400', 
    border: 'border-red-500/30', 
    label: 'REJEITADO',
    dot: 'bg-red-400'
  }
}

const StatusBadge = React.memo(({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
      {config.label}
    </div>
  )
})

const UserCard = React.memo(({ user, onApprove, onReject }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleApprove = useCallback(async () => {
    if (isProcessing) return
    setIsProcessing(true)
    try {
      await onApprove(user.id)
    } finally {
      setIsProcessing(false)
    }
  }, [user.id, onApprove, isProcessing])

  const handleReject = useCallback(async () => {
    if (isProcessing) return
    setIsProcessing(true)
    try {
      await onReject(user.id)
    } finally {
      setIsProcessing(false)
    }
  }, [user.id, onReject, isProcessing])

  const isPending = useMemo(() => 
    user.status?.toLowerCase() === 'pending', 
    [user.status]
  )

  const formattedDate = useMemo(() => 
    new Date(user.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }), 
    [user.createdAt]
  )

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 hover:border-slate-600/50 transition-colors group">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white truncate">{user.name}</h3>
            <p className="text-slate-400 text-sm truncate">{user.email}</p>
          </div>
        </div>
        <StatusBadge status={user.status} />
      </div>

      {/* Compact Info Row */}
      <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
        <div className="flex items-center gap-1">
          <ClockIcon className="w-3 h-3" />
          <span>{formattedDate}</span>
        </div>
        {user.discord && (
          <div className="flex items-center gap-1 truncate">
            <svg className="w-3 h-3 text-[#5865F2] flex-shrink-0" viewBox="0 0 71 55" fill="currentColor">
              <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
            </svg>
            <span className="truncate">{user.discord}</span>
          </div>
        )}
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-3 p-3 bg-slate-800/50 rounded border border-slate-700/30"
        >
          <p className="text-slate-400 text-xs mb-1">Motivo do acesso:</p>
          <p className="text-slate-300 text-sm leading-relaxed">
            {user.reason || 'Nenhum motivo informado'}
          </p>
        </motion.div>
      )}

      {/* Actions - Simplified */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-indigo-400 transition-colors text-sm"
        >
          <EyeIcon className="w-4 h-4" />
          {isExpanded ? 'Ocultar' : 'Detalhes'}
        </button>

        {isPending && (
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XMarkIcon className="w-4 h-4" />
              Rejeitar
            </button>
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckIcon className="w-4 h-4" />
              Aprovar
            </button>
          </div>
        )}
      </div>
    </div>
  )
})

const AccessRequestsSection = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('pending')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Memoized stats calculation
  const stats = useMemo(() => {
    return {
      pending: users.filter(r => r.status === 'PENDING').length,
      approved: users.filter(r => r.status === 'APPROVED').length,
      rejected: users.filter(r => r.status === 'REJECTED').length,
      total: users.length
    }
  }, [users])

  // Memoized filtered users
  const filteredUsers = useMemo(() => {
    if (activeTab === 'all') return users
    return users.filter(user => user.status?.toLowerCase() === activeTab)
  }, [users, activeTab])

  // Optimized API call
  const loadAccessRequests = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/access-requests')
      const requests = response.data.data
      
      if (!Array.isArray(requests)) {
        throw new Error('Formato de dados inválido')
      }
      
      setUsers(requests)
    } catch (error) {
      console.error('❌ Erro ao carregar solicitações:', error)
      toast.error('Erro ao carregar solicitações')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAccessRequests()
  }, [loadAccessRequests])

  // Optimized handlers with optimistic updates
  const handleApprove = useCallback(async (userId) => {
    try {
      // Optimistic update
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, status: 'APPROVED' }
            : user
        )
      )

      await api.post(`/admin/access-requests/${userId}/approve`)
      toast.success('Usuário aprovado com sucesso!')
    } catch (error) {
      console.error('Error approving user:', error)
      toast.error('Erro ao aprovar usuário.')
      // Revert optimistic update
      loadAccessRequests()
    }
  }, [loadAccessRequests])

  const handleReject = useCallback(async (userId) => {
    try {
      // Optimistic update
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, status: 'REJECTED' }
            : user
        )
      )

      await api.post(`/admin/access-requests/${userId}/reject`)
      toast.success('Usuário rejeitado.')
    } catch (error) {
      console.error('Error rejecting user:', error)
      toast.error('Erro ao rejeitar usuário.')
      // Revert optimistic update
      loadAccessRequests()
    }
  }, [loadAccessRequests])

  const tabs = useMemo(() => [
    { id: 'pending', label: 'Pendentes', count: stats.pending, color: 'text-yellow-400', icon: ClockIcon },
    { id: 'approved', label: 'Aprovados', count: stats.approved, color: 'text-green-400', icon: CheckIcon },
    { id: 'rejected', label: 'Rejeitados', count: stats.rejected, color: 'text-red-400', icon: XMarkIcon },
    { id: 'all', label: 'Todos', count: stats.total, color: 'text-indigo-400', icon: UsersIcon }
  ], [stats])

  return (
    <div className="space-y-6">
      {/* Compact Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
            <ShieldCheckIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Aprovações de Cadastro</h1>
            <p className="text-slate-400 text-sm">
              Gerencie solicitações de acesso ({stats.total} total)
            </p>
            </div>
          </div>
        </div>

        {/* Compact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-3 rounded-lg border transition-all text-left hover:scale-105 ${
                  activeTab === tab.id 
                    ? 'bg-slate-800/80 border-slate-600/50 ring-1 ring-indigo-500/30' 
                    : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-600/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-lg font-bold ${tab.color}`}>
                    {tab.count}
                  </span>
                  <IconComponent className={`w-4 h-4 ${tab.color}`} />
                </div>
                <span className="text-slate-400 text-xs uppercase font-medium">
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-slate-600 border-t-indigo-400 rounded-full animate-spin" />
                <span className="text-slate-400 text-sm">Carregando solicitações...</span>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20">
              <UsersIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Nenhuma solicitação encontrada</h3>
              <p className="text-slate-400">
                Não há solicitações {activeTab === 'all' ? '' : `${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}`} no momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}
        </div>
    </div>
  )
}

export default AccessRequestsSection
