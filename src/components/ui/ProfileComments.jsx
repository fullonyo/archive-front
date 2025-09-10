import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Heart, 
  Reply, 
  MoreVertical, 
  Pin, 
  EyeOff, 
  Eye,
  Trash2,
  Send,
  User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Avatar from './Avatar';

const ProfileComments = ({ profileUserId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [pagination, setPagination] = useState(null);
  const [expandedComments, setExpandedComments] = useState(new Set());

  const isProfileOwner = user && user.id === profileUserId;

  useEffect(() => {
    if (profileUserId && !isNaN(profileUserId)) {
      loadComments();
    } else {
      setLoading(false);
    }
  }, [profileUserId]);

  const loadComments = async (page = 1) => {
    if (!profileUserId) return;
    
    try {
      const response = await api.get(`/users/${profileUserId}/comments?page=${page}&limit=20`);
      
      if (response.data.success) {
        const commentsData = response.data.data.comments || [];
        
        if (page === 1) {
          setComments(commentsData);
        } else {
          setComments(prev => [...prev, ...commentsData]);
        }
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || commenting || !user) return;

    setCommenting(true);
    try {
      const response = await api.post(`/users/${profileUserId}/comments`, {
        content: newComment.trim()
      });

      if (response.data.success) {
        setComments(prev => [response.data.data, ...prev]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setCommenting(false);
    }
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim() || commenting || !user) return;

    setCommenting(true);
    try {
      const response = await api.post(`/users/${profileUserId}/comments`, {
        content: replyText.trim(),
        parentId: commentId
      });

      if (response.data.success) {
        // Add reply to the parent comment
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...comment.replies, response.data.data],
              _count: {
                ...comment._count,
                replies: comment._count.replies + 1
              }
            };
          }
          return comment;
        }));
        
        setReplyText('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Error creating reply:', error);
    } finally {
      setCommenting(false);
    }
  };

  const handleLike = async (commentId) => {
    if (!user) return;

    try {
      const response = await api.post(`/users/comments/${commentId}/like`);
      if (response.data.success) {
        const { isLiked, likesCount } = response.data.data;
        
        // Update comment or reply like status
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              isLiked,
              _count: { ...comment._count, likes: likesCount }
            };
          }
          
          // Check replies
          const updatedReplies = comment.replies.map(reply => {
            if (reply.id === commentId) {
              return {
                ...reply,
                isLiked,
                _count: { ...reply._count, likes: likesCount }
              };
            }
            return reply;
          });
          
          return { ...comment, replies: updatedReplies };
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleVisibilityToggle = async (commentId, currentVisibility) => {
    if (!isProfileOwner) return;

    try {
      const response = await api.put(`/users/comments/${commentId}/visibility`, {
        isVisible: !currentVisibility
      });
      
      if (response.data.success) {
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, isVisible: !currentVisibility };
          }
          return comment;
        }));
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const handlePin = async (commentId, currentPinned) => {
    if (!isProfileOwner) return;

    try {
      const response = await api.put(`/users/comments/${commentId}/pin`, {
        isPinned: !currentPinned
      });
      
      if (response.data.success) {
        // Reload comments to get proper ordering
        loadComments();
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await api.delete(`/users/comments/${commentId}`);
      if (response.data.success) {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const loadMoreReplies = async (commentId) => {
    try {
      const response = await api.get(`/users/comments/${commentId}/replies?page=1&limit=50`);
      if (response.data.success) {
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: response.data.data.replies
            };
          }
          return comment;
        }));
        setExpandedComments(prev => new Set([...prev, commentId]));
      }
    } catch (error) {
      console.error('Error loading replies:', error);
    }
  };

  const CommentActions = ({ comment, isReply = false }) => {
    // Verificar se comment é válido
    if (!comment || typeof comment !== 'object') {
      return null;
    }

    const canModerate = isProfileOwner;
    const canDelete = user && (user.id === comment.authorId || isProfileOwner);

    return (
      <div className="flex items-center gap-1 text-sm">
        {/* Like Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleLike(comment.id)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
            comment.isLiked 
              ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20' 
              : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
          }`}
        >
          <Heart className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
          <span className="font-medium">{comment._count?.likes || 0}</span>
        </motion.button>

        {/* Reply Button */}
        {!isReply && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
          >
            <Reply className="w-4 h-4" />
            <span className="font-medium">Responder</span>
          </motion.button>
        )}

        {/* Moderation Actions */}
        {canModerate && (
          <div className="flex items-center gap-1 ml-2">
            {!isReply && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePin(comment.id, comment.isPinned)}
                className={`p-2 rounded-full transition-all ${
                  comment.isPinned
                    ? 'text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20'
                    : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10'
                }`}
                title={comment.isPinned ? 'Desfixar comentário' : 'Fixar comentário'}
              >
                <Pin className="w-4 h-4" />
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleVisibilityToggle(comment.id, comment.isVisible)}
              className={`p-2 rounded-full transition-all ${
                comment.isVisible
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-500/10'
                  : 'text-orange-400 bg-orange-500/10 hover:bg-orange-500/20'
              }`}
              title={comment.isVisible ? 'Ocultar comentário' : 'Mostrar comentário'}
            >
              {comment.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </motion.button>
          </div>
        )}

        {/* Delete Button */}
        {canDelete && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDelete(comment.id)}
            className="p-2 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all ml-1"
            title="Excluir comentário"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    );
  };

  const CommentItem = ({ comment, isReply = false }) => {
    // Verificar se comment é válido
    if (!comment || typeof comment !== 'object') {
      return null;
    }

    // Verificar se author existe
    if (!comment.author || typeof comment.author !== 'object') {
      return null;
    }

    const hasMoreReplies = comment._count?.replies > (comment.replies?.length || 0);
    const isExpanded = expandedComments.has(comment.id);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`${!comment.isVisible && isProfileOwner ? 'opacity-50' : ''}`}
      >
        <div className={`flex gap-4 ${isReply ? 'ml-12 mt-4' : 'mb-6'}`}>
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-gray-800/60 bg-gray-800 shadow-lg ring-2 ring-black/30">
              <Avatar
                avatarUrl={comment.author.avatar || comment.author.avatarUrl}
                username={comment.author.username}
                userId={comment.author.id}
                size="md"
                className="w-full h-full"
                instanceId={`comment-${comment.id}-${comment.author.id}`}
              />
            </div>
          </div>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="font-semibold text-white">
                  {comment.author?.username || 'Anonymous'}
                </span>
                {comment.author?.isVerified && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
                {comment.isPinned && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-full">
                    <Pin className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-yellow-400 font-medium">Fixado</span>
                  </div>
                )}
                <span className="text-xs text-gray-400 ml-auto">
                  {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('pt-BR') : 'Data desconhecida'}
                </span>
              </div>

              {/* Content */}
              <p className="text-gray-300 text-sm leading-relaxed">
                {comment.content || ''}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-3 ml-1">
              <CommentActions comment={comment} isReply={isReply} />
            </div>

            {/* Reply Form */}
            <AnimatePresence>
              {replyingTo === comment.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <form onSubmit={(e) => { e.preventDefault(); handleReply(comment.id); }}>
                    <div className="flex gap-3">
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex-1 overflow-hidden">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Escreva uma resposta..."
                          className="w-full px-4 py-3 bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none text-sm"
                          rows="2"
                          maxLength="1000"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleReply(comment.id);
                            }
                            if (e.key === 'Escape') {
                              setReplyingTo(null);
                              setReplyText('');
                            }
                          }}
                        />
                        <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-t border-white/10">
                          <span className="text-xs text-gray-400">
                            Enter para enviar • {1000 - replyText.length} caracteres restantes
                          </span>
                          <div className="flex gap-2">
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              className="px-3 py-1 text-xs text-gray-400 hover:text-white transition-colors rounded-full"
                            >
                              Cancelar
                            </motion.button>
                            <motion.button
                              type="submit"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              disabled={!replyText.trim() || commenting}
                              className="flex items-center gap-1 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-full hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {commenting ? (
                                <>
                                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  <Send className="w-3 h-3" />
                                  Responder
                                </>
                              )}
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Replies */}
            {comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4"
              >
                <AnimatePresence>
                  {comment.replies.map(reply => {
                    // Verificar se reply é válido
                    if (!reply || !reply.id) return null;
                    return (
                      <CommentItem key={reply.id} comment={reply} isReply={true} />
                    );
                  })}
                </AnimatePresence>

                {/* Load More Replies */}
                {hasMoreReplies && !isExpanded && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => loadMoreReplies(comment.id)}
                    className="mt-3 ml-12 px-3 py-1.5 text-sm text-purple-400 hover:text-purple-300 font-medium bg-white/5 backdrop-blur-sm rounded-full border border-white/10 hover:border-purple-400/30 transition-all"
                  >
                    Ver mais {(comment._count?.replies || 0) - (comment.replies?.length || 0)} respostas
                  </motion.button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (!profileUserId || isNaN(profileUserId)) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Perfil não encontrado.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Comment Form Skeleton */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 animate-pulse">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-2xl"></div>
            <div className="flex-1 space-y-3">
              <div className="h-20 bg-white/10 rounded-xl"></div>
              <div className="flex justify-between items-center">
                <div className="h-3 bg-white/10 rounded w-24"></div>
                <div className="h-8 bg-white/10 rounded-xl w-24"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List Skeleton */}
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-2xl flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                    {/* Header skeleton */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-4 bg-white/10 rounded w-24"></div>
                      <div className="h-3 bg-white/10 rounded w-16 ml-auto"></div>
                    </div>
                    {/* Content skeleton */}
                    <div className="space-y-2">
                      <div className="h-3 bg-white/10 rounded w-full"></div>
                      <div className="h-3 bg-white/10 rounded w-3/4"></div>
                      <div className="h-3 bg-white/10 rounded w-1/2"></div>
                    </div>
                  </div>
                  {/* Actions skeleton */}
                  <div className="mt-3 ml-1 flex gap-2">
                    <div className="h-7 bg-white/5 rounded-full w-16"></div>
                    <div className="h-7 bg-white/5 rounded-full w-20"></div>
                  </div>
                  
                  {/* Reply skeleton (sometimes) */}
                  {i === 1 && (
                    <div className="ml-12 mt-4 animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 bg-white/10 rounded-2xl flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="h-3 bg-white/10 rounded w-20"></div>
                              <div className="h-3 bg-white/10 rounded w-12 ml-auto"></div>
                            </div>
                            <div className="space-y-2">
                              <div className="h-3 bg-white/10 rounded w-full"></div>
                              <div className="h-3 bg-white/10 rounded w-2/3"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-400 font-medium">Carregando comentários...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {user && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        >
          <form onSubmit={handleComment}>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-indigo-500/30 bg-gray-800 shadow-lg ring-2 ring-indigo-500/20">
                  <Avatar
                    avatarUrl={user.avatar}
                    username={user.username}
                    userId={user.id}
                    size="md"
                    className="w-full h-full"
                    instanceId={`comment-form-${user.id}`}
                  />
                </div>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escreva um comentário..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent backdrop-blur-sm transition-all"
                  rows="3"
                  maxLength="1000"
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-gray-400">
                    {newComment.length}/1000 caracteres
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!newComment.trim() || commenting}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-semibold shadow-lg shadow-purple-500/25"
                  >
                    {commenting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <MessageSquare className="w-4 h-4" />
                    )}
                    Comentar
                  </motion.button>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {Array.isArray(comments) && comments.length > 0 && comments.map(comment => {
            // Verificar se comment é válido antes de renderizar
            if (!comment || !comment.id || !comment.author) {
              console.warn('Invalid comment data:', comment);
              return null;
            }
            return (
              <CommentItem key={comment.id} comment={comment} />
            );
          })}
        </AnimatePresence>

        {(!Array.isArray(comments) || comments.length === 0) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <MessageSquare className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-300 mb-3">Nenhum comentário ainda</h3>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
              {user ? 'Seja o primeiro a deixar um comentário!' : 'Faça login para comentar.'}
            </p>
          </motion.div>
        )}

        {/* Load More */}
        {pagination && pagination.page < pagination.pages && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center pt-6"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => loadComments(pagination.page + 1)}
              className="px-8 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all font-semibold"
            >
              Carregar mais comentários
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProfileComments;
