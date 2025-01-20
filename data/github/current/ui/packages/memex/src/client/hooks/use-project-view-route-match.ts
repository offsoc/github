import {useLocation} from 'react-router-dom'

import {PROJECT_ROUTE, PROJECT_VIEW_ROUTE} from '../routes'

export function useProjectViewRouteMatch<Params extends {[K in keyof Params]?: string} = {projectNumber: string}>() {
  const location = useLocation()
  for (const route of [PROJECT_VIEW_ROUTE, PROJECT_ROUTE]) {
    const match = route.matchPath(location.pathname)

    if (match) {
      return {
        projectViewRoutesMatch: match,
        isProjectViewRoute: true,
      }
    }
  }

  return {projectViewRoutesMatch: null, isProjectViewRoute: false}
}
