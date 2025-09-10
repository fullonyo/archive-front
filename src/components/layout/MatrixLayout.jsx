import React, { lazy, Suspense } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import LoadingSpinner from '../ui/LoadingSpinner'
import VRChatLoading from '../ui/VRChatLoading'
import StableMatrixBackground from '../ui/StableMatrixBackground'

const MatrixLayout = ({ children }) => {
  return (
    <div className="w-full relative bg-gray-900">
      {/* Matrix Background - Fixed to viewport */}
      <div className="fixed inset-0 z-0">
        <StableMatrixBackground 
          fallbackType="vrchat"
          className="fixed inset-0 z-0"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default MatrixLayout
