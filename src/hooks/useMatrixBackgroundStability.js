import { useState, useEffect, useCallback } from 'react'

/**
 * Hook personalizado para gerenciar o estado de loading do MatrixBackground
 * e evitar re-renderizações desnecessárias durante carregamentos de página
 */
export const useMatrixBackgroundStability = (dependencies = []) => {
  const [isStable, setIsStable] = useState(false)
  const [stabilityTimeout, setStabilityTimeout] = useState(null)

  const stabilize = useCallback(() => {
    if (stabilityTimeout) {
      clearTimeout(stabilityTimeout)
    }

    // Aguardar um período para considerar a página estável
    const timeout = setTimeout(() => {
      setIsStable(true)
    }, 500) // 500ms de delay para estabilização

    setStabilityTimeout(timeout)
  }, [stabilityTimeout])

  const destabilize = useCallback(() => {
    setIsStable(false)
    if (stabilityTimeout) {
      clearTimeout(stabilityTimeout)
      setStabilityTimeout(null)
    }
  }, [stabilityTimeout])

  useEffect(() => {
    // Reiniciar processo de estabilização quando dependências mudarem
    destabilize()
    
    // Pequeno delay antes de começar a estabilizar
    const initTimeout = setTimeout(() => {
      stabilize()
    }, 100)

    return () => {
      clearTimeout(initTimeout)
      if (stabilityTimeout) {
        clearTimeout(stabilityTimeout)
      }
    }
  }, dependencies) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (stabilityTimeout) {
        clearTimeout(stabilityTimeout)
      }
    }
  }, [stabilityTimeout])

  return {
    isStable,
    stabilize,
    destabilize
  }
}

/**
 * Hook para detectar mudanças de rota e pausar animações durante transições
 */
export const useRouteStability = () => {
  const [isTransitioning, setIsTransitioning] = useState(false)

  const startTransition = useCallback(() => {
    setIsTransitioning(true)
  }, [])

  const endTransition = useCallback(() => {
    // Aguardar um pouco mais para garantir que a transição terminou
    setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
  }, [])

  return {
    isTransitioning,
    startTransition,
    endTransition
  }
}

export default useMatrixBackgroundStability
