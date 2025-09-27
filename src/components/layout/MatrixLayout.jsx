import React, { lazy, Suspense } from 'react'
import Navbar from './Navbar'
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
          className="w-full h-full"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-20">
        <Navbar />
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}

export default MatrixLayout
