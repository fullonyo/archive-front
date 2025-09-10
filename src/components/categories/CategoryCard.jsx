import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { getCategoryDisplayInfo } from '../../utils/categoryUtils'

const CategoryCard = ({ category, onCategoryClick }) => {
  const { IconComponent, colorClasses, isAvatarCategory } = getCategoryDisplayInfo(category)

  return (
    <Link
      to={isAvatarCategory ? '#' : `/categories/${category.id}`}
      onClick={(e) => onCategoryClick(category, e)}
      className="group relative overflow-hidden rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10"
      aria-label={`Explorar categoria ${category.display_name}`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses} shadow-lg`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <ChevronRightIcon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
          {category.display_name}
        </h3>
        
        <p className="text-slate-400 text-sm mb-4 leading-relaxed">
          {category.description}
        </p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 font-medium">
              {category.asset_count} assets
            </span>
            {isAvatarCategory && (
              <div className="inline-flex items-center bg-indigo-500/20 border border-indigo-500/30 rounded-full px-2 py-0.5">
                <span className="text-xs text-indigo-400 font-medium">2 Tipos</span>
              </div>
            )}
          </div>
          <span className="text-slate-500">
            {isAvatarCategory ? 'Selecionar →' : 'Explorar →'}
          </span>
        </div>
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  )
}

export default CategoryCard
