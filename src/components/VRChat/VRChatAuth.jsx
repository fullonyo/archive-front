import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  LinkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon 
} from '@heroicons/react/24/outline'
import VRChatLoading from '../ui/VRChatLoading'

const VRChatAuth = ({ 
  onConnect, 
  on2FASubmit, 
  error, 
  loading, 
  needs2FA, 
  clearError 
}) => {
  const [loginData, setLoginData] = useState({ 
    username: '', 
    password: '', 
    twoFactorAuth: '' 
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleConnect = async (e) => {
    e.preventDefault()
    
    if (!loginData.username || !loginData.password) return
    if (loading) return

    await onConnect(loginData.username, loginData.password)
  }

  const handle2FASubmit = async (e) => {
    e.preventDefault()
    
    if (!loginData.twoFactorAuth) return
    if (loading) return

    await on2FASubmit(loginData.twoFactorAuth)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <LinkIcon className="w-8 h-8 text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Conectar VRChat</h1>
          <p className="text-gray-400">Conecte sua conta para sincronizar dados</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-6"
          >
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-400 text-sm font-medium">Erro na conexão</p>
                <p className="text-red-300 text-xs mt-1">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}

        {needs2FA ? (
          <form onSubmit={handle2FASubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Código de Verificação
              </label>
              <input
                type="text"
                value={loginData.twoFactorAuth}
                onChange={(e) => setLoginData(prev => ({ ...prev, twoFactorAuth: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="Digite o código do seu email"
                maxLength={6}
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || !loginData.twoFactorAuth}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <VRChatLoading size="sm" type="refresh" showText={false} className="w-5 h-5 mr-2" />
              ) : null}
              {loading ? 'Verificando...' : 'Verificar Código'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email ou Username
              </label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="seu@email.com"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 pr-12"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !loginData.username || !loginData.password}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <VRChatLoading size="sm" type="refresh" showText={false} className="w-5 h-5 mr-2" />
              ) : null}
              {loading ? 'Conectando...' : 'Conectar'}
            </button>
          </form>
        )}

        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-400 text-sm font-medium">Autenticação Segura</p>
              <p className="text-blue-300 text-xs mt-1">
                Suas credenciais são usadas apenas para autenticação e não são armazenadas.
                Se você tem 2FA habilitado, será solicitado um código de verificação.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default VRChatAuth
