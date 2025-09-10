import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckIcon, 
  XMarkIcon, 
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CloudArrowDownIcon,
  HeartIcon,
  StarIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  FolderIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  DocumentIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import {
  CheckIcon as CheckIconSolid,
  XMarkIcon as XMarkIconSolid,
  EyeIcon as EyeIconSolid,
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { getGoogleDriveImageUrl, getGoogleDriveAlternativeUrls, handleImageError } from '../../utils/googleDriveUtils'
import { getProxiedImageUrl, needsProxy } from '../../utils/imageProxy'
import { usePermissions } from '../../hooks/usePermissions'
import LoadingSpinner from '../ui/LoadingSpinner'
import VRChatLoading from '../ui/VRChatLoading'
import ImageWithLoading from '../ui/ImageWithLoading'

const AssetFilters = ({ filters, onFiltersChange, categories = [] }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
      >
        <FunnelIcon className="w-5 h-5" />
        Filtros
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowLeftIcon className="w-4 h-4 transform -rotate-90" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status de Aprovação */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status de Aprovação
                </label>
                <select
                  value={filters.isApproved || ''}
                  onChange={(e) => onFiltersChange({ ...filters, isApproved: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-slate-300 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                >
                  <option value="">Todos</option>
                  <option value="true">Aprovados</option>
                  <option value="false">Pendentes</option>
                </select>
              </div>

              {/* Status Ativo */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status Ativo
                </label>
                <select
                  value={filters.isActive || ''}
                  onChange={(e) => onFiltersChange({ ...filters, isActive: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-slate-300 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                >
                  <option value="">Todos</option>
                  <option value="true">Ativos</option>
                  <option value="false">Inativos</option>
                </select>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Categoria
                </label>
                <select
                  value={filters.categoryId || ''}
                  onChange={(e) => onFiltersChange({ ...filters, categoryId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-slate-300 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Busca */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Título ou descrição..."
                    value={filters.search || ''}
                    onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Botão limpar filtros */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => onFiltersChange({})}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Limpar filtros
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const AssetCard = ({ asset, onApprove, onReject, onView, onDelete, showActions = true }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      await onApprove(asset.id)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    setIsProcessing(true)
    try {
      await onReject(asset.id, rejectReason)
      setShowRejectModal(false)
      setRejectReason('')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja deletar este asset? Esta ação não pode ser desfeita.')) {
      setIsProcessing(true)
      try {
        await onDelete(asset.id)
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const getStatusBadge = () => {
    if (!asset.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-600">
          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
          Inativo
        </span>
      )
    }

    if (asset.isApproved) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-800 text-green-300 border border-green-600">
          <CheckIconSolid className="w-3 h-3 mr-1" />
          Aprovado
        </span>
      )
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-800 text-yellow-300 border border-yellow-600">
        <CalendarIcon className="w-3 h-3 mr-1" />
        Pendente
      </span>
    )
  }

  const imageUrls = useMemo(() => {
    if (asset.imageUrls) {
      if (Array.isArray(asset.imageUrls)) {
        return asset.imageUrls.map(url => needsProxy(url) ? getProxiedImageUrl(url) : getGoogleDriveImageUrl(url)).filter(Boolean)
      }
      if (typeof asset.imageUrls === 'string') {
        try {
          const parsed = JSON.parse(asset.imageUrls)
          const urls = Array.isArray(parsed) ? parsed : [parsed]
          return urls.map(url => needsProxy(url) ? getProxiedImageUrl(url) : getGoogleDriveImageUrl(url)).filter(Boolean)
        } catch {
          const url = asset.imageUrls
          const processedUrl = needsProxy(url) ? getProxiedImageUrl(url) : getGoogleDriveImageUrl(url)
          return [processedUrl].filter(Boolean)
        }
      }
    }
    
    if (asset.thumbnailUrl) {
      const processedUrl = needsProxy(asset.thumbnailUrl) ? getProxiedImageUrl(asset.thumbnailUrl) : getGoogleDriveImageUrl(asset.thumbnailUrl)
      return [processedUrl].filter(Boolean)
    }
    
    if (asset.images && Array.isArray(asset.images)) {
      return asset.images.map(url => needsProxy(url) ? getProxiedImageUrl(url) : getGoogleDriveImageUrl(url)).filter(Boolean)
    }
    
    return []
  }, [asset.imageUrls, asset.thumbnailUrl, asset.images])

  const processedThumbnailUrl = useMemo(() => {
    const url = imageUrls[0] || asset.thumbnailUrl || (asset.images && asset.images[0])
    if (!url) return null
    return needsProxy(url) ? getProxiedImageUrl(url) : getGoogleDriveImageUrl(url)
  }, [imageUrls, asset.thumbnailUrl, asset.images])

  const thumbnailUrl = processedThumbnailUrl

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10"
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-slate-900/50 overflow-hidden">
          {thumbnailUrl ? (
            <ImageWithLoading
              src={thumbnailUrl}
              alt={asset.title}
              className="w-full h-full group-hover:scale-105 transition-transform duration-300"
              loadingClassName="bg-gradient-to-br from-slate-800/50 via-slate-700/60 to-slate-900/50"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-900/50">
              <PhotoIcon className="w-16 h-16 text-slate-600" />
            </div>
          )}

          {/* Status overlay */}
          <div className="absolute top-4 left-4">
            {getStatusBadge()}
          </div>

          {/* Actions overlay */}
          {showActions && (
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onView(asset)
                }}
                className="p-2 bg-blue-500/80 hover:bg-blue-500 rounded-lg text-white transition-colors"
                title="Ver detalhes"
              >
                <EyeIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-white text-lg line-clamp-2 group-hover:text-red-400 transition-colors">
              {asset.title}
            </h3>
          </div>

          {/* Description */}
          <p className="text-slate-400 text-sm mb-4 line-clamp-3">
            {asset.description}
          </p>

          {/* Metadata */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <UserIcon className="w-4 h-4" />
              <span>{asset.user?.username || 'Usuário'}</span>
            </div>
            
            {asset.category && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <FolderIcon className="w-4 h-4" />
                <span>{asset.category.name}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-slate-400">
              <CalendarIcon className="w-4 h-4" />
              <span>{new Date(asset.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <CloudArrowDownIcon className="w-4 h-4" />
                <span>{asset.downloadCount || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <StarIcon className="w-4 h-4" />
                <span>{asset.averageRating?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2">
              {!asset.isApproved && asset.isActive && (
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 hover:border-green-600/50 rounded-lg text-green-400 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckIcon className="w-4 h-4" />
                  )}
                  Aprovar
                </button>
              )}

              {asset.isApproved && asset.isActive && (
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 hover:border-red-600/50 rounded-lg text-red-400 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <XMarkIcon className="w-4 h-4" />
                  )}
                  Rejeitar
                </button>
              )}

              {asset.isActive && (
                <button
                  onClick={handleDelete}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-red-900/20 hover:bg-red-900/30 border border-red-900/30 hover:border-red-900/50 rounded-lg text-red-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Deletar asset"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Modal de rejeição */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Rejeitar Asset
              </h3>
              
              <p className="text-slate-400 mb-4">
                Tem certeza que deseja rejeitar o asset "{asset.title}"?
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Motivo da rejeição (opcional)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Descreva o motivo da rejeição..."
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-600 rounded-lg text-slate-300 font-medium transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 hover:border-red-600/50 rounded-lg text-red-400 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Rejeitando...' : 'Rejeitar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

const AssetViewModal = ({ asset, isOpen, onClose }) => {
  if (!asset || !isOpen) return null

  const imageUrls = useMemo(() => {
    if (asset.imageUrls) {
      if (Array.isArray(asset.imageUrls)) {
        return asset.imageUrls.map(url => needsProxy(url) ? getProxiedImageUrl(url) : getGoogleDriveImageUrl(url)).filter(Boolean)
      }
      if (typeof asset.imageUrls === 'string') {
        try {
          const parsed = JSON.parse(asset.imageUrls)
          const urls = Array.isArray(parsed) ? parsed : [parsed]
          return urls.map(url => needsProxy(url) ? getProxiedImageUrl(url) : getGoogleDriveImageUrl(url)).filter(Boolean)
        } catch {
          const url = asset.imageUrls
          const processedUrl = needsProxy(url) ? getProxiedImageUrl(url) : getGoogleDriveImageUrl(url)
          return [processedUrl].filter(Boolean)
        }
      }
    }
    
    if (asset.thumbnailUrl) {
      const processedUrl = needsProxy(asset.thumbnailUrl) ? getProxiedImageUrl(asset.thumbnailUrl) : getGoogleDriveImageUrl(asset.thumbnailUrl)
      return [processedUrl].filter(Boolean)
    }
    
    if (asset.images && Array.isArray(asset.images)) {
      return asset.images.map(url => getGoogleDriveImageUrl(url)).filter(Boolean)
    }
    
    return []
  }, [asset.imageUrls, asset.thumbnailUrl, asset.images])

  const tags = useMemo(() => {
    if (Array.isArray(asset.tags)) {
      return asset.tags
    }
    if (typeof asset.tags === 'string') {
      try {
        return JSON.parse(asset.tags)
      } catch {
        return asset.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }
    }
    return []
  }, [asset.tags])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {asset.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span>Por {asset.user?.username}</span>
                    <span>•</span>
                    <span>{new Date(asset.createdAt).toLocaleDateString('pt-BR')}</span>
                    <span>•</span>
                    <span>{asset.category?.name}</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {/* Images */}
              {imageUrls.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Imagens</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="aspect-video bg-slate-900/50 rounded-lg overflow-hidden">
                        <ImageWithLoading
                          src={url}
                          alt={`${asset.title} - Imagem ${index + 1}`}
                          className="w-full h-full rounded-lg"
                          loadingClassName="bg-gradient-to-br from-slate-800/50 via-slate-700/60 to-slate-900/50"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Descrição</h3>
                <p className="text-slate-300 leading-relaxed">
                  {asset.description}
                </p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Detalhes do Arquivo</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nome do arquivo:</span>
                      <span className="text-slate-300">{asset.fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tamanho:</span>
                      <span className="text-slate-300">{(asset.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tipo:</span>
                      <span className="text-slate-300">{asset.fileType}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Estatísticas</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Downloads:</span>
                      <span className="text-slate-300">{asset.downloadCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avaliação:</span>
                      <span className="text-slate-300">{asset.averageRating?.toFixed(1) || '0.0'} ⭐</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className={`${asset.isApproved ? 'text-green-400' : 'text-yellow-400'}`}>
                        {asset.isApproved ? 'Aprovado' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-slate-700/50 border border-slate-600/50 rounded-full text-sm text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* External URL */}
              {asset.externalUrl && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Link Externo</h3>
                  <a
                    href={asset.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline break-all"
                  >
                    {asset.externalUrl}
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const AssetsSection = ({ onBack }) => {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 0, limit: 12 })
  const [filters, setFilters] = useState({})
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState({})
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const { hasPermission } = usePermissions()

  const loadCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data.data || [])
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }, [])

  const loadStats = useCallback(async () => {
    try {
      const response = await api.get('/admin/assets/stats')
      setStats(response.data.data || {})
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }, [])

  const loadAssets = useCallback(async (page = 1, currentFilters = {}) => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        page,
        limit: pagination.limit,
        ...currentFilters
      }

      const response = await api.get('/admin/assets', { params })
      
      setAssets(response.data.data || [])
      setPagination(response.data.pagination || { total: 0, pages: 0, limit: 12 })
      setCurrentPage(page)
    } catch (error) {
      console.error('Erro ao carregar assets:', error)
      setError('Erro ao carregar assets')
      toast.error('Erro ao carregar assets')
    } finally {
      setLoading(false)
    }
  }, [pagination.limit])

  const loadPendingAssets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.get('/admin/assets/pending', {
        params: { page: 1, limit: pagination.limit }
      })
      
      setAssets(response.data.data || [])
      setPagination(response.data.pagination || { total: 0, pages: 0, limit: 12 })
      setCurrentPage(1)
      setFilters({ isApproved: 'false' })
    } catch (error) {
      console.error('Erro ao carregar assets pendentes:', error)
      setError('Erro ao carregar assets pendentes')
      toast.error('Erro ao carregar assets pendentes')
    } finally {
      setLoading(false)
    }
  }, [pagination.limit])

  const handleApprove = useCallback(async (assetId) => {
    try {
      await api.put(`/admin/assets/${assetId}/approve`)
      toast.success('Asset aprovado com sucesso!')
      
      loadAssets(currentPage, filters)
      loadStats()
    } catch (error) {
      console.error('Erro ao aprovar asset:', error)
      toast.error(error.response?.data?.message || 'Erro ao aprovar asset')
    }
  }, [currentPage, filters, loadAssets, loadStats])

  const handleReject = useCallback(async (assetId, reason) => {
    try {
      await api.put(`/admin/assets/${assetId}/reject`, { reason })
      toast.success('Asset rejeitado com sucesso!')
      
      loadAssets(currentPage, filters)
      loadStats()
    } catch (error) {
      console.error('Erro ao rejeitar asset:', error)
      toast.error(error.response?.data?.message || 'Erro ao rejeitar asset')
    }
  }, [currentPage, filters, loadAssets, loadStats])

  const handleDelete = useCallback(async (assetId) => {
    try {
      await api.delete(`/admin/assets/${assetId}`)
      toast.success('Asset deletado com sucesso!')
      
      loadAssets(currentPage, filters)
      loadStats()
    } catch (error) {
      console.error('Erro ao deletar asset:', error)
      toast.error(error.response?.data?.message || 'Erro ao deletar asset')
    }
  }, [currentPage, filters, loadAssets, loadStats])

  const handleView = useCallback(async (asset) => {
    try {
      const response = await api.get(`/admin/assets/${asset.id}`)
      setSelectedAsset(response.data.data)
      setViewModalOpen(true)
    } catch (error) {
      console.error('Erro ao carregar detalhes do asset:', error)
      toast.error('Erro ao carregar detalhes do asset')
    }
  }, [])

  useEffect(() => {
    loadCategories()
    loadStats()
    loadPendingAssets()
  }, [loadCategories, loadStats, loadPendingAssets])

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      loadAssets(1, filters)
    }
  }, [filters, loadAssets])

  if (!hasPermission('manage_assets')) {
    return (
      <div className="text-center text-slate-400 py-12">
        <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4 text-red-400" />
        <h3 className="text-xl font-semibold mb-2">Acesso Negado</h3>
        <p>Você não tem permissão para gerenciar assets.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6 text-slate-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Gerenciamento de Assets</h1>
          <p className="text-slate-400">Aprovar, rejeitar e gerenciar assets da plataforma</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-blue-400', bgColor: 'bg-blue-400/20' },
          { label: 'Aprovados', value: stats.approved, color: 'text-green-400', bgColor: 'bg-green-400/20' },
          { label: 'Pendentes', value: stats.pending, color: 'text-yellow-400', bgColor: 'bg-yellow-400/20' },
          { label: 'Taxa de Aprovação', value: `${stats.approvalRate || 0}%`, color: 'text-purple-400', bgColor: 'bg-purple-400/20' }
        ].map((stat, index) => (
          <div 
            key={stat.label}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 text-center hover:bg-slate-800/70 transition-all duration-300"
          >
            <div className={`text-2xl font-bold font-mono mb-1 ${stat.color}`}>
              {stat.value || 0}
            </div>
            <div className="text-slate-400 text-sm">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => loadAssets(1, {})}
          className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 hover:border-blue-600/50 rounded-lg text-blue-400 font-medium transition-all duration-200"
        >
          Todos os Assets
        </button>
        <button
          onClick={loadPendingAssets}
          className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/30 hover:border-yellow-600/50 rounded-lg text-yellow-400 font-medium transition-all duration-200"
        >
          Assets Pendentes ({stats.pending || 0})
        </button>
      </div>

      {/* Filters */}
      <AssetFilters
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
      />

      {/* Loading State */}
      {loading && (
        <VRChatLoading 
          size="lg" 
          type="default" 
          text="Carregando assets..."
          className="rounded-lg min-h-[400px]"
        />
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">{error}</div>
          <button
            onClick={() => loadAssets(currentPage, filters)}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 font-medium transition-all duration-200"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Assets Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onApprove={handleApprove}
                onReject={handleReject}
                onView={handleView}
                onDelete={handleDelete}
                showActions={hasPermission('approve_assets') || hasPermission('delete_assets')}
              />
            ))}
          </div>

          {/* Empty State */}
          {assets.length === 0 && (
            <div className="text-center py-12">
              <DocumentIcon className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">
                Nenhum asset encontrado
              </h3>
              <p className="text-slate-500">
                Não há assets que correspondam aos filtros aplicados.
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => loadAssets(currentPage - 1, filters)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              
              <span className="text-slate-400">
                Página {currentPage} de {pagination.pages}
              </span>
              
              <button
                onClick={() => loadAssets(currentPage + 1, filters)}
                disabled={currentPage === pagination.pages}
                className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Asset View Modal */}
      <AssetViewModal
        asset={selectedAsset}
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false)
          setSelectedAsset(null)
        }}
      />
    </div>
  )
}

export default AssetsSection
