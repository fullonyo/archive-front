import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UserCircleIcon,
  TagIcon,
  CubeIcon,
  FilmIcon,
  GlobeAltIcon,
  SparklesIcon,
  StarIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import VRChatLoading from '../ui/VRChatLoading'

// Mapeamento de ícones
const iconMap = {
  'user-circle': UserCircleIcon,
  'globe-alt': GlobeAltIcon,
  'sparkles': SparklesIcon,
  'star': StarIcon,
  'wrench-screwdriver': WrenchScrewdriverIcon,
  'cube': CubeIcon,
}

const CategorySelector = ({ value, onChange }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      const categoriesData = response.data || []
      
      // Mapear para o formato esperado pelo componente
      const mappedCategories = categoriesData.map(category => ({
        id: category.id, // Usar ID numérico da API
        name: category.display_name,
        icon: iconMap[category.icon] || CubeIcon,
        description: category.description
      }))
      
      setCategories(mappedCategories)
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Fallback para categorias estáticas em caso de erro
      setCategories([
        {
          id: 'avatar',
          name: 'Avatar',
          icon: UserCircleIcon,
          description: 'Modelos 3D completos'
        },
        {
          id: 'clothes',
          name: 'Roupas',
          icon: TagIcon,
          description: 'Vestuário e acessórios'
        },
        {
          id: 'asset',
          name: 'Asset',
          icon: CubeIcon,
          description: 'Props e objetos'
        }
      ])
    } finally {
      setLoading(false)
    }
  }
  if (loading) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Categoria
        </label>
        <VRChatLoading 
          size="sm" 
          type="default" 
          text="Carregando categorias..."
          className="rounded-lg min-h-[120px]"
        />
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-3">
        Categoria
      </label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {categories.map(category => {
          const Icon = category.icon
          return (
            <motion.button
              key={category.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(category.id)}
              className={`relative p-4 rounded-lg border ${
                value === category.id
                  ? 'bg-indigo-500/20 border-indigo-500'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              } transition-colors group`}
            >
              <div className="flex flex-col items-center">
                <Icon className={`w-8 h-8 mb-2 ${
                  value === category.id
                    ? 'text-indigo-400'
                    : 'text-gray-400 group-hover:text-gray-300'
                }`} />
                <span className={`text-sm font-medium ${
                  value === category.id
                    ? 'text-indigo-300'
                    : 'text-gray-300'
                }`}>
                  {category.name}
                </span>
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {category.description}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default CategorySelector
