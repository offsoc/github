import {UsagePeriod} from '../enums'

/**
 * @param usageAt usage date formatted as YYYY-MM-DDTHH:MM:SS.MMMZ UTC, ex: 2023-03-14T16:21:25.316Z
 * @returns formatted date string
 * UsagePeriod.TODAY: H (4 PM)
 * UsagePeriod.THIS_MONTH: M/D/YYYY (3/14/2023)
 * UsagePeriod.THIS_YEAR: MMM YYYY (Mar 2023)
 */
export const formatUsageDateForPeriod = (usageAt: string | number, period: UsagePeriod | undefined): string => {
  const date = new Date(usageAt)
  switch (period) {
    case UsagePeriod.THIS_HOUR:
      return date.toLocaleTimeString('default', {timeZone: 'UTC', hour: 'numeric', minute: '2-digit'})
    case UsagePeriod.TODAY:
      return date.toLocaleTimeString('default', {timeZone: 'UTC', hour: 'numeric'})
    case UsagePeriod.THIS_MONTH:
    case UsagePeriod.LAST_MONTH:
      return date.toLocaleDateString('default', {timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric'})
    case UsagePeriod.THIS_YEAR:
    case UsagePeriod.LAST_YEAR: {
      const month = date.toLocaleDateString('default', {timeZone: 'UTC', month: 'short'})
      const year = date.getUTCFullYear()
      return `${month} ${year}`
    }
    default:
      return date.toLocaleDateString('default', {timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric'})
  }
}

//
// returns MMM YYYY (Mar 2023) if day is not present
export const formatDate = (year: number, month: number, day?: number): string => {
  const date = new Date(year, month - 1, day ?? 1)

  const monthName = getMonthName(month, 'short')
  const yearName = date.getFullYear()

  if (day) {
    return date.toLocaleDateString('default', {timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric'})
  } else {
    return `${monthName} ${yearName}`
  }
}

const getMonthName = (monthNumber: number, fmt: 'long' | 'short' = 'long'): string => {
  const date = new Date()
  date.setMonth(monthNumber - 1)

  return date.toLocaleString('default', {month: fmt})
}
