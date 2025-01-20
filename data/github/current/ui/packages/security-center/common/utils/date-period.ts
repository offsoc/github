import type {RangeSelection} from '@github-ui/date-picker'
import {differenceInDays} from 'date-fns'

export type DateRange = {
  startDate: string
  endDate: string
}

export type PeriodOptions = 'last14days' | 'last30days' | 'last90days'
export type Period = {period: PeriodOptions}

export function calculateDateRangeFromPeriod(selectedPeriod: Period): RangeSelection {
  const now = new Date()
  let startDate = now
  switch (selectedPeriod.period) {
    case 'last14days': {
      startDate = new Date(new Date().setUTCDate(now.getUTCDate() - 14))
      break
    }
    case 'last30days': {
      startDate = new Date(new Date().setUTCDate(now.getUTCDate() - 30))
      break
    }
    case 'last90days': {
      startDate = new Date(new Date().setUTCDate(now.getUTCDate() - 90))
      break
    }
    default:
      throw new Error(`Invalid period`)
  }
  return {from: startDate, to: now}
}

export function calculatePreviousDateRange(startDate: string, endDate: string): DateRange {
  const newStartDate = new Date(startDate)
  const newEndDate = new Date(endDate)

  const dayDiff = differenceInDays(newEndDate, newStartDate) + 1

  newStartDate.setDate(newStartDate.getDate() - dayDiff)
  newEndDate.setDate(newEndDate.getDate() - dayDiff)

  const newStartDateString = newStartDate.toISOString().split('T')[0]
  const newEndDateString = newEndDate.toISOString().split('T')[0]

  return {startDate: newStartDateString || '', endDate: newEndDateString || ''}
}

export function dateIsMoreThanTwoYearsAgo(date: string): boolean {
  const now = new Date()
  const twoYearsAgoUTCTime = Date.UTC(now.getUTCFullYear() - 2, now.getUTCMonth(), now.getUTCDate())

  const endDate = new Date(date)
  const endDateUTCTime = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate())

  return twoYearsAgoUTCTime > endDateUTCTime
}
