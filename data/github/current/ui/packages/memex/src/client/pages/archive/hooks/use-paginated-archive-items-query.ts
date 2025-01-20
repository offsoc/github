import {keepPreviousData} from '@tanstack/react-query'
import {createQuery} from 'react-query-kit'

import {SystemColumnId} from '../../../api/columns/contracts/memex-column'
import {apiGetPaginatedItems} from '../../../api/memex-items/api-get-paginated-items'
import type {MemexItem} from '../../../api/memex-items/contracts'
import type {GetPaginatedItemsRequest, GetPaginatedItemsResponse} from '../../../api/memex-items/paginated-views'
import {createMemexItemModel, type MemexItemModel} from '../../../models/memex-item-model'

/**
 * The GetPaginatedItemsResponse can potentially have grouped data in its response, but that shape of
 * data does not apply to the archive view, so we use the Extract type utility to narrow the type to
 * the response shape that only directly contains the nodes
 */
export type TransformedPaginatedData = Omit<Extract<GetPaginatedItemsResponse, {nodes: Array<MemexItem>}>, 'nodes'> & {
  itemModels: Array<MemexItemModel>
}

export const useBasePaginatedArchivedItemsQuery = createQuery<GetPaginatedItemsResponse, GetPaginatedItemsRequest>({
  queryKey: ['archivedItems'],
  fetcher: async ({after, q}) => {
    return apiGetPaginatedItems({after, q, scope: 'archived', fieldIds: [SystemColumnId.Title]})
  },
  use: [
    useNext => {
      return options =>
        useNext({
          ...options,
          placeholderData: keepPreviousData, // show 'stale' data while fetching new data
          staleTime: 60 * 1000, // data becomes stale after 1 minute
          refetchOnMount: 'always', // refetch data on mount, even if it's not stale
        })
    },
  ],
})

const selectData = (data: GetPaginatedItemsResponse): TransformedPaginatedData => {
  if ('groups' in data) {
    throw Error('groups not expected in archived data')
  }
  const {nodes, ...rest} = data
  return {
    ...rest,
    itemModels: data.nodes.map(node => createMemexItemModel(node)),
  }
}

// A convenience hook that provides a default select function to
// transform nodes into MemexItemModels.
export const usePaginatedArchivedItemsQuery = (variables: GetPaginatedItemsRequest = {}) =>
  useBasePaginatedArchivedItemsQuery({
    variables,
    select: selectData,
  })
