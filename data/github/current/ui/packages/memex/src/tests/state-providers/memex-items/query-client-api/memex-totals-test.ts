import type {PaginatedMemexItemsQueryVariables} from '../../../../client/state-providers/memex-items/queries/types'
import {
  getQueryDataForMemexItemsTotalCounts,
  incrementMemexItemsTotalCount,
  incrementMemexItemsTotalCountForGroup,
  mergeQueryDataForMemexItemsTotalCounts,
} from '../../../../client/state-providers/memex-items/query-client-api/memex-totals'
import {initQueryClient} from './helpers'

describe('query-client-api Memex totals', () => {
  describe('mergeQueryDataForMemexItemsTotalCounts', () => {
    it('merges group totalCounts when setting queryData', () => {
      const queryClient = initQueryClient()
      mergeQueryDataForMemexItemsTotalCounts(
        queryClient,
        {},
        {
          groups: {
            group1: {value: 2, isApproximate: false},
            group2: {value: 2, isApproximate: false},
          },
          totalCount: {value: 4, isApproximate: false},
        },
      )
      mergeQueryDataForMemexItemsTotalCounts(
        queryClient,
        {},
        {
          groups: {
            group3: {value: 1, isApproximate: false},
          },
          totalCount: {value: 5, isApproximate: false},
        },
      )
      const newTotals = getQueryDataForMemexItemsTotalCounts(queryClient, {})
      expect(newTotals).toMatchObject({
        groups: {
          group1: {value: 2, isApproximate: false},
          group2: {value: 2, isApproximate: false},
          group3: {value: 1, isApproximate: false},
        },
        totalCount: {value: 5, isApproximate: false},
      })
    })
  })

  describe('getQueryDataForMemexItemsTotalCounts', () => {
    it('returns totalCounts for the given query variables', () => {
      const queryClient = initQueryClient()
      mergeQueryDataForMemexItemsTotalCounts(
        queryClient,
        {},
        {groups: {}, totalCount: {value: 2, isApproximate: false}},
      )
      mergeQueryDataForMemexItemsTotalCounts(
        queryClient,
        {q: 'test'},
        {
          groups: {
            group1: {value: 1, isApproximate: false},
          },
          totalCount: {value: 5, isApproximate: false},
        },
      )
      const testTotals = getQueryDataForMemexItemsTotalCounts(queryClient, {q: 'test'})
      expect(testTotals).toMatchObject({
        groups: {
          group1: {value: 1, isApproximate: false},
        },
        totalCount: {value: 5, isApproximate: false},
      })
    })
  })

  describe('incrementMemexItemsTotalCount', () => {
    it('increments overall total count when no groupId is provided', () => {
      const queryClient = initQueryClient()
      const variables: PaginatedMemexItemsQueryVariables = {}
      mergeQueryDataForMemexItemsTotalCounts(queryClient, variables, {
        groups: {
          group1: {value: 2, isApproximate: false},
          group2: {value: 2, isApproximate: false},
        },
        totalCount: {value: 4, isApproximate: false},
      })

      const updatedTopLevelTotalCounts = incrementMemexItemsTotalCount(queryClient, variables, 1)
      expect(updatedTopLevelTotalCounts).toMatchObject({
        value: 5,
        isApproximate: false,
      })
    })
  })
  describe('incrementMemexItemsTotalCountForGroup', () => {
    it('increments total count for groupId', () => {
      const queryClient = initQueryClient()
      const variables: PaginatedMemexItemsQueryVariables = {}
      mergeQueryDataForMemexItemsTotalCounts(queryClient, variables, {
        groups: {
          group1: {value: 5, isApproximate: false},
          group2: {value: 2, isApproximate: false},
        },
        totalCount: {value: 7, isApproximate: false},
      })

      const updatedGroupTotalCount = incrementMemexItemsTotalCountForGroup(queryClient, variables, 'group1', 1)
      expect(updatedGroupTotalCount).toMatchObject({
        value: 6,
        isApproximate: false,
      })
    })
  })
})
