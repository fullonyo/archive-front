/**
 * Utilitário para tratar casos especiais de avatares do sistema
 */

/**
 * Verificar se é um usuário especial do sistema
 */
export const isSystemUser = (username) => {
  if (!username || typeof username !== 'string') return false
  
  const systemUsernames = ['sistema', 'system', 'admin', 'root']
  return systemUsernames.includes(username.toLowerCase().trim())
}

/**
 * Obter avatar padrão para usuários do sistema
 */
export const getSystemUserAvatar = (username) => {
  if (!isSystemUser(username)) return null
  
  const systemAvatars = {
    'sistema': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8cGF0aCBkPSJNNTAgMjBMMzAgNDBMMzAgNjBMNTAgODBMNzAgNjBMNzAgNDBMNTAgMjBaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjkiLz4KPGR5ZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwIiB5MT0iMCIgeDI9IjEwMCIgeTI9IjEwMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjNjM2NkYxIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzgwODBGRiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=',
    'system': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8cGF0aCBkPSJNNTAgMjBMMzAgNDBMMzAgNjBMNTAgODBMNzAgNjBMNzAgNDBMNTAgMjBaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjkiLz4KPGR5ZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwIiB5MT0iMCIgeDI9IjEwMCIgeTI9IjEwMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjNjM2NkYxIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzgwODBGRiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=',
    'admin': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8cGF0aCBkPSJNNTAgMjBMMzAgNDBMMzAgNjBMNTAgODBMNzAgNjBMNzAgNDBMNTAgMjBaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjkiLz4KPGR5ZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwIiB5MT0iMCIgeDI9IjEwMCIgeTI9IjEwMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjRkY2B0MyIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0ZGODBGRiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=',
    'root': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8cGF0aCBkPSJNNTAgMjBMMzAgNDBMMzAgNjBMNTAgODBMNzAgNjBMNzAgNDBMNTAgMjBaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjkiLz4KPGR5ZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwIiB5MT0iMCIgeDI9IjEwMCIgeTI9IjEwMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjRkY0QjAwIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0ZGODAwMCIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo='
  }
  
  return systemAvatars[username.toLowerCase().trim()] || systemAvatars['sistema']
}

/**
 * Normalizar avatar URL para usuários especiais
 */
export const normalizeAvatarUrl = (avatarUrl, username) => {
  // Se já temos uma URL válida, usar ela
  if (avatarUrl && 
      typeof avatarUrl === 'string' && 
      avatarUrl.trim().length > 0 && 
      !['null', 'undefined', 'false'].includes(avatarUrl.toLowerCase().trim())) {
    return avatarUrl
  }
  
  // Para usuários do sistema, usar avatar especial
  if (isSystemUser(username)) {
    console.log(`🔧 SystemAvatar: Using special avatar for system user: ${username}`)
    return getSystemUserAvatar(username)
  }
  
  // Para outros usuários sem avatar, retornar null para usar DefaultAvatar
  return null
}

/**
 * Verificar se uma URL é um avatar do sistema
 */
export const isSystemAvatar = (url) => {
  if (!url || typeof url !== 'string') return false
  return url.startsWith('data:image/svg+xml;base64,')
}
