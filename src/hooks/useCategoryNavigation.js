import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AVATAR_SUBCATEGORIES, SUBCATEGORY_NAMES, CATEGORY_NAMES } from '../constants/categories'
import toast from 'react-hot-toast'

export const useCategoryNavigation = (categories) => {
  const navigate = useNavigate()
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const handleCategoryClick = useCallback((category, e) => {
    // Se for a categoria "Avatars", mostrar o seletor
    if (category.name === CATEGORY_NAMES.AVATARS) {
      e?.preventDefault()
      setSelectedCategory(category)
      setShowAvatarSelector(true)
      return
    }
    // Para outras categorias, continuar normalmente
  }, [])

  const handleAvatarTypeSelect = useCallback((type) => {
    console.log('Avatar type selected:', type)
    
    if (!selectedCategory) {
      toast.error('Categoria não selecionada')
      return
    }
    
    // Redirecionar para a subcategoria selecionada
    if (type === 'booth') {
      fetchSubcategoryAndNavigate(selectedCategory.id, SUBCATEGORY_NAMES.AVATAR_BOOTH)
    } else if (type === 'gumroad') {
      fetchSubcategoryAndNavigate(selectedCategory.id, SUBCATEGORY_NAMES.AVATAR_GUMROAD)
    }
    
    setShowAvatarSelector(false)
  }, [selectedCategory])

  const fetchSubcategoryAndNavigate = useCallback(async (categoryId, subcategoryName) => {
    if (!categoryId || !subcategoryName) {
      toast.error('Parâmetros inválidos para navegação')
      return
    }

    try {
      const response = await api.get(`/categories?parent_id=${categoryId}`)
      const subcategories = response.data || response.data?.data
      
      const subcategory = subcategories.find(sub => sub.name === subcategoryName)
      if (subcategory) {
        navigate(`/categories/${categoryId}/${subcategory.id}`)
      } else {
        toast.error('Subcategoria não encontrada')
        // Fallback - navegar para a categoria principal
        navigate(`/categories/${categoryId}`)
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error)
      toast.error('Erro ao carregar subcategorias')
      // Fallback - navegar para a categoria principal
      navigate(`/categories/${categoryId}`)
    }
  }, [navigate])

  const buildCurrentCategory = useCallback(async (categoryId, subcategoryId, findCategoryById, fetchSubcategoryDetails) => {
    if (!categoryId || !findCategoryById) return null

    try {
      const category = findCategoryById(categoryId)
      if (!category) return null

      // Se há subcategoria, buscar os detalhes dela
      if (subcategoryId && fetchSubcategoryDetails) {
        try {
          const subcategory = await fetchSubcategoryDetails(subcategoryId)
          if (subcategory) {
            return { ...category, subcategory }
          }
        } catch (error) {
          console.error('Error fetching subcategory:', error)
          toast.error('Erro ao carregar detalhes da subcategoria')
        }
      }

      return category
    } catch (error) {
      console.error('Error building current category:', error)
      toast.error('Erro ao carregar categoria')
      return null
    }
  }, [])

  // Memoizar métodos de controle do modal
  const openAvatarSelector = useCallback((category) => {
    setSelectedCategory(category)
    setShowAvatarSelector(true)
  }, [])

  const closeAvatarSelector = useCallback(() => {
    setShowAvatarSelector(false)
    setSelectedCategory(null)
  }, [])

  return {
    showAvatarSelector,
    selectedCategory,
    setShowAvatarSelector,
    handleCategoryClick,
    handleAvatarTypeSelect,
    fetchSubcategoryAndNavigate,
    buildCurrentCategory,
    openAvatarSelector,
    closeAvatarSelector
  }
}
