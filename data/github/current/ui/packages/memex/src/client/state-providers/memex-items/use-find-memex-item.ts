import {useQueryClient} from '@tanstack/react-query'
import {useCallback} from 'react'

import type {MemexItemModel} from '../../models/memex-item-model'
import {findMemexItemByIdInQueryClient, findMemexItemGlobalIndexByIdInQueryClient} from './query-client-api/memex-items'

type FindMemexItemHookReturnType = {
  /**
   * Queries the client-side to find the MemexItemModel with the provided id
   * @return The MemexItemModel with the provided id, if it exists
   */
  findMemexItem: (id: number) => MemexItemModel | undefined

  /**
   * Queries the client-side list of items to find index of the MemexItemModel with the provided id
   * @return A number representing the index or -1 if the item cannot be found
   */
  findMemexItemIndex: (id: number) => number
}

export const useFindMemexItem = (): FindMemexItemHookReturnType => {
  const queryClient = useQueryClient()

  const findMemexItem = useCallback(
    (id: number) => {
      return findMemexItemByIdInQueryClient(queryClient, id)
    },
    [queryClient],
  )

  const findMemexItemIndex = useCallback(
    (id: number) => {
      return findMemexItemGlobalIndexByIdInQueryClient(queryClient, id)
    },
    [queryClient],
  )
  return {findMemexItem, findMemexItemIndex}
}
