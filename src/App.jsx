import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { usePermissions } from './hooks/usePermissions'

// Layout components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import MatrixLayout from './components/layout/MatrixLayout'
import LoadingSpinner from './components/ui/LoadingSpinner'
import MatrixBackgroundProvider from './components/ui/MatrixBackgroundProvider'

// Page components
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ConfirmEmailPage from './pages/ConfirmEmailPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import RankingsPage from './pages/RankingsPage'
import AssetDetailPage from './pages/AssetDetailPage'
import UploadPage from './pages/UploadPage'
import CategoriesPage from './pages/CategoriesPage'
import AdminPage from './pages/AdminPage'
import VRChatAPIPage from './pages/VRChatAPIPage'
import NotFoundPage from './pages/NotFoundPage'

// Protected route component
function ProtectedRoute({ children, requireAuth = true, requireUpload = false, requireAdmin = false }) {
  const { isAuthenticated, isLoading, canUpload } = useAuth()
  const { canAccessAdminPanel } = usePermissions()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireUpload && !canUpload()) {
    return <Navigate to="/dashboard" replace />
  }

  if (requireAdmin && !canAccessAdminPanel) {
    return <Navigate to="/" replace />
  }

  return children
}

// Public route component (redirect to homepage if already authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-400">Carregando Archive Nyo...</p>
        </div>
      </div>
    )
  }

  return (
    <MatrixBackgroundProvider defaultTheme="vrchat">
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Routes>
          {/* Root Route - HomePage for authenticated users, redirect to login for non-authenticated */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <MatrixLayout>
                  <HomePage />
                </MatrixLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Public Routes - No Header/Footer */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/confirm-email" 
            element={
              <PublicRoute>
                <ConfirmEmailPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/reset-password" 
            element={
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes - With Header/Footer */}
          <Route 
            path="/rankings" 
            element={
              <ProtectedRoute>
                <MatrixLayout>
                  <RankingsPage />
                </MatrixLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <MatrixLayout>
                  <DashboardPage />
                </MatrixLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <MatrixLayout>
                  <ProfilePage />
                </MatrixLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/:id" 
            element={
              <ProtectedRoute>
                <MatrixLayout>
                  <ProfilePage />
                </MatrixLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/upload" 
            element={
              <ProtectedRoute>
                <MatrixLayout>
                  <UploadPage />
                </MatrixLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/marketplace" 
            element={
              <ProtectedRoute>
                <MatrixLayout>
                  <CategoriesPage />
                </MatrixLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/asset/:id" 
            element={
              <ProtectedRoute>
                <MatrixLayout>
                  <AssetDetailPage />
                </MatrixLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/categories" 
            element={
              <ProtectedRoute>
                <MatrixLayout>
                  <CategoriesPage />
                </MatrixLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/categories/:categoryId" 
            element={
              <ProtectedRoute>
                <MatrixLayout>
                  <CategoriesPage />
                </MatrixLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/categories/:categoryId/:subcategoryId" 
            element={
              <ProtectedRoute>
                <MatrixLayout>
                  <CategoriesPage />
                </MatrixLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin>
                <MatrixLayout>
                  <AdminPage />
                </MatrixLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vrchat-api" 
            element={
              <ProtectedRoute>
                <MatrixLayout>
                  <VRChatAPIPage />
                </MatrixLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={
            <MatrixLayout>
              <NotFoundPage />
            </MatrixLayout>
          } />
        </Routes>
        
      </div>
    </MatrixBackgroundProvider>
  )
}

export default App 