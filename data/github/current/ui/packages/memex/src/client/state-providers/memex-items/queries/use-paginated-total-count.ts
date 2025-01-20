import {useEnabledFeatures} from '../../../hooks/use-enabled-features'
import {usePaginatedMemexItemsQuery} from './use-paginated-memex-items-query'

export function usePaginatedTotalCount() {
  const {memex_table_without_limits} = useEnabledFeatures()
  if (!memex_table_without_limits) return 0
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {totalCount} = usePaginatedMemexItemsQuery()
  return totalCount.value
}
