import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  KeyIcon,
  UserIcon,
  ShieldCheckIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowLeftIcon
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

const ROLES = [
  { value: 'USER', label: 'Usuário', level: 10, description: 'Acesso básico à plataforma' },
  { value: 'CREATOR', label: 'Creator', level: 70, description: 'Upload e gestão de assets' },
  { value: 'MODERATOR', label: 'Moderador', level: 80, description: 'Moderação de conteúdo' },
  { value: 'ADMIN', label: 'Administrador', level: 90, description: 'Gestão avançada' },
  { value: 'SISTEMA', label: 'Sistema', level: 100, description: 'Acesso total ao sistema' }
]

const ROLE_LEVELS = {
  'USER': 10,
  'CREATOR': 70,
  'MODERATOR': 80,
  'ADMIN': 90,
  'SISTEMA': 100
}

const FILTER_OPTIONS = [
  { id: 'all', label: 'Todos' },
  { id: 'active', label: 'Ativos' },
  { id: 'inactive', label: 'Inativos' },
  { id: 'admin', label: 'Admins' },
  { id: 'moderator', label: 'Moderadores' },
  { id: 'creator', label: 'Creators' },
  { id: 'user', label: 'Usuários' }
]

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

const PermissionCard = React.memo(({ user, onUpdateRole, onToggleStatus }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedRole, setSelectedRole] = useState(user.role)

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  const handleRoleChange = useCallback((e) => {
    setSelectedRole(e.target.value)
  }, [])

  const handleRoleUpdate = useCallback(async () => {
    if (selectedRole === user.role) {
      toast.error('Selecione uma role diferente da atual')
      return
    }

    try {
      await onUpdateRole(user.id, selectedRole)
      toast.success('Role atualizada com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar role:', error)
      toast.error('Erro ao atualizar role')
      setSelectedRole(user.role)
    }
  }, [selectedRole, user.role, user.id, onUpdateRole])

  const handleToggleStatus = useCallback(() => {
    onToggleStatus(user.id, !user.isActive)
  }, [user.id, user.isActive, onToggleStatus])

  const statusConfig = useMemo(() => ({
    isActive: user.isActive,
    bgClass: user.isActive ? 'bg-green-500/20' : 'bg-red-500/20',
    textClass: user.isActive ? 'text-green-400' : 'text-red-400',
    borderClass: user.isActive ? 'border-green-500/30' : 'border-red-500/30',
    label: user.isActive ? 'ATIVO' : 'INATIVO'
  }), [user.isActive])

  const actionButtonConfig = useMemo(() => ({
    bgClass: user.isActive ? 'bg-red-600/20 hover:bg-red-600/30' : 'bg-green-600/20 hover:bg-green-600/30',
    textClass: user.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300',
    borderClass: user.isActive ? 'border-red-500/30' : 'border-green-500/30',
    label: user.isActive ? 'DESATIVAR' : 'ATIVAR',
    icon: user.isActive ? XCircleIcon : CheckCircleIcon
  }), [user.isActive])

  const hasRoleChanged = selectedRole !== user.role

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-5 hover:border-slate-600/50 transition-colors h-fit">
      {/* Main User Info */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <UserIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-lg truncate">{user.name}</h3>
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
          </div>
        </div>
      </div>

      {/* Expanded Role Management - Collapsible */}
      {isExpanded && (
        <div className="border-t border-slate-700/50 pt-4 mb-4 overflow-hidden">
          <div className="bg-slate-800/30 p-4 rounded border border-slate-700/30">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <CogIcon className="w-4 h-4" />
              Gerenciamento de Permissões
            </h4>
            
            <div className="space-y-3">
              {/* Current Role Info */}
              <div className="bg-slate-700/30 p-3 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-slate-400">ROLE ATUAL</span>
                  <RoleBadge role={user.role} level={user.permissionLevel} />
                </div>
                <p className="text-xs text-slate-300">
                  {ROLES.find(r => r.value === user.role)?.description || 'Descrição não disponível'}
                </p>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Alterar para:
                </label>
                <select
                  value={selectedRole}
                  onChange={handleRoleChange}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label} (Nível {role.level}) - {role.description}
                    </option>
                  ))}
                </select>
                
                {hasRoleChanged && (
                  <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                    <p className="text-yellow-400 text-xs mb-2">
                      ⚠️ Alterando de <strong>{user.role}</strong> para <strong>{selectedRole}</strong>
                    </p>
                    <button
                      onClick={handleRoleUpdate}
                      className="w-full px-3 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-400 hover:text-purple-300 hover:bg-purple-600/30 rounded transition-colors font-mono text-sm font-semibold"
                    >
                      Confirmar Alteração
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons - Fixed at bottom */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleToggleExpand}
          className="flex items-center gap-2 px-3 py-2 text-purple-400 hover:text-purple-300 transition-colors rounded hover:bg-purple-500/10"
        >
          <CogIcon className="w-4 h-4" />
          <span className="text-sm font-mono">
            {isExpanded ? 'Ocultar' : 'Gerenciar'}
          </span>
        </button>

        <button
          onClick={handleToggleStatus}
          className={`flex items-center gap-2 px-4 py-2 rounded border transition-colors font-mono text-sm font-semibold ${actionButtonConfig.bgClass} ${actionButtonConfig.textClass} ${actionButtonConfig.borderClass}`}
        >
          <actionButtonConfig.icon className="w-4 h-4" />
          <span>{user.isActive ? 'DESATIVAR' : 'ATIVAR'}</span>
        </button>
      </div>
    </div>
  )
})

const PermissionsSection = ({ onBack }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

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
      admins: (byRole.ADMIN || 0) + (byRole.SISTEMA || 0)
    }
  }, [users])

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      switch (filter) {
        case 'active': return user.isActive
        case 'inactive': return !user.isActive
        case 'admin': return ['ADMIN', 'SISTEMA'].includes(user.role)
        case 'moderator': return user.role === 'MODERATOR'
        case 'creator': return user.role === 'CREATOR'
        case 'user': return user.role === 'USER'
        default: return true
      }
    })
  }, [users, filter])

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando usuários...')
      
      const response = await api.get('/admin/users')
      console.log('✅ Usuários recebidos:', response.data)
      
      const usersList = response.data.data || []
      setUsers(usersList)
      
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error)
      toast.error('Erro ao carregar usuários')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleUpdateRole = useCallback(async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole })
      
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, role: newRole, permissionLevel: ROLE_LEVELS[newRole] || 10 }
            : user
        )
      )
      
    } catch (error) {
      console.error('Erro ao atualizar role:', error)
      throw error
    }
  }, [])

  const handleToggleStatus = useCallback(async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive })
      
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, isActive }
            : user
        )
      )
      
      toast.success(`Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso!`)
      
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status do usuário')
    }
  }, [])

  const handleFilterChange = useCallback((filterId) => {
    setFilter(filterId)
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
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <KeyIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide font-mono">
              Gerenciamento de Permissões
            </h2>
            <p className="text-slate-400 text-sm">
              Controle roles e status dos usuários
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
              <UserIcon className="w-6 h-6 text-indigo-400" />
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
                  {stats.admins}
                </div>
                <div className="text-slate-400 text-sm font-mono uppercase">
                  Admins
                </div>
              </div>
              <ShieldCheckIcon className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
          {FILTER_OPTIONS.map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => handleFilterChange(filterOption.id)}
              className={`px-4 py-2 rounded-lg font-mono text-sm transition-colors ${
                filter === filterOption.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {/* Users List */}
        <div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 font-mono text-sm">
                Nenhum usuário encontrado para o filtro selecionado
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {filteredUsers.map((user) => (
                <PermissionCard
                  key={user.id}
                  user={user}
                  onUpdateRole={handleUpdateRole}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          )}
        </div>
    </div>
  )
}

export default React.memo(PermissionsSection)
