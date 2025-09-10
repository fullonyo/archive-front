import React from 'react'
import { motion } from 'framer-motion'

const CategoryStats = ({ stats, delay = 0, compact = false }) => {
  if (!stats?.length) return null

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="flex items-center gap-4 text-sm text-slate-400"
      >
        {stats.map((stat, index) => (
          <div key={stat.label} className="flex items-center gap-1">
            <span className={`font-medium ${stat.color || 'text-indigo-400'}`}>
              {stat.value}
            </span>
            <span>{stat.label}</span>
          </div>
        ))}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-xl mx-auto"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: delay + (index * 0.05) }}
          className="text-center p-3 bg-slate-800/20 border border-slate-700/20 rounded-lg hover:bg-slate-800/30 transition-colors"
        >
          <div className={`text-lg font-bold mb-1 ${stat.color || 'text-indigo-400'}`}>
            {stat.value}
          </div>
          <div className="text-xs text-slate-400">{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default CategoryStats
