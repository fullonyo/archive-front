import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { 
  CubeIcon,
  ShoppingBagIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import AssetCard from '../components/assets/AssetCard'
import AvatarTypeSelector from '../components/categories/AvatarTypeSelector'
import CategoryCard from '../components/categories/CategoryCard'
import CategoryBreadcrumb from '../components/categories/CategoryBreadcrumb'
import AssetControls from '../components/categories/AssetControls'
import AssetsPagination from '../components/categories/AssetsPagination'
import CategoriesErrorBoundary from '../components/categories/CategoriesErrorBoundary'
import CategoryStats from '../components/categories/CategoryStats'
import TagCloud from '../components/categories/TagCloud'
import { useCategories } from '../hooks/useCategories'
import { useCategoryAssets } from '../hooks/useCategoryAssets'
import { useCategoryNavigation } from '../hooks/useCategoryNavigation'
import { useCurrentCategory } from '../hooks/useCurrentCategory'
import { useLoadingState } from '../hooks/useLoadingState'
import { VIEW_MODES } from '../constants/categories'
import useTags from '../hooks/useTags'

const CategoriesPage = () => {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  
  // Capturar tag da URL
  const selectedTagFromURL = searchParams.get('tag')
  const initialTags = useMemo(() => {
    return selectedTagFromURL ? [selectedTagFromURL] : []
  }, [selectedTagFromURL])
  
  // Custom hooks
  const { categories, loading: categoriesLoading, findCategoryById, fetchSubcategoryDetails } = useCategories()
  
  // Hook para categoria atual
  const {
    currentCategory,
    loading: categoryLoading,
    categoryName,
    categoryDescription,
    assetCount,
    isSubcategory,
    platformInfo,
    categoryId,
    subcategoryId
  } = useCurrentCategory(categories, findCategoryById, fetchSubcategoryDetails)
  
  // Hook para assets da categoria
  const { 
    assets, 
    loading: assetsLoading, 
    pagination, 
    filters,
    setSearchTerm,
    setSortBy,
    setCurrentPage,
    addTag,
    removeTag,
    resetFilters,
    hasAssets,
    isFirstPage,
    hasActiveSearch,
    hasActiveTags,
    hasActiveFilters
  } = useCategoryAssets(categoryId, subcategoryId, initialTags)
  
  // Hook para navegação de categorias
  const {
    showAvatarSelector,
    selectedCategory,
    handleCategoryClick,
    handleAvatarTypeSelect,
    closeAvatarSelector
  } = useCategoryNavigation(categories)
  
  // Hook para estados de loading
  const { 
    isMainLoading, 
    isInitialLoading, 
    isCategoryLoading, 
    isPaginationLoading 
  } = useLoadingState({
    categoriesLoading,
    assetsLoading,
    categoryLoading,
    categoryId,
    isFirstPage
  })
  
  // Local state
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID)

  // Hook para tags globais (apenas na página principal)
  const { 
    popularTags: globalPopularTags, 
    loading: globalTagsLoading 
  } = useTags(null) // null = tags globais

  // Estatísticas memoizadas
  const categoryStats = useMemo(() => {
    if (!categories?.length) return { totalAssets: 0, totalCategories: 0 }
    
    return {
      totalAssets: categories.reduce((sum, cat) => sum + (cat.asset_count || 0), 0),
      totalCategories: categories.length
    }
  }, [categories])

  // Estatísticas para a página principal - mais compactas
  const mainPageStats = useMemo(() => [
    { value: categoryStats.totalAssets, label: 'assets', color: 'text-indigo-400' },
    { value: categoryStats.totalCategories, label: 'categorias', color: 'text-purple-400' },
    { value: 2, label: 'plataformas', color: 'text-green-400' }
  ], [categoryStats])

  if (isMainLoading) {
    const loadingMessage = isInitialLoading 
      ? { title: 'Carregando categorias', subtitle: 'Preparando a melhor experiência para você...' }
      : { title: 'Carregando assets', subtitle: 'Buscando os melhores conteúdos...' }

    return (
      <CategoriesErrorBoundary>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-8 max-w-md w-full"
          >
            {/* Spinner Container - Perfeitamente Centralizado */}
            <div className="flex justify-center">
              <div className="relative">
                <LoadingSpinner size="xl" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="absolute inset-0 rounded-full border-2 border-indigo-500/20"
                />
              </div>
            </div>
            
            {/* Text Container - Alinhado com o Spinner */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white">
                {loadingMessage.title}
              </h2>
              <p className="text-slate-400 text-sm">
                {loadingMessage.subtitle}
              </p>
            </div>
          </motion.div>
        </div>
      </CategoriesErrorBoundary>
    )
  }

  return (
    <CategoriesErrorBoundary>
      {/* Discord Button */}
      <motion.a
        href="https://discord.gg/vrchieve"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-slate-900/80 backdrop-blur-sm border border-[#5865F2]/30 hover:border-[#5865F2]/60 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-[#5865F2]/20 group"
      >
        <svg 
          viewBox="0 0 71 55" 
          className="w-5 h-5 text-[#5865F2]/70 group-hover:text-[#5865F2] transition-colors"
          fill="currentColor"
        >
          <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
        </svg>
      </motion.a>

      <div className="container-max section-padding py-6">
        {/* Loading indicator para transições */}
        {isPaginationLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-full px-4 py-2 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-slate-300 font-medium">Carregando...</span>
            </div>
          </motion.div>
        )}

        {/* Compact Header */}
        <div className="mb-8">
          <CategoryBreadcrumb currentCategory={currentCategory} />
          
          {/* Stats for main page - compact */}
          {!currentCategory && !selectedTagFromURL && (
            <div className="flex items-center justify-between mt-4 mb-6">
              <h1 className="text-2xl font-bold text-white">Explorar Categorias</h1>
              <CategoryStats stats={mainPageStats} compact={true} delay={0.2} />
            </div>
          )}

          {/* Header for tag filtering */}
          {!currentCategory && selectedTagFromURL && (
            <div className="flex items-center justify-between mt-4 mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-white">
                  Assets com tag "{selectedTagFromURL}"
                </h1>
                {hasAssets && (
                  <div className="flex items-center gap-1 text-sm text-slate-400">
                    <span className="font-medium text-indigo-400">{assets.length}</span>
                    <span>assets encontrados</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Minimal Category Info */}
          {currentCategory && (
            <div className="flex items-center justify-between mt-4 mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-white">
                  {categoryName}
                </h1>
                
                {/* Compact Asset Count */}
                <div className="flex items-center gap-1 text-sm text-slate-400">
                  <span className="font-medium text-indigo-400">{assetCount}</span>
                  <span>assets</span>
                </div>
              </div>
              
              {/* Platform Badge - Compact */}
              {platformInfo && (
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/40 border border-slate-700/40 rounded-full text-sm">
                  {platformInfo.icon === 'shopping-bag' ? (
                    <ShoppingBagIcon className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <GlobeAltIcon className="w-4 h-4 text-purple-400" />
                  )}
                  <span className="text-slate-300">{platformInfo.name}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {!currentCategory && !selectedTagFromURL ? (
          /* Category Grid */
          <div className="space-y-8">
            {/* Tags Populares */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <TagCloud
                tags={globalPopularTags}
                loading={globalTagsLoading}
                title="Tags Mais Populares"
                emptyMessage="Explore as categorias para descobrir tags incríveis!"
                maxVisible={15}
                className="mb-8"
                navigationMode={true}
                categoryId={categoryId}
              />
            </motion.div>

            {/* Categories Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {categories.map((category, index) => (
                <CategoryCard  
                  key={category.id} 
                  category={category} 
                  onCategoryClick={handleCategoryClick}
                  index={index}
                />
              ))}
            </motion.div>
          </div>
        ) : (
          /* Category Assets */
          <div>
            {/* Controls */}
            <AssetControls
              searchTerm={filters.searchTerm}
              onSearchChange={setSearchTerm}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={filters.sortBy}
              onSortChange={setSortBy}
              totalResults={pagination.total || 0}
              isLoading={isPaginationLoading}
              categoryId={categoryId}
              selectedTags={filters.selectedTags}
              onTagSelect={addTag}
              onTagRemove={removeTag}
              showAdvancedFilters={true}
            />

            {/* Assets Grid/List */}
            {hasAssets ? (
              <>
                <div className={`grid gap-6 ${
                  viewMode === VIEW_MODES.GRID 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {assets.map((asset, index) => (
                    <AssetCard 
                      key={asset.id}
                      asset={asset}
                      index={index}
                      aspectRatio="square"
                      showActions={true}
                      className=""
                    />
                  ))}
                </div>
                
                {/* Pagination */}
                <AssetsPagination 
                  pagination={pagination}
                  onPageChange={setCurrentPage}
                  isLoading={isPaginationLoading}
                />
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center py-20"
              >
                <div className="relative">
                  {/* Empty State Icon */}
                  <div className="relative mx-auto w-32 h-32 mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 to-slate-800/20 rounded-full"></div>
                    <div className="absolute inset-4 bg-gradient-to-br from-slate-600/10 to-slate-700/10 rounded-full"></div>
                    <CubeIcon className="absolute inset-8 w-16 h-16 text-slate-500" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3">
                    Nenhum asset encontrado
                  </h3>
                  
                  <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
                    {hasActiveSearch 
                      ? `Não encontramos assets para "${filters.searchTerm}"`
                      : 'Esta categoria ainda não possui assets'
                    }
                  </p>

                  {/* Suggestions */}
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500">Tente:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {hasActiveSearch && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSearchTerm('')}
                          className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 hover:border-indigo-500/50 rounded-lg text-indigo-400 text-sm font-medium transition-all duration-200"
                        >
                          Limpar filtros
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.history.back()}
                        className="px-4 py-2 bg-slate-700/20 hover:bg-slate-700/30 border border-slate-600/30 hover:border-slate-600/50 rounded-lg text-slate-400 text-sm font-medium transition-all duration-200"
                      >
                        Voltar
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Avatar Type Selector Modal */}
        <AvatarTypeSelector
          isOpen={showAvatarSelector}
          onClose={closeAvatarSelector}
          onTypeSelect={handleAvatarTypeSelect}
          category={selectedCategory}
        />
      </div>
    </CategoriesErrorBoundary>
  )
}

export default CategoriesPage