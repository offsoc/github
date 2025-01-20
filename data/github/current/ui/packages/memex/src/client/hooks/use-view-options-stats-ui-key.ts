import {createContext, useContext} from 'react'

import {ViewOptionsMenuUI, type ViewOptionsUIType} from '../api/stats/contracts'

export const ViewOptionsStatsUiContext = createContext<ViewOptionsUIType>(ViewOptionsMenuUI)

/**
 * When submitting stats for view option submenus, used to identify the parent UI
 */
export function useViewOptionsStatsUiKey() {
  const ctx = useContext(ViewOptionsStatsUiContext)
  return ctx
}
