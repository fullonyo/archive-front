import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useDashboardData } from '../hooks/useDashboardData'
import { useLocation } from 'react-router-dom'
import { getGoogleDriveImageUrl, handleImageError } from '../utils/googleDriveUtils'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import {
  ChartBarIcon,
  UserIcon,
  CloudArrowUpIcon,
  HeartIcon,
  EyeIcon,
  StarIcon,
  ClockIcon,
  FireIcon,
  CogIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import PageTransition from '../components/ui/PageTransition'

const MetricCard = ({ title, value, change, icon: Icon, color }) => {
  const isPositive = change > 0
  const isNegative = change < 0

  const getColorClasses = (colorName) => {
    const colorMap = {
      blue: {
        bg: "bg-gray-800",
        text: "text-blue-400",
        highlight: "bg-blue-500/10",
        border: "border-blue-500/20"
      },
      purple: {
        bg: "bg-gray-800",
        text: "text-purple-400",
        highlight: "bg-purple-500/10",
        border: "border-purple-500/20"
      },
      pink: {
        bg: "bg-gray-800",
        text: "text-pink-400",
        highlight: "bg-pink-500/10",
        border: "border-pink-500/20"
      },
      green: {
        bg: "bg-gray-800",
        text: "text-emerald-400",
        highlight: "bg-emerald-500/10",
        border: "border-emerald-500/20"
      },
      orange: {
        bg: "bg-gray-800",
        text: "text-orange-400",
        highlight: "bg-orange-500/10",
        border: "border-orange-500/20"
      },
      indigo: {
        bg: "bg-gray-800",
        text: "text-indigo-400",
        highlight: "bg-indigo-500/10",
        border: "border-indigo-500/20"
      }
    }
    return colorMap[colorName] || colorMap.blue
  }

  const colorClasses = getColorClasses(color)

  return (
    <div className={clsx(
      "rounded-xl p-6",
      "bg-gray-800/50 backdrop-blur-sm",
      "border",
      colorClasses.border,
      "transition-all duration-200",
      "hover:bg-gray-800/80 hover:shadow-lg",
      "hover:shadow-gray-900/50"
    )}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
          <p className="text-gray-100 text-2xl font-bold">{value}</p>
          {change !== 0 && (
            <div className="flex items-center gap-1 mt-2">
              <span className={clsx(
                "text-sm font-medium",
                isPositive && "text-emerald-400",
                isNegative && "text-red-400",
                !isPositive && !isNegative && "text-gray-400"
              )}>
                {isPositive ? '+' : ''}{change}%
              </span>
              <span className="text-gray-500 text-xs">vs mês anterior</span>
            </div>
          )}
        </div>
        <div className={clsx(
          "w-12 h-12 rounded-lg flex items-center justify-center",
          colorClasses.highlight,
          colorClasses.text
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

const ActivityItem = ({ type, description, asset, user, timestamp }) => {
  const getIcon = () => {
    switch (type) {
      case 'download':
        return <CloudArrowUpIcon className="w-4 h-4 text-blue-400" />
      case 'favorite':
        return <HeartIcon className="w-4 h-4 text-pink-400" />
      case 'upload':
        return <CloudArrowUpIcon className="w-4 h-4 text-purple-400" />
      case 'review':
        return <StarIcon className="w-4 h-4 text-amber-400" />
      default:
        return <ClockIcon className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-200 text-sm font-medium truncate">{description}</p>
        <p className="text-gray-400 text-xs truncate">
          {asset?.title || user?.username}
        </p>
      </div>
      <span className="text-gray-500 text-xs">
        {new Date(timestamp).toLocaleDateString('pt-BR')}
      </span>
    </div>
  )
}

const AssetCard = ({ asset }) => {
  // Função para obter URL da imagem seguindo o padrão usado em outros componentes
  const getAssetImageUrl = () => {
    // Primeiro tenta imageUrls (array)
    if (asset.imageUrls && Array.isArray(asset.imageUrls) && asset.imageUrls.length > 0) {
      return getGoogleDriveImageUrl(asset.imageUrls[0])
    }
    
    // Depois tenta thumbnailUrl
    if (asset.thumbnailUrl) {
      return getGoogleDriveImageUrl(asset.thumbnailUrl)
    }
    
    // Fallback para uma imagem placeholder
    return `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop&crop=center&auto=format&q=80`
  }

  const imageUrl = getAssetImageUrl()

  return (
    <div className="flex items-center gap-3">
      <div 
        className="w-10 h-10 rounded-lg bg-gray-700 bg-cover bg-center flex-shrink-0" 
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-gray-200 text-sm font-medium truncate">{asset.title || asset.name}</p>
        <p className="text-gray-400 text-xs">por {asset.user?.username || 'Unknown'}</p>
      </div>
      <div className="text-right">
        <p className="text-gray-200 text-xs font-medium">
          {asset.downloadCount || 0} downloads
        </p>
        <p className="text-gray-400 text-xs">
          ⭐ {asset.averageRating ? asset.averageRating.toFixed(1) : '0.0'}
        </p>
      </div>
    </div>
  )
}

const DashboardPage = () => {
  const { user } = useAuth()
  const { data, loading, error, refreshData } = useDashboardData()
  const [refreshing, setRefreshing] = useState(false)
  const location = useLocation()

  // Mostrar mensagem de upload se vier do estado de navegação
  useEffect(() => {
    if (location.state?.message) {
      const { message, autoApproved, userRole } = location.state
      
      if (autoApproved) {
        toast.success(message, {
          duration: 6000,
          icon: '🎉'
        })
      } else {
        toast.success(message, {
          duration: 6000,
          icon: '📋'
        })
      }
      
      // Limpar o estado após mostrar a mensagem
      window.history.replaceState(null, '', location.pathname)
    }
  }, [location.state])

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshData()
    setRefreshing(false)
  }

  const getWelcomeMessage = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  const getMetricCards = () => {
    const { stats } = data
    console.log('📊 getMetricCards: data.stats =', stats)

    const baseCards = [
      {
        title: 'Total de Assets',
        value: stats?.totalAssets || 0,
        change: 0, // Por enquanto sem dados de mudança
        icon: CloudArrowUpIcon,
        color: 'indigo'
      },
      {
        title: 'Total de Usuários',
        value: stats?.totalUsers || 0,
        change: 0,
        icon: UserIcon,
        color: 'green'
      },
      {
        title: 'Downloads Totais',
        value: stats?.totalDownloads || 0,
        change: 0,
        icon: ChartBarIcon,
        color: 'blue'
      },
      {
        title: 'Likes Totais',
        value: stats?.totalLikes || 0,
        change: 0,
        icon: HeartIcon,
        color: 'pink'
      }
    ]

    // Por enquanto, não há dados específicos de premium/admin
    // if (user?.accountType === 'PREMIUM' || user?.accountType === 'ADMIN') {
    //   // Adicionar cards específicos quando houver dados
    // }

    return baseCards
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] flex-col gap-5">
        <LoadingSpinner size="lg" />
        <p className="text-gray-500 text-base">Carregando dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] flex-col gap-5">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-2xl font-semibold text-gray-200">Erro ao carregar dashboard</h2>
        <p className="text-gray-400 text-base text-center">{error}</p>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={clsx(
            "px-6 py-3 bg-blue-500 text-white rounded-lg text-sm font-medium",
            "hover:bg-blue-600 transition-colors",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
        >
          {refreshing ? 'Recarregando...' : 'Tentar novamente'}
        </button>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center miwn-h-[60vh] flex-col gap-5">
        <div className="text-5xl">🔒</div>
        <h2 className="text-2xl font-semibold text-gray-200">Usuário não autenticado</h2>
        <p className="text-gray-400 text-base text-center">
          Faça login para acessar o dashboard.
        </p>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-100">
                {getWelcomeMessage()}, {user.username}! 👋
              </h1>
              <p className="mt-2 text-gray-400">
                Aqui está um resumo das suas atividades no Archive Nyo
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={clsx(
                "inline-flex items-center gap-2 px-4 py-2",
                "bg-gray-800/50 text-gray-300 border border-gray-700/50 rounded-lg",
                "text-sm font-medium hover:bg-gray-800/80 transition-colors",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              <ArrowPathIcon className={clsx(
                "w-4 h-4",
                refreshing && "animate-spin"
              )} />
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {getMetricCards().map((card, index) => (
            <MetricCard key={index} {...card} />
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <ClockIcon className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-100">
                Atividade Recente
              </h3>
            </div>
            <div className="space-y-4">
              {data.recentAssets?.length > 0 ? (
                data.recentAssets.slice(0, 5).map((asset, index) => (
                  <ActivityItem key={index} 
                    type="upload"
                    description={`Novo asset: ${asset.title || asset.name || 'Asset sem nome'}`}
                    asset={{ title: asset.title || asset.name }}
                    user={{ username: asset.user?.username || 'Unknown' }}
                    timestamp={asset.createdAt || new Date().toISOString()}
                  />
                ))
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">
                  Nenhuma atividade recente
                </p>
              )}
            </div>
          </div>

          {/* Trending Assets */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <FireIcon className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-100">
                Assets em Alta
              </h3>
            </div>
            <div className="space-y-4">
              {data.trendingAssets?.length > 0 ? (
                data.trendingAssets.map((asset, index) => (
                  <AssetCard key={index} asset={asset} />
                ))
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">
                  Nenhum asset em alta no momento
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default DashboardPage 