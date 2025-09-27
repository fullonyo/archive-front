import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { ERROR_MESSAGES, API_ERROR_TYPES } from '../constants/categories'

export const useCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCategories = async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)
      
      // Se forçar refresh, adicionar timestamp para evitar cache do navegador
      const timestamp = forceRefresh ? `?t=${Date.now()}&include_assets=true` : '?include_assets=true'
      const response = await api.get(`/categories${timestamp}`)
      console.log('Categories API response:', response.data)
      
      let categoriesData = response.data
      
      // Se a resposta tem uma estrutura aninhada, extrair os dados corretos
      if (categoriesData && categoriesData.data) {
        categoriesData = categoriesData.data
      }
      
      // Garantir que é um array
      if (!Array.isArray(categoriesData)) {
        console.error('Categories data is not an array:', categoriesData)
        categoriesData = []
      }
      
      setCategories(categoriesData)
      console.log('Categories updated:', categoriesData.length, 'categories loaded')
    } catch (error) {
      console.error('Error fetching categories:', error)
      const errorMessage = error.response?.status 
        ? ERROR_MESSAGES[error.response.status] || ERROR_MESSAGES.CATEGORIES
        : ERROR_MESSAGES.CATEGORIES
      
      setError(errorMessage)
      toast.error(errorMessage)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const findCategoryById = (categoryId) => {
    return categories.find(c => c.id === parseInt(categoryId))
  }

  const fetchSubcategoryDetails = async (subcategoryId) => {
    try {
      const response = await api.get(`/categories/${subcategoryId}`)
      return response.data?.data?.category || response.data
    } catch (error) {
      console.error('Error fetching subcategory:', error)
      return null
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    forceRefresh: () => fetchCategories(true),
    findCategoryById,
    fetchSubcategoryDetails
  }
}
