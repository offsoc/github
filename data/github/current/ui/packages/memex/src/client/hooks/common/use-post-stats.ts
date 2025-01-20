import {useCallback, useContext} from 'react'

import {apiPostStats} from '../../api/stats/api-post-stats'
import type {PostStatsRequest} from '../../api/stats/contracts'
import {getInitialState} from '../../helpers/initial-state'
import {ViewContext} from '../use-views'

/**
 * Reads the current view number from the view context,
 * but allows an undefined return value in the case
 * we aren't in such a context, so we can pass
 * in the value manually
 */
const useCurrentViewNumber = () => {
  const ctx = useContext(ViewContext)

  return ctx?.currentView?.number
}

export const usePostStats = () => {
  const currentViewNumber = useCurrentViewNumber()
  const {loggedInUser} = getInitialState()

  const postStats = useCallback(
    (payload: PostStatsRequest['payload']) => {
      if (!loggedInUser?.id) {
        // ignore stats events for anonymous users
        return
      }

      apiPostStats({
        payload: {
          memexProjectViewNumber: currentViewNumber,
          ...payload,
        },
      })
    },
    [currentViewNumber, loggedInUser],
  )

  return {postStats}
}
