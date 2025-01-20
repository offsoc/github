import {useMemo} from 'react'

import {EMPTY_VIEW, KNOWN_VIEWS, PULLS_ASSIGNED_TO_ME_VIEW} from '../constants/view-constants'
import type {SavedViewRoute} from '../types/views-types'

export default function useKnownViews() {
  return useMemo(() => {
    const knownViews = [...KNOWN_VIEWS]

    knownViews.push(EMPTY_VIEW)
    knownViews.push(PULLS_ASSIGNED_TO_ME_VIEW)

    const knownViewRoutes: SavedViewRoute[] = knownViews.map((shortcut, index) => ({
      id: shortcut.id,
      name: shortcut.name,
      query: shortcut.query,
      position: index + 1,
      url: shortcut.url,
    }))

    return {knownViews, knownViewRoutes}
  }, [])
}
