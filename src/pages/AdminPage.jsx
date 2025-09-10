import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckIcon, 
  XMarkIcon, 
  EyeIcon,
  UserIcon,
  ClockIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  UsersIcon,
  UserPlusIcon,
  CogIcon,
  TrashIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import api from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import LoadingSpinner from '../components/ui/LoadingSpinner'

// Sub-componentes para cada seção
import AccessRequestsSection from '../components/admin/AccessRequestsSection'
import PermissionsSection from '../components/admin/PermissionsSection'
import UsersSection from '../components/admin/UsersSection'
import AccountManagementSection from '../components/admin/AccountManagementSection'
import AssetsSection from '../components/admin/AssetsSection'
import AdminBreadcrumb from '../components/admin/AdminBreadcrumb'

// Configuração de cores e estilos dos cards
const CARD_THEMES = {
  yellow: {
    icon: 'text-yellow-400',
    iconBg: 'bg-yellow-500/10 border-yellow-500/30',
    count: 'text-yellow-400',
    border: 'border-yellow-500/30 hover:border-yellow-400/60',
    gradient: 'from-yellow-500/5 to-yellow-500/10',
    action: 'text-yellow-400 group-hover:text-yellow-300',
    glow: 'shadow-yellow-500/10 hover:shadow-yellow-500/20'
  },
  orange: {
    icon: 'text-orange-400',
    iconBg: 'bg-orange-500/10 border-orange-500/30',
    count: 'text-orange-400',
    border: 'border-orange-500/30 hover:border-orange-400/60',
    gradient: 'from-orange-500/5 to-orange-500/10',
    action: 'text-orange-400 group-hover:text-orange-300',
    glow: 'shadow-orange-500/10 hover:shadow-orange-500/20'
  },
  purple: {
    icon: 'text-purple-400',
    iconBg: 'bg-purple-500/10 border-purple-500/30',
    count: 'text-purple-400',
    border: 'border-purple-500/30 hover:border-purple-400/60',
    gradient: 'from-purple-500/5 to-purple-500/10',
    action: 'text-purple-400 group-hover:text-purple-300',
    glow: 'shadow-purple-500/10 hover:shadow-purple-500/20'
  },
  blue: {
    icon: 'text-blue-400',
    iconBg: 'bg-blue-500/10 border-blue-500/30',
    count: 'text-blue-400',
    border: 'border-blue-500/30 hover:border-blue-400/60',
    gradient: 'from-blue-500/5 to-blue-500/10',
    action: 'text-blue-400 group-hover:text-blue-300',
    glow: 'shadow-blue-500/10 hover:shadow-blue-500/20'
  },
  red: {
    icon: 'text-red-400',
    iconBg: 'bg-red-500/10 border-red-500/30',
    count: 'text-red-400',
    border: 'border-red-500/30 hover:border-red-400/60',
    gradient: 'from-red-500/5 to-red-500/10',
    action: 'text-red-400 group-hover:text-red-300',
    glow: 'shadow-red-500/10 hover:shadow-red-500/20'
  }
}

const AdminDashboardCard = React.memo(({ 
  icon: Icon, 
  title, 
  description, 
  count, 
  color, 
  onClick, 
  permission,
  isLoading = false,
  index = 0
}) => {
  const { hasPermission } = usePermissions()
  
  // Memoizar verificação de permissão para evitar re-renders
  const hasRequiredPermission = useMemo(() => 
    !permission || hasPermission(permission), 
    [permission, hasPermission]
  )
  
  // Memoizar tema do card
  const theme = useMemo(() => CARD_THEMES[color] || CARD_THEMES.blue, [color])
  
  if (!hasRequiredPermission) {
    return null
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer h-full min-h-[200px]"
      role="button"
      tabIndex={0}
      aria-label={`Acessar ${title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div className="p-6 h-full flex flex-col">
        {/* Shimmer effect para loading */}
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
        )}
        
        {/* Header com altura fixa */}
        <div className="flex items-center justify-between mb-4 min-h-[4rem]">
          <div className={`
            p-3 rounded-lg bg-gradient-to-br ${theme.iconBg}
            shadow-lg transition-all duration-300
            group-hover:scale-110 group-hover:shadow-xl
          `}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          {/* Container do count com tamanho fixo */}
          <div className="min-w-[3rem] text-right">
            {count !== undefined && (
              <span className={`
                text-2xl font-bold font-mono
                ${theme.count}
                transition-all duration-300
              `}>
                {isLoading ? '...' : count}
              </span>
            )}
          </div>
        </div>
        
        {/* Conteúdo principal - flex grow para ocupar espaço disponível */}
        <div className="flex-grow flex flex-col justify-between">
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors leading-tight">
              {title}
            </h3>
            
            <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors leading-relaxed">
              {description}
            </p>
          </div>
          
          {/* Footer com altura fixa */}
          <div className="mt-4 flex items-center justify-between text-sm pt-4 border-t border-slate-700/30 group-hover:border-slate-600/30 transition-colors">
            <span className={`${theme.action} font-medium transition-colors duration-300`}>
              Clique para acessar
            </span>
            <ArrowRightIcon className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>
      </div>
      
      {/* Gradient overlay igual ao CategoryCard */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  )
})

const AdminPage = () => {
  const [currentSection, setCurrentSection] = useState('dashboard')
  const [stats, setStats] = useState({
    pendingRequests: 0,
    totalUsers: 0,
    totalPermissions: 0,
    activeUsers: 0,
    pendingAssets: 0,
    totalAssets: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { userLevel, canAccessAdminPanel, canManageUsers, canApproveUsers } = usePermissions()

  // Memoizar função de carregamento para evitar re-renders
  const loadDashboardStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Carregar estatísticas do dashboard com timeout
      const [requestsStats, usersStats, assetsStats] = await Promise.all([
        Promise.race([
          api.get('/admin/access-requests/stats'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 10000)
          )
        ]).catch(() => ({ data: { data: {} } })),
        
        Promise.race([
          api.get('/admin/users'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 10000)
          )
        ]).catch(() => ({ data: { data: [], pagination: { total: 0 } } })),

        Promise.race([
          api.get('/admin/assets/stats'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 10000)
          )
        ]).catch(() => ({ data: { data: {} } }))
      ])

      setStats({
        pendingRequests: requestsStats.data.data?.pending || 0,
        totalUsers: usersStats.data.pagination?.total || 0,
        totalPermissions: Object.keys(requestsStats.data.data || {}).length,
        activeUsers: usersStats.data.data?.filter(u => u.isActive)?.length || 0,
        pendingAssets: assetsStats.data.data?.pending || 0,
        totalAssets: assetsStats.data.data?.total || 0
      })
      
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error)
      setError('Erro ao carregar estatísticas do dashboard')
      toast.error('Erro ao carregar estatísticas do dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardStats()
  }, [loadDashboardStats])

  // Verificar se tem acesso - DEPOIS de todos os hooks
  if (!canAccessAdminPanel()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="text-center text-white"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="relative mb-6"
          >
            <ShieldCheckIcon className="w-16 h-16 mx-auto text-red-400" />
            <div className="absolute inset-0 rounded-full border-2 border-red-500/20 animate-pulse" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-bold mb-2"
          >
            Acesso Negado
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400"
          >
            Você não tem permissão para acessar esta área
          </motion.p>
        </motion.div>
      </div>
    )
  }

  // Loading state mais elegante
  if (loading && !stats.totalUsers && !stats.pendingRequests) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-8 max-w-md w-full"
        >
          {/* Spinner Container - Perfeitamente Centralizado */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-slate-600 border-t-red-500 rounded-full animate-spin" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="absolute inset-0 rounded-full border-2 border-red-500/20"
              />
            </div>
          </div>
          
          {/* Text Container - Alinhado com o Spinner */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-white">
              Carregando Painel Administrativo
            </h2>
            <p className="text-slate-400 text-sm">
              Preparando as informações do sistema...
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  const renderCurrentSection = () => {
    const sectionProps = {
      onBack: () => setCurrentSection('dashboard')
    }

    switch (currentSection) {
      case 'access-requests':
        return (
          <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <AdminBreadcrumb 
                currentSection={currentSection} 
                onNavigate={setCurrentSection} 
              />
              <AccessRequestsSection {...sectionProps} />
            </div>
          </div>
        )
      case 'permissions':
        return (
          <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <AdminBreadcrumb 
                currentSection={currentSection} 
                onNavigate={setCurrentSection} 
              />
              <PermissionsSection {...sectionProps} />
            </div>
          </div>
        )
      case 'users':
        return (
          <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <AdminBreadcrumb 
                currentSection={currentSection} 
                onNavigate={setCurrentSection} 
              />
              <UsersSection {...sectionProps} />
            </div>
          </div>
        )
      case 'account-management':
        return (
          <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <AdminBreadcrumb 
                currentSection={currentSection} 
                onNavigate={setCurrentSection} 
              />
              <AccountManagementSection {...sectionProps} />
            </div>
          </div>
        )
      case 'assets':
        return (
          <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <AdminBreadcrumb 
                currentSection={currentSection} 
                onNavigate={setCurrentSection} 
              />
              <AssetsSection {...sectionProps} />
            </div>
          </div>
        )
      default:
        return renderDashboard()
    }
  }

  const renderDashboard = () => (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb - oculto no dashboard */}
        <AdminBreadcrumb 
          currentSection={currentSection} 
          onNavigate={setCurrentSection} 
        />
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-xl bg-gradient-to-br from-red-500 via-orange-500 to-red-600 shadow-xl shadow-red-500/30">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wider font-mono">
            Painel Administrativo
          </h1>
          <p className="text-red-300/80 text-lg font-mono">
            {userLevel?.name || 'Admin'} • Sistema de Gerenciamento
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-5 gap-6">
          {/* Aprovações de Cadastro */}
          <AdminDashboardCard
            icon={UserPlusIcon}
            title="Aprovações de Cadastro"
            description="Gerenciar solicitações de acesso pendentes ao sistema"
            count={stats.pendingRequests}
            color="yellow"
            onClick={() => setCurrentSection('access-requests')}
            permission="approve_users"
            isLoading={loading}
            index={0}
          />

          {/* Aprovação de Assets */}
          <AdminDashboardCard
            icon={ClipboardDocumentCheckIcon}
            title="Aprovação de Assets"
            description="Aprovar ou rejeitar assets enviados pelos usuários"
            count={stats.pendingAssets}
            color="orange"
            onClick={() => setCurrentSection('assets')}
            permission="approve_assets"
            isLoading={loading}
            index={1}
          />

          {/* Gerenciamento de Permissões */}
          <AdminDashboardCard
            icon={CogIcon}
            title="Gerenciamento de Permissões"
            description="Alterar e renomear permissões do sistema de usuários"
            color="purple"
            onClick={() => setCurrentSection('permissions')}
            permission="manage_permissions"
            isLoading={loading}
            index={2}
          />

          {/* Listagem de Usuários */}
          <AdminDashboardCard
            icon={UsersIcon}
            title="Listagem de Usuários"
            description="Visualizar todos os usuários registrados no sistema"
            count={stats.totalUsers}
            color="blue"
            onClick={() => setCurrentSection('users')}
            permission="view_user_details"
            isLoading={loading}
            index={3}
          />

          {/* Gerenciamento de Contas */}
          <AdminDashboardCard
            icon={Cog6ToothIcon}
            title="Gerenciamento de Contas"
            description="Deletar e gerenciar contas de usuários da plataforma"
            count={stats.activeUsers}
            color="red"
            onClick={() => setCurrentSection('account-management')}
            permission="manage_users"
            isLoading={loading}
            index={4}
          />
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { value: stats.pendingRequests, label: 'Solicitações Pendentes', color: 'text-yellow-400', bgColor: 'bg-yellow-400/20' },
            { value: stats.pendingAssets, label: 'Assets Pendentes', color: 'text-orange-400', bgColor: 'bg-orange-400/20' },
            { value: stats.totalUsers, label: 'Total de Usuários', color: 'text-blue-400', bgColor: 'bg-blue-400/20' },
            { value: stats.activeUsers, label: 'Usuários Ativos', color: 'text-green-400', bgColor: 'bg-green-400/20' },
            { value: userLevel?.level || '?', label: 'Seu Nível de Acesso', color: 'text-purple-400', bgColor: 'bg-purple-400/20' }
          ].map((stat, index) => (
            <div 
              key={stat.label}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 text-center transition-all duration-300 hover:bg-slate-800/50 hover:border-slate-600/50 hover:scale-105 group"
            >
              <div className={`text-2xl font-bold font-mono mb-1 ${stat.color} transition-all duration-300 group-hover:scale-110`}>
                {loading && stat.value !== userLevel?.level ? (
                  <div className={`animate-pulse ${stat.bgColor} h-8 w-12 mx-auto rounded`} />
                ) : (
                  stat.value
                )}
              </div>
              <div className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-6 p-4 bg-red-900/50 border border-red-500/30 rounded-lg text-center">
            <p className="text-red-400 text-sm mb-3">
              {error}
            </p>
            <button 
              onClick={loadDashboardStats}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 text-sm font-medium transition-all duration-200 hover:scale-105"
            >
              Tentar Novamente
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen w-full relative bg-gray-900 overflow-hidden">
      {/* Main Content */}
      <div className="relative z-20">
        {renderCurrentSection()}
      </div>
    </div>
  )
}

export default AdminPage
