import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CloudArrowDownIcon,
  HeartIcon,
  TagIcon,
  UserCircleIcon,
  ClockIcon,
  LinkIcon,
  InformationCircleIcon,
  EyeIcon,
  StarIcon,
  DocumentTextIcon,
  FolderIcon,
  CalendarIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  CubeIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  ShareIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { assetsAPI } from '../services/api'
import DefaultAvatar from '../components/ui/DefaultAvatar'
import ImageCarousel from '../components/ui/ImageCarousel'
import ImageWithLoading from '../components/ui/ImageWithLoading'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { getGoogleDriveImageUrl, handleImageError } from '../utils/googleDriveUtils'
import { getProxiedImageUrl, needsProxy } from '../utils/imageProxy'
import { processTags } from '../utils/tagUtils'
import toast from 'react-hot-toast'

const AssetDetailPage = () => {
  const { id } = useParams()
  const [asset, setAsset] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('Fetching asset with ID:', id)
        
        const response = await assetsAPI.getAsset(id)
        console.log('Asset response:', response.data)
        
        if (response.data.success && response.data.data?.asset) {
          const assetData = response.data.data.asset
          console.log('Asset data received:', assetData)
          console.log('Asset createdAt:', assetData.createdAt, typeof assetData.createdAt)
          console.log('Asset updatedAt:', assetData.updatedAt, typeof assetData.updatedAt)
          console.log('User createdAt:', assetData.user?.createdAt, typeof assetData.user?.createdAt)
          
          setAsset(assetData)
          setIsLiked(response.data.data.isLiked || false)
        } else {
          throw new Error('Asset not found or invalid response')
        }
      } catch (err) {
        console.error('Error fetching asset:', err)
        setError(err.message || 'Failed to load asset')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchAsset()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-400">Carregando asset...</p>
        </div>
      </div>
    )
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <InformationCircleIcon className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Asset não encontrado</h2>
          <p className="text-gray-400 mb-4">{error || 'O asset que você está procurando não existe.'}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  const handleLike = async () => {
    try {
      await assetsAPI.toggleFavorite(id)
      setIsLiked(!isLiked)
      setAsset(prev => ({
        ...prev,
        _count: {
          ...prev._count,
          favorites: prev._count.favorites + (isLiked ? -1 : 1)
        }
      }))
    } catch (err) {
      console.error('Error toggling like:', err)
    }
  }

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      
      // Toast de carregamento
      const loadingToast = toast.loading('Preparando download...')
      
      const response = await assetsAPI.downloadAsset(id)
      
      // Get the download URL from the response
      const downloadUrl = response.data?.data?.download_url
      
      if (downloadUrl) {
        // Fechar toast de carregamento
        toast.dismiss(loadingToast)
        
        // Open download URL in new tab - Google Drive will handle the download
        window.open(downloadUrl, '_blank')
        
        // Update download count in UI
        setAsset(prev => ({
          ...prev,
          downloadCount: (prev.downloadCount || 0) + 1
        }))
        
        // Show success message
        toast.success('Download iniciado com sucesso!')
        console.log('Download started for:', downloadUrl)
      } else {
        throw new Error('Download URL not found')
      }
    } catch (err) {
      console.error('Error downloading asset:', err)
      toast.error('Erro ao iniciar download. Tente novamente.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: asset.title,
        text: asset.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copiado para a área de transferência!')
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    
    try {
      const date = new Date(dateString)
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString)
        return 'Data inválida'
      }
      
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      console.error('Error formatting date:', error, dateString)
      return 'Erro na data'
    }
  }

  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A'
    
    try {
      const date = new Date(dateString)
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString)
        return 'Data inválida'
      }
      
      return date.toLocaleDateString('pt-BR')
    } catch (error) {
      console.error('Error formatting date:', error, dateString)
      return 'Erro na data'
    }
  }

  const formatMemberSince = (dateString) => {
    if (!dateString) return 'Data não disponível'
    
    try {
      const date = new Date(dateString)
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString)
        return 'Data inválida'
      }
      
      return date.toLocaleDateString('pt-BR', { 
        month: 'long', 
        year: 'numeric' 
      })
    } catch (error) {
      console.error('Error formatting date:', error, dateString)
      return 'Erro na data'
    }
  }

  const getStatusBadge = () => {
    if (asset.isApproved) {
      return (
        <div className="inline-flex items-center px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
          <ShieldCheckIcon className="w-4 h-4 mr-2" />
          Aprovado
        </div>
      )
    } else {
      return (
        <div className="inline-flex items-center px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
          <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
          Pendente
        </div>
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
        <div className="pt-20 px-4">
          <div className="max-w-6xl mx-auto py-8">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-700 rounded-2xl h-96"></div>
                  <div className="grid grid-cols-4 gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="aspect-square bg-gray-700 rounded-lg"></div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="h-8 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                  <div className="flex space-x-4">
                    <div className="h-4 bg-gray-700 rounded w-16"></div>
                    <div className="h-4 bg-gray-700 rounded w-16"></div>
                    <div className="h-4 bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
        <div className="pt-20 px-4 flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <InformationCircleIcon className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Asset não encontrado</h2>
            <p className="text-gray-400 mb-6">{error || 'O asset solicitado não existe.'}</p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors"
            >
              Voltar
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 px-4">
      <div className="max-w-7xl mx-auto py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-8">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRightIcon className="w-4 h-4" />
            <Link to="/categories" className="hover:text-white transition-colors">Categorias</Link>
            <ChevronRightIcon className="w-4 h-4" />
            <Link to={`/categories/${asset.categoryId}`} className="hover:text-white transition-colors">
              {asset.category?.name}
            </Link>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-white font-medium truncate">{asset.title}</span>
          </nav>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Coluna Principal - Imagens e Informações */}
            <div className="xl:col-span-2 space-y-8">
              {/* Galeria de Imagens */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden"
              >
                <ImageCarousel
                  images={asset.imageUrls}
                  aspectRatio="[16/9]"
                  showControls={true}
                  showDots={true}
                  className="group"
                  fallbackImage={asset.thumbnailUrl || `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=450&fit=crop&crop=center&auto=format&q=80`}
                />
              </motion.div>

              {/* Título e Descrição */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">{asset.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      {/* Categoria */}
                      <div className="inline-flex items-center px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-full text-sm font-medium">
                        <FolderIcon className="w-4 h-4 mr-2" />
                        {asset.category?.name || 'Categoria não especificada'}
                      </div>
                      
                      {/* Status */}
                      {getStatusBadge()}
                    </div>
                  </div>

                  {/* Botão de Compartilhar */}
                  <button
                    onClick={handleShare}
                    className="flex items-center px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg transition-colors"
                  >
                    <ShareIcon className="w-4 h-4 mr-2" />
                    Compartilhar
                  </button>
                </div>

                {/* Descrição */}
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                    {asset.description}
                  </p>
                </div>

                {/* Tags */}
                {(() => {
                  const tags = processTags(asset.tags);
                  return tags && tags.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-700/50">
                      <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
                        <TagIcon className="w-4 h-4 mr-2" />
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Link
                            key={tag}
                            to={`/search?tags=${encodeURIComponent(tag)}`}
                            className="px-3 py-1 bg-gray-700/50 hover:bg-indigo-500/20 text-gray-300 hover:text-indigo-400 rounded-full text-sm transition-colors cursor-pointer"
                          >
                            #{tag}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </motion.div>

              {/* Informações Técnicas */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8"
              >
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <InformationCircleIcon className="w-6 h-6 mr-3 text-indigo-400" />
                  Informações Técnicas
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Arquivo */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide flex items-center">
                      <DocumentTextIcon className="w-4 h-4 mr-2" />
                      Arquivo
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Nome:</span>
                        <span className="text-white font-medium">{asset.fileName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tamanho:</span>
                        <span className="text-white font-medium">{formatFileSize(asset.fileSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tipo:</span>
                        <span className="text-white font-medium">{asset.fileType || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Datas */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Datas
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Criado:</span>
                        <span className="text-white font-medium">
                          {formatDate(asset.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Atualizado:</span>
                        <span className="text-white font-medium">
                          {formatDate(asset.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar - Ações e Informações do Uploader */}
            <div className="space-y-6">
              {/* Card de Ações */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6"
              >
                {/* Estatísticas */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-400">
                      {(asset.downloadCount || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center justify-center">
                      <CloudArrowDownIcon className="w-3 h-3 mr-1" />
                      Downloads
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-400">
                      {(asset._count?.favorites || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center justify-center">
                      <HeartIcon className="w-3 h-3 mr-1" />
                      Likes
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {asset.averageRating ? asset.averageRating.toFixed(1) : '—'}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center justify-center">
                      <StarIcon className="w-3 h-3 mr-1" />
                      Rating
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="space-y-3">
                  {/* Download Button */}
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className={`w-full ${
                      isDownloading 
                        ? 'bg-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transform hover:scale-[1.02] active:scale-[0.98]'
                    } text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center transition-all duration-300 shadow-lg`}
                  >
                    <CloudArrowDownIcon className={`w-5 h-5 mr-3 ${isDownloading ? 'animate-spin' : ''}`} />
                    {isDownloading ? 'Baixando...' : 'Download'}
                  </button>

                  {/* Like Button */}
                  <button
                    onClick={handleLike}
                    className={`w-full px-6 py-3 rounded-xl font-semibold flex items-center justify-center transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                      isLiked
                        ? 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white'
                        : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600 hover:border-pink-500/50'
                    }`}
                  >
                    {isLiked ? (
                      <HeartSolidIcon className="w-5 h-5 mr-2" />
                    ) : (
                      <HeartIcon className="w-5 h-5 mr-2" />
                    )}
                    {isLiked ? 'Curtido' : 'Curtir'}
                  </button>

                  {/* External Link Button */}
                  {(asset.externalUrl || asset.external_url) && (
                    <a
                      href={asset.externalUrl || asset.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-xl font-semibold transition-all duration-300 border border-gray-600 hover:border-indigo-500/50 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <ArrowTopRightOnSquareIcon className="w-5 h-5 mr-2" />
                      Ver Original
                    </a>
                  )}
                </div>
              </motion.div>

              {/* Card do Uploader */}
              {asset.user && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6"
                >
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <UserCircleIcon className="w-5 h-5 mr-2 text-indigo-400" />
                    Uploader
                  </h3>
                  
                  <Link to={`/profile/${asset.user.id}`} className="group block">
                    <div className="flex items-center space-x-4 p-4 bg-gray-700/30 hover:bg-gray-600/30 rounded-xl transition-colors">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        {asset.user.avatar ? (
                          <ImageWithLoading
                            src={needsProxy(asset.user.avatar) ? getProxiedImageUrl(asset.user.avatar) : getGoogleDriveImageUrl(asset.user.avatar)}
                            alt={asset.user.username}
                            className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-600 group-hover:ring-indigo-500 transition-colors"
                            loadingClassName="bg-gradient-to-br from-slate-800/50 via-slate-700/60 to-slate-900/50 rounded-full ring-2 ring-gray-600"
                            enableRetry={true}
                            maxRetries={2}
                            retryDelay={500}
                          />
                        ) : null}
                        <DefaultAvatar 
                          username={asset.user.username} 
                          size="lg"
                          className={`absolute inset-0 ring-2 ring-gray-600 group-hover:ring-indigo-500 transition-colors ${asset.user.avatar ? 'hidden' : 'flex'}`}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white group-hover:text-indigo-400 transition-colors truncate">
                          {asset.user.username}
                        </h4>
                        <p className="text-sm text-gray-400 capitalize">
                          {asset.user.accountType?.toLowerCase() || 'Usuário'}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          Membro desde {formatMemberSince(asset.user.createdAt)}
                        </div>
                      </div>
                      
                      <ChevronRightIcon className="w-5 h-5 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </Link>

                  {/* Bio do uploader se disponível */}
                  {asset.user.bio && (
                    <div className="mt-4 p-4 bg-gray-700/20 rounded-lg">
                      <p className="text-sm text-gray-300 italic">"{asset.user.bio}"</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Card de Informações Adicionais */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6"
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <CubeIcon className="w-5 h-5 mr-2 text-indigo-400" />
                  Detalhes
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-400 flex items-center">
                      <FolderIcon className="w-4 h-4 mr-2" />
                      ID do Asset
                    </span>
                    <span className="text-white font-mono text-sm">#{asset.id}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-400 flex items-center">
                      <EyeIcon className="w-4 h-4 mr-2" />
                      Visualizações
                    </span>
                    <span className="text-white font-medium">{(asset.viewCount || 0).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-400 flex items-center">
                      <ArrowPathIcon className="w-4 h-4 mr-2" />
                      Última Atualização
                    </span>
                    <span className="text-white font-medium">
                      {formatDateShort(asset.updatedAt)}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default AssetDetailPage
