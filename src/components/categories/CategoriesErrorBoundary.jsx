import React from 'react'
import { motion } from 'framer-motion'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

class CategoriesErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Categories Error Boundary caught an error:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6 max-w-md mx-auto p-8"
          >
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full"></div>
              <ExclamationTriangleIcon className="absolute inset-2 w-16 h-16 text-red-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              Ops! Algo deu errado
            </h2>
            
            <p className="text-slate-400 text-lg mb-8">
              Ocorreu um erro inesperado ao carregar as categorias. Nossa equipe foi notificada.
            </p>

            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 border border-indigo-500 rounded-lg text-white font-medium transition-all duration-200"
              >
                Recarregar página
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.history.back()}
                className="w-full px-6 py-3 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/50 rounded-lg text-slate-300 font-medium transition-all duration-200"
              >
                Voltar
              </motion.button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 p-4 bg-slate-800/50 rounded-lg text-left">
                <summary className="text-red-400 cursor-pointer mb-2">
                  Detalhes do erro (desenvolvimento)
                </summary>
                <pre className="text-xs text-slate-400 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

export default CategoriesErrorBoundary
