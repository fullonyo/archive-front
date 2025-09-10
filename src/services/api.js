import axios from 'axios'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle rate limiting with exponential backoff
    if (error.response?.status === 429 && !originalRequest._rateLimitRetry) {
      originalRequest._rateLimitRetry = true
      
      // Extract retry-after from headers or use default
      const retryAfter = error.response.headers['retry-after'] || '2'
      const waitTime = Math.min(parseInt(retryAfter) * 1000, 10000) // Max 10 seconds
      
      console.warn(`Rate limited. Retrying after ${waitTime}ms`)
      
      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, waitTime))
      
      return api(originalRequest)
    }

    // Handle token expired error
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = Cookies.get('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await api.post('/auth/refresh', { refreshToken })
        const { accessToken } = response.data.data

        // Update access token in cookies
        Cookies.set('accessToken', accessToken, { expires: 7, secure: true, sameSite: 'strict' })

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        // Refresh failed, clear tokens and redirect to login
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    if (error.response?.status === 429) {
      toast.error('Muitas requisições. Aguarde um momento e tente novamente.')
    } else if (error.response?.status >= 500) {
      toast.error('Erro do servidor. Tente novamente mais tarde.')
    } else if (error.response?.status === 404) {
      toast.error('Recurso não encontrado.')
    } else if (error.response?.data?.message && !error.config?.url?.includes('/register')) {
      // Não mostrar toast automático para erros de registro (componente já trata)
      toast.error(error.response.data.message)
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: (data) => api.post('/auth/logout', data),
  refreshToken: (data) => api.post('/auth/refresh', data),
  getProfile: () => api.get('/auth/profile'),
  checkAuth: () => api.get('/auth/check'),
}

// Registration API
export const registrationAPI = {
  registerUser: (userData) => api.post('/register', userData),
  register: (userData) => api.post('/register', userData),
  confirmEmail: (token) => api.get(`/register/confirm/${token}`),
  resendConfirmation: (email) => api.post('/register/resend', { email }),
  checkEmailAvailability: (email) => api.get(`/register/check-email/${encodeURIComponent(email)}`),
  getRegistrationStatus: (email) => api.get(`/register/status/${encodeURIComponent(email)}`),
}

// Password Reset API
export const passwordResetAPI = {
  requestReset: (email) => api.post('/password-reset/request', { email }),
  verifyToken: (token) => api.get(`/password-reset/verify/${token}`),
  confirmReset: (data) => api.post('/password-reset/confirm', data),
}

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/password', data),
  uploadAvatar: (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadBanner: (file) => {
    const formData = new FormData()
    formData.append('banner', file)
    return api.post('/users/banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getUserAssets: (params) => api.get('/users/assets', { params }),
  getFavorites: (params) => api.get('/users/favorites', { params }),
  deleteAccount: () => api.delete('/users/account'),
  getTopUploaders: (params) => api.get('/users/top-uploaders', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  getTopByDownloads: () => api.get('/users/top-downloads'),
  getTopByLikes: () => api.get('/users/top-likes'),
  getTopByRating: () => api.get('/users/top-rating'),
  
  // Admin endpoints
  getAllUsers: (params) => api.get('/users', { params }),
  updateAccountType: (userId, data) => api.put(`/users/${userId}/account-type`, data),
}

// Assets API
export const assetsAPI = {
  getAssets: (params) => api.get('/assets', { params }),
  getAsset: (id) => api.get(`/assets/${id}`),
  uploadAsset: (formData, onUploadProgress) => {
    return api.post('/assets', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Cache-Control': 'no-cache'
      },
      timeout: 600000, // 10 minutes - reduzido para uploads mais responsivos
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      onUploadProgress
    })
  },
  updateAsset: (id, data) => api.put(`/assets/${id}`, data),
  deleteAsset: (id) => api.delete(`/assets/${id}`),
  downloadAsset: (id) => api.get(`/assets/${id}/download`),
  toggleFavorite: (id) => api.post(`/assets/${id}/favorite`),
  addReview: (id, data) => api.post(`/assets/${id}/review`, data),
  getReviews: (id, params) => api.get(`/assets/${id}/reviews`, { params }),
  getCategories: () => api.get('/assets/categories/list'),
  getStats: () => api.get('/assets/stats'),
  getRecent: (params) => api.get('/assets/recent', { params }),
  getTrending: (params) => api.get('/assets/trending', { params }),
  getRecommendations: () => api.get('/assets/recommendations'),
  getRelatedAssets: (id) => api.get(`/assets/${id}/related`),
  
  // Admin endpoints
  approveAsset: (id, data) => api.put(`/assets/${id}/approval`, data),
}

// Search API
export const searchAPI = {
  searchAssets: (query, params) => api.get('/assets', { 
    params: { q: query, ...params } 
  }),
  getPopularAssets: (params) => api.get('/assets', { 
    params: { sort: 'popular', ...params } 
  }),
  getLatestAssets: (params) => api.get('/assets', { 
    params: { sort: 'newest', ...params } 
  }),
  getAssetsByCategory: (categoryId, params) => api.get('/assets', { 
    params: { category: categoryId, ...params } 
  }),
}

// Stats API (future implementation)
export const statsAPI = {
  getDashboardStats: () => api.get('/stats/dashboard'),
  getUserStats: (userId) => api.get(`/stats/users/${userId}`),
  getAssetStats: (assetId) => api.get(`/stats/assets/${assetId}`),
}

// Helper functions
export const createFormData = (data) => {
  const formData = new FormData()
  
  Object.keys(data).forEach(key => {
    const value = data[key]
    
    if (value instanceof File) {
      formData.append(key, value)
    } else if (Array.isArray(value)) {
      value.forEach(item => formData.append(key, item))
    } else if (value !== null && value !== undefined) {
      formData.append(key, value)
    }
  })
  
  return formData
}

export const downloadFile = async (url, filename) => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('Download error:', error)
    toast.error('Erro ao baixar arquivo')
  }
}

export default api