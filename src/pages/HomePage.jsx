import React, { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePermissions } from '../hooks/usePermissions'
import { motion } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
  CloudArrowUpIcon,
  UserGroupIcon,
  UserIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  LinkIcon
} from '@heroicons/react/24/outline'
import UserRankingCard from '../components/dashboard/UserRankingCard'
import RecentActivity from '../components/dashboard/RecentActivity'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import StableMatrixBackground from '../components/ui/StableMatrixBackground'
import { useHomePageData } from '../hooks/useHomePageData'
import { formatNumber } from '../utils/formatUtils'

const QuickAction = ({ to, icon: Icon, title, description, gradient }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="w-full"
  >
    <Link 
      to={to} 
      className="block w-full card group hover:border-primary-500 transition-all duration-200"
    >
      <div className="p-5 flex items-center space-x-4">
        <div className={`flex-shrink-0 w-12 h-12 ${gradient} rounded-lg flex items-center justify-center transition-all`}>
          <Icon className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-white mb-1 truncate">{title}</h3>
          <p className="text-slate-400 text-sm truncate">{description}</p>
        </div>
      </div>
    </Link>
  </motion.div>
)

const StatCard = ({ value, label, icon: Icon, color = "indigo" }) => {
  const getColorClasses = (color) => {
    switch (color) {
      case 'green':
        return {
          text: 'text-green-400 group-hover:text-green-300',
          bg: 'bg-green-500/10 border-green-500/20',
          icon: 'text-green-400',
          gradient: 'from-green-500/20 to-green-600/20'
        }
      case 'blue':
        return {
          text: 'text-blue-400 group-hover:text-blue-300',
          bg: 'bg-blue-500/10 border-blue-500/20',
          icon: 'text-blue-400',
          gradient: 'from-blue-500/20 to-blue-600/20'
        }
      case 'purple':
        return {
          text: 'text-purple-400 group-hover:text-purple-300',
          bg: 'bg-purple-500/10 border-purple-500/20',
          icon: 'text-purple-400',
          gradient: 'from-purple-500/20 to-purple-600/20'
        }
      default:
        return {
          text: 'text-indigo-400 group-hover:text-indigo-300',
          bg: 'bg-indigo-500/10 border-indigo-500/20',
          icon: 'text-indigo-400',
          gradient: 'from-indigo-500/20 to-indigo-600/20'
        }
    }
  }

  const colorClasses = getColorClasses(color)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden p-4 rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 group hover:bg-gray-800/60"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className={`text-2xl font-bold ${colorClasses.text} mb-1 transition-colors leading-none`}>
            {value}
          </div>
          <div className="text-gray-400 text-xs font-medium uppercase tracking-wide leading-none">
            {label}
          </div>
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg ${colorClasses.bg} flex-shrink-0 ml-3 group-hover:scale-110 transition-transform`}>
            <Icon className={`w-4 h-4 ${colorClasses.icon}`} />
          </div>
        )}
      </div>
      <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r ${colorClasses.gradient} opacity-60`} />
    </motion.div>
  )
}

const HomePage = () => {
  try {
    const { isAuthenticated, user } = useAuth()
    const permissionsHook = usePermissions()
    const { stats, loading: statsLoading, error: statsError } = useHomePageData()

    // Destruturação segura
    const { 
      canAccessAdminPanel = () => false, 
      userLevel = null, 
      loading: permissionsLoading = true 
    } = permissionsHook || {}

    // Chamar a função para obter o valor booleano com tratamento de erro
    let hasAdminAccess = false
    try {
      // Só verifica se não está carregando e a função existe
      if (!permissionsLoading && canAccessAdminPanel && typeof canAccessAdminPanel === 'function') {
        hasAdminAccess = canAccessAdminPanel()
      }
    } catch (error) {
      console.error('❌ Erro ao verificar acesso admin:', error)
      hasAdminAccess = false
    }

    // Dependências para estabilidade do background
    const stabilityDependencies = [
      isAuthenticated,
      statsLoading,
      permissionsLoading,
      user?.id
    ]

  return (
    <div className="h-screen w-full relative bg-gray-900 overflow-hidden">
      {/* Discord Button */}
      <motion.a
        href="https://discord.gg/vrchieve"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-slate-900/80 backdrop-blur-sm border border-[#5865F2]/30 hover:border-[#5865F2]/60 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-[#5865F2]/20 group"
      >
        <svg 
          viewBox="0 0 71 55" 
          className="w-5 h-5 text-[#5865F2]/70 group-hover:text-[#5865F2] transition-colors"
          fill="currentColor"
        >
          <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
        </svg>
      </motion.a>

      {/* Matrix Background estável */}
      <StableMatrixBackground 
        stabilityDependencies={stabilityDependencies}
        fallbackType="vrchat"
      />

      {/* Main Content */}
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 overflow-hidden">
        {/* Welcome Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="h-full flex flex-col"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-6"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {isAuthenticated ? (
                <>Bem-vindo de volta, <span className="text-indigo-400">{user?.username}</span>!</>
              ) : (
                <>Acesse o <span className="text-indigo-400 font-mono">Archive Nyo</span></>
              )}
            </h1>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              {isAuthenticated ? (
                'Explore nossa coleção de assets ou gerencie seus uploads.'
              ) : (
                'Construa. Imagine. Crie.'
              )}
            </p>
          </motion.div>

          {isAuthenticated ? (
            <div className="flex-1 flex flex-col space-y-4">
              {/* Quick Actions */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 ${hasAdminAccess ? '2xl:grid-cols-6' : ''}`}
              >
                <QuickAction
                  to="/marketplace"
                  icon={MagnifyingGlassIcon}
                  title="Explorar Assets"
                  description="Navegue por categorias"
                  gradient="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 group-hover:from-indigo-500/30 group-hover:to-purple-500/30"
                />
                <QuickAction
                  to="/upload"
                  icon={CloudArrowUpIcon}
                  title="Upload Assets"
                  description="Envie seus assets"
                  gradient="bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30"
                />
                <QuickAction
                  to="/profile"
                  icon={UserIcon}
                  title="Meu Perfil"
                  description="Configurações da conta"
                  gradient="bg-gradient-to-br from-green-500/20 to-emerald-500/20 group-hover:from-green-500/30 group-hover:to-emerald-500/30"
                />
                <QuickAction
                  to="/dashboard"
                  icon={UserGroupIcon}
                  title="Dashboard"
                  description="Seus uploads e favoritos"
                  gradient="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:from-blue-500/30 group-hover:to-cyan-500/30"
                />
                <QuickAction
                  to="/vrchat-api"
                  icon={LinkIcon}
                  title="VRChat API"
                  description="Conectar com VRChat"
                  gradient="bg-gradient-to-br from-orange-500/20 to-red-500/20 group-hover:from-orange-500/30 group-hover:to-red-500/30"
                />
                {!permissionsLoading && hasAdminAccess && (
                  <QuickAction
                    to="/admin"
                    icon={ShieldCheckIcon}
                    title="Painel Admin"
                    description={`${userLevel?.name || 'Admin'} • Nível ${userLevel?.level || '?'}`}
                    gradient={`bg-gradient-to-br ${
                      userLevel?.id === 'SISTEMA' 
                        ? 'from-red-500/30 to-orange-500/30 group-hover:from-red-500/40 group-hover:to-orange-500/40 border border-red-500/50 shadow-lg shadow-red-500/20' 
                        : 'from-red-500/20 to-orange-500/20 group-hover:from-red-500/30 group-hover:to-orange-500/30 border border-red-500/30'
                    }`}
                  />
                )}
              </motion.div>

              {/* Main Dashboard Grid */}
              <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-4">
                {/* Left Column - Stats and Rankings */}
                <div className="xl:col-span-8 space-y-4">
                  {/* Stats Overview */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
                  >
                    {statsLoading ? (
                      // Loading skeleton
                      Array(4).fill(0).map((_, i) => (
                        <div key={i} className="p-4 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 animate-pulse">
                          <div className="h-6 bg-gray-700 rounded mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded w-20"></div>
                        </div>
                      ))
                    ) : statsError ? (
                      <div className="col-span-full p-4 rounded-lg bg-red-900/20 border border-red-500/30 text-center">
                        <p className="text-red-400 text-sm">Erro ao carregar estatísticas</p>
                      </div>
                    ) : (
                      <>
                        <StatCard 
                          value={formatNumber(stats.totalApproved)} 
                          label="Assets Aprovados" 
                          icon={CloudArrowUpIcon}
                          color="green"
                        />
                        <StatCard 
                          value={formatNumber(stats.totalUsers)} 
                          label="Usuários" 
                          icon={UserIcon}
                          color="blue"
                        />
                        <StatCard 
                          value={formatNumber(stats.totalDownloads)} 
                          label="Downloads" 
                          icon={MagnifyingGlassIcon}
                          color="purple"
                        />
                        <StatCard 
                          value={formatNumber(stats.recentUploads)} 
                          label="Uploads (7 dias)" 
                          icon={UserGroupIcon}
                          color="indigo"
                        />
                      </>
                    )}
                  </motion.div>

                  {/* Recent Activity Component */}
                  <div className="flex-1">
                    <RecentActivity />
                  </div>
                </div>

                {/* Right Column - Rankings */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="xl:col-span-4 self-start"
                >
                  <UserRankingCard />
                </motion.div>
              </div>
            </div>
          ) : (
            /* Login Access */
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-md mx-auto px-4 sm:px-6"
            >
              <div className="bg-slate-900/90 backdrop-blur-sm border border-indigo-500/30 rounded-2xl p-8 shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
                
                <motion.div 
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-center mb-8 relative z-10"
                >
                  <div className="inline-flex items-center justify-center mb-6 relative">
                    <img 
                      src="/logo.png" 
                      alt="VRCHIEVE Logo" 
                      className="w-56 h-56 object-contain hover:scale-105 transition-transform duration-300 relative z-10"
                    />
                  </div>
                  <div className="w-20 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent mx-auto" />
                </motion.div>
                
                <motion.div 
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col space-y-4 relative z-10"
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link 
                      to="/login" 
                      className="group relative w-full py-4 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-400/30 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 tracking-wider text-sm transform overflow-hidden flex items-center justify-center"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <div className="relative flex items-center justify-center">
                        <svg className="w-5 h-5 mr-3 text-white/80 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v14a2 2 0 002 2h6a2 2 0 002-2v-2m-6-6h6" />
                        </svg>
                        <span className="font-extrabold">ENTRAR NO SISTEMA</span>
                      </div>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link 
                      to="/register" 
                      className="group inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-indigo-500/40 text-indigo-300 font-bold rounded-xl hover:from-indigo-500/20 hover:to-purple-500/20 hover:border-indigo-400 hover:text-white focus:outline-none focus:ring-4 focus:ring-indigo-400/30 shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 tracking-wider text-sm transform backdrop-blur-sm"
                    >
                      <svg className="w-4 h-4 mr-2 text-indigo-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span className="font-extrabold">SOLICITAR ACESSO</span>
                    </Link>
                  </motion.div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 text-center relative z-10"
                >
                  <p className="text-indigo-300/60 text-xs">
                    Plataforma segura • v2.1.3
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </motion.section>
      </div>
    </div>
  )
  } catch (error) {
    console.error('❌ Erro crítico na HomePage:', error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h2 className="text-xl font-bold mb-2">Erro na aplicação</h2>
          <p className="text-gray-400">Por favor, recarregue a página</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Recarregar
          </button>
        </div>
      </div>
    )
  }
}

export default HomePage
