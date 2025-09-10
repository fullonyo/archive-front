import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  XMarkIcon, 
  ShoppingBagIcon, 
  GlobeAltIcon,
  UserIcon,
  StarIcon,
  ArrowRightIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { AVATAR_SUBCATEGORIES } from '../../constants/categories'

const AvatarTypeSelector = ({ isOpen, onClose, onTypeSelect, category }) => {
  const [selectedType, setSelectedType] = useState(null)
  const [showSubcategories, setShowSubcategories] = useState(false)

  const avatarTypes = [
    {
      id: 'booth',
      name: 'Avatar Booth',
      description: 'Avatares disponíveis na plataforma Booth',
      icon: ShoppingBagIcon,
      color: 'indigo',
      gradient: 'from-indigo-500 to-blue-500',
      subcategoryId: AVATAR_SUBCATEGORIES.BOOTH,
      stats: { count: 127, trending: 'up' }
    },
    {
      id: 'gumroad',
      name: 'Avatar Gumroad', 
      description: 'Avatares disponíveis na plataforma Gumroad',
      icon: GlobeAltIcon,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500',
      subcategoryId: AVATAR_SUBCATEGORIES.GUMROAD,
      stats: { count: 89, trending: 'up' }
    }
  ]

  const handleTypeSelect = (type) => {
    setSelectedType(type)
    setShowSubcategories(true)
  }

  const handleConfirm = () => {
    if (selectedType) {
      onTypeSelect(selectedType)
      onClose()
    }
  }

  const handleBack = () => {
    setShowSubcategories(false)
    setSelectedType(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/25 overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {showSubcategories && (
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-slate-400" />
                </button>
              )}
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {showSubcategories ? selectedType?.name : 'Selecionar Tipo de Avatar'}
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  {showSubcategories 
                    ? 'Escolha uma subcategoria específica'
                    : 'Escolha a plataforma de origem do avatar'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors group"
            >
              <XMarkIcon className="w-6 h-6 text-slate-400 group-hover:text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showSubcategories ? (
            /* Type Selection */
            <div className="space-y-4">
              {avatarTypes.map((type) => {
                const Icon = type.icon
                return (
                  <div
                    key={type.id}
                    onClick={() => handleTypeSelect(type)}
                    className={clsx(
                      'group relative p-5 rounded-xl border cursor-pointer transition-all duration-300',
                      'hover:scale-[1.02] hover:shadow-xl',
                      selectedType?.id === type.id
                        ? 'border-indigo-500/50 bg-indigo-500/10 shadow-lg shadow-indigo-500/20'
                        : 'border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/30'
                    )}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 rounded-xl opacity-5">
                      <div className={`w-full h-full bg-gradient-to-br ${type.gradient}`} />
                    </div>

                    <div className="relative flex items-start justify-between">
                      <div className="flex space-x-4">
                        <div className={clsx(
                          'w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-all duration-300',
                          `bg-gradient-to-br ${type.gradient}`,
                          'group-hover:scale-110 group-hover:shadow-xl'
                        )}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        
                        <div>
                          <h3 className="text-base font-semibold text-white group-hover:text-indigo-400 transition-colors">
                            {type.name}
                          </h3>
                          <p className="text-slate-400 text-sm mt-1 max-w-md leading-relaxed">
                            {type.description}
                          </p>
                          
                          {/* Stats */}
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="inline-flex items-center px-2 py-1 rounded-md bg-slate-800/50 text-xs text-slate-400">
                              <UserIcon className="w-3 h-3 mr-1.5" />
                              <span>{type.stats.count} avatares</span>
                            </div>
                            <div className="inline-flex items-center px-2 py-1 rounded-md bg-green-500/10 text-xs text-green-400">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse" />
                              <span>Trending {type.stats.trending === 'up' ? '↗' : '↘'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <ArrowRightIcon className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Subcategory Confirmation */
            <div className="text-center space-y-6">
              <div className="relative">
                <div className={clsx(
                  'w-24 h-24 mx-auto rounded-2xl flex items-center justify-center shadow-2xl',
                  `bg-gradient-to-br ${selectedType.gradient}`
                )}>
                  <selectedType.icon className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-slate-900">
                  <StarIcon className="w-4 h-4 text-white" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {selectedType.name}
                </h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  Você será direcionado para explorar {selectedType.description.toLowerCase()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 justify-center pt-4">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 rounded-xl font-medium transition-all duration-200"
                >
                  Voltar
                </button>
                <Link
                  to={`/categories/1/${selectedType.subcategoryId}`}
                  onClick={onClose}
                  className={clsx(
                    'px-8 py-3 rounded-xl font-medium text-white transition-all duration-300',
                    `bg-gradient-to-r ${selectedType.gradient}`,
                    'hover:scale-105 hover:shadow-xl shadow-lg',
                    'flex items-center space-x-2'
                  )}
                >
                  <span>Explorar {selectedType.name}</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AvatarTypeSelector
