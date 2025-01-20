import {useMemo} from 'react'

import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import type {MemexItemModel} from '../../models/memex-item-model'
import {useMemexItemsQuery} from './queries/use-memex-items-query'
import {usePaginatedMemexItemsQuery} from './queries/use-paginated-memex-items-query'

type MemexItemsHookReturnType = {
  /**
   * List of all memex item models currently belonging to the project
   */
  items: Readonly<Array<MemexItemModel>>
}

export const useMemexItems = (): MemexItemsHookReturnType => {
  const {memex_table_without_limits} = useEnabledFeatures()

  if (memex_table_without_limits) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return usePaginatedMemexItems()
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useUnpaginatedMemexItems()
  }
}

const usePaginatedMemexItems = (): MemexItemsHookReturnType => {
  const {data} = usePaginatedMemexItemsQuery()
  return useMemo(() => {
    return {items: data.flatMap(q => q.nodes)}
  }, [data])
}

const useUnpaginatedMemexItems = (): MemexItemsHookReturnType => {
  return {items: useMemexItemsQuery().data?.pages[0]?.nodes || []}
}
