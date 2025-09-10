import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { HashtagIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import Tag from '../ui/Tag'
import LoadingSpinner from '../ui/LoadingSpinner'

const TagCloud = ({ 
  tags = [], 
  selectedTags = [], 
  onTagSelect, 
  onTagRemove,
  loading = false,
  maxVisible = 12,
  title = "Tags Populares",
  emptyMessage = "Nenhuma tag encontrada",
  className = "",
  navigationMode = false, // Novo prop para controlar se é navegação ou seleção
  categoryId = null // Categoria atual para navegação contextual
}) => {
  const [showAll, setShowAll] = useState(false)
  const navigate = useNavigate()
  
  // Processar e ordenar tags por popularidade
  const processedTags = useMemo(() => {
    return tags
      .filter(tag => tag.name && tag.name.trim() !== '')
      .sort((a, b) => (b.count || 0) - (a.count || 0))
  }, [tags])
  
  // Tags visíveis baseado no estado showAll
  const visibleTags = useMemo(() => {
    return showAll ? processedTags : processedTags.slice(0, maxVisible)
  }, [processedTags, showAll, maxVisible])
  
  const hasMoreTags = processedTags.length > maxVisible
  
  const handleTagClick = (tag) => {
    if (navigationMode) {
      // Modo navegação: redireciona para a página de categorias com filtro de tag
      const params = new URLSearchParams()
      params.set('tag', tag.name)
      
      if (categoryId) {
        navigate(`/categories/${categoryId}?${params.toString()}`)
      } else {
        navigate(`/categories?${params.toString()}`)
      }
    } else {
      // Modo seleção: comportamento original
      if (selectedTags.some(t => t.name === tag.name)) {
        // Tag já selecionada - remover
        onTagRemove?.(tag)
      } else {
        // Tag não selecionada - adicionar
        onTagSelect?.(tag)
      }
    }
  }
  
  if (loading) {
    return (
      <div className={`bg-slate-800/30 rounded-xl p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <HashtagIcon className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      </div>
    )
  }
  
  if (!processedTags.length) {
    return (
      <div className={`bg-slate-800/30 rounded-xl p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <HashtagIcon className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <p className="text-slate-400 text-center py-4">{emptyMessage}</p>
      </div>
    )
  }
  
  return (
    <div className={`bg-slate-800/30 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <HashtagIcon className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <span className="text-sm text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full">
            {processedTags.length}
          </span>
        </div>
        
        {hasMoreTags && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {showAll ? (
              <>
                Mostrar menos <ChevronUpIcon className="w-4 h-4" />
              </>
            ) : (
              <>
                Ver todas <ChevronDownIcon className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={showAll ? 'all' : 'limited'}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap gap-2"
        >
          {visibleTags.map((tag, index) => {
            const isSelected = selectedTags.some(t => t.name === tag.name)
            
            return (
              <motion.div
                key={tag.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Tag
                  variant={isSelected ? 'selected' : 'clickable'}
                  onClick={() => handleTagClick(tag)}
                  className="group"
                >
                  <span>{tag.name}</span>
                  {tag.count && (
                    <span className="ml-1 text-xs opacity-70 group-hover:opacity-100 transition-opacity">
                      {tag.count}
                    </span>
                  )}
                </Tag>
              </motion.div>
            )
          })}
        </motion.div>
      </AnimatePresence>
      
      {selectedTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-4 border-t border-slate-700/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-slate-300">Tags Selecionadas:</span>
            <button
              onClick={() => selectedTags.forEach(tag => onTagRemove?.(tag))}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Limpar todas
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Tag
                key={tag.name}
                variant="primary"
                removable
                onRemove={() => onTagRemove?.(tag)}
              >
                {tag.name}
              </Tag>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default TagCloud
