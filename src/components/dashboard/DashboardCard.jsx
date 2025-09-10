import React from 'react'
import { clsx } from 'clsx'

const DashboardCard = ({ 
  children, 
  title, 
  subtitle,
  icon: Icon,
  className = '',
  headerAction,
  isLoading = false,
  error = null
}) => {
  return (
    <div className={clsx(
      'bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden',
      'hover:border-slate-600/50 transition-all duration-300',
      className
    )}>
      {/* Header */}
      {(title || Icon || headerAction) && (
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg">
                <Icon className="w-5 h-5 text-indigo-400" />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-white">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {headerAction && (
            <div className="flex items-center space-x-2">
              {headerAction}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {error ? (
          <div className="text-center py-8">
            <div className="text-red-400 text-sm">{error}</div>
          </div>
        ) : isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            <div className="h-4 bg-slate-700 rounded w-2/3"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

export default DashboardCard
