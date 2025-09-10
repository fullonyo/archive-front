import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'

// Context para gerenciar o estado global do MatrixBackground
const MatrixBackgroundContext = createContext({
  isVisible: true,
  theme: 'vrchat',
  setTheme: () => {},
  hide: () => {},
  show: () => {},
})

export const useMatrixBackground = () => {
  const context = useContext(MatrixBackgroundContext)
  if (!context) {
    throw new Error('useMatrixBackground deve ser usado dentro de MatrixBackgroundProvider')
  }
  return context
}

export const MatrixBackgroundProvider = ({ children, defaultTheme = 'vrchat' }) => {
  const [theme, setTheme] = useState(defaultTheme)
  const [isVisible, setIsVisible] = useState(true)

  const hide = useCallback(() => {
    setIsVisible(false)
  }, [])

  const show = useCallback(() => {
    setIsVisible(true)
  }, [])

  const handleSetTheme = useCallback((newTheme) => {
    if (newTheme === 'vrchat' || newTheme === 'default') {
      setTheme(newTheme)
    }
  }, [])

  const contextValue = useMemo(() => ({
    isVisible,
    theme,
    setTheme: handleSetTheme,
    hide,
    show,
  }), [isVisible, theme, handleSetTheme, hide, show])

  return (
    <MatrixBackgroundContext.Provider value={contextValue}>
      {children}
    </MatrixBackgroundContext.Provider>
  )
}

export default MatrixBackgroundProvider
