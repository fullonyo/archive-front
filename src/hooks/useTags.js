import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const useTags = (categoryId = null) => {
  const [tags, setTags] = useState([])
  const [popularTags, setPopularTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Refs para evitar refetch desnecessário
  const lastCategoryId = useRef(null)
  const hasFetchedOnce = useRef(false)

  // Fetch tags populares para uma categoria específica ou globalmente
  const fetchPopularTags = useCallback(async () => {
    if (loading) return
    
    setLoading(true)
    setError(null)
    
    try {
      const endpoint = categoryId 
        ? `/categories/${categoryId}/tags/popular`
        : '/tags/popular'
      
      const response = await api.get(endpoint)
      
      if (response.data.success) {
        setPopularTags(response.data.tags || [])
      } else {
        throw new Error(response.data.message || 'Erro ao carregar tags')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar tags populares'
      setError(errorMessage)
      console.error('Erro ao buscar tags populares:', err)
    } finally {
      setLoading(false)
    }
  }, [categoryId]) // Removido 'loading' das dependências para evitar loop

  // Buscar tags por termo de pesquisa
  const searchTags = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setTags([])
      return
    }

    try {
      const endpoint = categoryId 
        ? `/categories/${categoryId}/tags/search`
        : '/tags/search'
      
      const response = await api.get(endpoint, {
        params: { q: searchTerm, limit: 20 }
      })
      
      if (response.data.success) {
        setTags(response.data.tags || [])
      } else {
        setTags([])
      }
    } catch (err) {
      console.error('Erro ao buscar tags:', err)
      setTags([])
    }
  }, [categoryId])

  // Processar tags de diferentes formatos
  const processTags = useCallback((rawTags) => {
    if (!rawTags) return []
    
    if (Array.isArray(rawTags)) {
      return rawTags.filter(tag => tag && typeof tag === 'string')
    }
    
    if (typeof rawTags === 'string') {
      try {
        const parsed = JSON.parse(rawTags)
        if (Array.isArray(parsed)) {
          return parsed.filter(tag => tag && typeof tag === 'string')
        }
      } catch {
        // Se JSON parsing falha, tratar como string separada por vírgula
        return rawTags.split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
      }
    }
    
    return []
  }, [])

  // Formatar tags para exibição
  const formatTagsForDisplay = useCallback((rawTags, limit = 3) => {
    const processed = processTags(rawTags)
    return processed.slice(0, limit)
  }, [processTags])

  // Extrair tags únicas de uma lista de assets
  const extractTagsFromAssets = useCallback((assets) => {
    const tagMap = new Map()
    
    assets.forEach(asset => {
      const assetTags = processTags(asset.tags)
      assetTags.forEach(tag => {
        if (tagMap.has(tag)) {
          tagMap.set(tag, tagMap.get(tag) + 1)
        } else {
          tagMap.set(tag, 1)
        }
      })
    })
    
    return Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [processTags])

  // Filtrar assets por tags selecionadas
  const filterAssetsByTags = useCallback((assets, selectedTags) => {
    if (!selectedTags.length) return assets
    
    const selectedTagNames = selectedTags.map(tag => 
      typeof tag === 'string' ? tag : tag.name
    )
    
    return assets.filter(asset => {
      const assetTags = processTags(asset.tags)
      return selectedTagNames.some(selectedTag => 
        assetTags.some(assetTag => 
          assetTag.toLowerCase().includes(selectedTag.toLowerCase())
        )
      )
    })
  }, [processTags])

  // Efeito para carregar tags populares quando o componente monta
  useEffect(() => {
    // Só fazer fetch se mudou a categoria ou é a primeira vez
    if (lastCategoryId.current !== categoryId || !hasFetchedOnce.current) {
      lastCategoryId.current = categoryId
      hasFetchedOnce.current = true
      fetchPopularTags()
    }
  }, [categoryId, fetchPopularTags])

  // Memoizar valores computados
  const memoizedValues = useMemo(() => ({
    hasPopularTags: popularTags.length > 0,
    hasSearchResults: tags.length > 0,
    isEmpty: !loading && popularTags.length === 0 && tags.length === 0
  }), [popularTags.length, tags.length, loading])

  return {
    // Estados
    tags,
    popularTags,
    loading,
    error,
    
    // Funções
    fetchPopularTags,
    searchTags,
    processTags,
    formatTagsForDisplay,
    extractTagsFromAssets,
    filterAssetsByTags,
    
    // Valores computados
    ...memoizedValues,
    
    // Utility functions
    refetch: fetchPopularTags
  }
}

export default useTags
