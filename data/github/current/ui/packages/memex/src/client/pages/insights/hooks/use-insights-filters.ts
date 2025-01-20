import useIsMounted from '@github-ui/use-is-mounted'
import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {parseTrimmedAndLowerCasedFilter} from '../../../components/filter-bar/helpers/search-filter'
import {useItemMatchesFilterQuery} from '../../../hooks/use-item-matches-filter-query'
import {useValueDelayedByTimeout} from '../../../hooks/use-value-delayed-by-timeout'
import {FILTER_QUERY_PARAM} from '../../../platform/url'
import {useSearchParams} from '../../../router'
import {useChartActions} from '../../../state-providers/charts/use-chart-actions'
import type {ChartState} from '../../../state-providers/charts/use-charts'
import {useMemexItems} from '../../../state-providers/memex-items/use-memex-items'

/**
 * Temporarily extracting this to keep it from
 * growing in scope on the render of this method,
 * but I think we'll likely want to rethink some organization
 * here as we work
 */
function useFilterQuerySyncedToSearch(chart: Pick<ChartState, 'localVersion' | 'serverVersion' | 'number'>) {
  const initialFilterValue = chart.localVersion.configuration.filter
  const initialServerFilterValue = chart.serverVersion.configuration.filter
  const {updateLocalChartConfiguration} = useChartActions()
  const isMounted = useIsMounted()
  const [searchParams, setSearchParams] = useSearchParams()
  const updatingQueryParamsRef = useRef<number | null>(null)
  /**
   * The local filter state can be updated locally in the filter bar
   * (through a suggestion selection, typing, or clearing the filter in the input),
   * and well as via a change from an "external" source (a live update, discarding changes, etc.)
   *
   * This ref is used to track if the local filter state _has just been updated_ by a local change,
   * and as such is up to date and we should skip syncing it via the chart's local version's filter value.
   * in a `useEffect` below.
   */
  const skipNextSyncFromExternalChangeRef = useRef(false)
  useEffect(() => {
    return () => {
      if (updatingQueryParamsRef.current) {
        window.clearTimeout(updatingQueryParamsRef.current)
      }
    }
  }, [])

  const [localFilterValue, setLocalFilterValue] = useState(() => {
    return searchParams.get(FILTER_QUERY_PARAM) ?? initialFilterValue
  })

  /**
   * Sets the local value immediately, then updates
   * the query params after an optional delay.
   *
   * By default it pushes changes to the stack, but can optionally
   * replace history
   */
  const setLocalFilterValueAndSyncToQueryParam = useCallback(
    (
      value: string,
      opts: {immediate: boolean; replace?: boolean; skipNextSyncFromExternalChange?: boolean} = {immediate: false},
    ) => {
      setLocalFilterValue(value)
      if (opts.skipNextSyncFromExternalChange) {
        skipNextSyncFromExternalChangeRef.current = true
      }
      if (updatingQueryParamsRef.current) {
        window.clearTimeout(updatingQueryParamsRef.current)
      }
      function updateSearch() {
        const nextParams = new URLSearchParams(searchParams)
        if (value === chart.serverVersion.configuration.filter) {
          nextParams.delete(FILTER_QUERY_PARAM)
        } else {
          nextParams.set(FILTER_QUERY_PARAM, value)
        }

        updateLocalChartConfiguration(chart.number, {filter: value})
        setSearchParams(nextParams, {replace: opts.replace})
      }
      if (opts.immediate) {
        updateSearch()
      } else {
        updatingQueryParamsRef.current = window.setTimeout(() => {
          if (!isMounted()) return
          updateSearch()
        }, 200)
      }
    },
    [
      searchParams,
      chart.serverVersion.configuration.filter,
      chart.number,
      updateLocalChartConfiguration,
      setSearchParams,
      isMounted,
    ],
  )

  /**
   * Track the setter in a stable way. this is safe, since we'll have run
   * the callback and updated the stable reference here before the effect
   * is
   */
  const trackingSetter = useTrackingRef(setLocalFilterValueAndSyncToQueryParam)

  useEffect(
    function updateParamAndStateOnInitialFilterChange() {
      if (skipNextSyncFromExternalChangeRef.current) {
        skipNextSyncFromExternalChangeRef.current = false
      } else {
        const windowParams = new URLSearchParams(window.location.search)
        trackingSetter.current(windowParams.get(FILTER_QUERY_PARAM) ?? initialFilterValue, {
          immediate: true,
          replace: true,
        })
      }
    },
    [initialFilterValue, trackingSetter, chart.number],
  )

  const resetFilter = useCallback(() => {
    trackingSetter.current(initialServerFilterValue, {
      immediate: true,
    })
  }, [initialServerFilterValue, trackingSetter])

  return {localFilterValue, setLocalFilterValueAndSyncToQueryParam, resetFilter, setLocalFilterValue} as const
}

/**
 *
 * @param givenFilterValue A filter value string
 * @returns if Insights filter bar is enabled, and the trimmed filter is truthy, return a list of items that match the filter. Otherwise return null
 */
function useFilteredMemexItems(givenFilterValue: string) {
  const deferredFilterValue = useValueDelayedByTimeout(givenFilterValue)
  const {items} = useMemexItems()
  const {itemMatchesFilterQuery} = useItemMatchesFilterQuery()

  const filteredItems = useMemo(() => {
    const filterValueDefined = Boolean(deferredFilterValue.trim())

    if (!filterValueDefined) {
      return null
    }

    return items.filter(item => {
      return itemMatchesFilterQuery(item, parseTrimmedAndLowerCasedFilter(deferredFilterValue))
    })
  }, [deferredFilterValue, items, itemMatchesFilterQuery])

  return {
    filteredItems,
  }
}

export function useInsightsFilters(chart: Pick<ChartState, 'localVersion' | 'serverVersion' | 'number'>) {
  const {localFilterValue, setLocalFilterValueAndSyncToQueryParam, resetFilter} = useFilterQuerySyncedToSearch(chart)
  const {filteredItems} = useFilteredMemexItems(localFilterValue)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasFilterValue = localFilterValue.trim()
  const onClearButtonClick: React.MouseEventHandler<HTMLButtonElement> | undefined = useMemo(() => {
    return hasFilterValue
      ? () => {
          setLocalFilterValueAndSyncToQueryParam('', {immediate: true, skipNextSyncFromExternalChange: true})
        }
      : undefined
  }, [hasFilterValue, setLocalFilterValueAndSyncToQueryParam])

  const setValueFromSuggestion = useCallback(
    (value: string) => {
      return setLocalFilterValueAndSyncToQueryParam(value, {immediate: true, skipNextSyncFromExternalChange: true})
    },
    [setLocalFilterValueAndSyncToQueryParam],
  )

  const handleFilterValueChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      setLocalFilterValueAndSyncToQueryParam(e.target.value, {immediate: false, skipNextSyncFromExternalChange: true})
    },
    [setLocalFilterValueAndSyncToQueryParam],
  )

  return {
    chart,
    filteredItems,
    filterValue: localFilterValue,
    handleFilterValueChange,
    onClearButtonClick,
    setValueFromSuggestion,
    resetFilter,
    inputRef,
  }
}
