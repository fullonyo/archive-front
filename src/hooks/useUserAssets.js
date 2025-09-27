import { useState, useEffect, useCallback, useRef } from 'react'
import { usersAPI } from '../services/api'

const useUserAssets = () => {
  const [pendingAssets, setPendingAssets] = useState([])
  const [approvedAssets, setApprovedAssets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const previousAssetsRef = useRef({ pending: [], approved: [] })

  // Função para buscar assets pendentes (limitado para dropdown)
  const fetchPendingAssets = useCallback(async () => {
    try {
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
        
        // Só atualizar se houver mudança real para evitar re-renders desnecessários
        if (JSON.stringify(pending) !== JSON.stringify(previousAssetsRef.current.pending)) {
          setPendingAssets(pending)
          previousAssetsRef.current.pending = pending
          console.log('🔄 Assets pendentes atualizados:', pending.length)
        }
      }
    } catch (err) {
      console.error('Erro ao buscar assets pendentes:', err)
      setError('Erro ao carregar assets pendentes')
    }
  }, [])

  // Função para buscar assets aprovados (limitado para dropdown)
  const fetchApprovedAssets = useCallback(async () => {
    try {
      setError(null)

      const response = await usersAPI.getUserAssets({
        page: 1,
        limit: 20, // Limite para dropdown
        includeUnapproved: 'false',
        includeInactive: 'true'
      })

      if (response.data.success) {
        const assets = response.data.data.assets || []
        
        // Só atualizar se houver mudança real para evitar re-renders desnecessários
        if (JSON.stringify(assets) !== JSON.stringify(previousAssetsRef.current.approved)) {
          setApprovedAssets(assets)
          previousAssetsRef.current.approved = assets
          console.log('✅ Assets aprovados atualizados:', assets.length)
        }
      }
    } catch (err) {
      console.error('Erro ao buscar assets aprovados:', err)
      setError('Erro ao carregar assets aprovados')
    }
  }, [])

  // Função para atualizar listas (útil após upload)
  const refreshAssets = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchPendingAssets(),
        fetchApprovedAssets()
      ])
    } finally {
      setLoading(false)
    }
  }, [fetchPendingAssets, fetchApprovedAssets])

  // Carregar dados iniciais e configurar polling
  useEffect(() => {
    refreshAssets()
    
    // Configurar polling a cada 30 segundos para verificar mudanças de status
    const interval = setInterval(() => {
      refreshAssets()
    }, 30000) // 30 segundos
    
    return () => clearInterval(interval)
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
