import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const PageTransition = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <div className="relative">
      {/* Transition overlay */}
      <div
        className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-300 ${
          isTransitioning 
            ? 'opacity-100' 
            : 'opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-pink-900/20" />
        
        {/* Matrix particles effect during transition */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            >
              <div className="w-1 h-1 bg-indigo-400 rounded-full shadow-lg shadow-indigo-400/50" />
            </div>
          ))}
        </div>
      </div>

      {/* Page content */}
      <div
        className={`transition-all duration-500 ease-out ${
          isTransitioning 
            ? 'opacity-0 transform scale-95' 
            : 'opacity-100 transform scale-100'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

export default PageTransition
