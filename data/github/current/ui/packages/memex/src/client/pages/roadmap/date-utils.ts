import {format, parseISO} from 'date-fns'

/**
 * Convince the date-fns library to format a UTC date by first making it appear local.
 * Example: 'Mon Oct 03 2022 20:00:00 GMT-0400' => '2022-10-04T00:00:00.000' => 'Tue Oct 04 2022 00:00:00 GMT-0400' => 'Tue, Oct 4'
 */
export const formatDateUtc = (date: Date, pattern = 'EEE, MMM d') => {
  const isoFormatWithNoZ = date.toISOString().slice(0, -1)
  const localDate = parseISO(isoFormatWithNoZ)
  return format(localDate, pattern)
}

/** Returns a new date with start of day (hour 0:00) UTC time for the given local date */
export const startOfDayUtc = (date: Date) => {
  const localStartOfDay = new Date(new Date(date).setHours(0, 0, 0, 0))
  const utcStartOfDay = new Date(localStartOfDay.getTime() - localStartOfDay.getTimezoneOffset() * 60 * 1000)
  return utcStartOfDay
}

export const formatDateRangeUtc = (startDate: Date, endDate: Date, pattern = 'EEE, MMM d') => {
  const isDifferentYear = startDate.getUTCFullYear() !== endDate.getUTCFullYear()
  const start = formatDateUtc(startDate, pattern)
  const end = formatDateUtc(endDate, isDifferentYear ? `${pattern} yyyy` : pattern)
  return start === end ? start : `${start} - ${end}`
}

/** Returns a sorted array of the two provided dates.  If one date is undefined, then both dates will be the same. */
export function getSortedDates([date1, date2]: readonly [Date | undefined, Date | undefined]): [
  Date | undefined,
  Date | undefined,
] {
  if (!date1) return [date2, date2]
  else if (!date2) return [date1, date1]
  else return date1 <= date2 ? [date1, date2] : [date2, date1]
}
