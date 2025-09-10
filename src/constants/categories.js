// Constantes para categorias e subcategorias
export const AVATAR_SUBCATEGORIES = {
  BOOTH: 10,
  GUMROAD: 11
}

export const SUBCATEGORY_NAMES = {
  AVATAR_BOOTH: 'avatar-booth',
  AVATAR_GUMROAD: 'avatar-gumroad'
}

export const CATEGORY_NAMES = {
  AVATARS: 'avatars'
}

export const SORT_OPTIONS = {
  NEWEST: 'newest',
  POPULAR: 'popular', 
  DOWNLOADS: 'downloads',
  NAME: 'name'
}

export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list'
}

export const PAGINATION_CONFIG = {
  DEFAULT_LIMIT: 20,
  SEARCH_DEBOUNCE: 800 // Aumentado de 500ms para 800ms
}

// Mapeamento de ícones para categorias
export const CATEGORY_ICON_MAP = {
  'user-circle': 'UserCircleIcon',
  'globe-alt': 'GlobeAltIcon',
  'sparkles': 'SparklesIcon',
  'star': 'StarIcon',
  'wrench-screwdriver': 'WrenchScrewdriverIcon',
  'cube': 'CubeIcon',
  'ellipsis-horizontal': 'EllipsisHorizontalIcon',
  'user': 'UserCircleIcon',
  'cog-6-tooth': 'WrenchScrewdriverIcon',
  'shopping-bag': 'CubeIcon',
  'building-storefront': 'CubeIcon',
  'device-phone-mobile': 'GlobeAltIcon',
  'computer-desktop': 'GlobeAltIcon',
  'user-group': 'UserCircleIcon',
  'puzzle-piece': 'CubeIcon',
  'rectangle-stack': 'SparklesIcon',
  'square-3-stack-3d': 'SparklesIcon',
  'rectangle-group': 'SparklesIcon',
  'shoe-prints': 'SparklesIcon',
  'eye': 'StarIcon',
  'adjustments-horizontal': 'WrenchScrewdriverIcon',
  'code-bracket': 'WrenchScrewdriverIcon',
  'photo': 'CubeIcon',
  'squares-2x2': 'CubeIcon',
  'musical-note': 'CubeIcon',
  'play': 'CubeIcon'
}

// Mapeamento de cores para categorias
export const CATEGORY_COLOR_MAP = {
  indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500',
  blue: 'from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500',
  purple: 'from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500',
  pink: 'from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500',
  green: 'from-green-500 to-green-600 hover:from-green-400 hover:to-green-500',
  orange: 'from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500',
  gray: 'from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500'
}

// Tipos de erro da API
export const API_ERROR_TYPES = {
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403
}

// Mensagens de erro personalizadas
export const ERROR_MESSAGES = {
  [API_ERROR_TYPES.NOT_FOUND]: 'Categoria não encontrada',
  [API_ERROR_TYPES.INTERNAL_SERVER_ERROR]: 'Erro interno do servidor',
  [API_ERROR_TYPES.UNAUTHORIZED]: 'Você precisa estar logado',
  [API_ERROR_TYPES.FORBIDDEN]: 'Acesso negado',
  GENERIC: 'Erro ao carregar dados',
  CATEGORIES: 'Erro ao carregar categorias',
  ASSETS: 'Erro ao carregar assets'
}
