import React from 'react'
import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen w-full relative bg-gray-900 overflow-hidden">
      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center section-padding">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">Página não encontrada</h2>
          <p className="text-gray-400 mb-8">A página que você está procurando não existe.</p>
          <Link to="/" className="btn-primary">
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage 