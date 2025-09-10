import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SparklesIcon, ArrowPathIcon, CloudArrowUpIcon, UserIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

const VRChatLoading = ({ 
  size = 'md',
  type = 'default',
  text = null,
  className = '',
  showText = true,
  ...props 
}) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'p-4',
      icon: 'w-6 h-6',
      text: 'text-xs',
      dots: 'w-1 h-1'
    },
    md: {
      container: 'p-8',
      icon: 'w-8 h-8',
      text: 'text-sm',
      dots: 'w-1.5 h-1.5'
    },
    lg: {
      container: 'p-12',
      icon: 'w-12 h-12',
      text: 'text-base',
      dots: 'w-2 h-2'
    },
    xl: {
      container: 'p-16',
      icon: 'w-16 h-16',
      text: 'text-lg',
      dots: 'w-3 h-3'
    }
  }

  // Type configurations
  const typeConfig = {
    default: {
      icon: SparklesIcon,
      text: 'Loading...',
      gradient: 'from-blue-900/30 via-purple-800/40 to-cyan-700/30',
      iconColor: 'text-cyan-400'
    },
    upload: {
      icon: CloudArrowUpIcon,
      text: 'Uploading Asset...',
      gradient: 'from-green-900/30 via-blue-800/40 to-teal-700/30',
      iconColor: 'text-emerald-400'
    },
    processing: {
      icon: Cog6ToothIcon,
      text: 'Processing...',
      gradient: 'from-purple-900/30 via-pink-800/40 to-rose-700/30',
      iconColor: 'text-rose-400'
    },
    refresh: {
      icon: ArrowPathIcon,
      text: 'Refreshing...',
      gradient: 'from-indigo-900/30 via-blue-800/40 to-cyan-700/30',
      iconColor: 'text-blue-400'
    },
    user: {
      icon: UserIcon,
      text: 'Loading Profile...',
      gradient: 'from-violet-900/30 via-purple-800/40 to-indigo-700/30',
      iconColor: 'text-violet-400'
    }
  }

  const config = typeConfig[type] || typeConfig.default
  const sizes = sizeConfig[size]
  const IconComponent = config.icon
  const displayText = text || config.text

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${config.gradient} ${className}`} {...props}>
      {/* Animated gradient shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%] animate-[shimmer_2.5s_ease-in-out_infinite]" />
      
      {/* Main loading content */}
      <div className={`relative flex flex-col items-center justify-center space-y-3 ${sizes.container}`}>
        {/* Animated icon */}
        <motion.div
          className="relative"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: type === 'processing' || type === 'refresh' ? [0, 360] : [0, 0]
          }}
          transition={{ 
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 3, repeat: Infinity, ease: "linear" }
          }}
        >
          <IconComponent className={`${sizes.icon} ${config.iconColor}`} />
          {/* Icon glow effect */}
          <motion.div
            className={`absolute inset-0 ${config.iconColor.replace('text-', 'bg-')} blur-md opacity-40`}
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        </motion.div>
        
        {/* Loading text */}
        {showText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${sizes.text} ${config.iconColor.replace('400', '300/80')} font-medium tracking-wider uppercase`}
          >
            {displayText}
          </motion.div>
        )}
        
        {/* Animated progress dots */}
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`${sizes.dots} ${config.iconColor.replace('text-', 'bg-').replace('400', '400/60')} rounded-full`}
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
    </div>
  )
}

export default VRChatLoading
