import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

export const useCurrentCategory = (categories, findCategoryById, fetchSubcategoryDetails) => {
  const { categoryId, subcategoryId } = useParams()
  const [currentCategory, setCurrentCategory] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Função para construir a categoria atual - memoizada
  const buildCurrentCategory = useCallback(async (targetCategoryId, targetSubcategoryId) => {
    if (!targetCategoryId || !findCategoryById) {
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const category = findCategoryById(targetCategoryId)
      if (!category) {
        setError('Categoria não encontrada')
        return null
      }

      // Se há subcategoria, buscar os detalhes dela
      if (targetSubcategoryId && fetchSubcategoryDetails) {
        try {
          const subcategory = await fetchSubcategoryDetails(targetSubcategoryId)
          if (subcategory) {
            return { ...category, subcategory }
          }
        } catch (subcategoryError) {
          console.error('Error fetching subcategory:', subcategoryError)
          toast.error('Erro ao carregar detalhes da subcategoria')
          // Continuar com a categoria principal
        }
      }

      return category
    } catch (err) {
      console.error('Error building current category:', err)
      setError('Erro ao carregar categoria')
      toast.error('Erro ao carregar categoria')
      return null
    } finally {
      setLoading(false)
    }
  }, [findCategoryById, fetchSubcategoryDetails])

  // Effect para atualizar categoria quando params mudam
  useEffect(() => {
    const updateCategory = async () => {
      if (categoryId && findCategoryById) {
        const category = await buildCurrentCategory(categoryId, subcategoryId)
        setCurrentCategory(category)
      } else {
        setCurrentCategory(null)
      }
    }
    
    updateCategory()
  }, [categoryId, subcategoryId, buildCurrentCategory])

  // Valores memoizados
  const categoryName = useMemo(() => {
    if (!currentCategory) return 'Explorar Categorias'
    
    return currentCategory.subcategory 
      ? currentCategory.subcategory.display_name 
      : currentCategory.display_name
  }, [currentCategory])

  const categoryDescription = useMemo(() => {
    if (!currentCategory) {
      return 'Navegue por nossa coleção cuidadosamente organizada de assets e recursos para VRChat'
    }
    
    const desc = currentCategory.subcategory 
      ? currentCategory.subcategory.description 
      : currentCategory.description
    
    return `Descubra ${desc.toLowerCase()}`
  }, [currentCategory])

  const assetCount = useMemo(() => {
    return currentCategory?.asset_count || 0
  }, [currentCategory])

  const isAvatarCategory = useMemo(() => {
    return currentCategory?.name === 'avatars'
  }, [currentCategory])

  const isSubcategory = useMemo(() => {
    return Boolean(currentCategory?.subcategory)
  }, [currentCategory])

  const platformInfo = useMemo(() => {
    if (!currentCategory?.subcategory) return null

    const subcategoryName = currentCategory.subcategory.name
    if (subcategoryName === 'avatar-booth') {
      return { name: 'Booth Store', icon: 'shopping-bag', color: 'indigo' }
    } else if (subcategoryName === 'avatar-gumroad') {
      return { name: 'Gumroad Store', icon: 'globe', color: 'purple' }
    }
    
    return null
  }, [currentCategory])

  return {
    currentCategory,
    loading,
    error,
    // Computed values
    categoryName,
    categoryDescription,
    assetCount,
    isAvatarCategory,
    isSubcategory,
    platformInfo,
    // URL params
    categoryId,
    subcategoryId
  }
}
