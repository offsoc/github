import {memo, useCallback, useMemo} from 'react'

import type {SortDirection} from '../api/view/contracts'
import {SortedByContext} from '../hooks/use-sorted-by'
import type {LocalSort} from '../hooks/use-view-state-reducer/types'
import {ViewStateActionTypes} from '../hooks/use-view-state-reducer/view-state-action-types'
import {useViews} from '../hooks/use-views'
import type {ColumnModel} from '../models/column-model'

export const nextSortDirection = (currentDirection: SortDirection | null): SortDirection | null => {
  switch (currentDirection) {
    case 'asc':
      return 'desc'
    case 'desc':
      return null
    case null:
      return 'asc'
  }
}

export const describeSortRanking = (index: number): string => {
  switch (index) {
    case 0:
      return 'primary'
    case 1:
      return 'secondary'
    default:
      return `no. ${index + 1}`
  }
}

const EMPTY = [] as const

export const SortedByProvider = memo<{
  children?: React.ReactNode
}>(function SortedByProvider({children}) {
  const {currentView, viewStateDispatch} = useViews()

  const viewNumber = currentView?.number

  const sorts = currentView?.localViewStateDeserialized.sortByColumnsAndDirections ?? EMPTY

  const setSortedBy = useCallback(
    (...newSorts: ReadonlyArray<LocalSort>): void => {
      if (viewNumber === undefined) return
      viewStateDispatch({type: ViewStateActionTypes.SetSortedBy, sorts: newSorts, viewNumber})
    },
    [viewNumber, viewStateDispatch],
  )

  const clearSortedBy = useCallback(
    (index = 0) => {
      if (viewNumber === undefined) return
      viewStateDispatch({type: ViewStateActionTypes.SetSortedBy, sorts: sorts.slice(0, index), viewNumber})
    },
    [viewNumber, viewStateDispatch, sorts],
  )

  const getColumnSort = useCallback((column: ColumnModel) => sorts.find(s => s.column.id === column.id), [sorts])

  const setColumnSort = useCallback(
    (column: ColumnModel, direction: SortDirection | null) => {
      const foundIndex = sorts.findIndex(s => s.column.id === column.id)

      if (direction === null && foundIndex > -1) {
        // If we're clearing a sort, preserve other sorts
        const updated = [...sorts]
        // make sure this isn't -1
        updated.splice(foundIndex, 1)
        setSortedBy(...updated)
      } else if (direction == null) {
        // If we are clearing a sort that doesn't exist, noop
        return
      } else if (foundIndex > -1) {
        // If we're already sorting by column, update the direction
        const updated = [...sorts]
        updated.splice(foundIndex, 1, {column, direction})
        setSortedBy(...updated)
      } else {
        let updated = [...sorts]

        if (direction != null) {
          // Ensure max 2 sort columns are applied
          updated = updated.slice(0, 1)
          updated.push({column, direction})
        }

        setSortedBy(...updated)
      }
    },
    [setSortedBy, sorts],
  )

  const setPrimarySortPreservingSecondary = useCallback(
    (column: ColumnModel, direction: SortDirection | null) => {
      const foundIndex = sorts.findIndex(s => s.column.id === column.id)

      // This function does not remove any existing sort
      if (direction == null) return

      // If the column is used for a secondary sort, it will become a secondary sort
      if (foundIndex > 0) {
        setSortedBy({column, direction})
      } else {
        const updated = [...sorts]

        updated.splice(0, 1, {column, direction})

        setSortedBy(...updated)
      }
    },

    [setSortedBy, sorts],
  )

  return (
    <SortedByContext.Provider
      value={useMemo(() => {
        return {
          sorts,
          isSorted: sorts.length > 0,
          setSortedBy,
          clearSortedBy,
          isSortedByDirty: currentView?.isSortedByDirty ?? false,
          setColumnSort,
          setPrimarySortPreservingSecondary,
          getColumnSort,
        }
      }, [
        clearSortedBy,
        currentView?.isSortedByDirty,
        getColumnSort,
        setColumnSort,
        setPrimarySortPreservingSecondary,
        setSortedBy,
        sorts,
      ])}
    >
      {children}
    </SortedByContext.Provider>
  )
})
