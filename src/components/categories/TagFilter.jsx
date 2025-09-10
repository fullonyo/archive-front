import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HashtagIcon, 
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import Tag from '../ui/Tag'
import LoadingSpinner from '../ui/LoadingSpinner'
import useTags from '../../hooks/useTags'

const TagFilter = ({ 
  selectedTags = [], 
  onTagSelect, 
  onTagRemove, 
  categoryId = null,
  placeholder = "Buscar por tags...",
  className = "",
  showPopularTags = true,
  maxPopularTags = 8
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)
  const searchTimeoutRef = useRef(null)
  
  const { 
    popularTags, 
    loading: popularLoading,
    tags: searchResultsFromHook,
    searchTags
  } = useTags(categoryId)

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Buscar tags com debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchTerm.length >= 2) {
      setIsSearching(true)
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          await searchTags(searchTerm)
        } catch (error) {
          console.error('Erro ao buscar tags:', error)
        } finally {
          setIsSearching(false)
        }
      }, 300)
    } else {
      setIsSearching(false)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm, searchTags])

  const handleTagClick = (tag) => {
    const isSelected = selectedTags.some(t => 
      (typeof t === 'string' ? t : t.name) === (typeof tag === 'string' ? tag : tag.name)
    )
    
    if (isSelected) {
      onTagRemove?.(tag)
    } else {
      onTagSelect?.(tag)
    }
  }

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value)
    if (!isOpen) setIsOpen(true)
  }

  const handleSearchInputFocus = () => {
    setIsOpen(true)
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  const clearAllTags = () => {
    selectedTags.forEach(tag => onTagRemove?.(tag))
  }

  const tagsToShow = searchTerm.length >= 2 ? searchResultsFromHook : popularTags
  const isLoading = searchTerm.length >= 2 ? isSearching : popularLoading

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input de busca */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <HashtagIcon className="h-5 w-5 text-slate-400" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearchInputChange}
          onFocus={handleSearchInputFocus}
          className="block w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <FunnelIcon className="h-5 w-5 text-slate-400" />
          )}
        </div>
      </div>

      {/* Tags selecionadas */}
      <AnimatePresence>
        {selectedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-300">
                Tags Selecionadas ({selectedTags.length})
              </span>
              <button
                onClick={clearAllTags}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Limpar todas
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag, index) => (
                <Tag
                  key={index}
                  variant="primary"
                  removable
                  onRemove={() => onTagRemove?.(tag)}
                >
                  {typeof tag === 'string' ? tag : tag.name}
                </Tag>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown de tags */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-80 overflow-hidden"
          >
            {isLoading ? (
              <div className="p-4 text-center">
                <LoadingSpinner size="md" />
                <p className="text-slate-400 text-sm mt-2">
                  {searchTerm.length >= 2 ? 'Buscando tags...' : 'Carregando tags populares...'}
                </p>
              </div>
            ) : tagsToShow.length > 0 ? (
              <div className="overflow-y-auto max-h-80">
                <div className="p-3 border-b border-slate-700">
                  <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <MagnifyingGlassIcon className="w-4 h-4" />
                    {searchTerm.length >= 2 ? 'Resultados da Busca' : 'Tags Populares'}
                    <span className="bg-slate-700 px-2 py-0.5 rounded-full text-xs">
                      {tagsToShow.length}
                    </span>
                  </h4>
                </div>
                <div className="p-3 space-y-2">
                  {tagsToShow.slice(0, searchTerm.length >= 2 ? 10 : maxPopularTags).map((tag, index) => {
                    const tagName = typeof tag === 'string' ? tag : tag.name
                    const isSelected = selectedTags.some(t => 
                      (typeof t === 'string' ? t : t.name) === tagName
                    )
                    
                    return (
                      <motion.button
                        key={tagName}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleTagClick(tag)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors text-left ${
                          isSelected 
                            ? 'bg-indigo-600/30 text-indigo-300' 
                            : 'hover:bg-slate-700/50 text-slate-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <HashtagIcon className="w-4 h-4" />
                          {tagName}
                        </span>
                        {tag.count && (
                          <span className="text-xs bg-slate-700/50 px-2 py-1 rounded-full">
                            {tag.count}
                          </span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center">
                <HashtagIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">
                  {searchTerm.length >= 2 
                    ? `Nenhuma tag encontrada para "${searchTerm}"`
                    : 'Nenhuma tag disponível'
                  }
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TagFilter
