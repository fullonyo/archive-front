import { useCachedAPI } from './useCachedAPI'
import { assetsAPI, usersAPI } from '../services/api'
import { CACHE_CONFIG } from '../config/cache'

export const useHomePageData = () => {
  // Cache de estatísticas (atualiza a cada 5 minutos)
  const { 
    data: statsResult, 
    loading: statsLoading, 
    error: statsError 
  } = useCachedAPI(
    CACHE_CONFIG.HOMEPAGE_STATS,
    () => assetsAPI.getStats(),
    []
  )

  // Cache de top uploaders
  const { 
    data: uploadersResult, 
    loading: uploadersLoading, 
    error: uploadersError 
  } = useCachedAPI(
    CACHE_CONFIG.TOP_UPLOADERS,
    () => usersAPI.getTopUploaders({ limit: 5 }),
    []
  )

  // Processar dados ou usar valores padrão em caso de erro
  let stats = {
    totalAssets: 0,
    totalApproved: 0, 
    totalDownloads: 0,
    totalUsers: 0,
    recentUploads: 0
  }

  if (statsResult?.data?.success) {
    stats = statsResult.data.data
  }

  let topUploaders = []
  if (uploadersResult?.data?.success) {
    topUploaders = uploadersResult.data.data || []
  }

  const loading = statsLoading || uploadersLoading
  const error = (statsError && uploadersError) ? 'Erro ao carregar dados' : null

  return {
    stats,
    topUploaders,
    loading,
    error
  }
}
