import React, { useEffect, useRef, useMemo, useCallback } from 'react'

// Definir temas de cores como constante fora do componente para evitar recriação
const THEMES = {
  default: {
    background: ['#0f0f23', '#1e1b4b', '#312e81', '#1e1b4b'],
    shapes: {
      primary: 'rgba(99, 102, 241, 0.15)',
      secondary: 'rgba(139, 92, 246, 0.1)',
      tertiary: 'rgba(59, 130, 246, 0.05)',
      stroke: 'rgba(99, 102, 241, 0.4)'
    },
    particles: [
      'rgba(99, 102, 241, {alpha})',
      'rgba(139, 92, 246, {alpha})',
      'rgba(59, 130, 246, {alpha})',
      'rgba(34, 197, 94, {alpha})'
    ],
    lines: 'rgba(139, 92, 246, 0.2)'
  },
  vrchat: {
    background: ['#0a0a0f', '#1a0a2e', '#16213e', '#0f3460'],
    shapes: {
      primary: 'rgba(0, 255, 255, 0.25)',
      secondary: 'rgba(255, 0, 255, 0.2)',
      tertiary: 'rgba(50, 255, 50, 0.15)',
      stroke: 'rgba(0, 255, 255, 0.8)'
    },
    particles: [
      'rgba(0, 255, 255, {alpha})',    // Ciano vibrante
      'rgba(255, 0, 255, {alpha})',    // Magenta vibrante
      'rgba(50, 255, 50, {alpha})',    // Verde limão
      'rgba(255, 50, 255, {alpha})',   // Rosa neon
      'rgba(0, 255, 150, {alpha})',    // Verde água
      'rgba(255, 255, 0, {alpha})'     // Amarelo neon
    ],
    lines: 'rgba(0, 255, 255, 0.4)'
  }
}

const MatrixBackground = React.memo(({ theme = 'vrchat' }) => {
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)
  const shapesRef = useRef([])
  const isInitializedRef = useRef(false)

  // Memoizar validação do tema
  const validTheme = useMemo(() => {
    return typeof theme === 'string' && (theme === 'vrchat' || theme === 'default') ? theme : 'vrchat'
  }, [theme])

  // Memoizar tema atual
  const currentTheme = useMemo(() => {
    return THEMES[validTheme] || THEMES.default
  }, [validTheme])

  // Função para criar shapes memoizada
  const createShapes = useCallback((width, height) => {
    const shapes = []
    for (let i = 0; i < 15; i++) {
      shapes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 100 + 50,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: Math.random() * 0.1 + 0.05,
        type: Math.floor(Math.random() * 3)
      })
    }
    return shapes
  }, [])

  // Função de desenho otimizada
  const drawShape = useCallback((ctx, shape, theme) => {
    ctx.save()
    ctx.globalAlpha = shape.opacity
    ctx.translate(shape.x, shape.y)
    ctx.rotate(shape.rotation)
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, shape.size)
    gradient.addColorStop(0, theme.shapes.primary)
    gradient.addColorStop(0.5, theme.shapes.secondary)
    gradient.addColorStop(1, theme.shapes.tertiary)
    
    ctx.fillStyle = gradient
    ctx.strokeStyle = theme.shapes.stroke
    ctx.lineWidth = validTheme === 'vrchat' ? 2 : 1

    ctx.beginPath()
    if (shape.type === 0) {
      ctx.moveTo(0, -shape.size/2)
      ctx.lineTo(-shape.size/2, shape.size/2)
      ctx.lineTo(shape.size/2, shape.size/2)
      ctx.closePath()
    } else if (shape.type === 1) {
      ctx.rect(-shape.size/2, -shape.size/2, shape.size, shape.size)
    } else {
      ctx.arc(0, 0, shape.size/2, 0, Math.PI * 2)
    }
    
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }, [validTheme])

  // Função de redimensionamento otimizada
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const rect = canvas.getBoundingClientRect()
      const devicePixelRatio = window.devicePixelRatio || 1
      
      // Configurar tamanho do canvas com otimização para alta DPI
      canvas.width = rect.width * devicePixelRatio
      canvas.height = rect.height * devicePixelRatio
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(devicePixelRatio, devicePixelRatio)
      }
      
      // Recriar shapes apenas se o tamanho mudou significativamente
      if (!shapesRef.current.length || Math.abs(canvas.width - rect.width) > 100) {
        shapesRef.current = createShapes(rect.width, rect.height)
      }
    } catch (error) {
      console.error('MatrixBackground: Error in handleResize:', error)
    }
  }, [createShapes])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let ctx
    try {
      ctx = canvas.getContext('2d')
      if (!ctx) {
        console.warn('MatrixBackground: Failed to get 2D context')
        return
      }
    } catch (error) {
      console.error('MatrixBackground: Error getting canvas context:', error)
      return
    }
    
    // Inicialização única
    if (!isInitializedRef.current) {
      handleResize()
      isInitializedRef.current = true
    }

    // Função de animação otimizada
    const animate = () => {
      try {
        const rect = canvas.getBoundingClientRect()
        
        // Gradient background baseado no tema
        const gradient = ctx.createLinearGradient(0, 0, 0, rect.height)
        currentTheme.background.forEach((color, index) => {
          gradient.addColorStop(index / (currentTheme.background.length - 1), color)
        })
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, rect.width, rect.height)

        // Desenhar e atualizar formas geométricas
        shapesRef.current.forEach(shape => {
          shape.rotation += shape.rotationSpeed
          drawShape(ctx, shape, currentTheme)
        })

        animationFrameRef.current = requestAnimationFrame(animate)
      } catch (error) {
        console.error('MatrixBackground: Error in animation frame:', error)
        // Continuar animação mesmo com erro para evitar travamento
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    // Iniciar animação
    animate()

    // Event listener para resize
    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      try {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
        window.removeEventListener('resize', handleResize)
      } catch (error) {
        console.error('MatrixBackground: Error in cleanup:', error)
      }
    }
  }, [validTheme, currentTheme, handleResize, drawShape]) // Dependências essenciais apenas

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 w-full h-full"
        style={{ 
          background: '#000',
          imageRendering: 'optimizeSpeed' // Otimização de performance
        }}
        aria-hidden="true"
      />
      <div 
        className={`absolute inset-0 z-10 pointer-events-none ${
          validTheme === 'vrchat' 
            ? 'bg-gradient-to-br from-black/20 via-transparent to-black/30' 
            : 'bg-gradient-to-br from-black/40 via-transparent to-black/40'
        }`} 
      />
    </>
  )
})

// Adicionar displayName para debugging
MatrixBackground.displayName = 'MatrixBackground'

export default MatrixBackground
