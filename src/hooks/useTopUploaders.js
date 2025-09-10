import { useCachedAPI } from './useCachedAPI'
import { usersAPI } from '../services/api'

/**
 * Hook para buscar os top uploaders com cache automático
 * @param {number} limit - Número de usuários para retornar (padrão: 5)
 * @returns {Object} { data, loading, error, refetch }
 */
export const useTopUploaders = (limit = 5) => {
  return useCachedAPI(
    `top-uploaders-${limit}`, 
    async () => {
      const response = await usersAPI.getTopUploaders({ limit })
      return response.data.data || []
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutos - dados considerados "frescos"
      cacheTime: 10 * 60 * 1000, // 10 minutos - dados mantidos no cache
      refetchOnWindowFocus: false, // Não refetch ao focar na janela
      refetchOnMount: false, // Não refetch a cada mount se tiver cache válido
      retry: 2, // Tentar 2 vezes em caso de erro
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponencial
    }
  )
}

/**
 * Hook para buscar rankings específicos
 * @param {string} type - Tipo de ranking ('uploads', 'downloads', 'likes', 'rating')
 * @param {number} limit - Número de usuários para retornar
 */
export const useUserRanking = (type = 'uploads', limit = 10) => {
  const getApiCall = () => {
    switch (type) {
      case 'downloads':
        return () => usersAPI.getTopByDownloads({ limit })
      case 'likes':
        return () => usersAPI.getTopByLikes({ limit })
      case 'rating':
        return () => usersAPI.getTopByRating({ limit })
      default:
        return () => usersAPI.getTopUploaders({ limit })
    }
  }

  return useCachedAPI(
    `top-users-${type}-${limit}`,
    async () => {
      const response = await getApiCall()()
      return response.data.data || []
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 15 * 60 * 1000, // Cache mais longo para rankings
      refetchOnWindowFocus: false,
      retry: 2,
    }
  )
}

export default useTopUploaders
