import {useQueryClient} from '@tanstack/react-query'
import {useCallback, useEffect, useState} from 'react'

import {SystemColumnId} from '../../../api/columns/contracts/memex-column'
import {apiGetArchivedItems} from '../../../api/memex-items/api-get-archived-items'
import type {MemexItem} from '../../../api/memex-items/contracts'
import {archivedAtComparator} from '../../../helpers/archive-util'
import {useLazyRef} from '../../../hooks/common/use-lazy-ref'
import {createMemexItemModel, type MemexItemModel} from '../../../models/memex-item-model'
import {
  addMemexItemToQueryClient,
  removeMemexItemsFromQueryClient,
} from '../../../state-providers/memex-items/query-client-api/memex-items'
import type {ArchivedItemsContextValue} from '../archive-contexts'
import {useLazyLoadFields} from './use-lazy-load-fields'

type UseFetchArchivedItemsOptions = {
  filter: string
}

export function useFetchArchivedItems({filter}: UseFetchArchivedItemsOptions) {
  const archivedItemsByIdRef = useLazyRef(() => new Map<number, MemexItem>())
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [state, setState] = useState<Pick<ArchivedItemsContextValue, 'archivedItems' | 'totalCount'> | null>(null)

  const [hasLoadedAllItems, setHasLoadedAllItems] = useState(false)
  const queryClient = useQueryClient()

  const {requiredFields, hasAllFieldsLoaded, addRequiredFieldsFromFilter, markFieldsAsLoaded} = useLazyLoadFields({
    initialFields: [SystemColumnId.Title],
  })

  const loadItems = useCallback(
    async (fields: Array<number | SystemColumnId>) => {
      try {
        setStatus('loading')
        const {memexProjectItems, totalCount} = await apiGetArchivedItems({
          visibleFields: fields,
          perPage: hasLoadedAllItems ? 10000 : 500,
        })
        // NOTE: The order of setting state is important, because marking the fields as loaded first
        // is what will prevent the hook from fetching again. This should be fixed if we migrate to
        // React 18, which automatically batches all of these state updates together.
        markFieldsAsLoaded(fields)
        setState({
          archivedItems: memexProjectItems.map(item => createMemexItemModel(item)),
          totalCount,
        })
        setStatus('idle')

        for (const item of memexProjectItems) {
          archivedItemsByIdRef.current.set(item.id, item)
        }
      } catch (err) {
        setStatus('error')
      }
    },
    [archivedItemsByIdRef, hasLoadedAllItems, markFieldsAsLoaded],
  )

  const loadAllItems = useCallback(async () => {
    try {
      setHasLoadedAllItems(false)
      setStatus('loading')
      const {memexProjectItems, totalCount} = await apiGetArchivedItems({
        visibleFields: requiredFields,
        perPage: 10000,
      })
      const archivedItems = memexProjectItems.map(item => createMemexItemModel(item))
      setState({archivedItems, totalCount})
      setStatus('idle')
      setHasLoadedAllItems(true)

      for (const item of memexProjectItems) {
        archivedItemsByIdRef.current.set(item.id, item)
      }

      return archivedItems
    } catch (err) {
      setStatus('error')
    }
  }, [archivedItemsByIdRef, requiredFields])

  const optimisticRemoveItems = useCallback(
    (removedItemIds: Array<number>) => {
      for (const removedItemId of removedItemIds) {
        const item = archivedItemsByIdRef.current.get(removedItemId)

        if (item) {
          const {archived, ...restItem} = item
          addMemexItemToQueryClient(queryClient, createMemexItemModel(restItem))
        }

        archivedItemsByIdRef.current.delete(removedItemId)
      }
      setState(s => {
        if (s?.archivedItems && s.totalCount) {
          return {
            ...s,
            totalCount: s.totalCount - removedItemIds.length,
            archivedItems: s.archivedItems.filter(item => !removedItemIds.includes(item.id)),
          }
        } else {
          return s
        }
      })
    },
    [archivedItemsByIdRef, queryClient],
  )

  const optimisticRollbackRemoveItems = useCallback(
    (failedItems: Array<MemexItemModel>) => {
      removeMemexItemsFromQueryClient(
        queryClient,
        failedItems.map(itemModel => itemModel.id),
      )

      setState(s => {
        if (s?.archivedItems && s.totalCount) {
          return {
            ...s,
            totalCount: s.totalCount + failedItems.length,
            archivedItems: [...failedItems, ...s.archivedItems].sort((a, b) => {
              return archivedAtComparator(
                {id: a.id, archivedAt: a.archived?.archivedAt},
                {id: b.id, archivedAt: b.archived?.archivedAt},
              )
            }),
          }
        } else {
          return s
        }
      })
    },
    [queryClient],
  )

  useEffect(() => {
    // Fetch initial fields if there are any, and we haven't loaded them yet
    if (!hasAllFieldsLoaded && status === 'idle') {
      loadItems(requiredFields)
    }
  }, [hasAllFieldsLoaded, loadItems, requiredFields, status])

  useEffect(() => {
    // Mark all current filtered fields as required for lazy loading
    addRequiredFieldsFromFilter(filter)
  }, [addRequiredFieldsFromFilter, filter])

  return {state, status, optimisticRemoveItems, optimisticRollbackRemoveItems, loadAllItemsStatus: status, loadAllItems}
}
