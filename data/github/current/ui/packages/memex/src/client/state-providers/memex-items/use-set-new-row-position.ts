import {useQueryClient} from '@tanstack/react-query'
import {useCallback} from 'react'

import type {OptimisticUpdateRollbackData} from './query-client-api/memex-items'
import {
  updateMemexItemPositionInQueryClient,
  updateMemexItemWitNewRowPositionInQueryClient,
} from './query-client-api/memex-items'
import type {ReorderItemData} from './types'

export interface PreviousItemPosition {
  /**
   * The id of the item directly before the item that was moved.
   * If the item that was moved is now the top, we represent this with an empty string ''
   */
  previousItemId: number | ''
  /**
   * The old index in the list of the item that was just moved.
   */
  previousMovingItemIndex?: number
}

type SetNewRowPositionHookReturnType = {
  /**
   * Updates the position of an item in the list of items locally, and then makes a request to the server
   * @param id The id of the item which we are now moving
   * @param index The index in the list of items where we are attempting to move this item to
   * @return Some metadata about the item that was just moved
   */
  setNewRowPosition: (id: number, index: number) => PreviousItemPosition

  /**
   * Optimistically updates the position of an item in the list of items locally, for a project
   * with the MWL FF enabled. Just a thin wrapper around the query-client-api method.
   * @param movingItemId id of the item that is being moved
   * @param reorderData metadata about where we're moving the item to
   * @returns
   */
  setNewPositionForMWL: (
    movingItemId: number,
    reorderData: ReorderItemData,
  ) => {previousItemId: number | '' | undefined; rollbackData: OptimisticUpdateRollbackData} | void
}

export const useSetNewRowPosition = (): SetNewRowPositionHookReturnType => {
  const queryClient = useQueryClient()

  const setNewRowPosition = useCallback(
    (id: number, index: number) => {
      return updateMemexItemWitNewRowPositionInQueryClient(queryClient, id, index)
    },
    [queryClient],
  )

  const setNewPositionForMWL = useCallback(
    (movingItemId: number, reorderData: ReorderItemData) => {
      return updateMemexItemPositionInQueryClient(queryClient, movingItemId, reorderData)
    },
    [queryClient],
  )

  return {setNewRowPosition, setNewPositionForMWL}
}
