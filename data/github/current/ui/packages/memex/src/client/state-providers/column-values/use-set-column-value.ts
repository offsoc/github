import {useCallback} from 'react'

import type {LocalUpdatePayload} from '../../api/columns/contracts/domain'
import type {MemexColumnData} from '../../api/columns/contracts/storage'
import {cancelGetAllMemexData} from '../../api/memex/api-get-all-memex-data'
import {ItemType} from '../../api/memex-items/item-type'
import type {MemexItemModel} from '../../models/memex-item-model'
import {isValidDraftItemColumn} from '../memex-items/memex-item-helpers'
import {useSetMemexItemData} from '../memex-items/use-set-memex-item-data'

type ColumnDataType = MemexColumnData | LocalUpdatePayload

type SetColumnValueHookReturnType = {
  /**
   * Sets the value for a particular column for an item's model without making a server call.
   * This allows us to "optimistically" update the UI before we get a response from the server.
   *
   * It is also used to update our sparsely populated column data once a column is changed to visible.
   * @param columnData
   * @param forceUpdate Only used by `DraftIssueModel`. If true, will force a column value to be
   * updated even if it is for a column type that we normally would not care about for a DraftIssue
   * such as Reviewers, Labels, Milestone, etc.
   * We expose this so that when we have loaded all data for a column, we can set the item's column value
   * to null which will at least trigger a re-render of the cell now that we should go from a loading -> loaded state.
   */
  setColumnValue: (model: MemexItemModel, columnData: ColumnDataType, forceUpdate?: boolean) => void
}

export const useSetColumnValue = (): SetColumnValueHookReturnType => {
  const {setItemsStateFromModels: rerenderItems} = useSetMemexItemData()
  const setColumnValue = useCallback(
    (model: MemexItemModel, columnData: ColumnDataType, forceUpdate = false) => {
      const {contentType} = model
      const {memexProjectColumnId: columnId} = columnData

      if (contentType === ItemType.DraftIssue && !isValidDraftItemColumn(columnId) && !forceUpdate) {
        return
      }

      cancelGetAllMemexData()
      model.setColumnValueForItemColumnType(columnData)
      rerenderItems()
    },
    [rerenderItems],
  )

  return {setColumnValue}
}
