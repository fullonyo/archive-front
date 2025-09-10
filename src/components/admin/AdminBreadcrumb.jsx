import React from 'react'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

const SECTION_NAMES = {
  'dashboard': 'Dashboard',
  'access-requests': 'Aprovações de Cadastro',
  'assets': 'Aprovação de Assets',
  'permissions': 'Gerenciamento de Permissões',
  'users': 'Listagem de Usuários',
  'account-management': 'Gerenciamento de Contas'
}

const AdminBreadcrumb = ({ currentSection, onNavigate }) => {
  if (!currentSection || currentSection === 'dashboard') {
    return null
  }

  const sectionName = SECTION_NAMES[currentSection] || currentSection

  return (
    <nav className="flex items-center space-x-2 mb-4" aria-label="Breadcrumb">
      <button
        onClick={() => onNavigate('dashboard')}
        className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
      >
        Administração
      </button>
      <ChevronRightIcon className="w-4 h-4 text-slate-500" />
      <span className="text-red-400 font-medium text-sm">
        {sectionName}
      </span>
    </nav>
  )
}

export default AdminBreadcrumb
