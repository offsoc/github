import {createContext, useContext} from 'react'

import type {MemexProjectColumnId} from '../../../api/columns/contracts/memex-column'
import type {ColumnModel} from '../../../models/column-model'

export const VerticalGroupedByContext = createContext<{
  groupedByColumnId: MemexProjectColumnId | undefined
  setGroupedBy: (viewNumber: number, column: ColumnModel) => void
  isGroupedByDirty: boolean
  groupedByColumn: ColumnModel | undefined
} | null>(null)
/**
 * This hook exposes the currently grouped column that is used in the board view
 * as represented by query params in the URL, as well as functions to update and
 * clear the grouping details in the URL.
 */
export const useVerticalGroupedBy = () => {
  const ctx = useContext(VerticalGroupedByContext)
  if (!ctx) throw new Error('useVerticalGroupedBy must be used within a VerticalGroupedByContext')
  return ctx
}
