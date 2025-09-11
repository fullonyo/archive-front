import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export const useVRChatAPI = () => {
  const [status, setStatus] = useState('disconnected') // 'disconnected', 'connecting', 'connected', 'error', 'needs2fa'
  const [connection, setConnection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [twoFARequired, setTwoFARequired] = useState(false)
  const [pendingCredentials, setPendingCredentials] = useState(null) // Armazena credenciais enquanto aguarda 2FA
  const [rateLimited, setRateLimited] = useState(false) // Estado para rate limiting

  // Verifica status da conexão ao carregar
  const checkStatus = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get('/vrchat/status')
      
      if (response.data.success && response.data.connected) {
        setStatus('connected')
        setConnection(response.data.data)
      } else {
        setStatus('disconnected')
        setConnection(null)
      }
      setError(null)
    } catch (err) {
      console.error('Erro ao verificar status VRChat:', err)
      setStatus('error')
      setError(err.response?.data?.message || 'Erro ao verificar conexão')
    } finally {
      setLoading(false)
    }
  }, [])

  // Primeira etapa: tenta conectar com username/password
  const initiateConnection = useCallback(async (username, password) => {
    // Previne múltiplas chamadas simultâneas
    if (loading) {
      console.log('⏳ Já há uma conexão em andamento, ignorando nova tentativa')
      return { success: false, error: 'Conexão já em andamento' }
    }

    try {
      setStatus('connecting')
      setError(null)
      setTwoFARequired(false)
      setLoading(true)

      console.log('🔐 Iniciando conexão VRChat...')

      // Adiciona delay mínimo para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))

      const response = await api.post('/vrchat/connect', {
        username,
        password,
        twoFactorAuth: null
      })

      if (response.data.success) {
        // Sucesso sem 2FA
        setStatus('connected')
        setConnection({
          vrchatUsername: response.data.data.vrchatUser.username,
          vrchatDisplayName: response.data.data.vrchatUser.displayName,
          vrchatAvatarUrl: response.data.data.vrchatUser.currentAvatarImageUrl,
          vrchatStatus: response.data.data.vrchatUser.status,
          lastSyncAt: new Date(),
          connectedAt: new Date()
        })
        setPendingCredentials(null)
        setLoading(false)
        return { success: true, message: response.data.message, requires2FA: false }
      }
    } catch (err) {
      console.error('Erro na conexão inicial VRChat:', err)
      console.log('🔍 Response data completa:', err.response?.data)
      console.log('🔍 Response status:', err.response?.status)
      console.log('🔍 Response headers:', err.response?.headers)
      
      // Verifica se é resposta de 2FA necessário
      // Pode ser 401 com requires2FA: true, ou qualquer status com indicação de 2FA
      const responseData = err.response?.data || {}
      const requires2FA = responseData.requires2FA === true ||
                         (responseData.message && 
                          (responseData.message.includes('verificação') ||
                           responseData.message.includes('2FA') ||
                           responseData.message.includes('Código de verificação') ||
                           responseData.message.includes('emailOtp')))
      
      console.log('🔐 2FA required check:', requires2FA)
      console.log('🔐 requires2FA flag:', responseData.requires2FA)
      console.log('🔐 Message contains 2FA terms:', responseData.message)
      
      if (requires2FA) {
        // 2FA necessário - transiciona para tela de código
        console.log('🔐 2FA detectado automaticamente, transitioning to 2FA form')
        setStatus('needs2fa')
        setTwoFARequired(true)
        setPendingCredentials({ username, password })
        setError(null) // Limpa erro pois não é erro, é só necessidade de 2FA
        setLoading(false)
        return { 
          success: false, 
          requires2FA: true,
          message: 'Código de verificação necessário. Verifique seu email.'
        }
      } else if (err.response?.status === 401) {
        console.log('🚨 401 detectado - likely 2FA required')
        // Para 401, vamos assumir que é 2FA necessário
        setStatus('needs2fa')
        setTwoFARequired(true)
        setPendingCredentials({ username, password })
        setError(null)
        setLoading(false)
        return { 
          success: false, 
          requires2FA: true,
          message: 'Código de verificação necessário. Verifique seu email.'
        }
      }
      // Se é 429 (rate limiting)
      else if (err.response?.status === 429) {
        console.log('🚨 Rate limit detectado na conexão inicial')
        const rateLimitError = 'VRChat está limitando as tentativas. Aguarde 10-15 minutos antes de tentar novamente.'
        setStatus('error')
        setError(rateLimitError)
        setRateLimited(true)
        setLoading(false)
        
        // Reset automático após 10 minutos
        setTimeout(() => {
          setRateLimited(false)
          setError(null)
          setStatus('disconnected')
        }, 10 * 60 * 1000)
        
        return { 
          success: false, 
          requires2FA: false,
          error: rateLimitError
        }
        return { 
          success: false, 
          requires2FA: true,
          message: 'Sistema detectou 2FA necessário. Digite o código quando estiver pronto.'
        }
      }
      
      // Erro real (credenciais inválidas, etc.)
      console.log('❌ Tratando como erro real')
      setStatus('error')
      const errorMessage = err.response?.data?.message || 'Erro ao conectar com VRChat'
      setError(errorMessage)
      setPendingCredentials(null)
      setLoading(false)
      return { 
        success: false, 
        error: errorMessage,
        requires2FA: false
      }
    }
  }, [loading])

  // Segunda etapa: completa conexão com código 2FA
  const complete2FAConnection = useCallback(async (twoFactorCode) => {
    if (!pendingCredentials) {
      return { success: false, error: 'Credenciais não encontradas. Tente novamente.' }
    }

    // Previne múltiplas chamadas simultâneas
    if (loading) {
      console.log('⏳ Já há uma verificação 2FA em andamento, ignorando nova tentativa')
      return { success: false, error: 'Verificação já em andamento' }
    }

    try {
      setStatus('connecting')
      setError(null)
      setLoading(true)

      console.log('🔐 Enviando código 2FA para validação...')

      // Adiciona delay mínimo para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000))

      const response = await api.post('/vrchat/connect', {
        username: pendingCredentials.username,
        password: pendingCredentials.password,
        twoFactorAuth: twoFactorCode
      })

      if (response.data.success) {
        console.log('✅ 2FA validado com sucesso!')
        setStatus('connected')
        setConnection({
          vrchatUsername: response.data.data.vrchatUser.username,
          vrchatDisplayName: response.data.data.vrchatUser.displayName,
          vrchatAvatarUrl: response.data.data.vrchatUser.currentAvatarImageUrl,
          vrchatStatus: response.data.data.vrchatUser.status,
          lastSyncAt: new Date(),
          connectedAt: new Date()
        })
        setTwoFARequired(false)
        setPendingCredentials(null)
        setLoading(false)
        setError(null) // Limpa erros
        return { success: true, message: response.data.message }
      }
    } catch (err) {
      console.error('Erro na validação 2FA:', err)
      console.log('🔍 2FA Error Response:', err.response?.data)
      
      setLoading(false)
      
      // Tratamento específico para rate limiting
      if (err.response?.status === 429) {
        const rateLimitError = 'VRChat está limitando as tentativas. Aguarde 10-15 minutos antes de tentar novamente.'
        setError(rateLimitError)
        setRateLimited(true)
        setTwoFARequired(false) // Remove o form de 2FA durante rate limit
        
        // Reset automático após 10 minutos
        setTimeout(() => {
          setRateLimited(false)
          setError(null)
        }, 10 * 60 * 1000)
        
        return { success: false, error: rateLimitError }
      }
      
      // Se é rate limiting, mantém na tela de 2FA mas mostra erro específico
      if (err.response?.status === 429) {
        setStatus('needs2fa') // Mantém na tela de 2FA
        const errorMessage = 'VRChat está bloqueando muitas tentativas. Aguarde 5-10 minutos antes de tentar novamente. Use um código 2FA fresco.'
        setError(errorMessage)
        
        // Limpa o erro automaticamente após 10 minutos
        setTimeout(() => {
          setError('')
          console.log('🔓 Rate limiting timeout expirado - tentativas liberadas')
        }, 10 * 60 * 1000)
        
        return { 
          success: false, 
          error: errorMessage,
          shouldRetry: false, // Não retry automático para rate limit
          rateLimited: true
        }
      }
      
      // Verifica se ainda requer 2FA (código inválido/expirado)
      const responseData = err.response?.data || {}
      const stillRequires2FA = responseData.requires2FA === true ||
                              (responseData.message && 
                               (responseData.message.includes('inválido') ||
                                responseData.message.includes('expirado') ||
                                responseData.message.includes('verificação') ||
                                responseData.message.includes('2FA') ||
                                responseData.message.includes('Código')))
      
      if (stillRequires2FA) {
        // Código inválido - mantém na tela de 2FA para nova tentativa
        setStatus('needs2fa')
        const errorMessage = responseData.message || 'Código de verificação inválido ou expirado. Verifique seu email para um novo código.'
        setError(errorMessage)
        return { 
          success: false, 
          error: errorMessage,
          shouldRetry: true
        }
      } else {
        // Erro grave - volta ao início
        setStatus('disconnected')
        setTwoFARequired(false)
        setPendingCredentials(null)
        const errorMessage = responseData.message || 'Erro na validação. Tente fazer login novamente.'
        setError(errorMessage)
        return { 
          success: false, 
          error: errorMessage,
          shouldRetry: false
        }
      }
    }
  }, [pendingCredentials, loading])

  // Função legada mantida para compatibilidade (mas usando o novo fluxo)
  const connect = useCallback(async (username, password, twoFactorAuth = null) => {
    if (twoFactorAuth) {
      return complete2FAConnection(twoFactorAuth)
    } else {
      return initiateConnection(username, password)
    }
  }, [initiateConnection, complete2FAConnection])

  // Desconecta do VRChat
  const disconnect = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.delete('/vrchat/disconnect')
      
      if (response.data.success) {
        setStatus('disconnected')
        setConnection(null)
        setError(null)
        return { success: true, message: response.data.message }
      } else {
        throw new Error(response.data.message)
      }
    } catch (err) {
      console.error('Erro ao desconectar VRChat:', err)
      setError(err.response?.data?.message || 'Erro ao desconectar')
      return { success: false, error: err.response?.data?.message || 'Erro ao desconectar' }
    } finally {
      setLoading(false)
    }
  }, [])

  // Busca perfil VRChat
  const getProfile = useCallback(async () => {
    try {
      const response = await api.get('/vrchat/profile')
      
      if (response.data.success) {
        return { success: true, data: response.data.data }
      } else {
        throw new Error(response.data.message)
      }
    } catch (err) {
      console.error('Erro ao buscar perfil VRChat:', err)
      return { success: false, error: err.response?.data?.message || 'Erro ao buscar perfil' }
    }
  }, [])

  // Sincroniza favoritos
  const syncFavorites = useCallback(async (authCookie) => {
    try {
      const response = await api.post('/vrchat/sync-favorites', {
        authCookie
      })
      
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      } else {
        throw new Error(response.data.message)
      }
    } catch (err) {
      console.error('Erro ao sincronizar favoritos:', err)
      return { success: false, error: err.response?.data?.message || 'Erro ao sincronizar favoritos' }
    }
  }, [])

  // Busca mundos favoritos
  const getFavoriteWorlds = useCallback(async () => {
    try {
      const response = await api.get('/vrchat/favorites/worlds')
      
      if (response.data.success) {
        return { success: true, data: response.data.data }
      } else {
        throw new Error(response.data.message)
      }
    } catch (err) {
      console.error('Erro ao buscar mundos favoritos:', err)
      return { success: false, error: err.response?.data?.message || 'Erro ao buscar mundos' }
    }
  }, [])

  // Busca avatares favoritos
  const getFavoriteAvatars = useCallback(async () => {
    try {
      const response = await api.get('/vrchat/favorites/avatars')
      
      if (response.data.success) {
        return { success: true, data: response.data.data }
      } else {
        throw new Error(response.data.message)
      }
    } catch (err) {
      console.error('Erro ao buscar avatares favoritos:', err)
      return { success: false, error: err.response?.data?.message || 'Erro ao buscar avatares' }
    }
  }, [])

  // Testa conectividade com VRChat API
  const testConnection = useCallback(async () => {
    try {
      const response = await api.get('/vrchat/test')
      
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message }
      } else {
        throw new Error(response.data.message)
      }
    } catch (err) {
      console.error('Erro ao testar conectividade VRChat:', err)
      return { success: false, error: err.response?.data?.message || 'Erro ao testar conectividade' }
    }
  }, [])

  // Carrega status inicial
  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  // Função para resetar estado de erro
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Função para refresh manual
  const refresh = useCallback(() => {
    checkStatus()
  }, [checkStatus])

  return {
    // Estado
    status,
    connection,
    loading,
    error,
    twoFARequired,
    pendingCredentials: !!pendingCredentials, // retorna apenas boolean por segurança
    
    // Getters computados
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    isDisconnected: status === 'disconnected',
    hasError: status === 'error',
    needs2FA: status === 'needs2fa',
    rateLimited,
    
    // Ações de autenticação (novo fluxo)
    initiateConnection,
    complete2FAConnection,
    
    // Ações (compatibilidade + novas)
    connect,
    disconnect,
    getProfile,
    syncFavorites,
    getFavoriteWorlds,
    getFavoriteAvatars,
    testConnection,
    checkStatus,
    clearError,
    refresh
  }
}
