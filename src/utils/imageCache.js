/**
 * Sistema de cache de imagens para melhorar performance e reduzir inconsistências
 */

class ImageCacheManager {
  constructor() {
    this.cache = new Map()
    this.preloadQueue = new Set()
    this.maxCacheSize = 100 // Máximo de 100 imagens em cache
    this.cacheTimeout = 10 * 60 * 1000 // 10 minutos
  }

  /**
   * Gera uma chave única para o cache
   */
  getCacheKey(url) {
    return url ? url.trim() : null
  }

  /**
   * Verifica se uma imagem está no cache e ainda é válida
   */
  isInCache(url) {
    const key = this.getCacheKey(url)
    if (!key) return false

    const cached = this.cache.get(key)
    if (!cached) return false

    // Verifica se o cache ainda é válido
    const isExpired = Date.now() - cached.timestamp > this.cacheTimeout
    if (isExpired) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Adiciona uma imagem ao cache
   */
  addToCache(url, status = 'success', errorMessage = null) {
    const key = this.getCacheKey(url)
    if (!key) return

    // Limita o tamanho do cache
    if (this.cache.size >= this.maxCacheSize) {
      // Remove o item mais antigo
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      url,
      status, // 'success', 'error', 'loading'
      timestamp: Date.now(),
      errorMessage
    })
  }

  /**
   * Obtém informações do cache
   */
  getFromCache(url) {
    const key = this.getCacheKey(url)
    if (!key) return null

    return this.cache.get(key) || null
  }

  /**
   * Remove uma imagem do cache
   */
  removeFromCache(url) {
    const key = this.getCacheKey(url)
    if (key) {
      this.cache.delete(key)
    }
  }

  /**
   * Limpa todo o cache
   */
  clearCache() {
    this.cache.clear()
    this.preloadQueue.clear()
  }

  /**
   * Precarrega uma imagem
   */
  preloadImage(url) {
    return new Promise((resolve, reject) => {
      const key = this.getCacheKey(url)
      if (!key) {
        reject(new Error('Invalid URL'))
        return
      }

      // Se já está no cache como sucesso, resolve imediatamente
      if (this.isInCache(url)) {
        const cached = this.getFromCache(url)
        if (cached.status === 'success') {
          resolve(url)
          return
        }
      }

      // Se já está sendo carregada, não carrega novamente
      if (this.preloadQueue.has(key)) {
        resolve(url)
        return
      }

      this.preloadQueue.add(key)
      this.addToCache(url, 'loading')

      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        this.preloadQueue.delete(key)
        this.addToCache(url, 'success')
        resolve(url)
      }

      img.onerror = (error) => {
        this.preloadQueue.delete(key)
        this.addToCache(url, 'error', error.message)
        reject(new Error(`Failed to preload image: ${url}`))
      }

      // Timeout para evitar travamento
      setTimeout(() => {
        if (this.preloadQueue.has(key)) {
          this.preloadQueue.delete(key)
          this.addToCache(url, 'error', 'Timeout')
          reject(new Error(`Preload timeout for: ${url}`))
        }
      }, 10000) // 10 segundos

      img.src = url
    })
  }

  /**
   * Precarrega múltiplas imagens
   */
  async preloadImages(urls) {
    const results = await Promise.allSettled(
      urls.map(url => this.preloadImage(url))
    )

    return results.reduce((acc, result, index) => {
      acc[urls[index]] = result.status === 'fulfilled' ? 'success' : 'error'
      return acc
    }, {})
  }

  /**
   * Verifica se uma URL é válida para cache
   */
  isValidUrl(url) {
    if (!url || typeof url !== 'string') return false
    if (url === 'null' || url === 'undefined') return false
    if (!url.trim()) return false
    return url.startsWith('http') || url.startsWith('data:') || url.startsWith('/')
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats() {
    const stats = {
      total: this.cache.size,
      success: 0,
      error: 0,
      loading: 0,
      preloading: this.preloadQueue.size
    }

    for (const cached of this.cache.values()) {
      stats[cached.status]++
    }

    return stats
  }

  /**
   * Limpa cache expirado
   */
  cleanExpiredCache() {
    const now = Date.now()
    const expired = []

    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.cacheTimeout) {
        expired.push(key)
      }
    }

    expired.forEach(key => this.cache.delete(key))
    return expired.length
  }
}

// Instância singleton
const imageCache = new ImageCacheManager()

// Limpa cache expirado a cada 5 minutos
setInterval(() => {
  const cleaned = imageCache.cleanExpiredCache()
  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} expired images from cache`)
  }
}, 5 * 60 * 1000)

// Hook personalizado para usar o cache de imagens
export const useImageCache = () => {
  return {
    isInCache: (url) => imageCache.isInCache(url),
    addToCache: (url, status, error) => imageCache.addToCache(url, status, error),
    getFromCache: (url) => imageCache.getFromCache(url),
    removeFromCache: (url) => imageCache.removeFromCache(url),
    preloadImage: (url) => imageCache.preloadImage(url),
    preloadImages: (urls) => imageCache.preloadImages(urls),
    isValidUrl: (url) => imageCache.isValidUrl(url),
    getStats: () => imageCache.getStats(),
    clearCache: () => imageCache.clearCache()
  }
}

export default imageCache
