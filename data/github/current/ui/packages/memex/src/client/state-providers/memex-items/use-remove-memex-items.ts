import {useCallback} from 'react'

import type {IRemoveMemexItemResponse} from '../../api/memex-items/contracts'
import {useRemoveItemsMutation} from './mutations/use-remove-items-mutation'

type RemoveMemexItemsHookReturnType = {
  /**
   * Makes a request to the server to remove a list of items from the project
   * and removes them from the client-side state of items
   * @param itemIds A list of ids which represent the items which should be removed
   */
  removeMemexItems: (itemIds: Array<number>) => Promise<IRemoveMemexItemResponse>
}

export const useRemoveMemexItems = (): RemoveMemexItemsHookReturnType => {
  const {mutateAsync} = useRemoveItemsMutation()

  const removeMemexItems = useCallback(
    async (itemIds: Array<number>) => {
      if (itemIds.length) {
        // Perform request to remove items on the server
        return mutateAsync({memexProjectItemIds: itemIds})
      }
    },
    [mutateAsync],
  )

  return {removeMemexItems}
}
