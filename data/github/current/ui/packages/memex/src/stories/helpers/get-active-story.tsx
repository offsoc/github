import {PROJECT_ROUTE} from '../../client/routes'
import {defaultStoryId, getStoryId} from '../story-definitions'

export function getActiveStoryId() {
  if (window.location.pathname) {
    const match = PROJECT_ROUTE.matchFullPathOrChildPaths(window.location.pathname)

    if (match) {
      return getStoryId(match.params)
    }
  }
  return defaultStoryId
}
