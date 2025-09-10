import { useState, useEffect, useCallback } from 'react'
import { usersAPI } from '../services/api'

const useUserAssets = () => {
  const [pendingAssets, setPendingAssets] = useState([])
  const [approvedAssets, setApprovedAssets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Função para buscar assets pendentes (limitado para dropdown)
  const fetchPendingAssets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await usersAPI.getUserAssets({
        page: 1,
        limit: 20, // Limite para dropdown
        includeUnapproved: 'true',
        includeInactive: 'true'
      })

      if (response.data.success) {
        const assets = response.data.data.assets || []
        
        // Filtrar apenas assets pendentes (não aprovados)
        const pending = assets.filter(asset => !asset.isApproved)
        setPendingAssets(pending)
      }
    } catch (err) {
      console.error('Erro ao buscar assets pendentes:', err)
      setError('Erro ao carregar assets pendentes')
    } finally {
      setLoading(false)
    }
  }, [])

  // Função para buscar assets aprovados (limitado para dropdown)
  const fetchApprovedAssets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await usersAPI.getUserAssets({
        page: 1,
        limit: 20, // Limite para dropdown
        includeUnapproved: 'false',
        includeInactive: 'true'
      })

      if (response.data.success) {
        const assets = response.data.data.assets || []
        setApprovedAssets(assets)
      }
    } catch (err) {
      console.error('Erro ao buscar assets aprovados:', err)
      setError('Erro ao carregar assets aprovados')
    } finally {
      setLoading(false)
    }
  }, [])

  // Função para atualizar listas (útil após upload)
  const refreshAssets = useCallback(() => {
    fetchPendingAssets()
    fetchApprovedAssets()
  }, [fetchPendingAssets, fetchApprovedAssets])

  // Carregar dados iniciais
  useEffect(() => {
    refreshAssets()
  }, [refreshAssets])

  return {
    pendingAssets,
    approvedAssets,
    loading,
    error,
    refreshAssets
  }
}

export default useUserAssets
