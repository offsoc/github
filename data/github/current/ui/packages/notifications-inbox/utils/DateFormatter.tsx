const millisecond = 1
const second = millisecond * 1000
const minute = second * 60
const hour = minute * 60
const day = hour * 24
const week = day * 7
const month = day * 30
const year = day * 365
const timeIntervals = [
  {unit: 'y', ms: year},
  {unit: 'mo', ms: month},
  {unit: 'w', ms: week},
  {unit: 'd', ms: day},
  {unit: 'h', ms: hour},
  {unit: 'm', ms: minute},
]

/**
 * Format date to a human readable string
 *
 * If the date is less than 24 hours ago, it returns the time with format "HH:MM"
 * If the date is more than 24 hours ago, it returns the date in short format like "Jan 1"
 * If the date is before a year, it returns the date
 */
export function DateFormatter({timestamp}: {timestamp: Date}) {
  const now = new Date()
  const difference = now.getTime() - timestamp.getTime()
  const interval = timeIntervals.find(i => i.ms < difference) || {unit: 'm', ms: minute}
  const defaultLocale = 'en-US'
  let dateString

  if (interval.unit === 'm' || interval.unit === 'h') {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    dateString = timestamp.toLocaleTimeString(navigator.language || defaultLocale, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: userTimeZone,
    })
  }

  if (interval.unit === 'd' || interval.unit === 'w' || interval.unit === 'mo') {
    dateString = timestamp.toLocaleDateString(navigator.language || defaultLocale, {
      month: 'short',
      day: 'numeric',
    })
  }

  if (interval.unit === 'y') {
    dateString = timestamp.toLocaleDateString(navigator.language || defaultLocale)
  }

  // eslint-disable-next-line github/a11y-no-title-attribute
  return <span title={dateString}>{dateString}</span>
}
