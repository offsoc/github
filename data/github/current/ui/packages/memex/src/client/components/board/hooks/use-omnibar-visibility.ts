import {useCallback} from 'react'

import {clearFocus, focusOmnibar, useStableBoardNavigation} from '../navigation'

type OmnibarVisibility = {
  /** Switch the Omnibar to its enabled state */
  enableOmnibar: (opts?: {columnId?: string; horizontalGroupIndex: number}) => void
  /** Switch the Omnibar to its disabled state */
  disableOmnibar: () => void
}

/**
 * Get an object describing the current Omnibar state, along with methods to
 * update it.
 */
export const useOmnibarVisibility = (): OmnibarVisibility => {
  const {navigationDispatch} = useStableBoardNavigation()

  const enableOmnibar = useCallback(
    (opts: {columnId?: string; horizontalGroupIndex: number} = {horizontalGroupIndex: 0}) => {
      navigationDispatch(focusOmnibar(opts.columnId, opts.horizontalGroupIndex))
    },
    [navigationDispatch],
  )

  const disableOmnibar = useCallback(() => {
    navigationDispatch(clearFocus())
  }, [navigationDispatch])

  return {
    enableOmnibar,
    disableOmnibar,
  }
}
