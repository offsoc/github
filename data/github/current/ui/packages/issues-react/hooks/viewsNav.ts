import {HOTKEYS} from '@github-ui/issue-viewer/Hotkeys'
import {useKeyPress} from '@github-ui/use-key-press'
import {useNavigate} from '@github-ui/use-navigate'
import {useCallback} from 'react'

import {useQueryContext} from '../contexts/QueryContext'
import type {SavedViewRoute} from '../types/views-types'
import {searchUrl} from '../utils/urls'
import useKnownViews from './use-known-views'
import {useRouteInfo} from './use-route-info'

export const useViewsNav = (savedViewRoutes: SavedViewRoute[], shortcutKeys: string[], startIndex = 0) => {
  const navigate = useNavigate()
  const {viewPosition, setViewPosition, activeSearchQuery, setIsNewView} = useQueryContext()
  const {viewId} = useRouteInfo()
  const {knownViewRoutes} = useKnownViews()

  const getCurrentIndex = useCallback(() => {
    let currentIndex = savedViewRoutes.findIndex(item => item.id === viewId)
    if (!viewPosition && currentIndex !== -1) {
      setViewPosition(savedViewRoutes[currentIndex]!.position)
    }
    if (currentIndex === -1) {
      currentIndex = savedViewRoutes.findIndex(item => item.query === activeSearchQuery)
    }
    return currentIndex
  }, [savedViewRoutes, viewPosition, viewId, setViewPosition, activeSearchQuery])

  const performNavigation = useCallback(
    (savedViewRoute: SavedViewRoute) => {
      setIsNewView(false)
      if (savedViewRoute.query) {
        const url = searchUrl({viewId: savedViewRoute.id, query: undefined})
        navigate(url)
      } else if (savedViewRoute.url) {
        navigate(savedViewRoute.url)
      }

      setViewPosition(savedViewRoute.position)
    },
    [navigate, setIsNewView, setViewPosition],
  )

  const tryNavigate = useCallback(
    (index: number) => {
      if (!isNaN(index) && index >= 0 && index < savedViewRoutes.length) {
        performNavigation(savedViewRoutes[index]!)
      }
    },
    [performNavigation, savedViewRoutes],
  )

  const onNumberShortcutActivated = useCallback(
    (e: KeyboardEvent) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (e.altKey && e.shiftKey) {
        const digit = e.code.substring(e.code.length - 1)
        const index = parseInt(digit, 10) - startIndex - 1
        tryNavigate(index)
      }
    },
    [startIndex, tryNavigate],
  )

  const onUpDownShortcutActivated = useCallback(
    (e: KeyboardEvent) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (e.altKey && e.shiftKey) {
        const currentIndex = getCurrentIndex()
        // The currently highlighted item isn't in the current list of savedViewRoutes
        if (currentIndex === -1) {
          // Check whether we should navigate to the bottom of the predefined shortcuts list
          // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
          if (viewPosition === knownViewRoutes.length + 1 && e.key === 'ArrowUp') {
            tryNavigate(savedViewRoutes.length - 1)
            // Check whether we should navigate to the top of the user's saved views list
            // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
          } else if (viewPosition === knownViewRoutes.length && e.key === 'ArrowDown') {
            tryNavigate(0)
          }
        } else {
          // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
          if (currentIndex >= 1 && e.key === 'ArrowUp') {
            tryNavigate(currentIndex - 1)
            // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
          } else if (currentIndex + 1 < savedViewRoutes.length && e.key === 'ArrowDown') {
            tryNavigate(currentIndex + 1)
          }
        }
      }
    },
    [getCurrentIndex, savedViewRoutes.length, viewPosition, knownViewRoutes.length, tryNavigate],
  )

  useKeyPress([HOTKEYS.up, HOTKEYS.down], onUpDownShortcutActivated)
  useKeyPress(shortcutKeys, onNumberShortcutActivated)
}
