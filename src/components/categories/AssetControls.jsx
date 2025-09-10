import React, { useState } from 'react'
import { 
  MagnifyingGlassIcon,
  Squares2X2Icon as GridViewIcon,
  ListBulletIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { VIEW_MODES, SORT_OPTIONS } from '../../constants/categories'
import LoadingSpinner from '../ui/LoadingSpinner'
import TagFilter from './TagFilter'
import { motion, AnimatePresence } from 'framer-motion'

const AssetControls = ({ 
  searchTerm, 
  onSearchChange, 
  viewMode, 
  onViewModeChange, 
  sortBy, 
  onSortChange,
  totalResults = 0,
  isLoading = false,
  categoryId = null,
  selectedTags = [],
  onTagSelect,
  onTagRemove,
  showAdvancedFilters = true
}) => {
  const [showFilters, setShowFilters] = useState(false)
  
  const hasActiveFilters = searchTerm.length > 0 || selectedTags.length > 0
  
  const clearAllFilters = () => {
    onSearchChange('')
    selectedTags.forEach(tag => onTagRemove?.(tag))
  }

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Results Counter */}
      {totalResults > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-slate-400">
            <span>{totalResults} result{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}</span>
            {isLoading && (
              <div className="ml-3">
                <LoadingSpinner size="sm" />
              </div>
            )}
            {hasActiveFilters && (
              <div className="ml-3 flex items-center gap-2">
                <span className="text-xs bg-indigo-600/20 text-indigo-300 px-2 py-1 rounded-full">
                  {selectedTags.length + (searchTerm ? 1 : 0)} filtro{hasActiveFilters ? 's' : ''}
                </span>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <XMarkIcon className="w-3 h-3" />
                  Limpar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Main Search Bar */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar assets..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Buscar assets"
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
          {/* Advanced Filters Toggle */}
          {showAdvancedFilters && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                showFilters || selectedTags.length > 0
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              aria-label="Filtros avançados"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Filtros</span>
              {selectedTags.length > 0 && (
                <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                  {selectedTags.length}
                </span>
              )}
            </button>
          )}

          {/* View Mode */}
          <div className="flex items-center space-x-2" role="group" aria-label="Modo de visualização">
            <button
              onClick={() => onViewModeChange(VIEW_MODES.GRID)}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                viewMode === VIEW_MODES.GRID 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
              aria-label="Visualização em grade"
              aria-pressed={viewMode === VIEW_MODES.GRID}
            >
              <GridViewIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewModeChange(VIEW_MODES.LIST)}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                viewMode === VIEW_MODES.LIST 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
              aria-label="Visualização em lista"
              aria-pressed={viewMode === VIEW_MODES.LIST}
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            disabled={isLoading}
            className="px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
            aria-label="Ordenar por"
          >
            <option value={SORT_OPTIONS.NEWEST}>Mais recentes</option>
            <option value={SORT_OPTIONS.POPULAR}>Mais populares</option>
            <option value={SORT_OPTIONS.DOWNLOADS}>Mais baixados</option>
            <option value={SORT_OPTIONS.NAME}>Nome A-Z</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              Filtros Avançados
            </h3>
            
            {/* Tag Filter */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Filtrar por Tags
                </label>
                <TagFilter
                  selectedTags={selectedTags}
                  onTagSelect={onTagSelect}
                  onTagRemove={onTagRemove}
                  categoryId={categoryId}
                  placeholder="Buscar tags específicas..."
                  showPopularTags={true}
                  maxPopularTags={12}
                />
              </div>
              
              {/* Placeholder para outros filtros futuros */}
              {/* 
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
                // Adicionar mais filtros aqui no futuro:
                // - Filtro por tipo de arquivo
                // - Filtro por data
                // - Filtro por tamanho
                // - Filtro por rating
              </div>
              */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AssetControls
