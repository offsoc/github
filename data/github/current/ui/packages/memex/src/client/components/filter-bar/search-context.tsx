import {useTrackingRef} from '@github-ui/use-tracking-ref'
import debounce from 'lodash-es/debounce'
import {createContext, memo, useCallback, useContext, useMemo, useRef} from 'react'
import type {Row} from 'react-table'

import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import {SearchCancel, SearchStatName} from '../../api/stats/contracts'
import type {CommandSpec} from '../../commands/command-tree'
import {useCommands} from '../../commands/hook'
import {NO_SLICE_VALUE} from '../../features/slicing/hooks/use-slice-by'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {useFilterKeywords} from '../../hooks/use-filter-keywords'
import {useItemMatchesFilterQuery} from '../../hooks/use-item-matches-filter-query'
import {useProjectViewRouteMatch} from '../../hooks/use-project-view-route-match'
import type {BaseViewState, ViewIsDirtyStates} from '../../hooks/use-view-state-reducer/types'
import {ViewStateActionTypes} from '../../hooks/use-view-state-reducer/view-state-action-types'
import {useViews} from '../../hooks/use-views'
import type {ColumnModel} from '../../models/column-model'
import type {MemexItemModel} from '../../models/memex-item-model'
import {useAllColumns} from '../../state-providers/columns/use-all-columns'
import type {TableDataType} from '../react_table/table-data-type'
import {
  type FilterOptions,
  getColumnOptions,
  insertFilterIntoQuery,
  normalizeToFilterName,
  type ParsedFullTextQuery,
  parseTrimmedAndLowerCasedFilter,
  removeFilterFromQuery,
  replaceQuery,
} from './helpers/search-filter'

type StatSearchKeys = typeof SearchStatName
type StatSearchCancelKeys = typeof SearchCancel
type SearchActionTypes = typeof ViewStateActionTypes.SetFilter | typeof ViewStateActionTypes.SetSliceByFilter

/**
 * A configuration used to define a search context for project items.
 */
export type SearchConfigType = {
  /** A query outside of the filter bar appended to all search queries (e.g. -no:tracks)  */
  baseQuery?: string
  /** Whether or not this controls the main filter bar shared by project views  */
  isMainProjectFilter: boolean
  /** Action that will update state to relflect the updated query  */
  viewStateActionType: SearchActionTypes
  /** Getter that retrieves the filter value from state */
  getSearchQueryFromView: (view?: BaseViewState) => string
  /** Getter that determines whether or not filter value is dirty */
  getSearchIsDirty: (view?: BaseViewState & ViewIsDirtyStates) => boolean
  /** Stats keys used for stats calls emitted on user search or cancel */
  stats?: {
    search: StatSearchKeys
    cancel: StatSearchCancelKeys
  }
}

export const DefaultSearchConfig: Readonly<SearchConfigType> = {
  isMainProjectFilter: true,
  viewStateActionType: ViewStateActionTypes.SetFilter,
  getSearchQueryFromView: view => view?.localViewState?.filter ?? '',
  getSearchIsDirty: view => view?.isFilterDirty ?? false,
  stats: {
    search: SearchStatName,
    cancel: SearchCancel,
  },
}

export type SearchContextType = {
  query: string
  searchTokens: ParsedFullTextQuery['searchTokens']
  orderedTokenizedFilters: ParsedFullTextQuery['orderedTokenizedFilters']
  fieldFilters: ParsedFullTextQuery['fieldFilters']
  setQuery: (viewNumber: number, value: string) => void
  appendFilter: (filter: string, options?: FilterOptions) => void
  addFilter: (filter: string, value: string | number) => void
  removeFilter: (filter: string, value: string | number) => void
  toggleFilter: (filter: string, value: string | number) => void
  insertFilter: (filter: string, value: string | number) => void
  matchesSearchQuery: (item: MemexItemModel, applyTransientFilter?: ApplyTransientFilterOpts) => boolean
  globalFilter: (
    rows: Array<Row<TableDataType>>,
    applyTransientFilter?: ApplyTransientFilterOpts,
  ) => Array<Row<TableDataType>>
  focusFilterInput: () => void
  searchInputRef: React.MutableRefObject<HTMLInputElement | null>
  isSearchDirty: boolean
  clearSearchQuery: (viewNumber: number) => void
  addSpaceToQuery: () => void
  transientQuery: ParsedFullTextQuery & {normalisedQuery: string}
  baseQuery?: string
}

export type ApplyTransientFilterOpts = 'include' | 'exclude'
export const SearchContext = createContext<SearchContextType | null>(null)

/**
 * Consume the search context value.
 *
 * @returns The value of the search context.
 */
export const useSearch = () => {
  const value = useContext(SearchContext)
  if (!value) {
    throw new Error('useSearch must be used inside a SearchProvider')
  }

  return value
}

/**
 * Provides addition state to the search context that's unused in
 * the other contexts and is not view related
 */
export const SearchProvider = memo<{
  children?: React.ReactNode
  config: Readonly<SearchConfigType>
}>(function SearchProvider({children, config}) {
  const {currentView, viewStateDispatch} = useViews()
  const {allColumns} = useAllColumns()
  const {itemMatchesFilterQuery} = useItemMatchesFilterQuery()
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const {postStats} = usePostStats()
  const trackingPostStats = useTrackingRef(postStats)

  const emitDebouncedSearchStatsEvent = useMemo(
    () =>
      debounce((value: string) => {
        if (config.stats?.search) {
          trackingPostStats.current({
            name: config.stats.search,
            context: value.trim(),
          })
        }
      }, 500),
    [trackingPostStats, config.stats],
  )

  //#region search filter
  const setQuery = useCallback(
    (viewNumber: number, filter: string) => {
      emitDebouncedSearchStatsEvent.cancel()
      viewStateDispatch({type: config.viewStateActionType, viewNumber, filter})
      emitDebouncedSearchStatsEvent(filter)
    },
    [emitDebouncedSearchStatsEvent, viewStateDispatch, config.viewStateActionType],
  )
  //#endregion
  const searchQuery = config.getSearchQueryFromView(currentView)
  const isSearchDirty = config.getSearchIsDirty(currentView)
  const visibleFields = useMemo(
    () => currentView?.localViewStateDeserialized.visibleFields ?? [],
    [currentView?.localViewStateDeserialized.visibleFields],
  )

  const transientQuery = useMemo(() => {
    const field = currentView?.localViewStateDeserialized.sliceBy?.field
    const value = currentView?.localViewStateDeserialized.sliceValue

    if (!field || !value) {
      return parseTrimmedAndLowerCasedFilter('')
    }

    const normalizedFieldName = normalizeToFilterName(field.name)

    let filterField: string
    let filterValue: string | null

    if (value === NO_SLICE_VALUE) {
      filterField = 'no'
      filterValue = normalizedFieldName
    } else {
      filterField = normalizedFieldName
      filterValue = value
    }

    return parseTrimmedAndLowerCasedFilter(`${filterField}:"${filterValue}"`)
  }, [currentView])

  const query = useMemo(() => {
    const fullQuery = config.baseQuery ? `${config.baseQuery} ${searchQuery}` : searchQuery
    return parseTrimmedAndLowerCasedFilter(fullQuery)
  }, [searchQuery, config.baseQuery])

  // This function appends a filter (with its value if provided) at the end of the query string.
  const appendFilter = useCallback(
    /**
     * @param filter The text to append as the filter e.g. `label` or `assignee`
     * @param opts.value The value of the filter e.g. if the filter is `label` and value is `bug` then the query string will be set to `label:bug`
     * @param opts.replace Whether to replace the filter or not. For example:
     * if the query string is `lab` & replace is true & filter is `label` & value is `bug`
     * then the query string will be set to `label: bug` (instead of `lab label:bug`).
     * @param opts.filterForEmpty Whether to replace the entire filter to search for empty column values e.g. `no:label`
     * @param opts.filterForNegative Whether to replace the entire filter to search for negative column values e.g. `-label:bug`
     */
    (filter: string, opts: FilterOptions = {}) => {
      if (!currentView) return
      setQuery(currentView.number, replaceQuery(searchQuery, filter, opts))
    },
    [currentView, searchQuery, setQuery],
  )

  const filterExists = useCallback(
    (filterKey: string, filterValue: string): boolean => {
      return query.fieldFilters.some(
        ([name, values]) => name === filterKey.toLowerCase() && values.includes(filterValue.toLowerCase()),
      )
    },
    [query.fieldFilters],
  )

  // Add a filter by filterKey:filterValue to the filter bar if not already present.
  const addFilter = useCallback(
    (filterKey: string, filterValue: string | number) => {
      if (!currentView?.number) return

      const filterKeyNormalized = normalizeToFilterName(filterKey)
      const valueNormalized = filterValue.toString()

      appendFilter(filterKeyNormalized, {value: valueNormalized})
    },
    [appendFilter, currentView],
  )

  //  Remove a filter by filterKey:filterValue from the filter bar if already present.
  const removeFilter = useCallback(
    (filterKey: string, filterValue: string | number) => {
      if (!currentView?.number) return

      const filterKeyNormalized = normalizeToFilterName(filterKey)
      const valueNormalized = filterValue.toString()

      setQuery(currentView.number, removeFilterFromQuery(filterKeyNormalized, valueNormalized, searchQuery))
    },
    [currentView, searchQuery, setQuery],
  )

  // This toggle function will:
  //  Add filterKey:filterValue to the filter bar if not already present.
  //  Remove filterKey:filterValue from the filter bar if already present.
  const toggleFilter = useCallback(
    (filterKey: string, filterValue: string | number) => {
      if (!currentView?.number) return

      const filterKeyNormalized = normalizeToFilterName(filterKey)
      const valueNormalized = filterValue.toString()

      const updateFilter = filterExists(filterKeyNormalized, valueNormalized) ? removeFilter : addFilter

      updateFilter(filterKeyNormalized, valueNormalized)
    },
    [currentView, filterExists, addFilter, removeFilter],
  )

  const insertFilter = useCallback(
    (filterKey: string, filterValue: string | number) => {
      if (!currentView?.number) return

      const filterKeyNormalized = filterKey.toLowerCase()
      const valueNormalized = filterValue.toString()
      const selectedColumn = allColumns
        .filter(isFilterableColumn)
        .find(
          column =>
            column.name.toLowerCase() ===
            (filterKeyNormalized[0] === '-' ? filterKeyNormalized.slice(1) : filterKeyNormalized),
        )
      const columnOptions = getColumnOptions(selectedColumn)

      setQuery(
        currentView.number,
        insertFilterIntoQuery(searchQuery, filterKeyNormalized, valueNormalized, {columnOptions}),
      )
    },
    [currentView, searchQuery, setQuery, allColumns],
  )

  // `applyTransientFilter` allows additional filtering to be applied
  // without modifying the user's original filter query.
  // This is currently used to:
  //  - populate the slicer panel's items based on the user's current filter (before transient fitlers are applied)
  //  - apply additional filters based on slicer item selection
  const matchesSearchQuery = useCallback(
    (item: MemexItemModel, applyTransientFilter: ApplyTransientFilterOpts = 'include') => {
      if (!currentView) return false
      // Checks if an item matches the current query:
      // by either a specified field filter value or
      // by a free text match with any visible field.
      const itemMatchesQuery = itemMatchesFilterQuery(item, query, visibleFields)

      if (applyTransientFilter === 'include' && transientQuery.normalisedQuery) {
        return itemMatchesQuery && itemMatchesFilterQuery(item, transientQuery, visibleFields)
      }

      return itemMatchesQuery
    },
    [visibleFields, currentView, query, itemMatchesFilterQuery, transientQuery],
  )

  const {FilterKeywords} = useFilterKeywords()

  const globalFilter = useCallback(
    (rows: Array<Row<TableDataType>>, applyTransientFilter: ApplyTransientFilterOpts = 'include') => {
      if (!rows.length) return []
      if (!query.normalisedQuery && !transientQuery.normalisedQuery) return rows
      if (applyTransientFilter === 'exclude' && !query.normalisedQuery) return rows

      return rows.reduce((collection, row) => {
        if (row.isGrouped) {
          row.subRows = globalFilter(row.subRows, applyTransientFilter)
          collection.push({...row})
        } else {
          if (matchesSearchQuery(row.original, applyTransientFilter)) {
            collection.push(row)
          }
        }
        return collection
      }, new Array<Row<TableDataType>>())
    },
    [query.normalisedQuery, transientQuery.normalisedQuery, matchesSearchQuery],
  )
  //#endregion

  const focusFilterInput = useCallback(() => {
    searchInputRef.current?.focus()
  }, [])

  const clearSearchQuery = useCallback(
    (viewNumber: number) => {
      setQuery(viewNumber, '')
      if (config.stats?.cancel) {
        postStats({
          name: config.stats.cancel,
        })
      }
    },
    [postStats, setQuery, config.stats],
  )

  const addSpaceToQuery = useCallback(() => {
    const sanitizedQuery = searchQuery.trimEnd()
    if (currentView && sanitizedQuery.length > 0) {
      const waitingForInput = sanitizedQuery.endsWith(':') || sanitizedQuery.endsWith(',')
      setQuery(currentView.number, waitingForInput ? sanitizedQuery : `${sanitizedQuery} `)
      focusFilterInput()
    } else {
      focusFilterInput()
    }
  }, [currentView, searchQuery, setQuery, focusFilterInput])

  const {isProjectViewRoute} = useProjectViewRouteMatch()
  useCommands(() => {
    if (!isProjectViewRoute || !config.isMainProjectFilter) return null
    // We don't directly reference query, but we need it in state to avoid
    // bugs on resetting the query content due to memoization
    void query

    return [
      'f',
      'Filter by...',
      /**
       * We can use allColumns here instead of just the view specific ones,
       * since the filters applied here will have their column data lazy-loaded
       * if they aren't already visible
       */
      allColumns
        .filter(isFilterableColumn)
        .map<CommandSpec>((column, i) => [
          /**
           * to account for more fields than are filterable with a single 0-9 shortcode
           * converting 0-36 -> 0-9a-z
           *
           * this may need a better solution to account for more than 36 options in the future
           */
          i.toString(36),
          `Filter by ${column.name}`,
          'filter',
          () => {
            appendFilter(column.name)
            focusFilterInput()
          },
        ])
        .concat(
          FilterKeywords.filter(k => k.isFilterable).map<CommandSpec>((keywordFilterOption, i) => [
            (100 + i).toString(),
            keywordFilterOption.description,
            'filter',
            () => {
              appendFilter(keywordFilterOption.keyword)
              focusFilterInput()
            },
          ]),
        ),
    ]
  }, [
    allColumns,
    appendFilter,
    isProjectViewRoute,
    query,
    focusFilterInput,
    FilterKeywords,
    config.isMainProjectFilter,
  ])

  const searchCtx = useMemo(() => {
    return {
      searchInputRef,
      query: searchQuery,
      baseQuery: config.baseQuery,
      ...query,
      addSpaceToQuery,
      setQuery,
      clearSearchQuery,
      appendFilter,
      addFilter,
      removeFilter,
      toggleFilter,
      insertFilter,
      isSearchDirty,
      matchesSearchQuery,
      globalFilter,
      focusFilterInput,
      transientQuery,
    }
  }, [
    searchQuery,
    query,
    addSpaceToQuery,
    setQuery,
    clearSearchQuery,
    appendFilter,
    addFilter,
    removeFilter,
    toggleFilter,
    insertFilter,
    isSearchDirty,
    matchesSearchQuery,
    globalFilter,
    focusFilterInput,
    transientQuery,
    config.baseQuery,
  ])

  return <SearchContext.Provider value={searchCtx}>{children}</SearchContext.Provider>
})

function isFilterableColumn(column: ColumnModel): boolean {
  return column.dataType !== MemexColumnDataType.Title
}
