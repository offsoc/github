import {useCallback} from 'react'

import {omit} from '../../../../utils/omit'
import {apiUpdateView} from '../../../api/view/api-update-view'
import {useVerticalGroupedBy} from '../../../features/grouping/hooks/use-vertical-grouped-by'
import {useApiRequest} from '../../../hooks/use-api-request'
import {ViewStateActionTypes} from '../../../hooks/use-view-state-reducer/view-state-action-types'
import {useViews} from '../../../hooks/use-views'
import type {VerticalGroup} from '../../../models/vertical-group'

type ColumnWidthHookReturnType = {
  updateColumnLimit: (columnLimit: number | undefined) => Promise<void>
  columnLimit: number | undefined
}

export const useColumnLimit = (option: VerticalGroup): ColumnWidthHookReturnType => {
  const {currentView, viewStateDispatch} = useViews()
  const {groupedByColumn} = useVerticalGroupedBy()

  const viewNumber = currentView?.number
  const columnId = groupedByColumn?.databaseId
  const updateColumnLimit = useCallback(
    async (limit: number | undefined) => {
      if (typeof viewNumber !== 'number' || typeof columnId !== 'number' || !currentView) return

      await apiUpdateView({
        viewNumber,
        view: {
          ...omit(currentView.serverViewState, ['id', 'number', 'createdAt', 'updatedAt', 'priority']),
          layoutSettings: {
            ...currentView.serverViewState.layoutSettings,
            board: {
              ...currentView.serverViewState.layoutSettings.board,
              columnLimits: {
                ...currentView.serverViewState.layoutSettings.board?.columnLimits,
                [columnId]: {
                  ...currentView.serverViewState.layoutSettings.board?.columnLimits?.[columnId],
                  [option.id]: limit,
                },
              },
            },
          },
        },
      })

      viewStateDispatch({
        type: ViewStateActionTypes.UpdateBoardColumnLimit,
        limit,
        columnDatabaseId: columnId,
        optionId: option.id,
        viewNumber,
      })
    },
    [viewNumber, columnId, currentView, viewStateDispatch, option.id],
  )

  const {perform} = useApiRequest({
    request: updateColumnLimit,
  })

  return {
    updateColumnLimit: perform,
    columnLimit: groupedByColumn
      ? currentView?.localViewStateDeserialized.layoutSettings.board?.columnLimits?.[groupedByColumn.databaseId]?.[
          option.id
        ]
      : undefined,
  }
}
