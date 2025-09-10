import React from 'react'
import ImageWithLoading from './ImageWithLoading'
import { getGoogleDriveImageUrl } from '../../utils/googleDriveUtils'

const SimpleImageCarousel = ({ 
  images = [], 
  fallbackImage = `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop&crop=center&auto=format&q=80`
}) => {
  // Garantir que images é sempre um array
  const safeImages = Array.isArray(images) ? images : []
  
  // Processar as URLs das imagens através do Google Drive handler
  const processedImages = safeImages
    .map(url => getGoogleDriveImageUrl(url))
    .filter(Boolean) // Remove URLs nulas
  
  const displayImage = processedImages.length > 0 ? processedImages[0] : fallbackImage
  
  return (
    <div className="relative overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-800">
        <ImageWithLoading
          src={displayImage}
          alt="Asset image"
          className="w-full h-full"
          loadingClassName="bg-gradient-to-br from-slate-800/50 via-slate-700/60 to-slate-900/50"
        />
      </div>
    </div>
  )
}

export default SimpleImageCarousel
