import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useVRChatAPI } from '../hooks/useVRChatAPI'
import { 
  LinkIcon,
  GlobeAltIcon,
  UserIcon,
  HeartIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

const VRChatAPIPage = () => {
  const { user } = useAuth()
  const {
    status,
    connection,
    loading,
    error,
    twoFARequired,
    pendingCredentials,
    isConnected,
    isConnecting,
    isDisconnected,
    hasError,
    needs2FA,
    rateLimited,
    initiateConnection,
    complete2FAConnection,
    connect, // mantido para compatibilidade
    disconnect,
    testConnection,
    clearError,
    refresh,
    
    // Novas funções
    getFriends,
    getRecentWorlds,
    getStats,
    getWorldInstances,
    getDashboardData
  } = useVRChatAPI()

  const [showLoginForm, setShowLoginForm] = useState(false)
  const [loginData, setLoginData] = useState({ username: '', password: '', twoFactorAuth: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  
  // Estados para os novos dados
  const [dashboardData, setDashboardData] = useState(null)
  const [loadingDashboard, setLoadingDashboard] = useState(false)
  const [activeSection, setActiveSection] = useState('overview') // overview, friends, worlds, stats

  const handleConnect = async (e) => {
    e.preventDefault()
    
    if (!loginData.username || !loginData.password) {
      return
    }

    // Previne envio duplo
    if (isSubmitting || loading) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Usa a nova função que detecta 2FA automaticamente
      const result = await initiateConnection(loginData.username, loginData.password)
      
      if (result.success) {
        // Sucesso completo - sem 2FA necessário
        setShowLoginForm(false)
        setLoginData({ username: '', password: '', twoFactorAuth: '' })
      } else if (result.requires2FA) {
        // 2FA necessário - o hook já mudou o estado, apenas limpa o campo de código
        setLoginData(prev => ({ ...prev, twoFactorAuth: '' }))
        console.log('🔐 2FA requerido automaticamente detectado')
      } else {
        // Erro real
        console.error('❌ Erro na conexão:', result.error)
      }
    } catch (error) {
      console.error('Erro ao conectar:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handle2FASubmit = async (e) => {
    e.preventDefault()
    
    if (!loginData.twoFactorAuth) {
      return
    }

    // Previne envio duplo
    if (isSubmitting || loading) {
      console.log('⏳ 2FA submission já em andamento, ignorando')
      return
    }

    setIsSubmitting(true)
    
    try {
      console.log('🔐 Submetendo código 2FA...')
      const result = await complete2FAConnection(loginData.twoFactorAuth)
      
      if (result.success) {
        // Sucesso completo
        console.log('✅ 2FA validado com sucesso!')
        setShowLoginForm(false)
        setLoginData({ username: '', password: '', twoFactorAuth: '' })
      } else {
        // Erro na validação 2FA
        console.error('❌ Erro na validação 2FA:', result.error)
        
        // Se é rate limiting, bloqueia interface por mais tempo
        if (result.rateLimited) {
          console.log('⚠️ Rate limited detectado - bloqueando por 5 minutos')
          // Não limpa o campo, mas bloqueia por mais tempo
          setTimeout(() => {
            setIsSubmitting(false)
          }, 30000) // 30 segundos antes de permitir nova tentativa
          return
        }
        
        // Limpa o campo de código para nova tentativa (código inválido)
        if (!result.error.includes('Aguarde')) {
          setLoginData(prev => ({ ...prev, twoFactorAuth: '' }))
        }
      }
    } catch (error) {
      console.error('Erro ao validar 2FA:', error)
    } finally {
      // Delay antes de reabilitar para evitar spam
      setTimeout(() => {
        setIsSubmitting(false)
      }, 1000)
    }
  }

  const handleDisconnect = async () => {
    const result = await disconnect()
    if (result.success) {
      setShowLoginForm(false)
    }
  }

  const handleTest = async () => {
    setIsTesting(true)
    setTestResult(null)
    
    try {
      const result = await testConnection()
      setTestResult(result)
    } catch (error) {
      setTestResult({ success: false, error: 'Erro inesperado ao testar' })
    } finally {
      setIsTesting(false)
    }
  }

  // Função para carregar dados do dashboard
  const loadDashboardData = async () => {
    console.log('🚀 Iniciando carregamento do dashboard...')
    setLoadingDashboard(true)
    try {
      const result = await getDashboardData()
      console.log('📊 Resultado dashboard:', result)
      
      if (result.success) {
        setDashboardData(result.data)
        console.log('✅ Dashboard data atualizado:', result.data)
      } else {
        console.error('❌ Falha ao carregar dashboard:', result.error)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dashboard:', error)
    } finally {
      setLoadingDashboard(false)
    }
  }

  // Carrega dados quando conecta
  React.useEffect(() => {
    if (isConnected && !dashboardData) {
      loadDashboardData()
    }
  }, [isConnected])

  const getStatusInfo = () => {
    if (isConnecting || loading || isSubmitting) {
      return {
        color: 'yellow',
        icon: InformationCircleIcon,
        title: 'Conectando...',
        description: 'Estabelecendo conexão com a API do VRChat'
      }
    }
    
    if (isConnected) {
      return {
        color: 'green',
        icon: ShieldCheckIcon,
        title: 'Conectado',
        description: `Conectado como ${connection?.vrchatDisplayName || connection?.vrchatUsername}`
      }
    }
    
    if (hasError) {
      return {
        color: 'red',
        icon: ExclamationTriangleIcon,
        title: 'Erro de Conexão',
        description: error || 'Não foi possível conectar à API do VRChat'
      }
    }
    
    if (needs2FA) {
      return {
        color: 'yellow',
        icon: ShieldCheckIcon,
        title: 'Verificação 2FA',
        description: 'Digite o código de verificação enviado para seu email'
      }
    }
    
    return {
      color: 'gray',
      icon: LinkIcon,
      title: 'Desconectado',
      description: 'Clique em conectar para integrar com VRChat'
    }
  }

  const statusInfo = getStatusInfo()

  const features = [
    {
      icon: UserIcon,
      title: 'Sincronização de Perfil',
      description: 'Sincronize seu perfil do VRChat com o VRCHIEVE',
      status: 'Em Desenvolvimento'
    },
    {
      icon: HeartIcon,
      title: 'Favoritos Automáticos',
      description: 'Adicione automaticamente seus mundos e avatares favoritos',
      status: 'Planejado'
    },
    {
      icon: GlobeAltIcon,
      title: 'Status de Mundo',
      description: 'Veja quais mundos você visitou e suas estatísticas',
      status: 'Planejado'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/25">
                <LinkIcon className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-800 rounded-full border-2 border-gray-700 flex items-center justify-center">
                <span className="text-xs font-bold text-orange-400">API</span>
              </div>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Integração VRChat API
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Conecte sua conta do VRChat ao VRCHIEVE para uma experiência mais integrada
          </p>
        </motion.div>

        {/* Rate Limiting Warning Banner */}
        {(rateLimited || (error && (error.includes('limitando') || error.includes('rate limit') || error.includes('Too many')))) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-red-900/50 border-l-4 border-red-500 rounded-lg p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-red-300 font-semibold">VRChat Rate Limiting Ativo</h3>
                  <p className="text-red-200 text-sm mt-1">
                    A API do VRChat bloqueou temporariamente muitas tentativas de autenticação. 
                    Aguarde 10-15 minutos e tente novamente com um código 2FA fresco do seu email.
                  </p>
                  <p className="text-red-300 text-xs mt-2">
                    💡 Este é um mecanismo de proteção normal da VRChat para prevenir abuso da API.
                  </p>
                  <div className="bg-red-800/30 rounded-md p-3 mt-3">
                    <h4 className="text-red-200 font-medium text-sm">O que fazer agora:</h4>
                    <ul className="text-red-200 text-xs mt-1 space-y-1">
                      <li>• Aguarde 10-15 minutos antes de tentar novamente</li>
                      <li>• Use um código 2FA completamente novo do seu email</li>
                      <li>• Não faça múltiplas tentativas seguidas</li>
                      <li>• A página irá resetar automaticamente após 10 minutos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="card p-6">
            {/* Test Connection Section */}
            <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-white">Teste de Conectividade</h4>
                <button
                  onClick={handleTest}
                  disabled={isTesting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isTesting ? 'Testando...' : 'Testar API VRChat'}
                </button>
              </div>
              
              {testResult && (
                <div className={`p-3 rounded-lg ${testResult.success ? 'bg-green-900/30 border border-green-500/30' : 'bg-red-900/30 border border-red-500/30'}`}>
                  <p className={`text-sm ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                    {testResult.success ? '✅ ' + testResult.message : '❌ ' + testResult.error}
                  </p>
                  {testResult.success && testResult.data && (
                    <div className="mt-2 text-xs text-green-300">
                      <p>Status: {testResult.data.status}</p>
                      <p>API Version: {testResult.data.apiVersion}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  statusInfo.color === 'green' ? 'bg-green-500/20 border border-green-500/30' :
                  statusInfo.color === 'yellow' ? 'bg-yellow-500/20 border border-yellow-500/30' :
                  statusInfo.color === 'red' ? 'bg-red-500/20 border border-red-500/30' :
                  'bg-gray-500/20 border border-gray-500/30'
                }`}>
                  <statusInfo.icon className={`w-6 h-6 ${
                    statusInfo.color === 'green' ? 'text-green-400' :
                    statusInfo.color === 'yellow' ? 'text-yellow-400' :
                    statusInfo.color === 'red' ? 'text-red-400' :
                    'text-gray-400'
                  }`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{statusInfo.title}</h3>
                  <p className="text-gray-400">{statusInfo.description}</p>
                </div>
              </div>
              
              {(isConnecting || loading || isSubmitting) && (
                <div className="animate-spin w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
              )}
            </div>

            {/* Connection Actions */}
            {isDisconnected && !showLoginForm && !loading && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowLoginForm(true)}
                className="w-full py-3 px-6 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-500 hover:to-red-500 transition-all duration-200 shadow-lg shadow-orange-500/25"
              >
                Conectar com VRChat
              </motion.button>
            )}

            {/* Login Form */}
            {showLoginForm && (isDisconnected || needs2FA) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Form Inicial (Username/Password) ou Form 2FA */}
                {!needs2FA ? (
                  <form onSubmit={handleConnect} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email ou Username do VRChat
                      </label>
                      <input
                        type="text"
                        value={loginData.username}
                        onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Seu email ou username do VRChat"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Password do VRChat
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={loginData.password}
                          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Sua senha do VRChat"
                          required
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                          disabled={isSubmitting}
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <InformationCircleIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-blue-400 text-xs">
                          <strong>Segurança:</strong> Suas credenciais são usadas apenas para autenticação 
                          e não são armazenadas no servidor. A conexão é feita diretamente com a API oficial do VRChat.
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={isSubmitting || loading || !loginData.username || !loginData.password || rateLimited}
                        className="flex-1 py-2 px-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-500 hover:to-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting || loading ? 'Conectando...' : 'Conectar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowLoginForm(false)
                          setLoginData({ username: '', password: '', twoFactorAuth: '' })
                          clearError()
                        }}
                        className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-all duration-200"
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Form 2FA - aparece automaticamente quando detectado */
                  <form onSubmit={handle2FASubmit} className="space-y-4">
                    <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-3">
                        <ShieldCheckIcon className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-yellow-400 text-sm font-semibold mb-1">
                            Verificação de Duas Etapas Detectada
                          </p>
                          <p className="text-yellow-300 text-xs">
                            Sua conta VRChat tem 2FA habilitado. Verifique seu email para o código de verificação.
                            {(rateLimited || (error && (error.includes('limitando') || error.includes('Too many')))) && (
                              <><br/><strong>🔒 VRChat Rate Limit:</strong> Muitas tentativas detectadas. Aguarde 10-15 minutos.</>
                            )}
                            {error && error.includes('Aguarde') && !rateLimited && (
                              <><br/><strong>⚠️ Rate Limit:</strong> Aguarde alguns segundos antes de tentar novamente.</>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Erro específico do 2FA */}
                    {error && (
                      <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 mb-4">
                        <p className="text-red-400 text-sm">
                          {error}
                        </p>
                        {error.includes('bloqueando') && (
                          <p className="text-red-300 text-xs mt-1">
                            🔒 VRChat bloqueou temporariamente sua IP. Aguarde 5-10 minutos e use um código 2FA fresco do seu email.
                          </p>
                        )}
                        {error.includes('Aguarde') && !error.includes('bloqueando') && (
                          <p className="text-red-300 text-xs mt-1">
                            💡 A API do VRChat limita tentativas muito rápidas. Aguarde ~10 segundos.
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Código de Verificação (2FA)
                      </label>
                      <input
                        type="text"
                        value={loginData.twoFactorAuth}
                        onChange={(e) => setLoginData(prev => ({ ...prev, twoFactorAuth: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg tracking-widest"
                        placeholder="000000"
                        maxLength="6"
                        required
                        disabled={isSubmitting}
                        autoFocus
                      />
                      <p className="text-gray-400 text-xs mt-1">
                        Digite o código de 6 dígitos enviado para seu email
                      </p>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={isSubmitting || loading || !loginData.twoFactorAuth || rateLimited || (error && (error.includes('limitando') || error.includes('Too many')))}
                        className="flex-1 py-2 px-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-500 hover:to-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {(rateLimited || (error && (error.includes('limitando') || error.includes('Too many')))) ? 'Rate Limited - Aguarde' : 
                         (isSubmitting || loading) ? 'Verificando...' : 'Verificar Código'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowLoginForm(false)
                          setLoginData({ username: '', password: '', twoFactorAuth: '' })
                          clearError()
                        }}
                        className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-all duration-200"
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}

            {/* Connected Dashboard */}
            {isConnected && connection && (
              <div className="space-y-6">
                {/* User Profile Header */}
                <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    {connection.vrchatAvatarUrl && (
                      <img
                        src={connection.vrchatAvatarUrl}
                        alt="VRChat Avatar"
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="text-green-400 font-semibold text-lg">{connection.vrchatDisplayName}</h4>
                      <p className="text-green-300 text-sm">@{connection.vrchatUsername}</p>
                      <p className="text-green-400 text-xs">
                        Conectado em {new Date(connection.connectedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={loadDashboardData}
                      disabled={loadingDashboard}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50"
                    >
                      {loadingDashboard ? 'Atualizando...' : 'Atualizar'}
                    </button>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-gray-800 rounded-lg p-1">
                  <div className="flex space-x-1">
                    {[
                      { id: 'overview', label: 'Visão Geral', icon: UserIcon },
                      { id: 'friends', label: 'Amigos', icon: HeartIcon },
                      { id: 'worlds', label: 'Mundos', icon: GlobeAltIcon },
                      { id: 'stats', label: 'Estatísticas', icon: ShieldCheckIcon },
                    ].map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveSection(tab.id)}
                          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                            activeSection === tab.id
                              ? 'bg-orange-600 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-700'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="bg-gray-800 rounded-lg p-6">
                  {loadingDashboard ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                      <p className="text-gray-400">Carregando dados...</p>
                    </div>
                  ) : (
                    <>
                      {/* Overview Section */}
                      {activeSection === 'overview' && (
                        <div className="space-y-6">
                          <h3 className="text-white text-xl font-bold mb-4">Visão Geral</h3>
                          
                          {/* Debug Section - TEMPORÁRIO */}
                          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-4">
                            <h4 className="text-blue-400 font-semibold mb-2">Debug - Estado dos Dados</h4>
                            <div className="text-xs space-y-1">
                              <p className="text-blue-300">Dashboard Data: {dashboardData ? 'EXISTE' : 'NULL'}</p>
                              <p className="text-blue-300">Stats: {dashboardData?.stats ? 'EXISTE' : 'NULL'}</p>
                              <p className="text-blue-300">Recent Worlds: {dashboardData?.recentWorlds ? 'EXISTE' : 'NULL'}</p>
                              <p className="text-blue-300">Friends: {dashboardData?.friends ? 'EXISTE' : 'NULL'}</p>
                              <p className="text-blue-300">Loading: {loadingDashboard ? 'SIM' : 'NÃO'}</p>
                              {dashboardData && (
                                <details className="mt-2">
                                  <summary className="text-blue-400 cursor-pointer">Ver dados completos</summary>
                                  <pre className="text-blue-200 text-xs mt-1 overflow-auto max-h-32">
                                    {JSON.stringify(dashboardData, null, 2)}
                                  </pre>
                                </details>
                              )}
                            </div>
                          </div>
                          
                          {dashboardData?.stats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-gray-700 rounded-lg p-4 text-center">
                                <p className="text-2xl font-bold text-orange-400">{dashboardData.stats.totalFriends}</p>
                                <p className="text-gray-300 text-sm">Amigos</p>
                              </div>
                              <div className="bg-gray-700 rounded-lg p-4 text-center">
                                <p className="text-2xl font-bold text-blue-400">{dashboardData.stats.totalWorlds}</p>
                                <p className="text-gray-300 text-sm">Mundos</p>
                              </div>
                              <div className="bg-gray-700 rounded-lg p-4 text-center">
                                <p className="text-2xl font-bold text-green-400">{dashboardData.stats.totalAvatars}</p>
                                <p className="text-gray-300 text-sm">Avatares</p>
                              </div>
                              <div className="bg-gray-700 rounded-lg p-4 text-center">
                                <p className="text-2xl font-bold text-purple-400">{dashboardData.stats.hoursPlayed}h</p>
                                <p className="text-gray-300 text-sm">Jogadas</p>
                              </div>
                            </div>
                          )}
                          
                          {dashboardData?.recentWorlds && (
                            <div>
                              <h4 className="text-white font-semibold mb-3">Mundos Recentes</h4>
                              <div className="space-y-3">
                                {dashboardData.recentWorlds.worlds?.slice(0, 3).map((world, index) => (
                                  <div key={index} className="bg-gray-700 rounded-lg p-4 flex items-center space-x-4">
                                    <img
                                      src={world.imageUrl}
                                      alt={world.name}
                                      className="w-12 h-12 rounded-lg object-cover"
                                    />
                                    <div className="flex-1">
                                      <h5 className="text-white font-medium">{world.name}</h5>
                                      <p className="text-gray-400 text-sm">por {world.authorName}</p>
                                      <p className="text-gray-500 text-xs">
                                        Visitado {new Date(world.visitedAt).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Friends Section */}
                      {activeSection === 'friends' && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white text-xl font-bold">Lista de Amigos</h3>
                            <div className="flex items-center space-x-4">
                              {/* Indicador de dados reais vs mock */}
                              {dashboardData?.friends?.mock !== undefined && (
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  dashboardData.friends.mock 
                                    ? 'bg-yellow-600/30 text-yellow-300 border border-yellow-500/50' 
                                    : 'bg-green-600/30 text-green-300 border border-green-500/50'
                                }`}>
                                  {dashboardData.friends.mock ? '📋 Dados Demo' : '🔗 Dados Reais'}
                                </div>
                              )}
                              <div className="text-sm text-gray-400">
                                {dashboardData?.friends?.total || 0} amigos
                              </div>
                            </div>
                          </div>
                          
                          {/* Warning para dados mock */}
                          {dashboardData?.friends?.mock && (
                            <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4 mb-4">
                              <div className="flex items-start space-x-3">
                                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-yellow-400 text-sm font-medium mb-1">
                                    Exibindo dados de demonstração
                                  </p>
                                  <p className="text-yellow-300 text-xs">
                                    Para ver seus amigos reais do VRChat, é necessário reautenticar sua conta para obter um cookie de sessão atualizado.
                                  </p>
                                  <button
                                    onClick={() => setShowLoginForm(true)}
                                    className="mt-2 text-yellow-400 hover:text-yellow-300 text-xs underline"
                                  >
                                    Reautenticar agora
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Success message para dados reais */}
                          {dashboardData?.friends?.mock === false && (
                            <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 mb-4">
                              <div className="flex items-start space-x-3">
                                <ShieldCheckIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-green-400 text-sm font-medium">
                                    Conectado com sucesso à API do VRChat
                                  </p>
                                  <p className="text-green-300 text-xs">
                                    Exibindo dados reais da sua conta VRChat
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {dashboardData?.friends && dashboardData.friends.friends && dashboardData.friends.friends.length > 0 ? (
                            <div className="space-y-3">
                              {dashboardData.friends.friends.map((friend, index) => (
                                <div key={friend.id || index} className="bg-gray-700 rounded-lg p-4 flex items-center space-x-4">
                                  <img
                                    src={friend.currentAvatarImageUrl}
                                    alt={friend.displayName}
                                    className="w-12 h-12 rounded-lg object-cover bg-gray-600"
                                    onError={(e) => {
                                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0yNCAxMkMxOC40NzcgMTIgMTQgMTYuNDc3IDE0IDIyUzE4LjQ3NyAzMiAyNCAzMlMzNCAyNy41MjMgMzQgMjJTMjkuNTIzIDEyIDI0IDEyWk0yNCAyOEMyMC42ODYgMjggMTggMjUuMzE0IDE4IDIyUzIwLjY4NiAxNiAyNCAxNlMyOCAxOC42ODYgMjggMjJTMjUuMzE0IDI4IDI0IDI4WiIgZmlsbD0iIzZCNzI4MCIvPgo8L3N2Zz4K'
                                    }}
                                  />
                                  <div className="flex-1">
                                    <h5 className="text-white font-medium">{friend.displayName}</h5>
                                    <p className="text-gray-400 text-sm">{friend.statusDescription || 'Sem status'}</p>
                                    {friend.location && friend.location !== 'offline' && friend.location !== 'private' && (
                                      <p className="text-gray-500 text-xs">📍 {friend.location}</p>
                                    )}
                                  </div>
                                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    friend.status === 'online' 
                                      ? 'bg-green-600 text-green-100' 
                                      : friend.status === 'active'
                                      ? 'bg-blue-600 text-blue-100'
                                      : friend.status === 'join me'
                                      ? 'bg-purple-600 text-purple-100'
                                      : friend.status === 'busy'
                                      ? 'bg-orange-600 text-orange-100'
                                      : 'bg-gray-600 text-gray-300'
                                  }`}>
                                    {friend.status === 'online' ? '🟢 Online' 
                                     : friend.status === 'active' ? '🔵 Ativo' 
                                     : friend.status === 'join me' ? '🟣 Me Junte' 
                                     : friend.status === 'busy' ? '🟠 Ocupado' 
                                     : '⚫ Offline'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-gray-400 py-8">
                              <p>Nenhum amigo encontrado ou erro ao carregar dados</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Worlds Section */}
                      {activeSection === 'worlds' && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white text-xl font-bold">Mundos Visitados</h3>
                            {/* Indicador de dados reais vs mock */}
                            {dashboardData?.recentWorlds?.mock !== undefined && (
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                dashboardData.recentWorlds.mock 
                                  ? 'bg-yellow-600/30 text-yellow-300 border border-yellow-500/50' 
                                  : 'bg-green-600/30 text-green-300 border border-green-500/50'
                              }`}>
                                {dashboardData.recentWorlds.mock ? '📋 Dados Demo' : '🔗 Dados Reais'}
                              </div>
                            )}
                          </div>
                          
                          {/* Warning para dados mock */}
                          {dashboardData?.recentWorlds?.mock && (
                            <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4 mb-4">
                              <div className="flex items-start space-x-3">
                                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-yellow-400 text-sm font-medium mb-1">
                                    Exibindo dados de demonstração
                                  </p>
                                  <p className="text-yellow-300 text-xs">
                                    Para ver seus mundos reais do VRChat, é necessário reautenticar sua conta.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {dashboardData?.recentWorlds && (
                            <div className="grid gap-4">
                              {dashboardData.recentWorlds.worlds?.map((world, index) => (
                                <div key={index} className="bg-gray-700 rounded-lg p-4 flex items-center space-x-4">
                                  <img
                                    src={world.imageUrl}
                                    alt={world.name}
                                    className="w-16 h-16 rounded-lg object-cover"
                                  />
                                  <div className="flex-1">
                                    <h5 className="text-white font-medium">{world.name}</h5>
                                    <p className="text-gray-400 text-sm">por {world.authorName}</p>
                                    <p className="text-gray-300 text-sm">{world.description}</p>
                                    <p className="text-gray-500 text-xs mt-1">
                                      Capacidade: {world.capacity} players • Visitado {new Date(world.visitedAt).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Stats Section */}
                      {activeSection === 'stats' && (
                        <div className="space-y-6">
                          <h3 className="text-white text-xl font-bold mb-4">Estatísticas da Conta</h3>
                          
                          {dashboardData?.stats && (
                            <div className="grid gap-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-700 rounded-lg p-6">
                                  <h4 className="text-white font-semibold mb-4">Informações da Conta</h4>
                                  <div className="space-y-3">
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Trust Rank:</span>
                                      <span className="text-orange-400 font-medium">{dashboardData.stats.trustRank}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Data de Criação:</span>
                                      <span className="text-white">{new Date(dashboardData.stats.accountCreated).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Último Login:</span>
                                      <span className="text-white">{new Date(dashboardData.stats.lastLogin).toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="bg-gray-700 rounded-lg p-6">
                                  <h4 className="text-white font-semibold mb-4">Estatísticas de Uso</h4>
                                  <div className="space-y-3">
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Horas Jogadas:</span>
                                      <span className="text-purple-400 font-medium">{dashboardData.stats.hoursPlayed}h</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Total de Fotos:</span>
                                      <span className="text-blue-400 font-medium">{dashboardData.stats.totalPhotos}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Conectado ao VRCHIEVE:</span>
                                      <span className="text-green-400 font-medium">{new Date(dashboardData.stats.joinDate).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Disconnect Button */}
                <div className="text-center">
                  <button
                    onClick={handleDisconnect}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    Desconectar Conta VRChat
                  </button>
                </div>
              </div>
            )}

            {/* Error Display */}
            {hasError && (
              <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 text-sm mb-3">
                  {error}
                </p>
                {error.includes('Muitas tentativas') && (
                  <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-3 mt-3">
                    <p className="text-yellow-400 text-xs">
                      💡 <strong>Dica:</strong> A API do VRChat tem limites de tentativas para proteger contra ataques. 
                      Aguarde alguns minutos antes de tentar novamente.
                    </p>
                  </div>
                )}
                <div className="flex space-x-3 mt-3">
                  <button
                    onClick={() => {
                      clearError()
                      setShowLoginForm(false)
                      setRequires2FA(false)
                    }}
                    className="text-red-400 hover:text-red-300 text-sm underline"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={refresh}
                    className="text-red-400 hover:text-red-300 text-sm underline"
                  >
                    Verificar status
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Recursos Planejados</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="card p-6 group hover:border-orange-500/30 transition-all duration-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                    <feature.icon className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{feature.description}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      {feature.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">Sobre a Integração</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              A integração com a API do VRChat permitirá uma experiência mais fluida entre 
              o VRChat e o VRCHIEVE, sincronizando automaticamente seus dados e preferências.
            </p>
            <p>
              <strong className="text-white">Recursos em desenvolvimento:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
              <li>Sincronização automática de perfil e preferências</li>
              <li>Importação de avatares e mundos favoritos</li>
              <li>Estatísticas de uso e atividade</li>
              <li>Notificações de atualizações de conteúdo</li>
            </ul>
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mt-6">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-400 text-sm mb-2">
                    <strong>Autenticação de Duas Etapas (2FA):</strong>
                  </p>
                  <ul className="text-blue-300 text-xs space-y-1 ml-2">
                    <li>• Se você tem 2FA habilitado no VRChat, será solicitado um código de verificação</li>
                    <li>• O código pode ser enviado por email ou gerado no seu app autenticador</li>
                    <li>• Suas credenciais são usadas apenas para autenticação e não são armazenadas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Troubleshooting Tips */}
        {error && error.includes('bloqueando') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="card p-6">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="w-6 h-6 text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-orange-400 text-lg font-semibold mb-3">
                    Como Resolver o Rate Limiting
                  </p>
                  <div className="space-y-3 text-gray-300 text-sm">
                    <div>
                      <strong className="text-orange-300">⏰ Aguarde:</strong>
                      <p>O VRChat bloqueia IPs que fazem muitas tentativas. Aguarde 5-10 minutos antes de tentar novamente.</p>
                    </div>
                    <div>
                      <strong className="text-orange-300">📧 Código Fresco:</strong>
                      <p>Use um código 2FA completamente novo do seu email. Códigos antigos podem estar expirados.</p>
                    </div>
                    <div>
                      <strong className="text-orange-300">🔄 Uma Tentativa:</strong>
                      <p>Faça apenas uma tentativa por vez. Múltiplos cliques ativam a proteção do VRChat.</p>
                    </div>
                    <div>
                      <strong className="text-orange-300">🌐 Trocar IP:</strong>
                      <p>Se necessário, reinicie seu roteador ou use uma conexão diferente (mobile hotspot).</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 hover:border-gray-500 transition-all duration-200"
          >
            ← Voltar
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default VRChatAPIPage
