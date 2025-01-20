import {useEffect} from 'react'

import {type DateSpan, isRangeSelection} from '../../common/components/date-span-picker/DateSpanPicker'
import {toUTCDateString} from '../../common/utils/date-formatter'

export function useUpdateUrl(query: string, queryIsDirty: boolean, dateSpan: DateSpan, dateSpanIsDirty: boolean): void {
  useEffect(() => {
    const url = new URL(window.location.href, window.location.origin)
    const params = url.searchParams

    if (queryIsDirty) {
      params.set('query', query)
    } else {
      params.delete('query')
    }

    if (dateSpanIsDirty) {
      if (isRangeSelection(dateSpan)) {
        params.set('startDate', toUTCDateString(dateSpan.from))
        params.set('endDate', toUTCDateString(dateSpan.to))
        params.delete('period')
      } else {
        params.set('period', dateSpan.period)
        params.delete('startDate')
        params.delete('endDate')
      }
    } else {
      params.delete('period')
      params.delete('startDate')
      params.delete('endDate')
    }

    history.pushState(null, '', `${url.pathname}${url.search}`)
  }, [query, queryIsDirty, dateSpan, dateSpanIsDirty])
}
