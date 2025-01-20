import {useCallback} from 'react'

import {isMemexItemTypeArchivable} from '../../helpers/archive-util'
import {useArchiveItemsMutation} from './mutations/use-archive-items-mutation'
import {useFindMemexItem} from './use-find-memex-item'

type ArchiveMemexItemsHookReturnType = {
  /**
   * Makes a request to the server to archive a list of items
   * and removes them from the client-side state of items
   * @param itemIds A list of ids which represent the items which should be archived
   */
  archiveMemexItems: (itemIds: Array<number>) => Promise<void>
}

export const useArchiveMemexItems = (): ArchiveMemexItemsHookReturnType => {
  const {findMemexItem} = useFindMemexItem()
  const {mutateAsync} = useArchiveItemsMutation()

  const archiveMemexItems = useCallback(
    async (itemIds: Array<number>) => {
      // ensure items can be archived
      const memexProjectItemIds = itemIds.filter(id => {
        const memexItemModel = findMemexItem(id)
        if (memexItemModel) {
          return isMemexItemTypeArchivable(memexItemModel.contentType)
        }
        return false
      })
      if (memexProjectItemIds.length === 0) {
        return
      }
      // Perform request to archive items on the server
      return mutateAsync({memexProjectItemIds})
    },
    [findMemexItem, mutateAsync],
  )

  return {archiveMemexItems}
}
