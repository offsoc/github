import {
  addBusinessDays,
  addDays,
  differenceInDays,
  isAfter,
  isBefore,
  isEqual,
  subBusinessDays,
  subDays,
} from 'date-fns'

import type {InternalRangeSelection, RangeEnd} from '../types'
import {clamp, closestWeekday} from './functions'

interface DateLimits {
  minDate?: Date
  maxDate?: Date
}

interface RangeSizeLimits {
  minRangeSize?: number
  maxRangeSize?: number
}

const nextValidDay = (date: Date, disableWeekends: boolean) =>
  disableWeekends ? closestWeekday(date, 'forward') : date
const prevValidDay = (date: Date, disableWeekends: boolean) =>
  disableWeekends ? closestWeekday(date, 'backward') : date
const closestValidDay = (date: Date, disableWeekends: boolean) =>
  disableWeekends ? closestWeekday(date, 'auto') : date

const addValidDays = (date: Date, days: number, disableWeekends: boolean) =>
  disableWeekends ? addBusinessDays(date, days) : addDays(date, days)
const subValidDays = (date: Date, days: number, disableWeekends: boolean) =>
  disableWeekends ? subBusinessDays(date, days) : subDays(date, days)

/** Clamp the day to the given range while also forcing the result to fall on a weekday if weekends are disabled. */
const clampValid = (date: Date, {minDate, maxDate}: DateLimits, disableWeekends: boolean) => {
  // Even though we call closestValidDay on the result, we still need to adjust the limits. For example if the maxDate
  // is a Sunday and we don't adjust the maxDate, we could clamp the result to a Sunday, which would result in returning
  // the next Monday - a day after the maxDate. If we instead adjust the maxDate to the previous Friday, we would correctly
  // return Friday.
  const validMinDate = minDate && nextValidDay(minDate, disableWeekends)
  const validMaxDate = maxDate && prevValidDay(maxDate, disableWeekends)
  return closestValidDay(clamp(date, {minDate: validMinDate, maxDate: validMaxDate}), disableWeekends)
}

// When calculating with range sizes we always need to subtract one, because range sizes include both the start and end days
const maxTo = (validFrom: Date, {maxRangeSize}: RangeSizeLimits, disableWeekends: boolean) =>
  maxRangeSize !== undefined ? addValidDays(validFrom, maxRangeSize - 1, disableWeekends) : undefined
const minFrom = (validTo: Date, {maxRangeSize}: RangeSizeLimits, disableWeekends: boolean) =>
  maxRangeSize !== undefined ? subValidDays(validTo, maxRangeSize - 1, disableWeekends) : undefined
const minTo = (validFrom: Date, {minRangeSize}: RangeSizeLimits, disableWeekends: boolean) =>
  minRangeSize !== undefined ? addValidDays(validFrom, minRangeSize - 1, disableWeekends) : undefined
const maxFrom = (validTo: Date, {minRangeSize}: RangeSizeLimits, disableWeekends: boolean) =>
  minRangeSize !== undefined ? subValidDays(validTo, minRangeSize - 1, disableWeekends) : undefined

interface RangeSizeParams extends DateLimits, RangeSizeLimits {
  disableWeekends?: boolean
  adjustableRangeEnd?: RangeEnd
}

/**
 * Ensure that the range is 'forward' by making the 'to' date fall after the 'from' date. If the range is flipped, also
 * flips the active range end.
 */
const ensureForwardRange = <R extends InternalRangeSelection>(range: R, adjustableRangeEnd: RangeEnd): [R, RangeEnd] =>
  range.to && isAfter(range.from, range.to)
    ? [{...range, from: range.to, to: range.from}, adjustableRangeEnd === 'from' ? 'to' : 'from']
    : [range, adjustableRangeEnd]

/**
 * Adjust the active range end to fit the range to the allowed size.
 */
const adjustRangeToSize = <R extends InternalRangeSelection>(
  range: R,
  {disableWeekends = false, adjustableRangeEnd = 'to', ...rangeSizeLimits}: RangeSizeParams,
): R => {
  const validFrom = closestValidDay(range.from, disableWeekends)

  // no 'to' date selected, so no length to calculate
  if (!range.to) return {...range, from: validFrom}

  const validTo = closestValidDay(range.to, disableWeekends)

  switch (adjustableRangeEnd) {
    case 'from':
      return {
        ...range,
        from: clampValid(
          range.from,
          {
            minDate: minFrom(validTo, rangeSizeLimits, disableWeekends),
            maxDate: maxFrom(validTo, rangeSizeLimits, disableWeekends),
          },
          disableWeekends,
        ),
        to: validTo,
      }
    case 'to':
      return {
        ...range,
        from: validFrom,
        to: clampValid(
          range.to,
          {
            minDate: minTo(validFrom, rangeSizeLimits, disableWeekends),
            maxDate: maxTo(validFrom, rangeSizeLimits, disableWeekends),
          },
          disableWeekends,
        ),
      }
  }
}

/**
 * Shift the range to fit within the allowed dates. If the allowed date range is too short to fit the range, the result
 * will overflow past the `maxDate`.
 */
const shiftRangeToFit = <R extends InternalRangeSelection>(
  range: R,
  {disableWeekends = false, ...limits}: RangeSizeParams,
): R => {
  if (!range.to) return {...range, from: clampValid(range.from, limits, disableWeekends)}

  const size = differenceInDays(range.to, range.from)

  const validTo = clampValid(range.to, limits, disableWeekends)
  const newFrom = subDays(validTo, size)

  const validFrom = clampValid(newFrom, limits, disableWeekends)
  const newTo = addDays(validFrom, size)

  return {...range, from: validFrom, to: newTo}
}

export const fitRange = <R extends InternalRangeSelection>(range: R, params: RangeSizeParams): R => {
  const [forwardRange, newadjustableRangeEnd] = ensureForwardRange(range, params.adjustableRangeEnd ?? 'to')
  const newParams = {...params, adjustableRangeEnd: newadjustableRangeEnd}
  const adjustedRange = adjustRangeToSize(forwardRange, newParams)
  const shiftedRange = shiftRangeToFit(adjustedRange, newParams)
  return shiftedRange
}

export const rangeSide = (date: Date, range: InternalRangeSelection): RangeEnd | 'middle' | null => {
  if (isEqual(date, range.from)) return 'from'
  if (!range.to) return null
  if (isEqual(date, range.to)) return 'to'
  if (isAfter(date, range.from) && isBefore(date, range.to)) return 'middle'
  return null
}
