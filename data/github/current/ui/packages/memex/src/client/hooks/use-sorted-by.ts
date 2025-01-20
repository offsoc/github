import {createContext, useContext} from 'react'

import type {SortDirection} from '../api/view/contracts'
import type {ColumnModel} from '../models/column-model'
import type {LocalSort} from './use-view-state-reducer/types'

export interface SortedByContext {
  /** The sorts for the current view in priority order (ie, 0 = primary sort, 1 = secondary sort ...) */
  sorts: ReadonlyArray<LocalSort>
  /** Change all sorts for the current view. */
  setSortedBy: (...sorts: ReadonlyArray<LocalSort>) => void
  /** Clear sorts for the current view. If index is passed, will clear sorts on and after that point. */
  clearSortedBy: (index?: number) => void
  /** `true` if there are unsaved sorting changes in the current view. */
  isSortedByDirty: boolean
  /** `true` if the current view is sorted. */
  isSorted: boolean
  /**
   * Set the sort direction for a column in the current view.
   * If there is a primary sort already, a new sort column will be applied as a secondary sort
   * @param column The column to sort by
   * @param direction The direction to sort. If `null`, will clear the sort for this column. If a primary sort is cleared
   * and a secondary sort is already applied, the secondary sort will become the primary sort
   */
  setColumnSort: (column: ColumnModel, direction: SortDirection | null) => void
  /**
   * Sets the primary sort for a given view, preserving secondary sort
   * This is used for the command palatte, which does not have an implementation for secondary sorting yet
   * @param column The column to sort by
   * @param direction The direction to sort
   */
  setPrimarySortPreservingSecondary: (column: ColumnModel, direction: SortDirection) => void
  /** Get the sort state for a column in the current view. */
  getColumnSort: (column: ColumnModel) => LocalSort | undefined
}

export const SortedByContext = createContext<SortedByContext | null>(null)

export const useSortedBy = () => {
  const ctx = useContext(SortedByContext)
  if (!ctx) throw new Error('useSortedBy must be used within a SortedByContext')
  return ctx
}
