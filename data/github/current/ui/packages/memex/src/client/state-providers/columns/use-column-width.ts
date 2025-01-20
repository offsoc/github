import {useCallback} from 'react'

import {omit} from '../../../utils/omit'
import {cancelGetAllMemexData} from '../../api/memex/api-get-all-memex-data'
import {DefaultOmitPropertiesForView} from '../../api/view/contracts'
import {
  applyColumnWidthsToView,
  canViewTypeHaveColumnWidths,
  getColumnWidthsForLayout,
} from '../../helpers/column-widths'
import {getViewTypeFromViewTypeParam} from '../../helpers/view-type'
import {useDefaultLayoutSettings} from '../../hooks/use-default-layout-settings'
import {useUpdateViewWithoutSettingStates} from '../../hooks/use-view-apis'
import {ViewStateActionTypes} from '../../hooks/use-view-state-reducer/view-state-action-types'
import {useViews} from '../../hooks/use-views'
import {useFindColumn} from './use-find-column'

type ColumnWidthHookReturnType = {
  /**
   * Updates the width of a column by id
   * @param id    - The id of the column to update
   * @param width - The new width of the column
   */
  updateWidth: (id: number | string, width: number) => Promise<void>

  /**
   * Gets th width of a column by id
   * @param id    - The id of the column to update
   * @returns The width of the column or undefined if unset
   */
  getWidth: (id: number | string) => number | undefined
}

export const useColumnWidth = (): ColumnWidthHookReturnType => {
  const {findColumn} = useFindColumn()
  const {currentView, viewStateDispatch} = useViews()
  const {getLayoutSettingsWithDefaults} = useDefaultLayoutSettings()
  const updateViewWithoutSettingStates = useUpdateViewWithoutSettingStates()

  const getWidth = useCallback(
    (id: number | string) => {
      const column = findColumn(id)

      if (column) {
        const layoutSettings =
          currentView?.localViewState && getLayoutSettingsWithDefaults(currentView?.localViewState.layoutSettings)

        if (layoutSettings) {
          const columnWidths = getColumnWidthsForLayout(currentView.localViewState.layout, layoutSettings)
          const perViewColumnWidth = columnWidths?.[column.databaseId.toString()]

          if (perViewColumnWidth) return perViewColumnWidth
        }
      }

      return column?.settings.width ?? undefined
    },
    [findColumn, getLayoutSettingsWithDefaults, currentView],
  )

  const updateWidth = useCallback(
    async (id: number | string, width: number) => {
      // Sometimes react-table sends a float, but the server expect an integer
      const roundedWidth = Math.round(width)

      const column = findColumn(id)
      if (!column || getWidth(id) === roundedWidth) {
        return
      }

      const viewNumber = currentView?.number

      if (!viewNumber) return

      const viewType = getViewTypeFromViewTypeParam(currentView.localViewState.layout)
      if (!canViewTypeHaveColumnWidths(viewType)) return

      const {layout} = currentView.localViewState

      const originalColumnWidths = getColumnWidthsForLayout(layout, currentView.localViewState.layoutSettings)

      const columnWidths = {
        ...originalColumnWidths,
        [column.databaseId.toString()]: roundedWidth,
      }

      const nextServerViewState = applyColumnWidthsToView(currentView.serverViewState, layout, columnWidths)

      // Optimistically update the column widths in state
      viewStateDispatch({
        type: ViewStateActionTypes.SetColumnWidths,
        viewType,
        viewNumber,
        columnWidths,
      })

      cancelGetAllMemexData()

      // Add the column width to the view immediately
      await updateViewWithoutSettingStates.perform({
        viewNumber: currentView.number,
        view: omit(nextServerViewState, DefaultOmitPropertiesForView),
      })

      // Rollback column width changes on failure
      if (updateViewWithoutSettingStates.status.current.status === 'failed') {
        viewStateDispatch({
          type: ViewStateActionTypes.SetColumnWidths,
          viewType,
          viewNumber,
          columnWidths: originalColumnWidths,
        })
      }
    },
    [getWidth, findColumn, currentView, updateViewWithoutSettingStates, viewStateDispatch],
  )

  return {updateWidth, getWidth}
}
