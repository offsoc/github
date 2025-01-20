import {useQueryClient} from '@tanstack/react-query'
import {useCallback} from 'react'

import type {MemexItem} from '../../api/memex-items/contracts'
import {useSidePanelItemId} from '../../hooks/use-side-panel'
import {updateMemexItemsInQueryClient} from './query-client-api/memex-items'

type UpdateMemexItemsHookReturnType = {
  /**
   * Syncs the local state of the list of memex items with new values
   * provided by the server
   * @param items New list of items and their data to be updated to.
   */
  updateMemexItems: (items: Array<MemexItem>) => void
}

export const useUpdateMemexItems = (): UpdateMemexItemsHookReturnType => {
  const sidePanelStateItemId = useSidePanelItemId()
  const queryClient = useQueryClient()

  const updateMemexItems = useCallback(
    (items: Array<MemexItem>) => {
      updateMemexItemsInQueryClient(queryClient, items, sidePanelStateItemId)
    },
    [queryClient, sidePanelStateItemId],
  )

  return {updateMemexItems}
}
