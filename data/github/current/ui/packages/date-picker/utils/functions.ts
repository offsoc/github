import {isAfter, isBefore, isSunday, isWeekend, nextMonday, previousFriday} from 'date-fns'

import {type InternalSelection, isMultiSelection, isRangeSelection, type RangeEnd} from '../types'

export const sanitizeDate = (date: Date | string) => new Date(new Date(date).toDateString())

export const sanitizeSelection = (selection?: InternalSelection): InternalSelection => {
  if (selection instanceof Date) {
    return sanitizeDate(selection)
  } else if (selection && isMultiSelection(selection)) {
    return selection.map(sanitizeDate)
  } else if (selection && isRangeSelection(selection)) {
    return {from: sanitizeDate(selection.from), to: selection.to && sanitizeDate(selection.to)}
  }
  return null
}

export const getFocusDate = (selection: InternalSelection, activeRangeEnd: RangeEnd | null = null): Date | null => {
  if (!selection) return sanitizeDate(new Date())

  if (selection instanceof Date) {
    return sanitizeDate(selection)
  } else if (isMultiSelection(selection)) {
    const lastDate = selection.at(-1)
    return lastDate ? sanitizeDate(lastDate) : null
  } else if (isRangeSelection(selection)) {
    return activeRangeEnd === 'to' && selection.to ? sanitizeDate(selection.to) : sanitizeDate(selection.from)
  } else {
    return null
  }
}

/**
 * Clamp the date to the given range. Unlike date-fns `clamp`, this supports optional
 * start and end dates.
 */
export const clamp = (date: Date, {minDate: min, maxDate: max}: {minDate?: Date; maxDate?: Date}) =>
  min && isBefore(date, min) ? min : max && isAfter(date, max) ? max : date

/**
 * Returns `true` if the date falls in between the given dates. If start or end date are
 * `undefined`, they will not apply.
 */
export const isBetween = (date: Date, {minDate: min, maxDate: max}: {minDate?: Date; maxDate?: Date}) =>
  (min ? isAfter(date, min) : true) && (max ? isBefore(date, max) : true)

export const closestWeekday = (date: Date, direction: 'forward' | 'backward' | 'auto' = 'auto'): Date => {
  if (!isWeekend(date)) return date

  switch (direction) {
    case 'forward':
      return nextMonday(date)
    case 'backward':
      return previousFriday(date)
    case 'auto':
      return isSunday(date) ? nextMonday(date) : previousFriday(date)
  }
}
