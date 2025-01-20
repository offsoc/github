import {memo, useCallback, useMemo} from 'react'

import {HorizontalGroupedByContext} from '../features/grouping/hooks/use-horizontal-grouped-by'
import {useCollapsedGroups} from '../hooks/use-collapsed-groups'
import {ViewStateActionTypes} from '../hooks/use-view-state-reducer/view-state-action-types'
import {useViews} from '../hooks/use-views'
import type {ColumnModel} from '../models/column-model'

const emptyCollapsedGroups: Array<string> = []
export const HorizontalGroupedByProvider = memo<{
  children?: React.ReactNode
}>(function HorizontalGroupedByProvider({children}) {
  const {currentView, viewStateDispatch} = useViews()
  const [allCollapsedGroups, setAllCollapsedGroups] = useCollapsedGroups()
  const currentViewNumber = currentView?.number ?? -1

  const setGroupedBy = useCallback(
    (viewNumber: number, column: ColumnModel): void => {
      viewStateDispatch({type: ViewStateActionTypes.SetHorizontalGroupedBy, viewNumber, column})

      // Do not persist collapsed groups when changing grouped by column
      setAllCollapsedGroups(prevCollapsedGroups => ({
        ...prevCollapsedGroups,
        [currentViewNumber]: [],
      }))
    },
    [viewStateDispatch, setAllCollapsedGroups, currentViewNumber],
  )

  const clearGroupedBy = useCallback(
    (viewNumber: number) => {
      viewStateDispatch({type: ViewStateActionTypes.ClearHorizontalGroupedBy, viewNumber})
    },
    [viewStateDispatch],
  )

  const toggleGroupCollapsed = useCallback(
    (value: string) => {
      setAllCollapsedGroups(prevCollapsedGroups => {
        const collapsedGroups = prevCollapsedGroups[currentViewNumber] ?? []
        const isCollapsed = collapsedGroups.includes(value)

        if (isCollapsed) {
          return {
            ...prevCollapsedGroups,
            [currentViewNumber]: collapsedGroups.filter(v => v !== value),
          }
        }

        return {...prevCollapsedGroups, [currentViewNumber]: [...collapsedGroups, value]}
      })
    },
    [currentViewNumber, setAllCollapsedGroups],
  )

  return (
    <HorizontalGroupedByContext.Provider
      value={useMemo(() => {
        return {
          groupedByColumnId: currentView?.localViewStateDeserialized.horizontalGroupByColumns[0]?.id,
          groupedByColumn: currentView?.localViewStateDeserialized.horizontalGroupByColumns[0],
          setGroupedBy,
          clearGroupedBy,
          isGroupedByDirty: currentView?.isHorizontalGroupedByDirty ?? false,
          collapsedGroups: allCollapsedGroups[currentViewNumber] ?? emptyCollapsedGroups,
          toggleGroupCollapsed,
        }
      }, [
        clearGroupedBy,
        currentView?.isHorizontalGroupedByDirty,
        currentView?.localViewStateDeserialized.horizontalGroupByColumns,
        setGroupedBy,
        allCollapsedGroups,
        toggleGroupCollapsed,
        currentViewNumber,
      ])}
    >
      {children}
    </HorizontalGroupedByContext.Provider>
  )
})
