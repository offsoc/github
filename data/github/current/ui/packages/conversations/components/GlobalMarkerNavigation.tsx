import {ChevronLeftIcon, ChevronRightIcon} from '@primer/octicons-react'
import {Box, IconButton, Text} from '@primer/react'

import type {DiffAnnotation, MarkerNavigationImplementation, NavigationThread} from '../types'

/**
 * Returns the position of this marker in the list of markers for the line, ie. 1 of 4.
 */
function MarkerPosition({markerId, markers}: {markerId: string; markers: Array<NavigationThread | DiffAnnotation>}) {
  const index = markers.findIndex(marker => marker.id === markerId)
  return (
    <Text sx={{color: 'fg.muted'}}>
      <Text sx={{fontWeight: 500, color: 'fg.default'}}>{index + 1}</Text> of{' '}
      <Text sx={{fontWeight: 500, color: 'fg.default'}}>{markers.length}</Text>
    </Text>
  )
}

export type GlobalMarkerNavigationProps = {
  markerId: string
  markerNavigationImplementation: MarkerNavigationImplementation
  onNavigate: () => void
}

/**
 * Shows the left/right chevrons to navigate through the markers of the pull request
 */
export function GlobalMarkerNavigation({
  markerId,
  markerNavigationImplementation,
  onNavigate,
}: GlobalMarkerNavigationProps) {
  const {incrementActiveMarker, decrementActiveMarker, filteredMarkers} = markerNavigationImplementation
  const showGlobalNavigation = filteredMarkers.find(current => current.id === markerId) && filteredMarkers.length > 1

  if (!showGlobalNavigation) return null

  return (
    <Box sx={{pr: 1, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
      {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
      <IconButton
        unsafeDisableTooltip={true}
        aria-label="Load previous marker"
        icon={ChevronLeftIcon}
        variant="invisible"
        onClick={() => {
          decrementActiveMarker(markerId)
          onNavigate()
        }}
      />
      {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
      <IconButton
        unsafeDisableTooltip={true}
        aria-label="Load next marker"
        icon={ChevronRightIcon}
        variant="invisible"
        onClick={() => {
          incrementActiveMarker(markerId)
          onNavigate()
        }}
      />
      <Box sx={{ml: 1}}>
        <MarkerPosition markerId={markerId} markers={filteredMarkers} />
      </Box>
    </Box>
  )
}
