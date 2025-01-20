import {memo, useCallback, useMemo} from 'react'

import {omit} from '../../utils/omit'
import {DefaultOmitPropertiesForView} from '../api/view/contracts'
import {canServerSliceByColumnType} from '../features/server-capabilities'
import {SliceByContext, type SliceValue} from '../features/slicing/hooks/use-slice-by'
import {useEnabledFeatures} from '../hooks/use-enabled-features'
import {useUpdateViewWithoutSettingStates} from '../hooks/use-view-apis'
import {ViewStateActionTypes} from '../hooks/use-view-state-reducer/view-state-action-types'
import {useViews} from '../hooks/use-views'
import type {ColumnModel} from '../models/column-model'

export const SliceByProvider = memo<{
  children?: React.ReactNode
}>(function SliceByProvider({children}) {
  const {currentView, viewStateDispatch} = useViews()
  const updateViewWithoutSettingStates = useUpdateViewWithoutSettingStates()
  const {memex_table_without_limits} = useEnabledFeatures()

  let sliceField = currentView?.localViewStateDeserialized.sliceBy?.field ?? null
  if (memex_table_without_limits && !(sliceField && canServerSliceByColumnType(sliceField.dataType))) {
    sliceField = null
  }

  const setSliceValue = useCallback(
    (viewNumber: number, value: SliceValue) => {
      viewStateDispatch({
        type: ViewStateActionTypes.SetSliceValue,
        value,
        viewNumber,
      })
    },
    [viewStateDispatch],
  )

  const setSliceField = useCallback(
    (viewNumber: number, column: ColumnModel) => {
      viewStateDispatch({
        type: ViewStateActionTypes.SetSliceValue,
        value: '',
        viewNumber,
      })
      viewStateDispatch({type: ViewStateActionTypes.SetSliceBy, column, viewNumber})
    },
    [viewStateDispatch],
  )

  const clearSliceField = useCallback(
    (viewNumber: number) => {
      viewStateDispatch({
        type: ViewStateActionTypes.SetSliceValue,
        value: '',
        viewNumber,
      })
      viewStateDispatch({type: ViewStateActionTypes.ClearSliceBy, viewNumber})
    },
    [viewStateDispatch],
  )

  const setSliceByPanelWidth = useCallback(
    async (panelWidth: number) => {
      const viewNumber = currentView?.number

      if (!viewNumber) return

      // Optimistically update the view state
      viewStateDispatch({type: ViewStateActionTypes.SetSliceByPanelWidth, viewNumber, panelWidth})

      const originalSliceBy = currentView.serverViewState.sliceBy || {}

      const nextServerViewState = {
        ...currentView.serverViewState,
        sliceBy: {
          ...originalSliceBy,
          panelWidth,
        },
      }

      await updateViewWithoutSettingStates.perform({
        viewNumber,
        view: omit(nextServerViewState, DefaultOmitPropertiesForView),
      })

      // Revert to the original slice by if the update failed
      if (updateViewWithoutSettingStates.status.current.status === 'failed') {
        viewStateDispatch({
          type: ViewStateActionTypes.SetSliceByPanelWidth,
          viewNumber,
          panelWidth: originalSliceBy.panelWidth,
        })
      }
    },
    [currentView, updateViewWithoutSettingStates, viewStateDispatch],
  )

  return (
    <SliceByContext.Provider
      value={useMemo(() => {
        return {
          sliceField,
          setSliceField,
          clearSliceField,
          isSliceByDirty: currentView?.isSliceByDirty ?? false,
          sliceValue: currentView?.localViewStateDeserialized.sliceValue ?? null,
          setSliceValue,
          sliceByPanelWidth: currentView?.localViewState.sliceBy?.panelWidth,
          setSliceByPanelWidth,
        }
      }, [
        sliceField,
        setSliceField,
        clearSliceField,
        currentView?.isSliceByDirty,
        currentView?.localViewStateDeserialized.sliceValue,
        currentView?.localViewState.sliceBy?.panelWidth,
        setSliceValue,
        setSliceByPanelWidth,
      ])}
    >
      {children}
    </SliceByContext.Provider>
  )
})
