import {noop} from '@github-ui/noop'
import {useQueryClient} from '@tanstack/react-query'
import {useCallback} from 'react'

import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {pageParamForNextPlaceholder} from '../memex-items/queries/types'
import {usePaginatedMemexItemsQuery} from '../memex-items/queries/use-paginated-memex-items-query'
import {mostRecentUpdateSingleton} from './most-recent-update'
import {pendingUpdatesSingleton} from './pending-updates'

export const useHandlePaginatedDataRefresh = () => {
  const {memex_table_without_limits} = useEnabledFeatures()
  if (memex_table_without_limits) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useHandlePaginatedDataRefreshMWLEnabled()
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useHandlePaginatedDataRefreshMWLDisabled()
  }
}

const useHandlePaginatedDataRefreshMWLDisabled = () => {
  return {handleRefresh: noop, handleCancelFetchData: noop}
}

const useHandlePaginatedDataRefreshMWLEnabled = () => {
  const {invalidateAllQueries, queryKeysForGroups, queryKeysForItems} = usePaginatedMemexItemsQuery()
  const queryClient = useQueryClient()

  const handleCancelFetchData = useCallback(() => {
    for (const queryKey of queryKeysForGroups) {
      // no need to cancel placeholder queries
      if (queryKey[3] !== pageParamForNextPlaceholder) {
        queryClient.cancelQueries({queryKey})
      }
    }
    for (const queryKey of queryKeysForItems) {
      // no need to cancel placeholder queries
      if (queryKey[3] !== pageParamForNextPlaceholder) {
        queryClient.cancelQueries({queryKey})
      }
    }
  }, [queryKeysForGroups, queryKeysForItems, queryClient])

  const handleRefresh = useCallback(
    async (timestamp?: number) => {
      // if the timestamp is older than the most recent update, then refreshing the paginated data may overwrite
      // the local state with stale denormalized state, so we ignore it
      if (
        // the provided timestamp (from hydro) is in the precision of seconds, so we have to reduce the locally stored
        // time to that precision (flooring so denormalizations on the same second get through)
        (timestamp || Infinity) >= Math.floor(mostRecentUpdateSingleton.get() / 1000) &&
        !pendingUpdatesSingleton.hasPendingUpdates()
      ) {
        handleCancelFetchData()
        return invalidateAllQueries()
      }
    },
    [invalidateAllQueries, handleCancelFetchData],
  )

  return {handleRefresh, handleCancelFetchData}
}
