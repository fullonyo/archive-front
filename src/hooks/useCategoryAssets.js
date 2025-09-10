import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { searchAPI, assetsAPI } from '../services/api'
import toast from 'react-hot-toast'
import { ERROR_MESSAGES, API_ERROR_TYPES, PAGINATION_CONFIG } from '../constants/categories'

export const useCategoryAssets = (categoryId, subcategoryId, initialTags = []) => {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [error, setError] = useState(null)
  
  // Ref para cancelar requests anteriores
  const abortControllerRef = useRef(null)
  // Ref para debounce de search
  const searchTimeoutRef = useRef(null)
  // Ref para evitar requests duplicados
  const lastRequestRef = useRef(null)
  // Ref para controlar se tags iniciais já foram definidas
  const initialTagsSetRef = useRef(false)

  // Estados de filtros
  const [filters, setFilters] = useState({
    searchTerm: '',
    sortBy: 'newest',
    currentPage: 1,
    selectedTags: initialTags
  })

  const fetchAssets = useCallback(async (targetCategoryId, targetSubcategoryId, targetFilters) => {
    // Se não há categoria e não há tags selecionadas, não fazer nada
    if (!targetCategoryId && (!targetFilters.selectedTags || targetFilters.selectedTags.length === 0)) {
      setAssets([])
      setPagination({})
      setLoading(false)
      return
    }

    // Criar uma chave única para a requisição para evitar duplicatas
    const requestKey = `${targetCategoryId || 'global'}-${targetSubcategoryId}-${JSON.stringify(targetFilters)}`
    
    // Se for a mesma requisição que a anterior, ignorar
    if (lastRequestRef.current === requestKey) {
      return
    }

    lastRequestRef.current = requestKey

    // Cancelar request anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController()

    try {
      // Não setar loading se é apenas uma mudança de página
      if (targetFilters.currentPage === 1) {
        setLoading(true)
      }
      setError(null)
      
      const params = {
        page: targetFilters.currentPage,
        limit: PAGINATION_CONFIG.DEFAULT_LIMIT,
        sort: targetFilters.sortBy
      }

      // Adicionar categoria se houver
      if (targetCategoryId) {
        params.category = targetSubcategoryId || targetCategoryId
      }

      if (targetFilters.searchTerm?.trim()) {
        params.q = targetFilters.searchTerm.trim()
      }

      // Adicionar tags ao filtro se houver tags selecionadas
      if (targetFilters.selectedTags?.length > 0) {
        const tagNames = targetFilters.selectedTags.map(tag => 
          typeof tag === 'string' ? tag : tag.name
        )
        params.tags = tagNames.join(',')
      }

      console.log('Fetching assets with params:', params)

      // Usar endpoint apropriado baseado na presença de categoria
      const response = targetCategoryId 
        ? await searchAPI.getAssetsByCategory(params.category, params, { signal: abortControllerRef.current.signal })
        : await assetsAPI.getAssets(params)
      
      const result = response.data?.data || response.data
      
      if (result && !abortControllerRef.current.signal.aborted) {
        setAssets(result.assets || [])
        setPagination(result.pagination || {})
        console.log('Assets loaded successfully:', result.assets?.length || 0)
      }
    } catch (error) {
      // Ignorar erros de abort
      if (error.name === 'AbortError') {
        return
      }

      console.error('Error fetching assets:', error)
      
      let errorMessage = ERROR_MESSAGES.ASSETS
      if (error.response?.status === API_ERROR_TYPES.NOT_FOUND) {
        errorMessage = ERROR_MESSAGES[API_ERROR_TYPES.NOT_FOUND]
      } else if (error.response?.status && ERROR_MESSAGES[error.response.status]) {
        errorMessage = ERROR_MESSAGES[error.response.status]
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
      setAssets([])
      setPagination({})
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false)
      }
    }
  }, [])

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Effect principal - apenas para mudanças de categoria e filtros não-search
  useEffect(() => {
    // Limpar search timeout se existir
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
      searchTimeoutRef.current = null
    }

    // Se não há search term, fazer fetch imediatamente
    if (!filters.searchTerm?.trim()) {
      fetchAssets(categoryId, subcategoryId, filters)
    }
  }, [categoryId, subcategoryId, filters.sortBy, filters.currentPage, filters.selectedTags]) // Removido fetchAssets

  // Effect para atualizar tags quando initialTags mudam
  useEffect(() => {
    if (initialTags.length > 0) {
      setFilters(prev => ({
        ...prev,
        selectedTags: initialTags,
        currentPage: 1 // Reset to first page when adding tags from URL
      }))
    }
  }, [JSON.stringify(initialTags)]) // Usar JSON.stringify para comparação de valor

  // Effect separado para search com debounce aprimorado
  useEffect(() => {
    if (!categoryId) return

    // Limpar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (filters.searchTerm?.trim()) {
      // Debounce para search
      searchTimeoutRef.current = setTimeout(() => {
        fetchAssets(categoryId, subcategoryId, filters)
      }, PAGINATION_CONFIG.SEARCH_DEBOUNCE)
    } else if (filters.searchTerm === '') {
      // Se limpar a busca, buscar imediatamente
      fetchAssets(categoryId, subcategoryId, filters)
    }

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [filters.searchTerm, categoryId, subcategoryId]) // Removido fetchAssets

  // Funções de controle de filtros com useCallback
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const setSearchTerm = useCallback((term) => {
    updateFilters({ searchTerm: term, currentPage: 1 })
  }, [updateFilters])

  const setSortBy = useCallback((sort) => {
    updateFilters({ sortBy: sort, currentPage: 1 })
  }, [updateFilters])

  const setCurrentPage = useCallback((page) => {
    updateFilters({ currentPage: page })
  }, [updateFilters])

  const setSelectedTags = useCallback((tags) => {
    updateFilters({ selectedTags: tags, currentPage: 1 })
  }, [updateFilters])

  const addTag = useCallback((tag) => {
    setFilters(prev => ({
      ...prev,
      selectedTags: [...prev.selectedTags, tag],
      currentPage: 1
    }))
  }, [])

  const removeTag = useCallback((tagToRemove) => {
    setFilters(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.filter(tag => {
        const tagName = typeof tag === 'string' ? tag : tag.name
        const removeTagName = typeof tagToRemove === 'string' ? tagToRemove : tagToRemove.name
        return tagName !== removeTagName
      }),
      currentPage: 1
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      sortBy: 'newest',
      currentPage: 1,
      selectedTags: initialTags
    })
  }, [initialTags])

  const refetch = useCallback(() => {
    // Reset da chave de request para forçar novo fetch
    lastRequestRef.current = null
    fetchAssets(categoryId, subcategoryId, filters)
  }, [categoryId, subcategoryId, filters, fetchAssets])

  // Memoizar valores computados
  const hasAssets = useMemo(() => assets.length > 0, [assets.length])
  const isFirstPage = useMemo(() => filters.currentPage === 1, [filters.currentPage])
  const hasActiveSearch = useMemo(() => Boolean(filters.searchTerm?.trim()), [filters.searchTerm])
  const hasActiveTags = useMemo(() => filters.selectedTags.length > 0, [filters.selectedTags.length])
  const hasActiveFilters = useMemo(() => hasActiveSearch || hasActiveTags, [hasActiveSearch, hasActiveTags])

  return {
    assets,
    loading,
    pagination,
    error,
    filters,
    setSearchTerm,
    setSortBy,
    setCurrentPage,
    setSelectedTags,
    addTag,
    removeTag,
    updateFilters,
    resetFilters,
    refetch,
    // Valores computados
    hasAssets,
    isFirstPage,
    hasActiveSearch,
    hasActiveTags,
    hasActiveFilters
  }
}
