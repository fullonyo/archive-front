import React from 'react'
import { motion } from 'framer-motion'
import { SparklesIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

const LoadingSpinner = ({ size = 'md', className, text = null, ...props }) => {
  const sizeConfig = {
    sm: {
      container: 'p-2',
      icon: 'w-4 h-4',
      text: 'text-xs',
      dots: 'w-1 h-1'
    },
    md: {
      container: 'p-4',
      icon: 'w-6 h-6',
      text: 'text-sm',
      dots: 'w-1.5 h-1.5'
    },
    lg: {
      container: 'p-6',
      icon: 'w-8 h-8',
      text: 'text-base',
      dots: 'w-2 h-2'
    },
    xl: {
      container: 'p-8',
      icon: 'w-12 h-12',
      text: 'text-lg',
      dots: 'w-2.5 h-2.5'
    }
  }

  const config = sizeConfig[size]

  return (
    <div className={clsx('flex flex-col items-center justify-center', config.container, className)} {...props}>
      {/* Animated icon */}
      <motion.div
        className="relative"
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 360]
        }}
        transition={{ 
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 3, repeat: Infinity, ease: "linear" }
        }}
      >
        <SparklesIcon className={`${config.icon} text-cyan-400`} />
        {/* Icon glow effect */}
        <motion.div
          className={`absolute inset-0 bg-cyan-400 blur-md opacity-40`}
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      </motion.div>
      
      {/* Loading text */}
      {text && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`mt-2 text-cyan-300/80 font-medium tracking-wider uppercase ${config.text}`}
        >
          {text}
        </motion.div>
      )}
      
      {/* Animated progress dots */}
      <div className="flex space-x-1 mt-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`${config.dots} bg-cyan-400/60 rounded-full`}
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
  )
}

export default LoadingSpinner 