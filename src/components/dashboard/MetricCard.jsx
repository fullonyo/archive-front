import React from 'react'
import { clsx } from 'clsx'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon,
  color = 'indigo',
  isLoading = false 
}) => {
  const colorClasses = {
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600', 
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600'
  }

  const changeClasses = {
    positive: 'text-green-400',
    negative: 'text-red-400', 
    neutral: 'text-slate-400'
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            <div className="w-10 h-10 bg-slate-700 rounded-lg"></div>
          </div>
          <div className="h-8 bg-slate-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-slate-700 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
          {title}
        </h4>
        {Icon && (
          <div className={clsx(
            'p-2.5 rounded-lg shadow-lg transition-all duration-300 group-hover:scale-110',
            `bg-gradient-to-br ${colorClasses[color]} shadow-${color}-500/25`
          )}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
      
      <div className="mb-2">
        <div className="text-2xl md:text-3xl font-bold text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </div>
      
      {change !== undefined && (
        <div className="flex items-center space-x-1">
          {changeType === 'positive' && <ArrowUpIcon className="w-3 h-3 text-green-400" />}
          {changeType === 'negative' && <ArrowDownIcon className="w-3 h-3 text-red-400" />}
          <span className={clsx('text-xs font-medium', changeClasses[changeType])}>
            {typeof change === 'number' ? 
              `${change > 0 ? '+' : ''}${change}%` : 
              change
            }
          </span>
          <span className="text-xs text-slate-500">vs último mês</span>
        </div>
      )}
    </div>
  )
}

export default MetricCard
