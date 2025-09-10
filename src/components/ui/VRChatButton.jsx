import React from 'react'
import { motion } from 'framer-motion'
import { SparklesIcon, ArrowPathIcon, CloudArrowUpIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

const VRChatButton = ({ 
  children,
  loading = false,
  loadingText = 'Carregando...',
  loadingType = 'default',
  disabled = false,
  className = '',
  variant = 'primary',
  size = 'md',
  onClick,
  ...props
}) => {
  // Loading icon based on type
  const getLoadingIcon = () => {
    switch (loadingType) {
      case 'upload':
        return CloudArrowUpIcon
      case 'processing':
        return Cog6ToothIcon
      case 'refresh':
        return ArrowPathIcon
      default:
        return SparklesIcon
    }
  }

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: 'px-3 py-1.5',
      text: 'text-sm',
      icon: 'w-4 h-4',
      dots: 'w-1 h-1'
    },
    md: {
      padding: 'px-4 py-2',
      text: 'text-sm',
      icon: 'w-4 h-4',
      dots: 'w-1.5 h-1.5'
    },
    lg: {
      padding: 'px-6 py-3',
      text: 'text-base',
      icon: 'w-5 h-5',
      dots: 'w-1.5 h-1.5'
    }
  }

  // Variant configurations
  const variantConfig = {
    primary: {
      base: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-indigo-500/50',
      hover: 'hover:from-indigo-600 hover:to-indigo-700 hover:border-indigo-400/50',
      loading: 'bg-gradient-to-r from-indigo-500/70 to-indigo-600/70 text-indigo-100',
      disabled: 'bg-gray-600 text-gray-400 border-gray-600/50'
    },
    secondary: {
      base: 'bg-gray-800/50 text-gray-300 border-gray-700/50',
      hover: 'hover:bg-gray-700/50 hover:text-white hover:border-gray-600/50',
      loading: 'bg-gray-800/70 text-gray-400',
      disabled: 'bg-gray-800/30 text-gray-500 border-gray-700/30'
    },
    danger: {
      base: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-500/50',
      hover: 'hover:from-red-600 hover:to-red-700 hover:border-red-400/50',
      loading: 'bg-gradient-to-r from-red-500/70 to-red-600/70 text-red-100',
      disabled: 'bg-gray-600 text-gray-400 border-gray-600/50'
    },
    success: {
      base: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-500/50',
      hover: 'hover:from-emerald-600 hover:to-emerald-700 hover:border-emerald-400/50',
      loading: 'bg-gradient-to-r from-emerald-500/70 to-emerald-600/70 text-emerald-100',
      disabled: 'bg-gray-600 text-gray-400 border-gray-600/50'
    }
  }

  const sizes = sizeConfig[size]
  const variantStyles = variantConfig[variant]
  const LoadingIcon = getLoadingIcon()

  const getButtonStyle = () => {
    if (disabled && !loading) return variantStyles.disabled
    if (loading) return variantStyles.loading
    return `${variantStyles.base} ${variantStyles.hover}`
  }

  const isDisabled = disabled || loading

  return (
    <motion.button
      className={`
        relative inline-flex items-center justify-center gap-2 
        ${sizes.padding} ${sizes.text}
        border backdrop-blur-sm rounded-lg
        font-medium transition-all duration-200
        ${getButtonStyle()}
        ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'}
        ${className}
      `}
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {loading && (
        <>
          {/* Loading background overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded-lg" />
          
          {/* Loading content */}
          <div className="relative flex items-center gap-2">
            {/* Animated loading icon */}
            <motion.div
              animate={{ 
                rotate: loadingType === 'processing' || loadingType === 'refresh' ? [0, 360] : [0, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <LoadingIcon className={sizes.icon} />
            </motion.div>
            
            {/* Loading text */}
            <span>{loadingText}</span>
            
            {/* Animated dots */}
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={`${sizes.dots} bg-current rounded-full`}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}
      
      {!loading && (
        <span className="relative">{children}</span>
      )}
    </motion.button>
  )
}

export default VRChatButton
