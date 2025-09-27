import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { assetsAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

const AssetReviews = ({ assetId, assetOwnerId, onReviewAdded }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reviewData, setReviewData] = useState({
    rating: 0,
    comment: ''
  })
  const [hoveredRating, setHoveredRating] = useState(0)
  const { user } = useAuth()

  const canReview = user && user.id !== assetOwnerId

  useEffect(() => {
    loadReviews()
  }, [assetId])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const response = await assetsAPI.getReviews(assetId)
      if (response.data.success) {
        setReviews(response.data.data.reviews || [])
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Você precisa estar logado para avaliar')
      return
    }

    if (reviewData.rating === 0) {
      toast.error('Selecione uma avaliação de 1 a 5 estrelas')
      return
    }

    if (reviewData.comment.trim().length < 10) {
      toast.error('Comentário deve ter pelo menos 10 caracteres')
      return
    }

    try {
      setSubmitting(true)
      const response = await assetsAPI.addReview(assetId, {
        rating: reviewData.rating,
        comment: reviewData.comment.trim()
      })

      if (response.data.success) {
        toast.success('Avaliação enviada com sucesso!')
        setShowReviewForm(false)
        setReviewData({ rating: 0, comment: '' })
        loadReviews() // Reload reviews
        if (onReviewAdded) {
          onReviewAdded(reviewData.rating)
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      const errorMessage = error.response?.data?.message || 'Erro ao enviar avaliação'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const renderStarRating = (rating, interactive = false, size = 'w-5 h-5') => {
    const stars = []
    const displayRating = interactive ? hoveredRating || reviewData.rating : rating

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          disabled={!interactive}
          className={`${size} ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-all`}
          onClick={() => interactive && setReviewData(prev => ({ ...prev, rating: i }))}
          onMouseEnter={() => interactive && setHoveredRating(i)}
          onMouseLeave={() => interactive && setHoveredRating(0)}
        >
          {i <= displayRating ? (
            <StarSolidIcon className="text-yellow-400" />
          ) : (
            <StarIcon className="text-gray-400" />
          )}
        </button>
      )
    }
    return <div className="flex space-x-1">{stars}</div>
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-700 rounded w-48"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-800/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-32"></div>
                <div className="h-3 bg-gray-700 rounded w-24 mt-2"></div>
              </div>
            </div>
            <div className="h-16 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center">
          <StarIcon className="w-6 h-6 mr-2 text-yellow-400" />
          Avaliações ({reviews.length})
        </h3>
        
        {canReview && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
          >
            {showReviewForm ? 'Cancelar' : 'Avaliar'}
          </button>
        )}
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmitReview}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
          >
            <h4 className="text-lg font-semibold text-white mb-4">
              Deixe sua avaliação
            </h4>
            
            {/* Star Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Avaliação *
              </label>
              {renderStarRating(0, true, 'w-8 h-8')}
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Comentário *
              </label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                rows={4}
                placeholder="Compartilhe sua experiência com este asset..."
                maxLength={500}
                required
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {reviewData.comment.length}/500
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={submitting || reviewData.rating === 0}
                className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {submitting ? 'Enviando...' : 'Enviar Avaliação'}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <StarIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">Nenhuma avaliação ainda.</p>
          {canReview && (
            <p className="text-sm text-gray-500 mt-2">
              Seja o primeiro a avaliar este asset!
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {review.user?.username?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      {review.user?.username || 'Usuário'}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {renderStarRating(review.rating)}
                      <span className="text-sm text-gray-400">
                        • {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <p className="text-gray-300 leading-relaxed">
                {review.comment}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Not logged in message */}
      {!user && (
        <div className="text-center py-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
          <p className="text-gray-400">
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
              Faça login
            </Link> para deixar uma avaliação
          </p>
        </div>
      )}
    </div>
  )
}

export default AssetReviews