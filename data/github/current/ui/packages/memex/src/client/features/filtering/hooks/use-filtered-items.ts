import {useMemo} from 'react'

import {type ApplyTransientFilterOpts, useSearch} from '../../../components/filter-bar/search-context'
import {useMemexItems} from '../../../state-providers/memex-items/use-memex-items'

type UseFilteredItemsParams = {
  applyTransientFilter: ApplyTransientFilterOpts
}

/**
 * @param applyTransientFilter Whether to include or exclude the transient slicer filter
 * in the search query.
 * @returns An object containing a list of `filteredItems` based on the current search query.
 */
export function useFilteredItems({applyTransientFilter}: UseFilteredItemsParams = {applyTransientFilter: 'include'}) {
  const {items} = useMemexItems()

  const {matchesSearchQuery, query, transientQuery, baseQuery} = useSearch()
  const isFiltered = Boolean(query || baseQuery || (applyTransientFilter && transientQuery.normalisedQuery))

  const filteredItems = useMemo(
    () => (isFiltered ? items.filter(item => matchesSearchQuery(item, applyTransientFilter)) : items),
    [isFiltered, items, matchesSearchQuery, applyTransientFilter],
  )

  return {filteredItems}
}
