import { useState, useEffect, useCallback } from 'react'
import { CACHE_CONFIG } from '../config/cache'

// Cache global simples
const cache = new Map()
const CACHE_DURATION = CACHE_CONFIG.DURATION

// Throttling global para evitar muitas chamadas simultâneas
const pendingRequests = new Map()
const REQUEST_DELAY = 100 // 100ms entre requests diferentes

// Função para limpar cache
export const clearCache = (key) => {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}

// Função para verificar se tem dados em cache
export const hasCache = (key) => {
  return cache.has(key)
}

export const useCachedAPI = (key, apiCall, dependencies = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async (force = false) => {
    const now = Date.now()
    const cacheKey = typeof key === 'function' ? key() : key
    const cachedData = cache.get(cacheKey)

    // Se tem cache válido e não é força, usar cache
    if (!force && cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
      setData(cachedData.data)
      setLoading(false)
      setError(null)
      return
    }

    // Verificar se já existe uma requisição pendente para esta chave
    if (pendingRequests.has(cacheKey)) {
      try {
        const result = await pendingRequests.get(cacheKey)
        setData(result)
        setLoading(false)
        setError(null)
        return
      } catch (err) {
        // Se a requisição pendente falhou, continuar com nova requisição
      }
    }

    // Se tem cache expirado, mostrar dados antigos enquanto carrega novos
    if (cachedData) {
      setData(cachedData.data)
      setLoading(true)
      setError(null)
    } else {
      setLoading(true)
      setError(null)
    }

    // Criar uma promise para a requisição
    const requestPromise = (async () => {
      // Pequeno delay para evitar muitas requisições simultâneas
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY))
      
      const result = await apiCall()
      
      // Armazenar no cache
      cache.set(cacheKey, {
        data: result,
        timestamp: now
      })
      
      return result
    })()

    // Armazenar a promise no mapa de requisições pendentes
    pendingRequests.set(cacheKey, requestPromise)

    try {
      const result = await requestPromise
      setData(result)
      setError(null)
    } catch (err) {
      console.error(`Error in cached API call for ${cacheKey}:`, err)
      
      // Se tem dados em cache, manter eles e não mostrar erro
      if (cachedData) {
        setData(cachedData.data)
        setError(null)
      } else {
        setError(err)
      }
    } finally {
      setLoading(false)
      // Remover a requisição do mapa após completar
      pendingRequests.delete(cacheKey)
    }
  }, Array.isArray(dependencies) ? dependencies : [dependencies])

  const refetch = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, Array.isArray(dependencies) ? dependencies : [dependencies])

  return { data, loading, error, refetch }
}

// Hook específico para evitar múltiplas chamadas da mesma API
export const useDebounceAPI = (apiCall, delay = 1000) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  let timeoutRef = null

  const debouncedCall = useCallback((...args) => {
    if (timeoutRef) {
      clearTimeout(timeoutRef)
    }

    setLoading(true)
    timeoutRef = setTimeout(async () => {
      try {
        setError(null)
        const result = await apiCall(...args)
        setData(result)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }, delay)
  }, [apiCall, delay])

  return { data, loading, error, call: debouncedCall }
}