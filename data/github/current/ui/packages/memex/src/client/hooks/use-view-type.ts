import {createContext, useContext} from 'react'

import type {SwitchLayout} from '../api/stats/contracts'
import type {ViewType} from '../helpers/view-type'
import type {BaseViewState} from '../hooks/use-view-state-reducer/types'

export const ViewTypeContext = createContext<{
  viewType: ViewType
  setViewType: (view: BaseViewState, viewType: ViewType, source: SwitchLayout['ui']) => void
  isViewTypeDirty: boolean
} | null>(null)

/**
 * Consume the view type context value.
 *
 * @returns The current view type context value
 */
export function useViewType() {
  const value = useContext(ViewTypeContext)

  if (!value) {
    throw new Error('useViewType must be used inside a ViewTypeProvider')
  }

  return value
}
