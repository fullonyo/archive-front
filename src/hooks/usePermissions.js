import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

// Níveis de permissão do sistema (sincronizado com backend)
export const PERMISSION_LEVELS = {
  SISTEMA: {
    id: 'SISTEMA',
    name: 'Sistema',
    level: 100,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10 border-red-500/30',
    description: 'Acesso master de desenvolvedor - controla todas as permissões'
  },
  ADMIN: {
    id: 'ADMIN',
    name: 'Administração',
    level: 90,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10 border-orange-500/30',
    description: 'Gerenciamento completo da plataforma'
  },
  MODERATOR: {
    id: 'MODERATOR',
    name: 'Moderador',
    level: 80,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10 border-yellow-500/30',
    description: 'Moderação de conteúdo e usuários'
  },
  CREATOR: {
    id: 'CREATOR',
    name: 'Creator',
    level: 70,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/30',
    description: 'Upload e gerenciamento de assets'
  },
  USER: {
    id: 'USER',
    name: 'Usuário',
    level: 10,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    description: 'Acesso básico à plataforma'
  }
}

// Permissões específicas do sistema (sincronizado com backend)
export const PERMISSIONS = {
  // Gestão de usuários
  MANAGE_USERS: 'manage_users',
  APPROVE_USERS: 'approve_users',
  BAN_USERS: 'ban_users',
  VIEW_USER_DETAILS: 'view_user_details',
  
  // Gestão de assets
  MANAGE_ASSETS: 'manage_assets',
  APPROVE_ASSETS: 'approve_assets',
  DELETE_ASSETS: 'delete_assets',
  MODERATE_ASSETS: 'moderate_assets',
  
  // Gestão de categorias
  MANAGE_CATEGORIES: 'manage_categories',
  CREATE_CATEGORIES: 'create_categories',
  DELETE_CATEGORIES: 'delete_categories',
  
  // Gestão do sistema
  MANAGE_PERMISSIONS: 'manage_permissions',
  VIEW_ADMIN_PANEL: 'view_admin_panel',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_SETTINGS: 'manage_settings',
  
  // Uploads
  UPLOAD_ASSETS: 'upload_assets',
  UPLOAD_PREMIUM: 'upload_premium',
  
  // Moderação
  MODERATE_COMMENTS: 'moderate_comments',
  MODERATE_REPORTS: 'moderate_reports'
}

export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth()
  const [userPermissions, setUserPermissions] = useState([])
  const [userLevel, setUserLevel] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPermissions = async () => {
      if (isAuthenticated && user) {
        try {
          setLoading(true)
          
          console.log('🔐 Buscando permissões para usuário:', user)
          
          // Buscar permissões do backend
          const response = await api.get('/admin/permissions/me')
          console.log('✅ Resposta de permissões:', response.data)
          
          const { permissions, level } = response.data.data
          
          setUserPermissions(permissions || [])
          setUserLevel(PERMISSION_LEVELS[level] || PERMISSION_LEVELS.USER)
          
          console.log('🛡️ Permissões configuradas:', {
            permissions: permissions || [],
            level: PERMISSION_LEVELS[level] || PERMISSION_LEVELS.USER,
            rawLevel: level
          })
          
        } catch (error) {
          console.error('❌ Erro ao buscar permissões:', error)
          console.error('🔍 Detalhes do erro de permissão:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          })
          
          // Fallback: usar role do usuário se disponível
          const mockUserLevel = user.role || 'USER'
          setUserLevel(PERMISSION_LEVELS[mockUserLevel] || PERMISSION_LEVELS.USER)
          
          // Fallback: permissões básicas baseadas na role
          const fallbackPermissions = getFallbackPermissions(mockUserLevel)
          setUserPermissions(fallbackPermissions)
          
          console.log('🔄 Usando fallback de permissões:', {
            level: mockUserLevel,
            permissions: fallbackPermissions
          })
        } finally {
          setLoading(false)
        }
      } else {
        console.log('🚫 Usuário não autenticado ou não existe')
        setUserLevel(null)
        setUserPermissions([])
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [user, isAuthenticated])

  // Função de fallback para permissões quando a API não está disponível
  const getFallbackPermissions = (role) => {
    const LEVEL_PERMISSIONS = {
      SISTEMA: Object.values(PERMISSIONS), // Acesso total
      ADMIN: [
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.APPROVE_USERS,
        PERMISSIONS.BAN_USERS,
        PERMISSIONS.VIEW_USER_DETAILS,
        PERMISSIONS.MANAGE_ASSETS,
        PERMISSIONS.APPROVE_ASSETS,
        PERMISSIONS.DELETE_ASSETS,
        PERMISSIONS.MODERATE_ASSETS,
        PERMISSIONS.MANAGE_CATEGORIES,
        PERMISSIONS.CREATE_CATEGORIES,
        PERMISSIONS.DELETE_CATEGORIES,
        PERMISSIONS.VIEW_ADMIN_PANEL,
        PERMISSIONS.VIEW_ANALYTICS,
        PERMISSIONS.MANAGE_SETTINGS,
        PERMISSIONS.UPLOAD_ASSETS,
        PERMISSIONS.UPLOAD_PREMIUM,
        PERMISSIONS.MODERATE_COMMENTS,
        PERMISSIONS.MODERATE_REPORTS
      ],
      MODERATOR: [
        PERMISSIONS.VIEW_USER_DETAILS,
        PERMISSIONS.MODERATE_ASSETS,
        PERMISSIONS.APPROVE_ASSETS,
        PERMISSIONS.VIEW_ADMIN_PANEL,
        PERMISSIONS.UPLOAD_ASSETS,
        PERMISSIONS.MODERATE_COMMENTS,
        PERMISSIONS.MODERATE_REPORTS
      ],
      CREATOR: [
        PERMISSIONS.UPLOAD_ASSETS,
        PERMISSIONS.UPLOAD_PREMIUM
      ],
      USER: [
        PERMISSIONS.UPLOAD_ASSETS
      ]
    }
    
    return LEVEL_PERMISSIONS[role] || LEVEL_PERMISSIONS.USER
  }

  // Verificar se o usuário tem uma permissão específica
  const hasPermission = (permission) => {
    return Array.isArray(userPermissions) && userPermissions.includes(permission)
  }

  // Verificar se o usuário tem nível mínimo
  const hasMinimumLevel = (requiredLevel) => {
    if (!userLevel) return false
    return userLevel.level >= PERMISSION_LEVELS[requiredLevel].level
  }

  // Verificar se é administrador (ADMIN ou SISTEMA)
  const isAdmin = () => {
    return hasMinimumLevel('ADMIN')
  }

  // Verificar se é sistema (nível master)
  const isSystem = () => {
    return userLevel?.id === 'SISTEMA'
  }

  // Verificar se pode acessar painel admin
  const canAccessAdminPanel = () => {
    try {
      console.log('🔍 Verificando acesso ao painel admin:', {
        userPermissions,
        userLevel: userLevel?.id,
        isAuthenticated
      })
      
      // Verificação defensiva: usuário precisa estar autenticado E ter a permissão
      if (!isAuthenticated || !user) {
        console.log('❌ Usuário não autenticado')
        return false
      }
      
      if (!userLevel) {
        console.log('❌ Nível de usuário não definido')
        return false
      }
      
      // Apenas SISTEMA, ADMIN e MODERATOR podem acessar
      const allowedLevels = ['SISTEMA', 'ADMIN', 'MODERATOR']
      if (!allowedLevels.includes(userLevel.id)) {
        console.log('❌ Nível de usuário não permitido:', userLevel.id)
        return false
      }
      
      // Verificação direta da permissão (evita dependência circular)
      const hasViewAdminPanel = Array.isArray(userPermissions) && 
        userPermissions.includes(PERMISSIONS.VIEW_ADMIN_PANEL)
      
      console.log('✅ Resultado final do acesso admin:', hasViewAdminPanel)
      
      return hasViewAdminPanel
    } catch (error) {
      console.error('❌ Erro na função canAccessAdminPanel:', error)
      return false
    }
  }

  // Verificar se pode gerenciar usuários
  const canManageUsers = () => {
    return hasPermission(PERMISSIONS.MANAGE_USERS)
  }

  // Verificar se pode aprovar usuários
  const canApproveUsers = () => {
    return hasPermission(PERMISSIONS.APPROVE_USERS)
  }

  // Verificar se pode gerenciar assets
  const canManageAssets = () => {
    return hasPermission(PERMISSIONS.MANAGE_ASSETS)
  }

  // Verificar se pode fazer upload
  const canUpload = () => {
    return hasPermission(PERMISSIONS.UPLOAD_ASSETS)
  }

  // Obter todas as permissões disponíveis para debug
  const getAllPermissions = () => {
    return userPermissions
  }

  return {
    userLevel,
    userPermissions,
    loading,
    hasPermission,
    hasMinimumLevel,
    isAdmin,
    isSystem,
    canAccessAdminPanel,
    canManageUsers,
    canApproveUsers,
    canManageAssets,
    canUpload,
    getAllPermissions,
    PERMISSION_LEVELS,
    PERMISSIONS
  }
}

// Hook para simular mudança de role (apenas para desenvolvimento)
export const useRoleChanger = () => {
  const [currentRole, setCurrentRole] = useState('USER')

  const changeRole = (newRole) => {
    setCurrentRole(newRole)
    // Em produção, isso faria uma requisição para a API
    console.log(`Role alterado para: ${newRole}`)
  }

  const availableRoles = Object.keys(PERMISSION_LEVELS)

  return {
    currentRole,
    changeRole,
    availableRoles
  }
}
