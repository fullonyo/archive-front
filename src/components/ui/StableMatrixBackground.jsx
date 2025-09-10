import React, { Suspense, useMemo } from 'react'
import MatrixBackground from './MatrixBackground'
import LoadingSpinner from './LoadingSpinner'
import VRChatLoading from './VRChatLoading'
import { useMatrixBackground } from './MatrixBackgroundProvider'
import { useMatrixBackgroundStability } from '../../hooks/useMatrixBackgroundStability'

/**
 * Wrapper estável para o MatrixBackground que previne re-renderizações desnecessárias
 * e fornece controle fino sobre quando o background deve ser atualizado
 */
const StableMatrixBackground = ({ 
  fallbackType = 'vrchat',
  stabilityDependencies = [],
  className = "absolute inset-0 z-0",
  style = {}
}) => {
  const { isVisible, theme } = useMatrixBackground()
  const { isStable } = useMatrixBackgroundStability(stabilityDependencies)

  // Memoizar o componente de fallback para evitar re-criações
  const fallbackComponent = useMemo(() => {
    if (fallbackType === 'vrchat') {
      return (
        <VRChatLoading 
          size="lg" 
          type="default" 
          text="Inicializando Matrix..."
          className={className}
        />
      )
    }
    
    return (
      <div className={`${className} flex items-center justify-center bg-gray-900`}>
        <LoadingSpinner size="lg" />
      </div>
    )
  }, [fallbackType, className])

  // Se não estiver visível, não renderizar nada
  if (!isVisible) {
    return null
  }

  // Durante instabilidade, mostrar um background estático para evitar flicker
  if (!isStable) {
    return (
      <div 
        className={className}
        style={{
          background: theme === 'vrchat' 
            ? 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 25%, #16213e 50%, #0f3460 100%)'
            : 'linear-gradient(135deg, #0f0f23 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 100%)',
          ...style
        }}
      />
    )
  }

  return (
    <div className={className} style={style}>
      <Suspense fallback={fallbackComponent}>
        <MatrixBackground theme={theme} />
      </Suspense>
    </div>
  )
}

export default React.memo(StableMatrixBackground)
