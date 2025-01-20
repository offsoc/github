import {useQueryClient} from '@tanstack/react-query'
import {useCallback} from 'react'

import type {MemexColumnData} from '../../api/columns/contracts/storage'
import {cancelGetAllMemexData} from '../../api/memex/api-get-all-memex-data'
import type {MemexItem, MemexItemCreateData} from '../../api/memex-items/contracts'
import {ItemType} from '../../api/memex-items/item-type'
import {ToastType} from '../../components/toasts/types'
import useToasts from '../../components/toasts/use-toasts'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {createMemexItemModel, type MemexItemModel} from '../../models/memex-item-model'
import {Resources} from '../../strings'
import {useSetColumnValue} from '../column-values/use-set-column-value'
import {useUpdateLoadedColumns} from '../columns/use-update-loaded-columns'
import {useAddItemMutation} from './mutations/use-add-item-mutation'
import {addMemexItemForGroupToQueryClient, addMemexItemToQueryClient} from './query-client-api/memex-items'
import {useFindMemexItem} from './use-find-memex-item'

type CreateMemexItemHookReturnType = {
  /**
   * Makes a request to the server to create a new memex item,
   * and adds it to the client-side state of items
   * @param itemCreateData Information to send to the server about the type
   * and initial data for the new item
   * @return The newly create MemexItemModel
   */
  createMemexItem: (
    itemCreateData: MemexItemCreateData,
    groupId?: string,
    secondaryGroupId?: string,
  ) => Promise<MemexItemModel>
  /**
   * Creates a new memex item and adds it to the client-side state of items
   * Useful when waiting for server (i.e. live update) and we want to optimistically display update to user
   * @param itemCreateData Information to send to the server about the type
   * and initial data for the new item
   * @param newMemexProjectColumnValues The column values to set for the new item
   * @param url The url of the issue
   */
  createMemexItemOptimisitcally: (
    itemCreateData: MemexItemCreateData,
    newMemexProjectColumnValues: Array<MemexColumnData>,
    url?: string,
  ) => void
}

export const useCreateMemexItem = (): CreateMemexItemHookReturnType => {
  const {findMemexItemIndex} = useFindMemexItem()
  const {setColumnValue} = useSetColumnValue()
  const {addToast} = useToasts()
  const queryClient = useQueryClient()
  const mutation = useAddItemMutation()
  const {memex_table_without_limits} = useEnabledFeatures()

  const {updateLoadedColumns} = useUpdateLoadedColumns()

  const getInsertionIndexFromPreviousItemId = useCallback(
    (previousItemId: number | '' | undefined) => {
      if (previousItemId === undefined) {
        return undefined
      }
      if (previousItemId === '') {
        return 0
      }
      return findMemexItemIndex(previousItemId) + 1
    },
    [findMemexItemIndex],
  )

  const createMemexItem = useCallback(
    async (itemCreateData: MemexItemCreateData, groupId?: string, secondaryGroupId?: string) => {
      const insertionIndex = getInsertionIndexFromPreviousItemId(itemCreateData.previousMemexProjectItemId)
      const localColumnValues = itemCreateData.localColumnValues
      delete itemCreateData.localColumnValues

      cancelGetAllMemexData()
      const response = await mutation.mutateAsync({memexProjectItem: itemCreateData})
      const memexProjectItem = response.memexProjectItem

      // Add toast if there are partial failures in response
      const partialFailure = response.memexProjectColumn?.[0]?.partialFailures
      if (partialFailure) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          message: partialFailure.message,
          type: ToastType.warning,
          keepAlive: true,
        })
      }

      const model = createMemexItemModel(memexProjectItem)
      for (const columnData of memexProjectItem.memexProjectColumnValues) {
        updateLoadedColumns(columnData.memexProjectColumnId)
      }

      if (model && localColumnValues) {
        for (const columnValue of localColumnValues) {
          setColumnValue(model, columnValue)
        }
      }

      if (memex_table_without_limits && groupId != null) {
        const addedToBottom = addMemexItemForGroupToQueryClient(queryClient, model, {groupId, secondaryGroupId})
        if (addedToBottom) {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            message: Resources.newItemAddedToBottomOfColumn,
            type: ToastType.warning,
          })
        }
      } else {
        addMemexItemToQueryClient(queryClient, model, insertionIndex)
      }

      return model
    },
    [
      getInsertionIndexFromPreviousItemId,
      mutation,
      memex_table_without_limits,
      addToast,
      updateLoadedColumns,
      setColumnValue,
      queryClient,
    ],
  )

  // Sets the value for a particular column for an item's model without making a server call.
  // This allows us to "optimistically" update the UI before we get a response from the server.
  const createMemexItemOptimisitcally = useCallback(
    (itemCreateData: MemexItemCreateData, newMemexProjectColumnValues: Array<MemexColumnData>, url?: string) => {
      const localColumnValues = itemCreateData.localColumnValues
      delete itemCreateData.localColumnValues
      const {contentType, content} = itemCreateData

      let memexProjectItem: MemexItem | null = null
      if (contentType === ItemType.Issue) {
        memexProjectItem = {
          contentType,
          content: {...content, url: url || '', globalRelayId: ''},
          contentRepositoryId: content.repositoryId,
          memexProjectColumnValues: newMemexProjectColumnValues,
          id: content.id,
          priority: null,
          updatedAt: Date.now().toString(),
        }
      }

      if (memexProjectItem) {
        const model = createMemexItemModel(memexProjectItem)
        for (const columnData of memexProjectItem.memexProjectColumnValues) {
          updateLoadedColumns(columnData.memexProjectColumnId)
        }

        for (let i = 0; model && localColumnValues && i < localColumnValues.length; ++i) {
          const localValues = localColumnValues[i]
          if (localValues) {
            setColumnValue(model, localValues)
          }
        }

        addMemexItemToQueryClient(queryClient, model)
      }
    },
    [queryClient, updateLoadedColumns, setColumnValue],
  )

  return {createMemexItem, createMemexItemOptimisitcally}
}
