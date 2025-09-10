import { useCachedAPI } from '../../hooks/useCachedAPI'
import { assetsAPI } from '../../services/api'

export const useRecentActivity = () => {
  return useCachedAPI(
    'recent-activity',
    () => assetsAPI.getRecent(),
    []
  )
}
