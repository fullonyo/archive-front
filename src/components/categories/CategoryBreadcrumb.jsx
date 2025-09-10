import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

const CategoryBreadcrumb = ({ currentCategory }) => {
  if (!currentCategory) return null

  return (
    <nav className="flex items-center space-x-2 mb-2" aria-label="Breadcrumb">
      <Link 
        to="/categories" 
        className="text-slate-400 hover:text-white transition-colors"
      >
        Categorias
      </Link>
      <ChevronRightIcon className="w-4 h-4 text-slate-500" />
      <Link 
        to={`/categories/${currentCategory.id}`}
        className="text-slate-400 hover:text-white transition-colors"
      >
        {currentCategory.display_name}
      </Link>
      {currentCategory.subcategory && (
        <>
          <ChevronRightIcon className="w-4 h-4 text-slate-500" />
          <span className="text-indigo-400 font-medium">
            {currentCategory.subcategory.display_name}
          </span>
        </>
      )}
    </nav>
  )
}

export default CategoryBreadcrumb
