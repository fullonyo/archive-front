// Hook para gerenciar cache inteligente no frontend
import { useState, useEffect, useRef } from 'react';

class FrontendCacheManager {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.TTL = {
      assets: 3 * 60 * 1000, // 3 minutos
      categories: 30 * 60 * 1000, // 30 minutos
      stats: 5 * 60 * 1000, // 5 minutos
      user: 10 * 60 * 1000, // 10 minutos
      search: 2 * 60 * 1000 // 2 minutos
    };
  }

  generateKey(type, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${type}_${JSON.stringify(sortedParams)}`;
  }

  set(key, data, customTTL = null) {
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now());
    
    // Auto-cleanup after TTL
    const ttl = customTTL || this.TTL.assets;
    setTimeout(() => {
      this.cache.delete(key);
      this.timestamps.delete(key);
    }, ttl);
  }

  get(key) {
    const data = this.cache.get(key);
    const timestamp = this.timestamps.get(key);
    
    if (!data || !timestamp) {
      return null;
    }

    // Verificar se expirou (fallback para TTL)
    const now = Date.now();
    const age = now - timestamp;
    const maxAge = this.TTL.assets; // Default TTL
    
    if (age > maxAge) {
      this.cache.delete(key);
      this.timestamps.delete(key);
      return null;
    }

    return data;
  }

  has(key) {
    return this.get(key) !== null;
  }

  clear(pattern = null) {
    if (!pattern) {
      this.cache.clear();
      this.timestamps.clear();
      return;
    }

    // Limpar por padrão (ex: "assets_")
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
        this.timestamps.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: JSON.stringify(Array.from(this.cache.entries())).length
    };
  }
}

// Instância singleton
const frontendCache = new FrontendCacheManager();

// Hook para usar cache inteligente
export function useSmartCache() {
  const [stats, setStats] = useState(frontendCache.getStats());

  const refreshStats = () => {
    setStats(frontendCache.getStats());
  };

  useEffect(() => {
    const interval = setInterval(refreshStats, 30000); // Atualizar stats a cada 30s
    return () => clearInterval(interval);
  }, []);

  return {
    cache: frontendCache,
    stats,
    refreshStats
  };
}

// Hook para fetch com cache inteligente
export function useCachedFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cached, setCached] = useState(false);
  
  const abortControllerRef = useRef(null);
  const { cache } = useSmartCache();

  const fetchData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Gerar chave de cache baseada na URL e opções
      const cacheKey = cache.generateKey('fetch', { url, ...options });

      // Verificar cache primeiro (se não forçar refresh)
      if (!forceRefresh) {
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
          console.log('🎯 Cache hit para:', url);
          setData(cachedData);
          setCached(true);
          setLoading(false);
          return cachedData;
        }
      }

      // Cancelar request anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Criar novo AbortController
      abortControllerRef.current = new AbortController();

      console.log('🌐 Fazendo request para:', url);

      // Fazer request com headers de cache
      const response = await fetch(url, {
        ...options,
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'max-age=300', // Pedir cache de 5 minutos
          'If-None-Match': '*', // ETag support
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();

      // Determinar TTL baseado no tipo de dados
      let ttl = 5 * 60 * 1000; // 5 minutos padrão
      
      if (url.includes('/categories')) ttl = 30 * 60 * 1000; // 30 min
      if (url.includes('/stats')) ttl = 5 * 60 * 1000; // 5 min
      if (url.includes('/search')) ttl = 2 * 60 * 1000; // 2 min
      if (url.includes('/assets')) ttl = 3 * 60 * 1000; // 3 min

      // Verificar se o servidor retornou dados em cache
      const serverCached = responseData.cached || 
                          response.headers.get('X-Cache') === 'HIT' ||
                          response.status === 304;

      if (serverCached) {
        console.log('🎯 Dados vieram do cache do servidor');
      }

      // Armazenar no cache frontend
      cache.set(cacheKey, responseData, ttl);

      setData(responseData);
      setCached(serverCached);
      setLoading(false);

      return responseData;

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request cancelado:', url);
        return;
      }

      console.error('Erro no fetch:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  // Auto-fetch na primeira renderização
  useEffect(() => {
    fetchData();

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url]);

  return {
    data,
    loading,
    error,
    cached,
    refetch: () => fetchData(false),
    forceRefresh: () => fetchData(true)
  };
}

// Hook para pré-carregar dados populares
export function useDataPreloader() {
  const { cache } = useSmartCache();

  const preloadPopularData = async () => {
    console.log('🔥 Pré-carregando dados populares...');

    try {
      // Pré-carregar em paralelo
      await Promise.all([
        // Categorias (usado em toda página)
        fetch('/api/categories', {
          headers: { 'Cache-Control': 'max-age=1800' }
        }).then(r => r.json()).then(data => {
          cache.set('fetch_{"url":"/api/categories"}', data, 30 * 60 * 1000);
        }),

        // Assets populares (página inicial)
        fetch('/api/assets?limit=20&sort=popular', {
          headers: { 'Cache-Control': 'max-age=300' }
        }).then(r => r.json()).then(data => {
          cache.set('fetch_{"url":"/api/assets?limit=20&sort=popular"}', data, 3 * 60 * 1000);
        }),

        // Stats globais
        fetch('/api/stats', {
          headers: { 'Cache-Control': 'max-age=300' }
        }).then(r => r.json()).then(data => {
          cache.set('fetch_{"url":"/api/stats"}', data, 5 * 60 * 1000);
        }),

        // Assets recentes
        fetch('/api/assets/recent?limit=10', {
          headers: { 'Cache-Control': 'max-age=180' }
        }).then(r => r.json()).then(data => {
          cache.set('fetch_{"url":"/api/assets/recent?limit=10"}', data, 3 * 60 * 1000);
        })
      ]);

      console.log('✅ Dados populares pré-carregados');
    } catch (error) {
      console.error('❌ Erro no pré-carregamento:', error);
    }
  };

  return { preloadPopularData };
}

export default frontendCache;
