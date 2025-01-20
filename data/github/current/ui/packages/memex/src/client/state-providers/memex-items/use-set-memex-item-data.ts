import {useQueryClient} from '@tanstack/react-query'
import {useCallback} from 'react'

import type {UpdateMemexItemResponseData} from '../../api/memex-items/contracts'
import {setMemexItemsToForceRerenderInQueryClient, updateMemexItemInQueryClient} from './query-client-api/memex-items'

type SetMemexItemDataHookReturnType = {
  /**
   * Use to update an item locally as a result a server request.
   * Generally, Avoid using this callback directly and call it from a hook
   * that makes a request to the server to update an item.
   *
   * @param item - memex item response data
   */
  setItemData: (item: UpdateMemexItemResponseData) => void

  /**
   * If an item model's column value has been updated, we need to
   * set the state for the items in the model to reflect the changes.
   *
   * Previously this was handled by observables in the model, but
   * those no longer exist, so we need a mechanism to force a state update.
   */
  setItemsStateFromModels: () => void
}

export const useSetMemexItemData = (): SetMemexItemDataHookReturnType => {
  const queryClient = useQueryClient()

  const setItemData = useCallback(
    (item: UpdateMemexItemResponseData) => {
      updateMemexItemInQueryClient(queryClient, item)
    },
    [queryClient],
  )

  const setItemsStateFromModels = useCallback(() => {
    setMemexItemsToForceRerenderInQueryClient(queryClient)
  }, [queryClient])

  return {setItemData, setItemsStateFromModels}
}
