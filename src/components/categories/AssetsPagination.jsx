import React from 'react'

const AssetsPagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) {
    return null
  }

  const currentPage = pagination.currentPage
  const totalPages = pagination.totalPages
  const pages = []
  
  if (currentPage > 3) {
    pages.push(1)
    if (currentPage > 4) pages.push('...')
  }
  
  const start = Math.max(1, currentPage - 2)
  const end = Math.min(totalPages, currentPage + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  if (currentPage < totalPages - 2) {
    if (currentPage < totalPages - 3) pages.push('...')
    pages.push(totalPages)
  }

  const startItem = ((currentPage - 1) * pagination.limit) + 1
  const endItem = Math.min(currentPage * pagination.limit, pagination.total)

  return (
    <div className="mt-12 flex flex-col items-center space-y-4">
      {/* Page controls */}
      <nav className="flex items-center space-x-2" aria-label="Paginação">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Página anterior"
        >
          Anterior
        </button>
        
        {/* Page numbers */}
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span 
                key={`ellipsis-${index}`} 
                className="px-3 py-2 text-slate-400"
                aria-hidden="true"
              >
                ...
              </span>
            )
          }
          
          const isCurrentPage = page === currentPage
          
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isCurrentPage
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50'
              }`}
              aria-label={`Página ${page}`}
              aria-current={isCurrentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        })}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Próxima página"
        >
          Próximo
        </button>
      </nav>
      
      {/* Results info */}
      <div className="text-center text-sm text-slate-400" aria-live="polite">
        Mostrando {startItem} - {endItem} de {pagination.total} assets
      </div>
    </div>
  )
}

export default AssetsPagination
