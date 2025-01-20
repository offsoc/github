import {
  buildSliceDataQueryKey,
  type SliceByDataQueryKey,
} from '../../../../client/state-providers/memex-items/queries/query-keys'
import type {
  PaginatedMemexItemsQueryVariables,
  SliceByQueryData,
} from '../../../../client/state-providers/memex-items/queries/types'
import {setSliceByQueryData} from '../../../../client/state-providers/memex-items/query-client-api/memex-slices'
import {initQueryClient} from './helpers'

describe('query-client-api Memex slices', () => {
  describe('setSliceByQueryData', () => {
    it('calls setQueryData for correct query key', () => {
      const queryClient = initQueryClient()

      const variables: PaginatedMemexItemsQueryVariables = {}
      const newSliceByData: SliceByQueryData = {
        slices: [
          {
            sliceId: 'sliceId1',
            sliceValue: 'sliceValue1',
            totalCount: {isApproximate: false, value: 1},
            sliceMetadata: {
              title: 'Title',
              titleHtml: 'Title',
              id: 'abc',
              duration: 1,
              startDate: new Date().toISOString(),
            },
          },
        ],
      }
      const queryKey: SliceByDataQueryKey = buildSliceDataQueryKey(variables)

      setSliceByQueryData(queryClient, variables, newSliceByData)

      expect(queryClient.getQueryData(queryKey)).toBe(newSliceByData)
    })

    it('calls setQueryData for correct query key, removing sliceValue from the query key', () => {
      const queryClient = initQueryClient()

      const variables: PaginatedMemexItemsQueryVariables = {sliceByValue: 'sliceValue', sliceByColumnId: 123}
      const newSliceByData: SliceByQueryData = {
        slices: [
          {
            sliceId: 'sliceId1',
            sliceValue: 'sliceValue1',
            totalCount: {isApproximate: false, value: 1},
            sliceMetadata: {
              title: 'Title',
              titleHtml: 'Title',
              id: 'abc',
              duration: 1,
              startDate: new Date().toISOString(),
            },
          },
        ],
      }
      // sliceByValue should be removed from variables in query key
      const queryKey: SliceByDataQueryKey = buildSliceDataQueryKey({sliceByColumnId: 123})

      setSliceByQueryData(queryClient, variables, newSliceByData)

      expect(queryClient.getQueryData(queryKey)).toBe(newSliceByData)
    })
  })
})
