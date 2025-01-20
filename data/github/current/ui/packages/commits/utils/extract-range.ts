import type {RangeSelection} from '@github-ui/date-picker'
import {formatISO} from 'date-fns'

export function extractRange(range: RangeSelection | null) {
  if (!range) return
  const startDate = formatISO(range.from, {representation: 'date'})
  const endDate = formatISO(range.to, {representation: 'date'})

  return {startDate, endDate}
}
