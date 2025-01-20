import {useMemo} from 'react'
import {useMatch} from 'react-router-dom'
import invariant from 'tiny-invariant'

import {PROJECT_ROUTE} from '../routes'

/**
 * Memex only renders in side of a set of paths that are prefixed with a project route
 * so these invariants should always be true
 */
export function useProjectRouteParams() {
  const projectRouteMatch = useMatch(PROJECT_ROUTE.pathWithChildPaths)
  invariant(projectRouteMatch)
  const {ownerType, ownerIdentifier, projectNumber} = projectRouteMatch.params
  invariant(ownerType)
  invariant(ownerIdentifier)
  invariant(projectNumber)

  return useMemo(
    () => ({
      ownerType,
      ownerIdentifier,
      projectNumber: parseInt(projectNumber, 10),
    }),
    [ownerType, ownerIdentifier, projectNumber],
  )
}
