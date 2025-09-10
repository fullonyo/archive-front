import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI } from '../services/api'
import Cookies from 'js-cookie'

// Auth context
const AuthContext = createContext()

// Auth actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR'
}

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  accessToken: Cookies.get('accessToken') || null,
  refreshToken: Cookies.get('refreshToken') || null
}

// Helper functions for local storage
const getUserFromStorage = () => {
  try {
    const userData = localStorage.getItem('archieve_user')
    const parsedUser = userData ? JSON.parse(userData) : null
    
    // Adicionar role de debug se existir
    if (parsedUser && process.env.NODE_ENV === 'development') {
      const debugRole = localStorage.getItem('debugRole')
      if (debugRole) {
        parsedUser.role = debugRole
      }
    }
    
    return parsedUser
  } catch (error) {
    console.error('Error reading user from localStorage:', error)
    return null
  }
}

const saveUserToStorage = (user) => {
  try {
    localStorage.setItem('archieve_user', JSON.stringify(user))
  } catch (error) {
    console.error('Error saving user to localStorage:', error)
  }
}

const removeUserFromStorage = () => {
  try {
    localStorage.removeItem('archieve_user')
  } catch (error) {
    console.error('Error removing user from localStorage:', error)
  }
}

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      }
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      const loginUser = {
        ...action.payload.user,
        // Normalize avatarUrl to avatar for frontend consistency
        avatar: action.payload.user.avatarUrl || action.payload.user.avatar
      }
      saveUserToStorage(loginUser) // Save to localStorage
      return {
        ...state,
        user: loginUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken
      }
    
    case AUTH_ACTIONS.LOGIN_ERROR:
      removeUserFromStorage() // Remove from localStorage
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        accessToken: null,
        refreshToken: null
      }
    
    case AUTH_ACTIONS.LOGOUT:
      removeUserFromStorage() // Remove from localStorage
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        accessToken: null,
        refreshToken: null
      }
    
    case AUTH_ACTIONS.REFRESH_TOKEN:
      return {
        ...state,
        accessToken: action.payload.accessToken
      }
    
    case AUTH_ACTIONS.UPDATE_USER:
      const updatedUser = { ...state.user, ...action.payload }
      saveUserToStorage(updatedUser) // Save updated user to localStorage
      return {
        ...state,
        user: updatedUser
      }
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }
    
    default:
      return state
  }
}

// Auth provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize auth state from cookies
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = Cookies.get('accessToken')
        const refreshToken = Cookies.get('refreshToken')
        const cachedUser = getUserFromStorage()

        if (accessToken && refreshToken) {
          // Set tokens in state first
          dispatch({
            type: AUTH_ACTIONS.REFRESH_TOKEN,
            payload: { accessToken }
          })

          // If we have cached user data, use it temporarily while fetching fresh data
          if (cachedUser) {
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: {
                user: cachedUser,
                accessToken,
                refreshToken
              }
            })
          }

          // Verify token and get fresh user data
          try {
            const response = await authAPI.getProfile()
            
            if (response.data.success && response.data.data && response.data.data.user) {
              const freshUserData = response.data.data.user

              // Normalize avatarUrl to avatar for frontend compatibility
              const normalizedUserData = {
                ...freshUserData,
                avatar: freshUserData.avatarUrl || freshUserData.avatar
              }

              // Merge cached avatar if fresh data doesn't have it but cached does
              const finalUserData = {
                ...normalizedUserData,
                // Preserve cached avatar if server doesn't return one but we have it cached
                ...(cachedUser?.avatar && !normalizedUserData.avatar && { avatar: cachedUser.avatar })
              }

              dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: {
                  user: finalUserData,
                  accessToken,
                  refreshToken
                }
              })
            } else {
              throw new Error('Invalid profile response format')
            }
          } catch (profileError) {
            console.error('Profile fetch error:', profileError)
            
            // If we have cached user data and the token is still valid, use it
            if (cachedUser && profileError.response?.status !== 401) {
              dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: {
                  user: cachedUser,
                  accessToken,
                  refreshToken
                }
              })
            } else {
              // If profile fetch fails and no valid cache, clear everything
              Cookies.remove('accessToken')
              Cookies.remove('refreshToken')
              removeUserFromStorage()
              dispatch({ type: AUTH_ACTIONS.LOGOUT })
            }
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.LOGOUT })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Clear invalid tokens
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
        dispatch({ type: AUTH_ACTIONS.LOGOUT })
      }
    }

    initializeAuth()
  }, [])

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })
      
      const response = await authAPI.login(credentials)
      const { user, accessToken, refreshToken } = response.data.data

      // Store tokens in cookies - use different expiry based on rememberMe
      const cookieOptions = { secure: true, sameSite: 'strict' }
      
      if (credentials.rememberMe) {
        // Persistent cookies for "remember me"
        cookieOptions.expires = 7  // 7 days for access token
        Cookies.set('accessToken', accessToken, cookieOptions)
        Cookies.set('refreshToken', refreshToken, { ...cookieOptions, expires: 30 }) // 30 days for refresh token
      } else {
        // Session cookies (expire when browser closes)
        Cookies.set('accessToken', accessToken, cookieOptions)
        Cookies.set('refreshToken', refreshToken, cookieOptions)
      }

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, accessToken, refreshToken }
      })

      return response
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: error.response?.data?.message || 'Login failed'
      })
      throw error
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })
      
      const response = await authAPI.register(userData)
      const { user, accessToken, refreshToken } = response.data

      // Store tokens in cookies
      Cookies.set('accessToken', accessToken, { expires: 7, secure: true, sameSite: 'strict' })
      Cookies.set('refreshToken', refreshToken, { expires: 30, secure: true, sameSite: 'strict' })

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, accessToken, refreshToken }
      })

      return response
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: error.response?.data?.message || 'Registration failed'
      })
      throw error
    }
  }

  // Logout function
  const logout = async () => {
    try {
      // Call logout API if refresh token exists
      if (state.refreshToken) {
        await authAPI.logout({ refreshToken: state.refreshToken })
      }
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      // Clear tokens from cookies
      Cookies.remove('accessToken')
      Cookies.remove('refreshToken')
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    }
  }

  // Refresh token function
  const refreshAccessToken = async () => {
    try {
      const refreshToken = Cookies.get('refreshToken')
      
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await authAPI.refreshToken({ refreshToken })
      const { accessToken } = response.data

      // Update access token in cookies
      Cookies.set('accessToken', accessToken, { expires: 7, secure: true, sameSite: 'strict' })

      dispatch({
        type: AUTH_ACTIONS.REFRESH_TOKEN,
        payload: { accessToken }
      })

      return accessToken
    } catch (error) {
      console.error('Token refresh error:', error)
      // If refresh fails, logout user
      logout()
      throw error
    }
  }

  // Update user profile
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData
    })
    
    // Force re-render by updating localStorage timestamp
    if (userData.avatar) {
      const storageData = getUserFromStorage()
      if (storageData) {
        storageData.avatar = userData.avatar
        storageData._lastUpdated = Date.now()
        saveUserToStorage(storageData)
      }
    }
  }

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }

  // Check if user has permission
  const hasPermission = (requiredType) => {
    if (!state.user) return false
    
    const accountTypes = ['FREE', 'PREMIUM', 'ADMIN']
    const userLevel = accountTypes.indexOf(state.user.accountType)
    const requiredLevel = accountTypes.indexOf(requiredType)
    
    return userLevel >= requiredLevel
  }

  // Check if user can upload
  const canUpload = () => {
    return state.isAuthenticated && state.user // Todos os usuários autenticados podem fazer upload
  }

  // Check if user is admin
  const isAdmin = () => {
    return state.user?.accountType === 'ADMIN'
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    refreshAccessToken,
    updateUser,
    clearError,
    hasPermission,
    canUpload,
    isAdmin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
} 