import {useCallback} from 'react'

import type {LocalUpdatePayload} from '../../../../api/columns/contracts/domain'
import {useSetColumnValue} from '../../../../state-providers/column-values/use-set-column-value'
import {useFindMemexItem} from '../../../../state-providers/memex-items/use-find-memex-item'

type UpdateLocalMemexItemReturnValue = {
  /**
   * Sets the value of a local memex item's column without making a server update. Useful
   * for the sidebar fields which update values via a different API, but still need to
   * communicate those changes to the table or board.
   */
  updateLocalMemexItem: (model: number, columnData: LocalUpdatePayload) => void
}
export const useUpdateLocalMemexItem = (): UpdateLocalMemexItemReturnValue => {
  const {setColumnValue} = useSetColumnValue()
  const {findMemexItem} = useFindMemexItem()
  const updateLocalMemexItem = useCallback(
    (id: number, update: LocalUpdatePayload) => {
      const item = findMemexItem(id)
      if (item) {
        setColumnValue(item, update, true)
      }
    },
    [findMemexItem, setColumnValue],
  )
  return {updateLocalMemexItem}
}
