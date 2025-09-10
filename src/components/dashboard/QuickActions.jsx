import React from 'react'
import { Link } from 'react-router-dom'
import { 
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

const QuickActions = ({ userType = 'free', className = '' }) => {
  const getActionsForUser = () => {
    const baseActions = [
      {
        title: 'Buscar Assets',
        description: 'Explore nossa coleção',
        icon: MagnifyingGlassIcon,
        href: '/marketplace',
        color: 'blue',
        available: true
      },
      {
        title: 'Favoritos',
        description: 'Seus assets salvos',
        icon: HeartIcon,
        href: '/favorites',
        color: 'pink',
        available: true
      },
      {
        title: 'Configurações',
        description: 'Gerenciar perfil',
        icon: Cog6ToothIcon,
        href: '/profile',
        color: 'slate',
        available: true
      }
    ]

    const premiumActions = [
      {
        title: 'Upload Assets',
        description: 'Compartilhe suas criações',
        icon: CloudArrowUpIcon,
        href: '/upload',
        color: 'indigo',
        available: true,
        featured: true
      },
      {
        title: 'Analytics',
        description: 'Veja suas estatísticas',
        icon: ChartBarIcon,
        href: '/analytics',
        color: 'green',
        available: true
      }
    ]

    const adminActions = [
      {
        title: 'Gerenciar Usuários',
        description: 'Administrar comunidade',
        icon: UserGroupIcon,
        href: '/admin/users',
        color: 'purple',
        available: true
      }
    ]

    let actions = [...baseActions]
    
    if (userType === 'premium' || userType === 'admin') {
      actions = [...premiumActions, ...actions]
    }
    
    if (userType === 'admin') {
      actions = [...actions, ...adminActions]
    }

    return actions
  }

  const colorClasses = {
    indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500',
    blue: 'from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500',
    green: 'from-green-500 to-green-600 hover:from-green-400 hover:to-green-500',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500',
    pink: 'from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500',
    slate: 'from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500'
  }

  const actions = getActionsForUser()

  return (
    <div className={clsx('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {actions.map((action, index) => {
        const Icon = action.icon
        
        return (
          <Link
            key={index}
            to={action.href}
            className={clsx(
              'group relative overflow-hidden rounded-xl border transition-all duration-300',
              'hover:scale-[1.02] hover:shadow-xl',
              action.available 
                ? 'border-slate-700/50 hover:border-slate-600/50 bg-slate-800/50'
                : 'border-slate-700/30 bg-slate-800/30 cursor-not-allowed opacity-60'
            )}
          >
            {/* Featured badge */}
            {action.featured && (
              <div className="absolute top-3 right-3 z-10">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 text-xs font-bold px-2 py-1 rounded-full">
                  ✨ PREMIUM
                </div>
              </div>
            )}

            {/* Background gradient */}
            <div className={clsx(
              'absolute inset-0 opacity-5 transition-opacity duration-300',
              action.available && 'group-hover:opacity-10',
              `bg-gradient-to-br ${colorClasses[action.color]}`
            )} />

            <div className="relative p-6">
              <div className="flex items-start space-x-4">
                <div className={clsx(
                  'p-3 rounded-xl shadow-lg transition-all duration-300',
                  action.available && 'group-hover:scale-110 group-hover:shadow-xl',
                  `bg-gradient-to-br ${colorClasses[action.color]}`
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={clsx(
                    'text-lg font-semibold mb-1 transition-colors',
                    action.available 
                      ? 'text-white group-hover:text-indigo-400' 
                      : 'text-slate-500'
                  )}>
                    {action.title}
                  </h3>
                  <p className={clsx(
                    'text-sm leading-relaxed',
                    action.available ? 'text-slate-400' : 'text-slate-600'
                  )}>
                    {action.description}
                  </p>
                  
                  {!action.available && (
                    <div className="mt-2">
                      <span className="text-xs text-orange-400 font-medium">
                        🔒 Requer upgrade
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export default QuickActions
