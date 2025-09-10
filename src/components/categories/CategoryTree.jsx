import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ChevronDownIcon,
  ChevronRightIcon,
  UserCircleIcon,
  GlobeAltIcon,
  SparklesIcon,
  StarIcon,
  WrenchScrewdriverIcon,
  CubeIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'

const iconMap = {
  'user-circle': UserCircleIcon,
  'globe-alt': GlobeAltIcon,
  'sparkles': SparklesIcon,
  'star': StarIcon,
  'wrench-screwdriver': WrenchScrewdriverIcon,
  'cube': CubeIcon,
  'ellipsis-horizontal': EllipsisHorizontalIcon,
  'user': UserCircleIcon,
  'cog-6-tooth': WrenchScrewdriverIcon,
  'shopping-bag': CubeIcon,
  'building-storefront': CubeIcon,
  'device-phone-mobile': GlobeAltIcon,
  'computer-desktop': GlobeAltIcon,
  'user-group': UserCircleIcon,
  'puzzle-piece': CubeIcon,
  'rectangle-stack': SparklesIcon,
  'square-3-stack-3d': SparklesIcon,
  'rectangle-group': SparklesIcon,
  'shoe-prints': SparklesIcon,
  'eye': StarIcon,
  'adjustments-horizontal': WrenchScrewdriverIcon,
  'code-bracket': WrenchScrewdriverIcon,
  'photo': CubeIcon,
  'squares-2x2': CubeIcon,
  'musical-note': CubeIcon,
  'play': CubeIcon
}

const colorMap = {
  indigo: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
  blue: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  purple: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  pink: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
  green: 'text-green-400 border-green-500/30 bg-green-500/10',
  orange: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  gray: 'text-gray-400 border-gray-500/30 bg-gray-500/10'
}

const CategoryTree = ({ categories, selectedCategoryId, onCategorySelect }) => {
  const [expandedCategories, setExpandedCategories] = useState({})

  const mainCategories = categories.filter(cat => !cat.parent_id)
  const getSubcategories = (parentId) => 
    categories.filter(cat => cat.parent_id === parentId)

  const toggleExpanded = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  const CategoryItem = ({ category, level = 0 }) => {
    const IconComponent = iconMap[category.icon] || CubeIcon
    const subcategories = getSubcategories(category.id)
    const hasSubcategories = subcategories.length > 0
    const isExpanded = expandedCategories[category.id]
    const isSelected = selectedCategoryId === category.id
    const colorClasses = colorMap[category.color] || colorMap.gray

    return (
      <div className="mb-2">
        <div
          className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer ${
            isSelected 
              ? `${colorClasses} border shadow-lg` 
              : 'hover:bg-slate-800/50 text-slate-300 hover:text-white'
          }`}
          style={{ paddingLeft: `${0.75 + level * 1.5}rem` }}
          onClick={() => {
            if (hasSubcategories) {
              toggleExpanded(category.id)
            }
            onCategorySelect(category.id)
          }}
        >
          <div className="flex items-center min-w-0 flex-1">
            <IconComponent className="w-5 h-5 flex-shrink-0" />
            <div className="flex items-center ml-3 min-w-0 gap-2">
              <span className="font-medium truncate">
                {category.display_name}
              </span>
              {category.asset_count && (
                <span className="text-sm text-slate-400 flex-shrink-0">
                  ({category.asset_count})
                </span>
              )}
              {category.subcategories_count && (
                <span className="px-1.5 py-0.5 text-xs rounded-md bg-slate-800/50 text-slate-400 flex-shrink-0">
                  {category.subcategories_count} tipos
                </span>
              )}
            </div>
          </div>

          {hasSubcategories && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded(category.id)
              }}
              className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0 ml-2"
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Subcategorias */}
        {hasSubcategories && isExpanded && (
          <div className="ml-4 mt-2 space-y-1">
            {subcategories.map(subcategory => (
              <CategoryItem
                key={subcategory.id}
                category={subcategory}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <CubeIcon className="w-5 h-5 mr-2 text-indigo-400" />
        Categorias
      </h3>
      
      <div className="space-y-2">
        <div
          className={`flex items-center p-3 rounded-lg transition-all duration-200 cursor-pointer ${
            !selectedCategoryId 
              ? 'text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 shadow-lg' 
              : 'hover:bg-slate-800/50 text-slate-300 hover:text-white'
          }`}
          onClick={() => onCategorySelect(null)}
        >
          <EllipsisHorizontalIcon className="w-5 h-5 mr-3" />
          <span className="font-medium">Todas as Categorias</span>
        </div>

        {mainCategories.map(category => (
          <CategoryItem
            key={category.id}
            category={category}
          />
        ))}
      </div>
    </div>
  )
}

export default CategoryTree
