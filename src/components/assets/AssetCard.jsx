import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  HeartIcon,
  ArrowDownTrayIcon,
  StarIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import ImageCarousel from '../ui/ImageCarousel'
import { processTags } from '../../utils/tagUtils'
import { assetsAPI } from '../../services/api'
import toast from 'react-hot-toast'

const AssetCard = ({ 
  asset, 
  index = 0, 
  showActions = true, 
  aspectRatio = '[4/3]',
  onFavorite = null,
  className = ''
}) => {
  
  const handleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onFavorite) {
      onFavorite(asset.id, !asset.is_favorited)
    }
  }

  const handleDownload = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const loadingToast = toast.loading('Preparando download...')
      
      const response = await assetsAPI.downloadAsset(asset.id)
      
      if (response.data.success && response.data.data.download_url) {
        toast.dismiss(loadingToast)
        
        window.open(response.data.data.download_url, '_blank')
        
        toast.success('Download iniciado!')
      } else {
        throw new Error('URL de download não encontrada')
      }
    } catch (error) {
      console.error('Erro no download:', error)
      toast.error('Erro ao iniciar download. Tente novamente.')
    }
  }

  const handleExternalLink = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (asset.externalUrl || asset.external_url || asset.sourceUrl || asset.source_url) {
      const externalUrl = asset.externalUrl || asset.external_url || asset.sourceUrl || asset.source_url
      window.open(externalUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const hasExternalLink = asset.externalUrl || asset.external_url || asset.sourceUrl || asset.source_url

  const tags = processTags(asset.tags)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className={`group relative ${className}`}
    >
      <Link
        to={`/asset/${asset.id}`}
        className="block bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300"
      >
        {/* Image Carousel */}
        <ImageCarousel
          images={asset.imageUrls}
          aspectRatio={aspectRatio}
          showControls={true}
          showDots={true}
          className="group"
          fallbackImage={asset.thumbnailUrl || asset.thumbnail_url}
        />
        
        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">
            {asset.title}
          </h3>
          
          <p className="text-slate-400 text-sm mb-3 line-clamp-2">
            {asset.description}
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-slate-500">
              Por {asset.user?.username || asset.uploader?.username || asset.uploader_username}
            </span>
            <div className="flex items-center space-x-3">
              <span className="text-indigo-400 font-medium flex items-center">
                <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                {asset.downloadCount || asset.download_count || 0}
              </span>
              {asset.averageRating || asset.average_rating ? (
                <span className="text-yellow-400 font-medium flex items-center">
                  <StarIcon className="w-4 h-4 mr-1" />
                  {(asset.averageRating || asset.average_rating).toFixed(1)}
                </span>
              ) : null}
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.slice(0, 3).map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-2 py-1 bg-slate-600/50 text-slate-400 text-xs rounded-full">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Category */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500">
              {asset.category?.name}
            </span>
            <span className="text-xs text-slate-500">
              {new Date(asset.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Download Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className={`${hasExternalLink ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors`}
              aria-label="Download asset"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Download
            </motion.button>

            {/* External Link Button */}
            {hasExternalLink && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExternalLink}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
                aria-label="Open external link"
                title="Abrir link original (Booth/Gumroad)"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Actions overlay (visible on hover) */}
        {showActions && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex space-x-2">
              {onFavorite && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFavorite}
                  className="p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
                  aria-label={asset.is_favorited ? "Remove from favorites" : "Add to favorites"}
                >
                  {asset.is_favorited ? (
                    <HeartSolidIcon className="w-4 h-4 text-red-400" />
                  ) : (
                    <HeartIcon className="w-4 h-4 text-white" />
                  )}
                </motion.button>
              )}
            </div>
          </div>
        )}
      </Link>
    </motion.div>
  )
}

export default AssetCard
