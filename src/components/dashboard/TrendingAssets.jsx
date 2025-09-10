import React from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowTrendingUpIcon,
  HeartIcon,
  ArrowDownTrayIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { clsx } from 'clsx'
import ImageWithLoading from '../ui/ImageWithLoading'

const TrendingAssets = ({ assets = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center space-x-4">
            <div className="w-16 h-16 bg-slate-700 rounded-xl"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-700 rounded w-3/4"></div>
              <div className="h-3 bg-slate-700 rounded w-1/2"></div>
              <div className="flex space-x-4">
                <div className="h-3 bg-slate-700 rounded w-16"></div>
                <div className="h-3 bg-slate-700 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <ArrowTrendingUpIcon className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Nenhum asset em alta</h3>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          Os assets mais populares da semana aparecerão aqui em breve.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {assets.map((asset, index) => (
        <div
          key={asset.id}
          className="group flex items-center space-x-4 hover:bg-slate-700/20 rounded-lg p-3 -m-3 transition-all duration-200"
        >
          {/* Ranking */}
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
            <div className={clsx(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
              index === 0 && 'bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900',
              index === 1 && 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-900',
              index === 2 && 'bg-gradient-to-r from-orange-400 to-orange-500 text-white',
              index > 2 && 'bg-slate-700 text-slate-300'
            )}>
              {index + 1}
            </div>
          </div>

          {/* Thumbnail */}
          <Link to={`/asset/${asset.id}`} className="flex-shrink-0">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-700">
              <ImageWithLoading
                src={asset.thumbnail_url}
                alt={asset.title}
                className="w-full h-full group-hover:scale-110 transition-transform duration-300"
                loadingClassName="bg-gradient-to-br from-slate-800/50 via-slate-700/60 to-slate-900/50"
              />
            </div>
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <Link to={`/asset/${asset.id}`}>
              <h4 className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                {asset.title}
              </h4>
            </Link>
            
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
              Por {asset.uploader_username}
            </p>
            
            <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
              <div className="flex items-center space-x-1">
                <ArrowDownTrayIcon className="w-3 h-3" />
                <span>{asset.download_count?.toLocaleString() || 0}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <HeartIcon className="w-3 h-3" />
                <span>{asset.favorite_count?.toLocaleString() || 0}</span>
              </div>
              
              {asset.average_rating && (
                <div className="flex items-center space-x-1">
                  <StarIcon className="w-3 h-3" />
                  <span>{asset.average_rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 hover:bg-slate-600 rounded-lg transition-colors">
              {asset.is_favorited ? (
                <HeartSolidIcon className="w-4 h-4 text-pink-400" />
              ) : (
                <HeartIcon className="w-4 h-4 text-slate-400 hover:text-pink-400" />
              )}
            </button>
          </div>
        </div>
      ))}
      
      <div className="pt-4 border-t border-slate-700/50">
        <Link
          to="/trending"
          className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium flex items-center space-x-1"
        >
          <ArrowTrendingUpIcon className="w-4 h-4" />
          <span>Ver todos os trending →</span>
        </Link>
      </div>
    </div>
  )
}

export default TrendingAssets
