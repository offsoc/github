import debounce, {type DebouncedFunc} from 'lodash-es/debounce'
import {useCallback, useEffect, useRef} from 'react'

import {useItemMatchesFilterQuery} from '../../../hooks/use-item-matches-filter-query'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {useMemexItems} from '../../../state-providers/memex-items/use-memex-items'
import {useAutomationGraph} from '../../../state-providers/workflows/use-automation-graph'
import {parseTrimmedAndLowerCasedFilter} from '../../filter-bar/helpers/search-filter'
import {getContentTypes, SEARCH_DEBOUNCE_DELAY_MS} from '../helpers/search-constants'

export const useGetProjectItemsAction = () => {
  const {itemMatchesFilterQuery} = useItemMatchesFilterQuery()
  const {items} = useMemexItems()
  const {setFilterCount, localQuery, setLocalQuery, setLocalContentTypes} = useAutomationGraph()
  const debouncedSearch = useRef<DebouncedFunc<() => Promise<void>> | undefined>()

  const getFilterCount = useCallback(
    (query: string) => {
      const matchesSearchQuery = (item: MemexItemModel) => {
        return itemMatchesFilterQuery(item, parseTrimmedAndLowerCasedFilter(query))
      }

      return items.filter(matchesSearchQuery).length
    },
    [itemMatchesFilterQuery, items],
  )

  const onSearchQueryChange = useCallback(
    (newQuery: string) => {
      setLocalQuery(newQuery)

      if (debouncedSearch.current) {
        debouncedSearch.current.cancel()
      }

      debouncedSearch.current = debounce(() => {
        setLocalContentTypes(getContentTypes(newQuery))
      }, SEARCH_DEBOUNCE_DELAY_MS)

      debouncedSearch.current()
    },
    [setLocalQuery, setLocalContentTypes],
  )

  useEffect(() => {
    setFilterCount(getFilterCount(localQuery))
  }, [getFilterCount, localQuery, setFilterCount])

  return {
    onSearchQueryChange,
  }
}
