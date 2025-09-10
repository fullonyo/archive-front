import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { motion } from 'framer-motion'
import { 
  CogIcon,
  UserPlusIcon,
  TrashIcon,
  PencilIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'
import VRChatLoading from '../ui/VRChatLoading'
import VRChatButton from '../ui/VRChatButton'

const ACCOUNT_TYPES = {
  FREE: 'FREE',
  PREMIUM: 'PREMIUM',
  VIP: 'VIP'
}

const FILTER_OPTIONS = [
  { id: 'all', label: 'Todas' },
  { id: 'active', label: 'Ativas' },
  { id: 'inactive', label: 'Inativas' },
  { id: 'admin', label: 'Administradores' }
]

const AccountCard = memo(({ account, onEdit, onDelete, onToggleStatus }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleEdit = useCallback(() => {
    if (account) {
      onEdit(account)
    }
  }, [onEdit, account])

  const handleDelete = useCallback(() => {
    if (account?.id) {
      onDelete(account.id)
      setShowDeleteConfirm(false)
    }
  }, [onDelete, account?.id])

  const handleToggle = useCallback(() => {
    if (account?.id && account?.isActive !== undefined) {
      onToggleStatus(account.id, !account.isActive)
    }
  }, [onToggleStatus, account?.id, account?.isActive])

  const handleConfirmDelete = useCallback(() => {
    setShowDeleteConfirm(true)
  }, [])

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4 shadow-xl hover:border-slate-600/50 transition-all duration-300 h-full flex flex-col min-h-[320px]"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <CogIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{account.name}</h3>
            <p className="text-slate-400 text-xs font-mono">{account.email}</p>
            <p className="text-slate-500 text-xs font-mono">ID: {account.id}</p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold border ${
            account.role === 'SISTEMA' 
              ? 'bg-red-500/20 text-red-400 border-red-500/30'
              : account.role === 'ADMIN'
              ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
              : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
          }`}>
            {account.role}
          </span>
          <div>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-mono ${
              account.isActive 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {account.isActive ? 'ATIVO' : 'INATIVO'}
            </span>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="flex-grow space-y-2 mb-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-slate-400 text-xs">Tipo de conta:</span>
            <p className="text-slate-300 font-mono text-sm">{account.accountType || 'FREE'}</p>
          </div>
          <div>
            <span className="text-slate-400 text-xs">Criado em:</span>
            <p className="text-slate-300 font-mono text-sm">
              {new Date(account.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        
        <div className="min-h-[2rem] flex items-start">
          {account.lastLogin ? (
            <div className="text-sm">
              <span className="text-slate-400 text-xs">Último login:</span>
              <p className="text-slate-300 font-mono text-sm">
                {new Date(account.lastLogin).toLocaleString('pt-BR')}
              </p>
            </div>
          ) : (
            <div className="text-sm">
              <span className="text-slate-400 text-xs">Último login:</span>
              <p className="text-slate-500 font-mono italic text-sm">Nunca logou</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <div className="min-h-[80px] mb-3">
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <div className="flex items-center space-x-2 mb-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
              <span className="text-red-400 font-mono font-bold text-sm">CONFIRMAR EXCLUSÃO</span>
            </div>
            <p className="text-slate-300 text-xs mb-2">
              Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleDelete}
                className="flex-1 px-2 py-1 bg-red-600/20 border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-600/30 rounded-lg transition-all duration-200 font-mono text-xs"
              >
                CONFIRMAR
              </button>
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-2 py-1 bg-slate-600/20 border border-slate-500/30 text-slate-400 hover:text-slate-300 hover:bg-slate-600/30 rounded-lg transition-all duration-200 font-mono text-xs"
              >
                CANCELAR
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEdit}
            className="flex items-center space-x-1 px-2 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 hover:bg-blue-600/30 rounded-lg transition-all duration-200 font-mono text-xs"
          >
            <PencilIcon className="w-3 h-3" />
            <span>EDITAR</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggle}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-all duration-200 font-mono text-xs ${
              account.isActive
                ? 'bg-red-600/20 border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-600/30'
                : 'bg-green-600/20 border border-green-500/30 text-green-400 hover:text-green-300 hover:bg-green-600/30'
            }`}
          >
            {account.isActive ? (
              <>
                <XCircleIcon className="w-3 h-3" />
                <span>DESATIVAR</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-3 h-3" />
                <span>ATIVAR</span>
              </>
            )}
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleConfirmDelete}
          className="flex items-center space-x-1 px-2 py-1 bg-red-600/20 border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-600/30 rounded-lg transition-all duration-200 font-mono text-xs"
        >
          <TrashIcon className="w-3 h-3" />
          <span>EXCLUIR</span>
        </motion.button>
      </div>
    </motion.div>
  )
})

AccountCard.displayName = 'AccountCard'

const CreateAccountModal = memo(({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'USER',
    accountType: 'FREE',
    isActive: true
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await onSubmit(formData)
      setFormData({
        username: '',
        email: '',
        role: 'USER',
        accountType: 'FREE',
        isActive: true
      })
      onClose()
    } catch (error) {
      console.error('Erro ao criar conta:', error)
    } finally {
      setLoading(false)
    }
  }, [onSubmit, formData, onClose])

  if (!isOpen) return null

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
        className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Criar Nova Conta</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nome de Usuário
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              placeholder="Nome de usuário"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              placeholder="email@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            >
              <option value="USER">Usuário (Nível 10)</option>
              <option value="CREATOR">Creator (Nível 70)</option>
              <option value="MODERATOR">Moderador (Nível 80)</option>
              <option value="ADMIN">Administrador (Nível 90)</option>
              <option value="SISTEMA">Sistema (Nível 100)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tipo de Conta
            </label>
            <select
              value={formData.accountType}
              onChange={(e) => handleInputChange('accountType', e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            >
              <option value="FREE">Gratuita</option>
              <option value="PREMIUM">Premium</option>
              <option value="VIP">VIP</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="ml-2 text-sm font-medium text-slate-300">
              Conta ativa
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-600/20 border border-slate-500/30 text-slate-400 hover:text-slate-300 hover:bg-slate-600/30 rounded-lg transition-all duration-200 font-mono text-sm"
            >
              CANCELAR
            </button>
            <VRChatButton
              type="submit"
              loading={loading}
              loadingText="CRIANDO..."
              loadingType="processing"
              variant="primary"
              size="md"
              className="flex-1"
            >
              CRIAR CONTA
            </VRChatButton>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
})

CreateAccountModal.displayName = 'CreateAccountModal'

const EditAccountModal = memo(({ isOpen, onClose, onSubmit, account }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'USER',
    accountType: 'FREE',
    isActive: true
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  useEffect(() => {
    if (account) {
      setFormData({
        username: account.username || '',
        email: account.email || '',
        role: account.role || 'USER',
        accountType: account.accountType || 'FREE',
        isActive: account.isActive !== undefined ? account.isActive : true
      })
    }
  }, [account])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!account?.id) return
    
    setLoading(true)
    
    try {
      await onSubmit(account.id, formData)
      onClose()
    } catch (error) {
      console.error('Erro ao editar conta:', error)
    } finally {
      setLoading(false)
    }
  }, [account?.id, formData, onSubmit, onClose])

  if (!isOpen || !account) return null

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
        className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Editar Conta</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nome de Usuário
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              placeholder="Nome do usuário"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              placeholder="email@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            >
              <option value="USER">Usuário (Nível 10)</option>
              <option value="CREATOR">Creator (Nível 70)</option>
              <option value="MODERATOR">Moderador (Nível 80)</option>
              <option value="ADMIN">Administrador (Nível 90)</option>
              <option value="SISTEMA">Sistema (Nível 100)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tipo de Conta
            </label>
            <select
              value={formData.accountType}
              onChange={(e) => handleInputChange('accountType', e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            >
              <option value="FREE">Gratuita</option>
              <option value="PREMIUM">Premium</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="editIsActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="editIsActive" className="ml-2 text-sm font-medium text-slate-300">
              Conta ativa
            </label>
          </div>

          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 mt-4">
            <p className="text-xs text-slate-400 mb-1">Informações da conta:</p>
            <p className="text-xs text-slate-300">ID: {account.id}</p>
            <p className="text-xs text-slate-300">Criado em: {new Date(account.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-600/20 border border-slate-500/30 text-slate-400 hover:text-slate-300 hover:bg-slate-600/30 rounded-lg transition-all duration-200 font-mono text-sm"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 hover:bg-blue-600/30 rounded-lg transition-all duration-200 font-mono text-sm disabled:opacity-50"
            >
              {loading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
})

EditAccountModal.displayName = 'EditAccountModal'

const AccountManagementSection = ({ onBack }) => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [filter, setFilter] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0
  })

  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando contas administrativas...')
      
      const response = await api.get('/admin/accounts')
      console.log('✅ Contas recebidas:', response.data)
      
      const accountsList = response.data.data || []
      setAccounts(accountsList)
      
      const newStats = {
        total: accountsList.length,
        active: accountsList.filter(a => a.isActive).length,
        inactive: accountsList.filter(a => !a.isActive).length,
        admins: accountsList.filter(a => ['ADMIN', 'SISTEMA'].includes(a.role)).length
      }
      setStats(newStats)
      
    } catch (error) {
      console.error('❌ Erro ao carregar contas:', error)
      toast.error('Erro ao carregar contas administrativas')
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  const handleCreateAccount = useCallback(async (accountData) => {
    try {
      console.log('🆕 Criando nova conta:', accountData)
      
      const response = await api.post('/admin/accounts', accountData)
      console.log('✅ Conta criada:', response.data)
      
      toast.success('Conta criada com sucesso!')
      loadAccounts()
      
    } catch (error) {
      console.error('❌ Erro ao criar conta:', error)
      const errorMessage = error.response?.data?.message || 'Erro ao criar conta'
      toast.error(errorMessage)
      throw error
    }
  }, [loadAccounts])

  const handleEditAccount = useCallback((account) => {
    setEditingAccount(account)
    setShowEditModal(true)
  }, [])

  const handleEditSubmit = useCallback(async (accountId, formData) => {
    try {
      const response = await api.put(`/admin/accounts/${accountId}`, formData)
      
      setAccounts(prev => 
        prev.map(account => 
          account.id === accountId 
            ? { ...account, ...formData }
            : account
        )
      )
      
      toast.success('Conta editada com sucesso!')
      setShowEditModal(false)
      setEditingAccount(null)
      
    } catch (error) {
      console.error('Erro ao editar conta:', error)
      const errorMessage = error.response?.data?.message || 'Erro ao editar conta'
      toast.error(errorMessage)
      throw error
    }
  }, [])

  const handleDeleteAccount = useCallback(async (accountId) => {
    try {
      await api.delete(`/admin/accounts/${accountId}`)
      
      setAccounts(prev => prev.filter(account => account.id !== accountId))
      
      setStats(prev => ({
        ...prev,
        total: prev.total - 1
      }))
      
      toast.success('Conta excluída com sucesso!')
      
    } catch (error) {
      console.error('Erro ao excluir conta:', error)
      toast.error('Erro ao excluir conta')
    }
  }, [])

  const handleToggleStatus = useCallback(async (accountId, isActive) => {
    try {
      await api.put(`/admin/accounts/${accountId}/status`, { isActive })
      
      setAccounts(prev => 
        prev.map(account => 
          account.id === accountId 
            ? { ...account, isActive }
            : account
        )
      )
      
      setStats(prev => ({
        ...prev,
        active: prev.active + (isActive ? 1 : -1),
        inactive: prev.inactive + (isActive ? -1 : 1)
      }))
      
      toast.success(`Conta ${isActive ? 'ativada' : 'desativada'} com sucesso!`)
      
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status da conta')
    }
  }, [])

  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => {
      switch (filter) {
        case 'active': return account.isActive
        case 'inactive': return !account.isActive
        case 'admin': return ['ADMIN', 'SISTEMA'].includes(account.role)
        default: return true
      }
    })
  }, [accounts, filter])

  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter)
  }, [])

  const handleCreateModalToggle = useCallback(() => {
    setShowCreateModal(prev => !prev)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <ShieldCheckIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-wider font-mono">
              Gerenciamento de Contas
            </h2>
            <p className="text-slate-400 text-sm">
              Crie e gerencie contas administrativas
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateModalToggle}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 hover:bg-blue-600/30 rounded-lg transition-all duration-200 font-mono text-sm"
        >
          <UserPlusIcon className="w-4 h-4" />
          <span>CRIAR CONTA</span>
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-indigo-400 mb-1">
                {stats.total}
              </div>
              <div className="text-slate-400 text-sm font-mono uppercase">
                Total
              </div>
            </div>
            <CogIcon className="w-6 h-6 text-indigo-400" />
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-400 mb-1">
                {stats.active}
              </div>
              <div className="text-slate-400 text-sm font-mono uppercase">
                Ativas
              </div>
            </div>
            <CheckCircleIcon className="w-6 h-6 text-green-400" />
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-400 mb-1">
                {stats.inactive}
              </div>
              <div className="text-slate-400 text-sm font-mono uppercase">
                Inativas
              </div>
            </div>
            <XCircleIcon className="w-6 h-6 text-red-400" />
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-400 mb-1">
                {stats.admins}
              </div>
              <div className="text-slate-400 text-sm font-mono uppercase">
                Admins
              </div>
            </div>
            <ShieldCheckIcon className="w-6 h-6 text-orange-400" />
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex space-x-2 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
          {FILTER_OPTIONS.map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => handleFilterChange(filterOption.id)}
              className={`px-4 py-2 rounded-lg font-mono text-sm transition-all duration-200 ${
                filter === filterOption.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Accounts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {loading ? (
          <VRChatLoading 
            size="lg" 
            type="user" 
            text="Carregando contas..."
            className="rounded-lg min-h-[300px]"
          />
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center py-12">
            <CogIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 font-mono">
              Nenhuma conta encontrada para o filtro selecionado
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {filteredAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onEdit={handleEditAccount}
                onDelete={handleDeleteAccount}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Create Account Modal */}
      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={handleCreateModalToggle}
        onSubmit={handleCreateAccount}
      />

      {/* Edit Account Modal */}
      <EditAccountModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingAccount(null)
        }}
        onSubmit={handleEditSubmit}
        account={editingAccount}
      />
    </div>
  )
}

export default memo(AccountManagementSection)
