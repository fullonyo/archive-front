/**
 * Sistema de cache de avatares para melhorar performance e evitar recarregamentos
 */

class AvatarCache {
  constructor() {
    this.cache = new Map()
    this.preloadCache = new Map()
    this.failureCache = new Set()
    this.maxCacheSize = 100
    this.cacheTTL = 5 * 60 * 1000 // 5 minutos
    
    console.log('🗄️ AvatarCache: Initialized with TTL:', this.cacheTTL)
  }

  /**
   * Gerar chave de cache baseada na URL
   */
  getCacheKey(url) {
    if (!url || typeof url !== 'string') return null
    return url.trim().toLowerCase()
  }

  /**
   * Verificar se uma URL está em cache e ainda é válida
   */
  isInCache(url) {
    const key = this.getCacheKey(url)
    if (!key) return false

    const cached = this.cache.get(key)
    if (!cached) return false

    // Verificar se o cache ainda é válido
    const isExpired = Date.now() - cached.timestamp > this.cacheTTL
    if (isExpired) {
      this.cache.delete(key)
      console.log('🗑️ AvatarCache: Expired cache removed for:', key)
      return false
    }

    return true
  }

  /**
   * Obter dados do cache
   */
  getFromCache(url) {
    const key = this.getCacheKey(url)
    if (!key) return null

    const cached = this.cache.get(key)
    if (!cached) return null

    // Verificar se ainda é válido
    if (!this.isInCache(url)) return null

    console.log('✅ AvatarCache: Cache hit for:', key)
    return {
      status: cached.status,
      url: cached.optimizedUrl,
      timestamp: cached.timestamp
    }
  }

  /**
   * Adicionar ao cache
   */
  addToCache(originalUrl, optimizedUrl, status = 'success') {
    const key = this.getCacheKey(originalUrl)
    if (!key) return

    // Limitar tamanho do cache
    if (this.cache.size >= this.maxCacheSize) {
      // Remover o item mais antigo
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
      console.log('🧹 AvatarCache: Removed oldest cache entry:', oldestKey)
    }

    // Só fazer log se for uma nova entrada, não uma atualização
    const existingEntry = this.cache.get(key)
    const isNewEntry = !existingEntry || existingEntry.status !== status

    this.cache.set(key, {
      originalUrl,
      optimizedUrl,
      status,
      timestamp: Date.now()
    })

    if (isNewEntry) {
      console.log(`💾 AvatarCache: Cached ${status} for:`, key)
    }
  }

  /**
   * Marcar URL como falhada
   */
  markAsFailed(url) {
    const key = this.getCacheKey(url)
    if (!key) return

    this.failureCache.add(key)
    this.addToCache(url, null, 'failed')
    
    console.log('❌ AvatarCache: Marked as failed:', key)
  }

  /**
   * Verificar se URL já falhou antes
   */
  hasFailed(url) {
    const key = this.getCacheKey(url)
    if (!key) return false

    const cached = this.getFromCache(url)
    return cached?.status === 'failed'
  }

  /**
   * Pré-carregar imagem
   */
  preloadImage(url) {
    return new Promise((resolve, reject) => {
      const key = this.getCacheKey(url)
      if (!key) {
        reject(new Error('Invalid URL'))
        return
      }

      // Verificar se já foi pré-carregada
      if (this.preloadCache.has(key)) {
        const cached = this.preloadCache.get(key)
        if (cached.status === 'success') {
          resolve(cached.url)
        } else {
          reject(new Error('Previously failed'))
        }
        return
      }

      // Verificar cache principal
      const cachedResult = this.getFromCache(url)
      if (cachedResult) {
        if (cachedResult.status === 'success') {
          resolve(cachedResult.url)
        } else {
          reject(new Error('Cached failure'))
        }
        return
      }

      console.log('🔄 AvatarCache: Preloading image:', url)

      const img = new Image()
      
      img.onload = () => {
        console.log('✅ AvatarCache: Preload success:', url)
        this.preloadCache.set(key, { status: 'success', url, timestamp: Date.now() })
        this.addToCache(url, url, 'success')
        resolve(url)
      }

      img.onerror = (error) => {
        console.log('❌ AvatarCache: Preload failed:', url, error)
        this.preloadCache.set(key, { status: 'failed', url, timestamp: Date.now() })
        this.markAsFailed(url)
        reject(error)
      }

      img.src = url
    })
  }

  /**
   * Limpar cache expirado
   */
  cleanExpiredCache() {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTTL) {
        this.cache.delete(key)
        cleanedCount++
      }
    }

    // Limpar preload cache também
    for (const [key, value] of this.preloadCache.entries()) {
      if (now - value.timestamp > this.cacheTTL) {
        this.preloadCache.delete(key)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 AvatarCache: Cleaned ${cleanedCount} expired entries`)
    }
  }

  /**
   * Obter estatísticas do cache
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      preloadCacheSize: this.preloadCache.size,
      failureCount: this.failureCache.size,
      maxSize: this.maxCacheSize,
      ttl: this.cacheTTL
    }
  }

  /**
   * Limpar todo o cache
   */
  clear() {
    this.cache.clear()
    this.preloadCache.clear()
    this.failureCache.clear()
    console.log('🗑️ AvatarCache: All caches cleared')
  }
}

// Instância singleton
const avatarCache = new AvatarCache()

// Limpar cache expirado a cada 2 minutos
setInterval(() => {
  avatarCache.cleanExpiredCache()
}, 2 * 60 * 1000)

export default avatarCache

/**
 * Hook para usar o cache de avatares
 */
export const useAvatarCache = () => {
  return {
    isInCache: (url) => avatarCache.isInCache(url),
    getFromCache: (url) => avatarCache.getFromCache(url),
    addToCache: (originalUrl, optimizedUrl, status) => avatarCache.addToCache(originalUrl, optimizedUrl, status),
    markAsFailed: (url) => avatarCache.markAsFailed(url),
    hasFailed: (url) => avatarCache.hasFailed(url),
    preloadImage: (url) => avatarCache.preloadImage(url),
    getStats: () => avatarCache.getStats(),
    clear: () => avatarCache.clear()
  }
}
