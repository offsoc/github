import {act, renderHook} from '@testing-library/react'

import {useEnabledFeatures} from '../../client/hooks/use-enabled-features'
import {mostRecentUpdateSingleton} from '../../client/state-providers/data-refresh/most-recent-update'
import {pendingUpdatesSingleton} from '../../client/state-providers/data-refresh/pending-updates'
import {useHandlePaginatedDataRefresh} from '../../client/state-providers/data-refresh/use-handle-paginated-data-refresh'
import {
  buildGroupedMemexItemsQueryKey,
  buildUngroupedMemexItemsQueryKey,
} from '../../client/state-providers/memex-items/queries/query-keys'
import {
  pageParamForInitialPage,
  pageParamForNextPlaceholder,
} from '../../client/state-providers/memex-items/queries/types'
import {usePaginatedMemexItemsQuery} from '../../client/state-providers/memex-items/queries/use-paginated-memex-items-query'
import {asMockHook} from '../mocks/stub-utilities'
import {createTestQueryClient} from '../test-app-wrapper'
import {createWrapperWithContexts} from '../wrapper-utils'

jest.mock('../../client/state-providers/memex-items/queries/use-paginated-memex-items-query')
jest.mock('../../client/hooks/use-enabled-features')

describe('useHandlePaginatedDataRefresh', () => {
  beforeEach(() => {
    asMockHook(useEnabledFeatures).mockReturnValue({memex_table_without_limits: true})
  })
  it('should cancel appropriate queries with createTestQueryClient', () => {
    const groupKey = buildGroupedMemexItemsQueryKey({}, {groupId: 'test'}, pageParamForInitialPage)
    const groupPlaceholderKey = buildGroupedMemexItemsQueryKey({}, {groupId: 'test'}, pageParamForNextPlaceholder)
    const itemsKey = buildUngroupedMemexItemsQueryKey({}, pageParamForInitialPage)
    const itemsPlaceholderKey = buildUngroupedMemexItemsQueryKey({}, pageParamForNextPlaceholder)
    asMockHook(usePaginatedMemexItemsQuery).mockReturnValue({
      queryKeysForGroups: [groupKey, groupPlaceholderKey],
      queryKeysForItems: [itemsKey, itemsPlaceholderKey],
    })

    const queryClient = createTestQueryClient()
    const spy = jest.spyOn(queryClient, 'cancelQueries')
    const {result} = renderHook(() => useHandlePaginatedDataRefresh(), {
      wrapper: createWrapperWithContexts({
        QueryClient: {
          queryClient,
        },
      }),
    })

    act(() => {
      result.current.handleCancelFetchData()
    })

    // this should only cancel non-placeholder queries
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenCalledWith({queryKey: groupKey})
    expect(spy).toHaveBeenCalledWith({queryKey: itemsKey})
  })

  it('should handle invalidation and cancel appropriate queries when handling refreshes', async () => {
    const groupKey = buildGroupedMemexItemsQueryKey({}, {groupId: 'test'}, pageParamForInitialPage)
    const invalidateAllQueriesStub = jest.fn()
    asMockHook(usePaginatedMemexItemsQuery).mockReturnValue({
      queryKeysForGroups: [groupKey],
      queryKeysForItems: [],
      invalidateAllQueries: invalidateAllQueriesStub,
    })

    const queryClient = createTestQueryClient()
    const spy = jest.spyOn(queryClient, 'cancelQueries')
    const {result} = renderHook(() => useHandlePaginatedDataRefresh(), {
      wrapper: createWrapperWithContexts({
        QueryClient: {
          queryClient,
        },
      }),
    })
    await act(async () => {
      await result.current.handleRefresh()
    })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({queryKey: groupKey})
    expect(invalidateAllQueriesStub).toHaveBeenCalledTimes(1)
  })

  it('should not invalidate queries when there are pending updates', async () => {
    const invalidateAllQueriesStub = jest.fn()
    asMockHook(usePaginatedMemexItemsQuery).mockReturnValue({
      queryKeysForGroups: [],
      queryKeysForItems: [],
      invalidateAllQueries: invalidateAllQueriesStub,
    })

    const queryClient = createTestQueryClient()
    const {result} = renderHook(() => useHandlePaginatedDataRefresh(), {
      wrapper: createWrapperWithContexts({
        QueryClient: {
          queryClient,
        },
      }),
    })
    pendingUpdatesSingleton.increment()
    await act(async () => {
      await result.current.handleRefresh()
    })

    expect(invalidateAllQueriesStub).not.toHaveBeenCalled()
  })

  it('should not invalidate queries when the most recent update is more recent than the provided timestamp', async () => {
    const invalidateAllQueriesStub = jest.fn()
    asMockHook(usePaginatedMemexItemsQuery).mockReturnValue({
      queryKeysForGroups: [],
      queryKeysForItems: [],
      invalidateAllQueries: invalidateAllQueriesStub,
    })

    const queryClient = createTestQueryClient()
    const {result} = renderHook(() => useHandlePaginatedDataRefresh(), {
      wrapper: createWrapperWithContexts({
        QueryClient: {
          queryClient,
        },
      }),
    })
    const timestamp = 100
    mostRecentUpdateSingleton.set(timestamp + 1)
    await act(async () => {
      await result.current.handleRefresh(timestamp)
    })

    expect(invalidateAllQueriesStub).not.toHaveBeenCalled()
  })
})
