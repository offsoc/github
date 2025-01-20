import {useCallback} from 'react'
import {useLocation} from 'react-router-dom'

import {useNavigate} from '../../router'
import {useProjectRouteParams} from '../../router/use-project-route-params'
import {useProjectViewRouteMatch} from '../use-project-view-route-match'
import {getPathDescriptor} from './get-path-descriptor'
import type {CurrentView} from './types'

/**
 * A function for checking the current state and updating the url
 * properly based on the latest state
 */
export function useHandleUrlUpdate() {
  const navigate = useNavigate()
  const location = useLocation()
  const {isProjectViewRoute} = useProjectViewRouteMatch()
  const projectRouteParams = useProjectRouteParams()

  return useCallback(
    (currentView: CurrentView | undefined, {replace}: {replace?: boolean}) => {
      if (!currentView) return
      if (!isProjectViewRoute) return

      const nextLocationDescriptor = getPathDescriptor(currentView, projectRouteParams, location.search)
      if (
        nextLocationDescriptor.pathname === location.pathname &&
        // location.search has a leading `?` where the nextLocationDescriptor doesn't
        nextLocationDescriptor.search === location.search.slice(1)
      ) {
        return
      }

      navigate(nextLocationDescriptor, {replace})
    },
    [location.search, location.pathname, isProjectViewRoute, navigate, projectRouteParams],
  )
}
