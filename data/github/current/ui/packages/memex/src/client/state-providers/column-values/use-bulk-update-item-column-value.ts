import {callbackCancelledResult, useSafeAsyncCallback} from '@github-ui/use-safe-async-callback'
import {useCallback} from 'react'
import invariant from 'tiny-invariant'

import type {ItemUpdates, UpdateColumnValueAction} from '../../api/columns/contracts/domain'
import {cancelGetAllMemexData} from '../../api/memex/api-get-all-memex-data'
import {apiBulkUpdateItems} from '../../api/memex-items/api-bulk-update-items'
import {BulkColumnValueUpdate} from '../../api/stats/contracts'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {useBulkUpdateItemsContext} from '../../hooks/use-bulk-update-items-context'
import {useFindLoadedFieldIds} from '../columns/use-find-loaded-field-ids'
import {useFindMemexItem} from '../memex-items/use-find-memex-item'
import {useSetMemexItemData} from '../memex-items/use-set-memex-item-data'
import {buildRevertForUpdate} from './column-value'
import {mapToLocalUpdate, mapToRemoteUpdate} from './column-value-payload'
import {useSetColumnValue} from './use-set-column-value'

export const MAX_BULK_ITEMS = 50

export const useBulkUpdateItemColumnValues = () => {
  const bulkUpdateContext = useBulkUpdateItemsContext()
  const {setColumnValue} = useSetColumnValue()
  const {setItemData} = useSetMemexItemData()
  const {findMemexItem} = useFindMemexItem()
  const {postStats} = usePostStats()
  const {findLoadedFieldIds} = useFindLoadedFieldIds()
  const loadedFieldIds = findLoadedFieldIds()

  /**
   * Perform individual per-item updates and return an array of revert updates for undoing. Works with IDs so that the
   * updates are always performed on the latest instances of the items. Wrapped in `useSafeAsyncCallback` for safety
   * when undoing.
   */
  const performUpdates = useSafeAsyncCallback(async (allItemUpdates: Array<ItemUpdates>) => {
    const itemUpdates = []
    const reverts: Array<ItemUpdates> = []

    for (const {itemId, updates} of allItemUpdates) {
      const item = findMemexItem(itemId)
      if (!item) continue

      const itemReverts = []
      const remoteUpdates = []

      for (const update of updates) {
        const remoteUpdate = mapToRemoteUpdate(update)

        const revert = buildRevertForUpdate(update, item)

        // Optimistically update the values locally
        const localUpdate = mapToLocalUpdate(update)

        itemReverts.push(revert)
        setColumnValue(item, localUpdate)

        if (!remoteUpdate) continue
        remoteUpdates.push(remoteUpdate)
      }

      reverts.push({
        itemId,
        updates: itemReverts,
      })

      if (!remoteUpdates.length) continue // Non-updatable column

      itemUpdates.push({
        id: item.id,
        memexProjectColumnValues: remoteUpdates,
      })
    }

    try {
      cancelGetAllMemexData()

      const firstUpdate = itemUpdates[0]
      invariant(firstUpdate, 'need at least one project item update')

      const firstColumnValue = firstUpdate.memexProjectColumnValues[0]
      invariant(firstColumnValue, 'need at least one column value')

      const memexProjectColumnId = firstColumnValue.memexProjectColumnId

      bulkUpdateContext?.onPreparingToBulkUpdate(
        reverts,
        itemUpdates.map(itemUpdate => itemUpdate.id),
        memexProjectColumnId,
      )

      postStats({
        name: BulkColumnValueUpdate,
        ui: 'shortcut',
        context: itemUpdates.length,
        memexProjectColumnId,
      })

      const bulkUpdateResponse = await apiBulkUpdateItems({
        memexProjectItems: itemUpdates,
        fieldIds: loadedFieldIds,
      })
      if ('memexProjectItems' in bulkUpdateResponse && bulkUpdateResponse.memexProjectItems) {
        for (const item of bulkUpdateResponse.memexProjectItems) setItemData(item)
      }

      if (bulkUpdateContext && 'bulkUpdateErrors' in bulkUpdateResponse && bulkUpdateResponse.bulkUpdateErrors) {
        bulkUpdateContext.setErrors(bulkUpdateResponse.bulkUpdateErrors)
      }

      return reverts
    } catch (error) {
      for (const {itemId, updates} of reverts) {
        const item = findMemexItem(itemId)
        if (item) {
          for (const update of updates) {
            setColumnValue(item, mapToLocalUpdate(update))
          }
        }
      }

      throw error
    }
  })

  /** Apply the same update to many columns. Returns a function that can undo the changes. */
  const bulkUpdateColumnValues = useCallback(
    async (
      itemUpdates: Array<{
        itemId: number
        updates: Array<UpdateColumnValueAction>
      }>,
    ) => {
      const reverts = await performUpdates(itemUpdates)

      return async () => {
        // It's crucial that this is a safe call to avoid calling an outdated reference if the user clicks much later.
        if (reverts !== callbackCancelledResult) await performUpdates(reverts)
      }
    },
    [performUpdates],
  )

  return {bulkUpdateColumnValues}
}
