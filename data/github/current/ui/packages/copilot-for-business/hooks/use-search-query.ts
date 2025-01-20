import {SeatType, type SortName} from '../types'
import {useDeferredValue, useCallback, useMemo} from 'react'
import {useTrackedValue} from '../standalone/hooks/use-tracked-value'

function _getFilterParam(filter: SeatType): string {
  switch (filter) {
    case SeatType.All:
    case SeatType.Organization:
      return 'all'
    case SeatType.User:
      return 'users'
    case SeatType.Team:
      return 'teams'
    case SeatType.OrganizationInvitation:
      return 'organizationinvitations'
    default:
      return ''
  }
}

function useFilterSeatType({initialFilter = SeatType.All}: {initialFilter: SeatType}) {
  const {value, lastValue, updateValue} = useTrackedValue({initialValue: initialFilter})

  const handleFilter = useCallback(
    (filter: SeatType) => {
      updateValue(filter)
    },
    [updateValue],
  )

  return {
    filter: value,
    lastValue,
    handleFilter,
    getFilterParam: _getFilterParam,
  }
}

function useSearchQuery({initialQuery = ''}: {initialQuery?: string} = {initialQuery: ''}) {
  const {value, lastValue, updateValue} = useTrackedValue({initialValue: initialQuery})
  const deferredQuery = useDeferredValue(value)

  const handleSearch = useCallback(
    (q: string) => {
      updateValue(q)
    },
    [updateValue],
  )

  return {
    query: value,
    deferredQuery,
    lastValue,
    handleSearch,
  }
}

function usePagination({initialPage = 1}: {initialPage?: number} = {initialPage: 1}) {
  const {value, lastValue, updateValue} = useTrackedValue({initialValue: initialPage})

  const handleSetPage = useCallback(
    (page: number) => {
      updateValue(page)
    },
    [updateValue],
  )

  return {
    currentPage: value,
    lastValue,
    handleSetPage,
  }
}

function useSort({initialSort = 'name_asc'}: {initialSort: SortName} = {initialSort: 'name_asc'}) {
  const {value, lastValue, updateValue} = useTrackedValue({initialValue: initialSort})

  const updateSortDetails = useCallback(
    (sort: SortName) => {
      updateValue(sort)
    },
    [updateValue],
  )

  return {
    sortDetails: value,
    lastValue,
    updateSortDetails,
  }
}

type Configs = {
  initialPage?: number
  initialSort?: SortName
  initialQuery?: string
  initialFilter?: SeatType
}

const configDefaults = {
  initialPage: 1,
  initialSort: 'name_asc' as SortName,
  initialQuery: '',
  initialFilter: SeatType.All,
}

export function usePaginatedSearchQuery(configs?: Configs) {
  const memoizedConfigs = useMemo(() => ({...configDefaults, ...(configs ?? {})}), [configs])
  const {initialPage, initialSort} = memoizedConfigs

  const {currentPage, handleSetPage} = usePagination({initialPage})
  const {query, deferredQuery, lastValue: lastQuery, handleSearch: originalHandleSearch} = useSearchQuery()
  const {sortDetails, lastValue: lastSort, updateSortDetails} = useSort({initialSort})
  const {filter, getFilterParam, handleFilter} = useFilterSeatType({initialFilter: SeatType.All})

  const handleSearch = useCallback(
    (q: string) => {
      handleSetPage(1)
      originalHandleSearch(q)
    },
    [handleSetPage, originalHandleSearch],
  )

  const queryHasChanged = () => query !== lastQuery.current || sortDetails !== lastSort.current

  const makeQueryString = useCallback(() => {
    return toQueryString({query: deferredQuery, currentPage, sortDetails})
  }, [currentPage, sortDetails, deferredQuery])

  return {
    currentPage,
    paginate: handleSetPage,
    query,
    deferredQuery,
    handleSearch,
    sortDetails,
    updateSortDetails,
    filter,
    getFilterParam,
    handleFilter,
    makeQueryString,
    queryHasChanged,
  }
}

export type QueryStringProps = {
  query: string
  currentPage: number
  sortDetails: string
}

export function toQueryString({query, currentPage, sortDetails}: QueryStringProps) {
  const params = new URLSearchParams()
  params.append('q', query)
  params.append('page', currentPage.toString())
  params.append('sort', sortDetails)

  return params.toString()
}
