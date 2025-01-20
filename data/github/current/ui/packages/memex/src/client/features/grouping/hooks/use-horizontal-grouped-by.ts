import {createContext, useContext} from 'react'

import type {MemexProjectColumnId} from '../../../api/columns/contracts/memex-column'
import type {ColumnModel} from '../../../models/column-model'

export const HorizontalGroupedByContext = createContext<{
  groupedByColumnId: MemexProjectColumnId | undefined
  setGroupedBy: (viewNumber: number, column: ColumnModel) => void
  clearGroupedBy: (viewNumber: number) => void
  isGroupedByDirty: boolean
  groupedByColumn: ColumnModel | undefined
  collapsedGroups: Array<string>
  toggleGroupCollapsed: (groupId: string) => void
} | null>(null)
/**
 * This hook exposes the currently grouped column that is used in the table view
 * as represented by query params in the URL, as well as functions to update and
 * clear the grouping details in the URL.
 */
export const useHorizontalGroupedBy = () => {
  const ctx = useContext(HorizontalGroupedByContext)
  if (!ctx) throw new Error('useHorizontalGroupedBy must be used within a HorizontalGroupedByContext')
  return ctx
}
