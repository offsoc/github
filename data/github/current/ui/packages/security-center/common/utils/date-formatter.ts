const excludeYearFormatter = new Intl.DateTimeFormat('en-us', {timeZone: 'UTC', month: 'short', day: 'numeric'})
const includeYearFormatter = new Intl.DateTimeFormat('en-us', {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

/**
 * Formats a date integer into a human-readable date string.
 *
 * @param {number} date - The date integer to format.
 * @param {boolean} includeYear - Whether to include the year in the formatted output. If not provided, the year will be excluded unless the date is not in the current UTC year.
 * @returns {string} A human-readable date string.
 */
export function humanReadableDate(date: Date, {includeYear}: {includeYear?: boolean} = {}): string {
  let formatter = excludeYearFormatter

  const now = new Date()
  if (includeYear || (includeYear == null && date.getUTCFullYear() !== now.getUTCFullYear())) {
    formatter = includeYearFormatter
  }

  return formatter.format(date)
}

/**
 * Formats the provided date into an ISO string without the time.
 * @param date
 * @returns yyyy-MM-dd (e.g. 2024-01-01)
 */
export function toUTCDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}
