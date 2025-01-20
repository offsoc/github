import {memo, useCallback, useMemo} from 'react'

import {VerticalGroupedByContext} from '../features/grouping/hooks/use-vertical-grouped-by'
import {ViewStateActionTypes} from '../hooks/use-view-state-reducer/view-state-action-types'
import {useViews} from '../hooks/use-views'
import type {ColumnModel} from '../models/column-model'

export const VerticalGroupedByProvider = memo<{
  children?: React.ReactNode
}>(function VerticalGroupedByProvider({children}) {
  const {currentView, viewStateDispatch} = useViews()
  const setGroupedBy = useCallback(
    (viewNumber: number, column: ColumnModel): void => {
      viewStateDispatch({type: ViewStateActionTypes.SetVerticalGroupedBy, viewNumber, column})
    },
    [viewStateDispatch],
  )

  return (
    <VerticalGroupedByContext.Provider
      value={useMemo(() => {
        return {
          groupedByColumnId: currentView?.localViewStateDeserialized.verticalGroupByColumns[0]?.id,
          groupedByColumn: currentView?.localViewStateDeserialized.verticalGroupByColumns[0],
          setGroupedBy,
          isGroupedByDirty: currentView?.isVerticalGroupedByDirty ?? false,
        }
      }, [
        currentView?.isVerticalGroupedByDirty,
        currentView?.localViewStateDeserialized.verticalGroupByColumns,
        setGroupedBy,
      ])}
    >
      {children}
    </VerticalGroupedByContext.Provider>
  )
})
