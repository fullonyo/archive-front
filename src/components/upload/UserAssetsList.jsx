import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import useUserAssets from '../../hooks/useUserAssets'
import { useAuth } from '../../contexts/AuthContext'
import { getGoogleDriveImageUrl, handleImageError } from '../../utils/googleDriveUtils'
import { getProxiedImageUrl, needsProxy } from '../../utils/imageProxy'
import ImageWithLoading from '../ui/ImageWithLoading'

const UserAssetsList = ({ onAssetUpload = null, className = '' }) => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')
  const dropdownRef = useRef(null)
  const {
    pendingAssets,
    approvedAssets,
    loading,
    error,
    refreshAssets
  } = useUserAssets()

  // Atualizar listas quando houver novo upload
  useEffect(() => {
    if (onAssetUpload) {
      refreshAssets()
    }
  }, [onAssetUpload, refreshAssets])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentAssets = activeTab === 'pending' ? pendingAssets : approvedAssets
  const totalAssets = pendingAssets.length + approvedAssets.length

  if (!user) {
    return null
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition-all duration-200 group"
      >
        <DocumentTextIcon className="w-5 h-5" />
        <span className="text-sm font-medium">Meus Assets</span>
        {totalAssets > 0 && (
          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            {totalAssets}
          </span>
        )}
        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">Meus Assets</h3>
                <button
                  onClick={refreshAssets}
                  disabled={loading}
                  className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors disabled:opacity-50"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all duration-200
                    ${activeTab === 'pending' 
                      ? 'bg-slate-800 text-yellow-400' 
                      : 'text-slate-400 hover:text-slate-300'
                    }
                  `}
                >
                  <ClockIcon className="w-4 h-4" />
                  Pendentes
                  {pendingAssets.length > 0 && (
                    <span className="bg-yellow-600 text-yellow-100 text-xs px-1.5 py-0.5 rounded-full font-bold">
                      {pendingAssets.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('approved')}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all duration-200
                    ${activeTab === 'approved' 
                      ? 'bg-slate-800 text-green-400' 
                      : 'text-slate-400 hover:text-slate-300'
                    }
                  `}
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  Aprovados
                  {approvedAssets.length > 0 && (
                    <span className="bg-green-600 text-green-100 text-xs px-1.5 py-0.5 rounded-full font-bold">
                      {approvedAssets.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
              {error && (
                <div className="p-3 bg-red-900/20 border-b border-red-700">
                  <div className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                    <p className="text-red-300 text-xs">{error}</p>
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {currentAssets.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        {activeTab === 'pending' ? (
                          <ClockIcon className="w-6 h-6 text-yellow-400" />
                        ) : (
                          <CheckCircleIcon className="w-6 h-6 text-green-400" />
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-white mb-1">
                        {activeTab === 'pending' 
                          ? 'Nenhum asset pendente' 
                          : 'Nenhum asset aprovado'
                        }
                      </h4>
                      <p className="text-slate-400 text-xs">
                        {activeTab === 'pending' 
                          ? 'Uploads aparecerão aqui' 
                          : 'Assets aprovados aqui'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {currentAssets.slice(0, 6).map((asset, index) => (
                        <motion.div
                          key={asset.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group"
                        >
                          <Link
                            to={`/assets/${asset.id}`}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            {/* Thumbnail */}
                            <div className="w-10 h-10 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                              {(() => {
                                // Processar URLs de imagem do asset
                                let imageUrl = null
                                
                                if (asset.imageUrls && Array.isArray(asset.imageUrls) && asset.imageUrls.length > 0) {
                                  const url = asset.imageUrls[0]
                                  imageUrl = needsProxy(url) ? getProxiedImageUrl(url) : getGoogleDriveImageUrl(url)
                                } else if (asset.thumbnailUrl) {
                                  const url = asset.thumbnailUrl
                                  imageUrl = needsProxy(url) ? getProxiedImageUrl(url) : getGoogleDriveImageUrl(url)
                                } else if (asset.images && Array.isArray(asset.images) && asset.images.length > 0) {
                                  const url = asset.images[0]
                                  imageUrl = needsProxy(url) ? getProxiedImageUrl(url) : getGoogleDriveImageUrl(url)
                                }
                                
                                return imageUrl ? (
                                  <ImageWithLoading
                                    src={imageUrl}
                                    alt={asset.title}
                                    className="w-full h-full rounded-lg"
                                    loadingClassName="bg-gradient-to-br from-slate-800/50 via-slate-700/60 to-slate-900/50"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-700">
                                    <DocumentTextIcon className="w-5 h-5 text-slate-400" />
                                  </div>
                                )
                              })()}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {asset.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`
                                  text-xs px-2 py-0.5 rounded-full font-medium
                                  ${asset.isApproved 
                                    ? 'bg-green-900/50 text-green-300' 
                                    : 'bg-yellow-900/50 text-yellow-300'
                                  }
                                `}>
                                  {asset.isApproved ? 'Aprovado' : 'Pendente'}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {asset.category?.name}
                                </span>
                              </div>
                            </div>

                            {/* Action */}
                            <EyeIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-300 transition-colors flex-shrink-0" />
                          </Link>
                        </motion.div>
                      ))}

                      {/* Show More */}
                      {currentAssets.length > 6 && (
                        <div className="p-2 border-t border-slate-700 mt-2">
                          <Link
                            to="/profile/assets"
                            className="block text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            Ver todos ({currentAssets.length})
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            {totalAssets > 0 && (
              <div className="p-3 border-t border-slate-700 bg-slate-750">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Total: {totalAssets} assets</span>
                  <span>
                    {pendingAssets.length} pendentes • {approvedAssets.length} aprovados
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserAssetsList
