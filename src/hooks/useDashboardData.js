import { useState, useEffect, useCallback } from 'react'
import { useCachedAPI, clearCache } from './useCachedAPI'
import { assetsAPI, usersAPI } from '../services/api'

export const useDashboardData = () => {
  const [data, setData] = useState({
    stats: {
      totalAssets: 0,
      totalUsers: 0,
      totalDownloads: 0,
      totalLikes: 0
    },
    recentAssets: [],
    trendingAssets: [],
    topUsers: [],
    categories: []
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cache individual para cada tipo de dado com tratamento de erro melhorado
  const { 
    data: statsResult, 
    loading: statsLoading, 
    error: statsError 
  } = useCachedAPI('dashboard-stats', async () => {
    const response = await assetsAPI.getStats()
    return response
  }, [])

  const { 
    data: recentResult, 
    loading: recentLoading, 
    error: recentError 
  } = useCachedAPI('dashboard-recent', async () => {
    const response = await assetsAPI.getRecent({ limit: 8 })
    return response
  }, [])

  const { 
    data: trendingResult, 
    loading: trendingLoading, 
    error: trendingError 
  } = useCachedAPI('dashboard-trending', async () => {
    const response = await assetsAPI.getTrending({ limit: 6 })
    return response
  }, [])

  const { 
    data: topUsersResult, 
    loading: topUsersLoading, 
    error: topUsersError 
  } = useCachedAPI('dashboard-topusers', async () => {
    const response = await usersAPI.getTopUploaders({ limit: 5 })
    return response
  }, [])

  const { 
    data: categoriesResult, 
    loading: categoriesLoading, 
    error: categoriesError 
  } = useCachedAPI('dashboard-categories', async () => {
    const response = await assetsAPI.getCategories()
    return response
  }, [])

  // Processar dados quando carregarem
  useEffect(() => {
    const allLoading = statsLoading || recentLoading || trendingLoading || topUsersLoading || categoriesLoading
    
    // Se ainda está carregando qualquer coisa, manter loading
    if (allLoading) {
      setLoading(true)
      return
    }

    // Verificar se há erros críticos
    const criticalErrors = [statsError, recentError, trendingError].filter(Boolean)
    if (criticalErrors.length > 0) {
      setError('Erro ao carregar dados do dashboard. Tente novamente.')
      setLoading(false)
      return
    }

    // Processar dados mesmo se alguns falharam (não críticos)
    try {
      // Processar stats - garantir que seja um objeto válido
      const statsData = statsResult?.data?.data || statsResult?.data || {}
      
      const processedStats = {
        totalAssets: statsData.totalAssets || statsData.totalApproved || 0,
        totalUsers: statsData.totalUsers || 0,
        totalDownloads: statsData.totalDownloads || 0,
        totalLikes: statsData.totalLikes || statsData.totalFavorites || 0
      }

      // Processar assets recentes
      const recentData = recentResult?.data?.data || recentResult?.data || []
      const processedRecent = Array.isArray(recentData) ? recentData : []

      // Processar trending assets
      const trendingData = trendingResult?.data?.data || trendingResult?.data || []
      const processedTrending = Array.isArray(trendingData) ? trendingData : []

      // Processar top users
      const topUsersData = topUsersResult?.data?.data || topUsersResult?.data || []
      const processedTopUsers = Array.isArray(topUsersData) ? topUsersData : []

      // Processar categories
      const categoriesData = categoriesResult?.data?.data || categoriesResult?.data || []
      const processedCategories = Array.isArray(categoriesData) ? categoriesData : []

      const finalData = {
        stats: processedStats,
        recentAssets: processedRecent,
        trendingAssets: processedTrending,
        topUsers: processedTopUsers,
        categories: processedCategories
      }

      setData(finalData)
      setError(null)
      
    } catch (processError) {
      setError('Erro ao processar dados do dashboard')
    } finally {
      setLoading(false)
    }

  }, [statsResult, recentResult, trendingResult, topUsersResult, categoriesResult,
      statsLoading, recentLoading, trendingLoading, topUsersLoading, categoriesLoading,
      statsError, recentError, trendingError, topUsersError, categoriesError])

  const refreshData = useCallback(() => {
    // Limpar todos os caches relacionados ao dashboard
    const cacheKeys = [
      'dashboard-stats',
      'dashboard-recent', 
      'dashboard-trending',
      'dashboard-topusers',
      'dashboard-categories'
    ]
    
    cacheKeys.forEach(key => clearCache(key))
    
    // Recarregar página após limpar cache
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }, [])

  return {
    data,
    loading,
    error,
    refreshData
  }
}
