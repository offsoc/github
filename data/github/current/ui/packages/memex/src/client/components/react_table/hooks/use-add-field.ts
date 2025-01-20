import {useCallback} from 'react'
import invariant from 'tiny-invariant'

import {omit} from '../../../../utils/omit'
import {DefaultOmitPropertiesForView} from '../../../api/view/contracts'
import {useApiRequest} from '../../../hooks/use-api-request'
import {useUpdateViewWithoutSettingStates} from '../../../hooks/use-view-apis'
import {ViewStateActionTypes} from '../../../hooks/use-view-state-reducer/view-state-action-types'
import {useViews} from '../../../hooks/use-views'
import type {AddColumnRequest} from '../../../state-providers/columns/columns-state-provider'
import {useAddColumn} from '../../../state-providers/columns/use-add-column'

export const useAddField = () => {
  const {viewStateDispatch, viewsMap} = useViews()
  const updateViewWithoutSettingStates = useUpdateViewWithoutSettingStates()
  const {addColumn} = useAddColumn()

  const requestAddField = useCallback(
    async ({request, viewNumber}: {request: AddColumnRequest; viewNumber?: number}) => {
      const {newColumn} = await addColumn(request)

      if (viewNumber) {
        const view = viewsMap[viewNumber]
        invariant(view, 'View must exist')
        const nextServerViewState = {
          ...view.serverViewState,
          visibleFields: view.serverViewState.visibleFields.concat(newColumn.databaseId),
        }
        // Add the new column to the current view immediately.
        await updateViewWithoutSettingStates.perform({
          viewNumber: view.number,
          view: omit(nextServerViewState, DefaultOmitPropertiesForView),
        })

        if (updateViewWithoutSettingStates.status.current.status === 'succeeded') {
          viewStateDispatch({
            type: ViewStateActionTypes.AddField,
            column: newColumn,
            viewNumber,
          })
        }
      }

      return newColumn
    },
    [addColumn, updateViewWithoutSettingStates, viewStateDispatch, viewsMap],
  )

  const addField = useApiRequest({request: requestAddField})

  return {addField}
}
