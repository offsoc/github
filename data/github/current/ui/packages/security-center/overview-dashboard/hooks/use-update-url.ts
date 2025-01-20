import {useEffect} from 'react'

import {isPeriodSelection} from '../../common/components/date-span-picker'
import type {DateSpan} from '../../common/components/date-span-picker/DateSpanPicker'

export function useUpdateUrl(
  submittedQuery: string,
  queryWasChanged: boolean,
  dateSpanWasChanged: boolean,
  startDateString: string,
  endDateString: string,
  selectedTable: string,
  selectedDateSpan: DateSpan,
  tab: string = '',
  tabIsDirty: boolean = false,
): void {
  useEffect(() => {
    const url = new URL(window.location.href, window.location.origin)
    const nextParams = url.searchParams

    if (queryWasChanged) {
      nextParams.set('query', submittedQuery)
    } else {
      nextParams.delete('query')
    }

    if (!dateSpanWasChanged) {
      nextParams.delete('period')
      nextParams.delete('startDate')
      nextParams.delete('endDate')
    } else if (isPeriodSelection(selectedDateSpan)) {
      nextParams.set('period', selectedDateSpan.period)
      nextParams.delete('startDate')
      nextParams.delete('endDate')
    } else {
      nextParams.set('startDate', startDateString)
      nextParams.set('endDate', endDateString)
      nextParams.delete('period')
    }

    // For the new three-tabbed view, the url will be updated within the DetectionTab component so we'll pass an empty string here.
    // Keeping this branching logic until the old view is removed.
    if (selectedTable !== '') {
      selectedTable !== 'repositories'
        ? nextParams.set('impactAnalysisTab', selectedTable)
        : nextParams.delete('impactAnalysisTab')
    }

    // This is only relevant for the three-tabbed view. The old view will pass in an empty string by default.
    // Keeping this branching logic until the old view is removed.
    if (tab !== '') {
      if (tabIsDirty) {
        nextParams.set('view', tab)
      } else {
        nextParams.delete('view')
      }
    }

    history.pushState(null, '', `${url.pathname}${url.search}`)
  }, [
    submittedQuery,
    startDateString,
    endDateString,
    selectedTable,
    selectedDateSpan,
    queryWasChanged,
    dateSpanWasChanged,
    tab,
    tabIsDirty,
  ])
}
