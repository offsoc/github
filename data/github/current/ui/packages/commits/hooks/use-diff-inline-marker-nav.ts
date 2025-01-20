import type {MarkerNavigationImplementation} from '@github-ui/conversations'
import {noop} from '@github-ui/noop'
import {useMemo} from 'react'

export function useDiffInlineMarkerNav(): MarkerNavigationImplementation {
  return useMemo(
    () => ({
      filteredMarkers: [],
      activeGlobalMarkerID: '',
      decrementActiveMarker: noop,
      incrementActiveMarker: noop,
      onActivateGlobalMarkerNavigation: noop,
    }),
    [],
  )
}
