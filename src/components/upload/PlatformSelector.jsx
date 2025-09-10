import React from 'react'
import { motion } from 'framer-motion'

const PlatformSelector = ({ platforms, selected, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-4">
        Plataformas Compatíveis
      </label>
      <div className="grid grid-cols-3 gap-4">
        {platforms.map(platform => {
          const Icon = platform.icon
          const isSelected = selected.includes(platform.id)
          
          return (
            <motion.button
              key={platform.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (isSelected) {
                  onChange(selected.filter(id => id !== platform.id))
                } else {
                  onChange([...selected, platform.id])
                }
              }}
              className={`relative p-6 rounded-xl border backdrop-blur-sm ${
                isSelected
                  ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/50 text-indigo-300 shadow-lg shadow-indigo-500/10'
                  : 'bg-gray-800/30 border-gray-700/50 text-gray-400 hover:bg-gray-800/40 hover:border-gray-600/50'
              } transition-all duration-200`}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className={`p-3 rounded-lg ${isSelected ? 'bg-indigo-500/20' : 'bg-gray-800/50'} transition-colors`}>
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-indigo-300' : 'text-gray-400'}`} />
                </div>
                <span className="text-sm font-medium text-center leading-tight">
                  {platform.name}
                </span>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 border-2 border-indigo-500/50 rounded-xl"
                  layoutId="platformSelection"
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default PlatformSelector
