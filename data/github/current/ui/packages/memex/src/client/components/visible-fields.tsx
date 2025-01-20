import {memo, useCallback, useMemo} from 'react'

import {
  FieldHideName,
  FieldMove,
  type FieldMoveUIType,
  FieldShowName,
  type FieldVisibilityUIType,
  TableHeaderMenuUI,
} from '../api/stats/contracts'
import {usePostStats} from '../hooks/common/use-post-stats'
import {ViewStateActionTypes} from '../hooks/use-view-state-reducer/view-state-action-types'
import {useViews} from '../hooks/use-views'
import {VisibleFieldsContext} from '../hooks/use-visible-fields'
import type {ColumnModel} from '../models/column-model'
import {useDestroyColumn} from '../state-providers/columns/use-destroy-column'

export const VisibleFieldsProvider = memo<{
  children?: React.ReactNode
}>(function VisibleFieldsProvider({children}) {
  const {currentView, viewStateDispatch} = useViews()
  const {postStats} = usePostStats()

  const {destroyColumn} = useDestroyColumn()

  const removeField = useCallback(
    (column: ColumnModel) => {
      viewStateDispatch({type: ViewStateActionTypes.RemoveField, column})

      return destroyColumn(column.id.toString())
    },
    [destroyColumn, viewStateDispatch],
  )

  const showField = useCallback(
    (viewNumber: number, column: ColumnModel) => {
      viewStateDispatch({type: ViewStateActionTypes.ShowField, viewNumber, column})
    },
    [viewStateDispatch],
  )

  const hideField = useCallback(
    (viewNumber: number, column: ColumnModel) => {
      viewStateDispatch({type: ViewStateActionTypes.HideField, viewNumber, column})
    },
    [viewStateDispatch],
  )

  const isFieldVisible = useCallback(
    (column: ColumnModel) => {
      if (!currentView) return false

      // We do a check for the actual column model here, since the "new memex"
      // columns have no database ID.

      return Boolean(currentView.localViewStateDeserialized.visibleFields.find(col => col.id === column.id))
    },
    [currentView],
  )

  const toggleField = useCallback(
    (viewNumber: number, column: ColumnModel, position?: number, ui: FieldVisibilityUIType = TableHeaderMenuUI) => {
      postStats({
        name: isFieldVisible(column) ? FieldHideName : FieldShowName,
        ui,
        memexProjectColumnId: column.id,
      })

      viewStateDispatch({type: ViewStateActionTypes.ToggleField, viewNumber, column, position})
    },
    [isFieldVisible, postStats, viewStateDispatch],
  )

  const moveField = useCallback(
    (viewNumber: number, column: ColumnModel, newPosition: number, ui: FieldMoveUIType = TableHeaderMenuUI) => {
      postStats({
        name: FieldMove,
        context: `position: ${newPosition}`,
        memexProjectColumnId: column.id,
        ui,
      })
      viewStateDispatch({type: ViewStateActionTypes.MoveField, viewNumber, column, newPosition})
    },
    [viewStateDispatch, postStats],
  )

  return (
    <VisibleFieldsContext.Provider
      value={useMemo(() => {
        return {
          visibleFields: currentView?.localViewStateDeserialized.visibleFields ?? [],
          isVisibleFieldsDirty: currentView?.isVisibleFieldsDirty ?? false,
          isFieldVisible,
          showField,
          hideField,
          moveField,
          toggleField,
          removeField,
        }
      }, [
        currentView?.isVisibleFieldsDirty,
        currentView?.localViewStateDeserialized.visibleFields,
        hideField,
        isFieldVisible,
        moveField,
        removeField,
        showField,
        toggleField,
      ])}
    >
      {children}
    </VisibleFieldsContext.Provider>
  )
})
