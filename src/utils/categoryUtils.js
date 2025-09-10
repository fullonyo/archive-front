import { 
  UserCircleIcon, 
  GlobeAltIcon, 
  SparklesIcon, 
  StarIcon,
  WrenchScrewdriverIcon,
  CubeIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'
import { CATEGORY_ICON_MAP, CATEGORY_COLOR_MAP } from '../constants/categories'

// Mapeamento real dos ícones
const iconComponents = {
  UserCircleIcon,
  GlobeAltIcon,
  SparklesIcon,
  StarIcon,
  WrenchScrewdriverIcon,
  CubeIcon,
  EllipsisHorizontalIcon
}

export const getIconComponent = (iconName) => {
  const mappedIconName = CATEGORY_ICON_MAP[iconName]
  return iconComponents[mappedIconName] || CubeIcon
}

export const getColorClasses = (colorName) => {
  return CATEGORY_COLOR_MAP[colorName] || CATEGORY_COLOR_MAP.gray
}

export const getCategoryDisplayInfo = (category) => {
  return {
    IconComponent: getIconComponent(category.icon),
    colorClasses: getColorClasses(category.color),
    isAvatarCategory: category.name === 'avatars'
  }
}
