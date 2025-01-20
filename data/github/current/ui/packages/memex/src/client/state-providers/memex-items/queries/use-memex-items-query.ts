import {createInfiniteQuery, type inferData} from 'react-query-kit'

import {createMemexItemModel, type MemexItemModel} from '../../../models/memex-item-model'
import {buildInitialItemsAndColumns} from '../memex-items-data'
import type {MemexItemsPageQueryData, WithTotal} from './types'

export const useMemexItemsQuery = createInfiniteQuery<WithTotal<MemexItemsPageQueryData>>({
  queryKey: ['memexItems'],
  // from https://tanstack.com/query/v4/docs/react/reference/useQuery
  /**
   *
   * If set to a function, the old and new data values will be passed through this function,
   * which should combine them into resolved data for the query. This way, you can retain references
   * from the old data to improve performance even when that data contains non-serializable values.
   */
  // Ideally, this approach would yield some performance benefits - however, due to the fact that in some cases we're using
  // mutable objects (MemexItemModels) and not changing anything about the contents of the array of items,
  // without overriding the default behavior, we would run into issues where our optimistic updates weren't
  // causing the table to re-render, because react-query did not think that anything had changed about our data.
  structuralSharing: false,
  // We're not currently using this queryFn, as the query is disabled
  // and we're relying on optimistic updates to mutate the state
  // However, this is a required prop to `createQuery`,
  // and helps determine the type of data stored in the query cache
  fetcher: () => {
    return {
      nodes: [],
      pageInfo: {startCursor: '', endCursor: '', hasNextPage: false, hasPreviousPage: false},
      totalCount: {value: 0, isApproximate: false},
    }
  },
  getNextPageParam: () => 0,
  initialPageParam: 0,
  // enabled: false,
  // Read our initial data from the JSON island
  initialData: () => {
    const {memexItems} = buildInitialItemsAndColumns('memex-items-data')
    const initialItems = memexItems || []
    const firstPage = createPageQueryDataFromItems(initialItems.map(item => createMemexItemModel(item)))
    return {pages: [firstPage], pageParams: [0]}
  },
  use: [
    useNext => {
      return options => {
        return useNext({...options, enabled: false})
      }
    },
  ],
})

export type UseMemexItemsQueryData = inferData<typeof useMemexItemsQuery>

export function createPageQueryDataFromItems(items: Array<MemexItemModel>): WithTotal<MemexItemsPageQueryData> {
  // Items are received from the server in priority order.
  // The raw priority value exceeds JavaScript MAX_SAFE_INTEGER,
  // so we map the item's index which represents its relative
  // priority within the current set of items.
  // item.prioritizedIndex is used as a tie-breaker when sorting.
  for (const [index, item] of items.entries()) {
    item.prioritizedIndex = index
  }
  return {
    nodes: items,
    pageInfo: {startCursor: '', endCursor: '', hasNextPage: false, hasPreviousPage: false},
    totalCount: {value: items.length, isApproximate: false},
  }
}
