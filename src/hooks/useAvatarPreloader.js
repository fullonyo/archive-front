import { useEffect, useCallback } from 'react'
import { useImageCache } from '../utils/imageCache'
import { getProxiedImageUrl, needsProxy } from '../utils/imageProxy'
import { getGoogleDriveImageUrl } from '../utils/googleDriveUtils'

/**
 * Hook para precarregar avatares de usuários
 * Melhora a performance e reduz inconsistências de carregamento
 */
export const useAvatarPreloader = () => {
  const { preloadImage, preloadImages, getStats } = useImageCache()

  /**
   * Precarrega um único avatar
   */
  const preloadAvatar = useCallback(async (avatarUrl) => {
    if (!avatarUrl) return false

    try {
      // Determina a URL correta (com ou sem proxy)
      const processedUrl = needsProxy(avatarUrl) 
        ? getProxiedImageUrl(avatarUrl) 
        : getGoogleDriveImageUrl(avatarUrl)

      await preloadImage(processedUrl)
      console.log(`✅ Avatar preloaded: ${avatarUrl}`)
      return true
    } catch (error) {
      console.log(`❌ Failed to preload avatar: ${avatarUrl}`, error.message)
      return false
    }
  }, [preloadImage])

  /**
   * Precarrega múltiplos avatares
   */
  const preloadAvatars = useCallback(async (avatarUrls) => {
    if (!avatarUrls || !Array.isArray(avatarUrls)) return {}

    // Processa URLs para usar proxy quando necessário
    const processedUrls = avatarUrls
      .filter(url => url && typeof url === 'string')
      .map(url => needsProxy(url) ? getProxiedImageUrl(url) : getGoogleDriveImageUrl(url))

    try {
      const results = await preloadImages(processedUrls)
      console.log(`📦 Preloaded ${Object.keys(results).length} avatars`)
      return results
    } catch (error) {
      console.error('Error preloading avatars:', error)
      return {}
    }
  }, [preloadImages])

  /**
   * Precarrega avatares de uma lista de usuários
   */
  const preloadUserAvatars = useCallback(async (users) => {
    if (!users || !Array.isArray(users)) return {}

    const avatarUrls = users
      .map(user => user.avatar || user.avatarUrl)
      .filter(Boolean)

    return await preloadAvatars(avatarUrls)
  }, [preloadAvatars])

  /**
   * Precarrega avatares com prioridade (usuários importantes primeiro)
   */
  const preloadAvatarsWithPriority = useCallback(async (users) => {
    if (!users || !Array.isArray(users)) return

    // Separa usuários por prioridade
    const highPriority = users.slice(0, 5) // Top 5 usuários
    const lowPriority = users.slice(5) // Resto

    // Precarrega prioridade alta primeiro
    if (highPriority.length > 0) {
      await preloadUserAvatars(highPriority)
    }

    // Precarrega prioridade baixa com delay
    if (lowPriority.length > 0) {
      setTimeout(() => {
        preloadUserAvatars(lowPriority)
      }, 1000) // 1 segundo de delay
    }
  }, [preloadUserAvatars])

  /**
   * Limpa cache e estatísticas
   */
  const getCacheStats = useCallback(() => {
    return getStats()
  }, [getStats])

  return {
    preloadAvatar,
    preloadAvatars,
    preloadUserAvatars,
    preloadAvatarsWithPriority,
    getCacheStats
  }
}

export default useAvatarPreloader
