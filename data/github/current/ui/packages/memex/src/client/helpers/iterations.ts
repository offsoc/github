import type {RangeSelection} from '@github-ui/date-picker'
import {
  addDays,
  addHours,
  differenceInDays,
  format,
  isAfter,
  isBefore,
  isSameYear,
  isValid,
  parseISO,
  subDays,
} from 'date-fns'

import {partition} from '../../utils/partition'
import type {Iteration, IterationConfiguration, IterationInterval} from '../api/columns/contracts/iteration'
import {MemexColumnDataType} from '../api/columns/contracts/memex-column'
import type {IterationColumnModel} from '../models/column-model/custom/iteration'
import type {Resources} from '../strings'
import {parseIsoDateStringToDate} from './parsing'

type IterationBreak = IterationInterval

/** The last day of the given interval. */
export function intervalEndDate(interval: IterationInterval): Date {
  return addDuration(interval.startDate, interval.duration)
}

/**
 Adds a duration to a date. For an interval, both the start and end
 dates are inclusive, which is why we subtract 1 in this computation
*/
export function addDuration(date: string | Date, duration: number): Date {
  return addDays(date instanceof Date ? date : parseISO(date), duration - 1)
}

/** The day after the last day of the given iteration. */
export function dayAfterIntervalEnds(interval: IterationInterval): Date {
  return addDays(intervalEndDate(interval), 1)
}

/**
 * Determine if the iteration contains the given date period
 *
 * @param now a specific time to check
 * @param iteration the iteration to check
 *
 * @returns `true` if the iteration contains this given date, or false otherwise
 */
export function isCurrentIteration(now: Date, iteration: Iteration) {
  const startDate = parseISO(iteration.startDate)
  const nowAsDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return isAfter(nowAsDateOnly, subDays(startDate, 1)) && isBefore(nowAsDateOnly, dayAfterIntervalEnds(iteration))
}

/** Format a given date using the short format expected in the user interface */
export function formatShortDate(date: Date) {
  const fmtString = isSameYear(date, new Date()) ? 'MMM dd' : 'MMM dd, yyyy'
  return format(date, fmtString)
}

/**
 * Convert the number to a string, prefixed with zeros to ensure it is a minimum
 * length
 *
 * @param number number to format
 * @param length minimum length of formatted string
 */
function prefixZeros(number: number, length: number): string {
  return number.toString().padStart(length, '0')
}

/** Format a given date for use with the backend API */
export function formatFullDate(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year.toString()}-${prefixZeros(month, 2)}-${prefixZeros(day, 2)}`
}
/**
 * Determines the date range in the format needed by the datepicker
 * for either an iteration or an iteration break
 * @param interval either an Iteration or an IterationBreak
 * @returns
 */
export function intervalDateRange(interval: IterationInterval) {
  const parsedStartDate = parseISO(interval.startDate)
  const startDate = isValid(parsedStartDate) ? parsedStartDate : new Date()
  return {
    startDate,
    endDate: addDuration(startDate, interval.duration),
  }
}
/**
 * Determines the date range in the format needed by the roadmap view
 * In other cases, we build a date from the start date and strip the time/timezone for display:
 * e.g. 2022-11-07 => Mon Nov 07 2022 00:00:00 GMT-0600 => Nov 07
 *
 * For roadmap view, we need to preserve time/timezone for mapping UTC dates
 * 2022-11-07 => 2022-11-07T00:00:00Z => Mon Nov 07 2022 19:00:00 GMT-0500:
 * @param interval either an Iteration or an IterationBreak
 * @returns
 */
export function intervalDateRangeFromUTC(interval: IterationInterval) {
  const startDateWithUTCMidnight = `${interval.startDate}T00:00:00Z`
  // If the date is invalid, default to today so that we can still render the UI at least.
  // The server should validate the date and return an error if it is invalid, but we can
  // try to be resilient against any potential invalid data.
  const d1 = parseIsoDateStringToDate(startDateWithUTCMidnight) ?? new Date()
  // Adding hours instead of days to avoid DST changes, keeping dates at midnight UTC.
  const d2 = addHours(parseISO(startDateWithUTCMidnight), (interval.duration - 1) * 24)

  return {
    startDate: d1,
    endDate: d2,
  }
}

/** Display the date range for the iteration using the short date format */
export function intervalDatesDescription(interval: IterationInterval | undefined) {
  if (!interval || !interval.startDate) return ''
  const {startDate, endDate} = intervalDateRange(interval)
  return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`
}

/** Display the iteration duration with the appropriate units */
export function intervalDurationDescription(interval: IterationInterval | undefined): string {
  if (!interval) {
    return ''
  }
  return formatDuration(daysToDuration(interval.duration))
}

/**
 * Return all iterations in a custom field.
 *
 * The order of items from this function is based on the order of each list:
 *
 *  - active iterations
 *  - completed iterations
 */
export function getAllIterations(column: IterationColumnModel) {
  return getAllIterationsForConfiguration(column.settings.configuration)
}

export function getAllIterationsForConfiguration(configuration: IterationConfiguration) {
  const allIterations = []

  const {iterations, completedIterations} = configuration

  if (iterations.length) {
    allIterations.push(...iterations)
  }

  if (completedIterations.length) {
    allIterations.push(...completedIterations)
  }

  return allIterations
}

/**
 * Checks if the end date of an interation is before the current date which means the iteration is completed
 */
function isCompletedIteration({startDate, duration}: Iteration) {
  return isBefore(addDays(parseISO(startDate), duration), new Date())
}

/**
 * Given an unsorted array of iterations, split and sort them into completed and active iterations that can be persisted
 */
export function partitionAllIterations(
  allIterations: Array<Iteration>,
): Pick<IterationConfiguration, 'iterations' | 'completedIterations'> {
  const sortedIterations = [...allIterations].sort(compareAscending)
  const [completed, active] = partition(sortedIterations, isCompletedIteration)
  return {
    completedIterations: completed.reverse(),
    iterations: active,
  }
}

/**
 * Comparer function for iterations to sort in descending order (later
 * iterations before earlier iterations)
 */
export function compareDescending(a: Iteration, b: Iteration) {
  return -compareAscending(a, b)
}

/**
 * Comparer function for iterations to sort in ascending order (earlier
 * iterations before later iterations)
 */
export function compareAscending(a: Iteration, b: Iteration) {
  if (a.startDate < b.startDate) return -1
  if (a.startDate > b.startDate) return 1
  return 0
}

/**
 * Locate the latest iteration that exists for an iteration setup
 *
 * @param configuration the iteration configuration object
 * @param exclude used for excluding an iteration from calculating the latest iteration. Used for when an iteration has been removed.
 *
 * @returns null if no iterations found, otherwise the active or completed
 * iteration with the latest start date
 */
export function getLatestIteration(configuration: IterationConfiguration): Iteration | null {
  const iterations = getAllIterationsForConfiguration(configuration)

  return iterations.length === 0 ? null : iterations.sort(compareDescending)[0] ?? null
}

/**
 * Get the default start date for creating a new iteration. This is the day after the last
 * iteration, or today if no iterations exist.
 * @param configuration the iteration configuration object
 */
export function getDefaultNewIterationStartDate(configuration: IterationConfiguration): Date {
  const latestIteration = getLatestIteration(configuration)
  const minDate = latestIteration ? parseISO(latestIteration.startDate) : new Date()
  return addDays(minDate, latestIteration?.duration ?? 0)
}

export function getCustomIterationToken(value: string): IterationToken | null {
  return Object.values(IterationToken).includes(value as IterationToken) ? (value as IterationToken) : null
}

function getCurrentIteration(column: IterationColumnModel): Iteration | null {
  if (column.dataType !== MemexColumnDataType.Iteration) {
    return null
  }

  // We need to loop over all iterations when attempting to find the current one because there is a chance
  // that the current iteration is actually in the completedIterations array. This can happen at the end
  // of an iteration depending on the time zone of the user viewing the page. The server controls whether or
  // not the iteration is completed, but we use the client's time zone to determine if the iteration is
  // still current.
  // See https://github.com/github/memex/issues/16604#issuecomment-1789949815 for more details.
  return getAllIterations(column).find(iteration => isCurrentIteration(new Date(), iteration)) ?? null
}

function getCustomIteration(column: IterationColumnModel, which: IterationToken): Iteration | null {
  if (column.dataType !== MemexColumnDataType.Iteration) {
    return null
  }

  const currentIteration = getCurrentIteration(column)
  if (which === IterationToken.Current) {
    return currentIteration
  }

  const allIterations = getAllIterations(column)
  const {completedIterations, iterations} = partitionAllIterations(allIterations)

  switch (which) {
    case IterationToken.Previous:
      // Completed iterations are sorted descending, so the first one is the last completed one
      return completedIterations.length > 0 ? completedIterations[0] ?? null : null
    case IterationToken.Next: {
      // If there is no current iteration (currently a break), return the first iteration
      const iterationIdx = currentIteration ? 1 : 0
      return iterations.length > iterationIdx ? iterations[iterationIdx] ?? null : null
    }
    default:
      return null
  }
}

export function getCustomIterationFromToken(value: string, column: IterationColumnModel): Iteration | null {
  const token = getCustomIterationToken(value)

  return token ? getCustomIteration(column, token) : null
}

export const IterationToken = {
  Current: '@current',
  Next: '@next',
  Previous: '@previous',
} as const
export type IterationToken = ObjectValues<typeof IterationToken>

export type IterationLabelType = keyof (typeof Resources)['iterationLabel']

export function getIterationLabelType(iteration: Iteration, isCompleted?: boolean): IterationLabelType {
  if (isCompleted ?? isCompletedIteration(iteration)) {
    return 'completed'
  }

  if (isCurrentIteration(new Date(), iteration)) {
    return 'current'
  }

  return 'planned'
}

/**
 * Get the iteration range as a `RangeSelection`. If the iteration start date is invalid,
 * returns `undefined`.
 */
export function intervalAsRangeSelection(interval: IterationInterval): RangeSelection {
  const {startDate, endDate} = intervalDateRange(interval)
  return {from: startDate, to: endDate}
}

export function rangeSelectionAsInterval(range: RangeSelection): IterationInterval {
  // Add 1 because the duration field is inclusive
  const duration = differenceInDays(range.to, range.from) + 1
  return {startDate: formatFullDate(range.from), duration}
}

/**
 * If there is a gap between two consecutive iterations, we would like to render that
 * gap as a break from the first iteration's end date + 1 to the next iteration's start date - 1
 *
 * If there is no gap between the iterations, this function willl return undefined
 *
 * @param previousIteration: the iteration that precedes this "break"
 * @param currentIteration: the iteration that comes immediately after this "break"
 * @returns the "break" created between these two iterations
 */
export function buildBreak(
  previousIteration: Iteration | undefined,
  currentIteration: Iteration | undefined,
): IterationBreak | undefined {
  if (!previousIteration || !currentIteration || !doesBreakExist(previousIteration, currentIteration)) {
    return undefined
  }
  return {
    startDate: formatFullDate(dayAfterIntervalEnds(previousIteration)),
    duration: differenceInDays(parseISO(currentIteration.startDate), dayAfterIntervalEnds(previousIteration)),
  }
}

/**
 * Given two consecutive iteration, this function returns whether there is a "gap" between them
 * and whether a break should be rendered
 * @param previousIteration
 * @param currentIteration
 * @returns
 */
export function doesBreakExist(previousIteration: Iteration, currentIteration: Iteration): boolean {
  return (
    differenceInDays(parseISO(currentIteration.startDate), parseISO(previousIteration.startDate)) >
    previousIteration.duration
  )
}

/**
 * Adjust the iteration's start date by `days`, maintaining the same duration.
 *
 * A positive value for `days` moves the iteration forward in time,
 * A negative value for `days` moves the iteration backwards in time
 *
 * Returns a copy of the iteration.
 */
export function adjustStartDate(iteration: Iteration, days: number): Iteration {
  return {
    ...iteration,
    startDate: days === 0 ? iteration.startDate : formatFullDate(addDays(parseISO(iteration.startDate), days)),
  }
}

/**
 * Adjust the iteration's duration by `days` keeping the start date the same.
 *
 * A positive value for `days` lengthens the iteration
 * A negative value for `days` shortens the iteration
 * @param iteration
 * @param days
 * @returns
 */
export function adjustDuration(iteration: Iteration, days: number): Iteration {
  return {
    ...iteration,
    duration: iteration.duration + days,
  }
}

export type IterationDurationUnits = 'weeks' | 'days'

const singularUnits: Record<IterationDurationUnits, string> = {
  weeks: 'week',
  days: 'day',
}

export interface IterationDuration {
  quantity: number
  units: IterationDurationUnits
}

export function daysToDuration(days: number): IterationDuration {
  const units = days % 7 === 0 ? 'weeks' : 'days'
  const quantity = units === 'weeks' ? days / 7 : days
  return {quantity, units}
}

/**
 * Convert a duration to the number of days. For now, the backend only accepts a
 * quantity in days, so we have to convert and potentially lose the units information.
 */
export function durationToDays({units, quantity}: IterationDuration): number {
  const factor = units === 'weeks' ? 7 : 1
  return quantity * factor
}

/** Get the units to display (handling singular values) for the given duration. */
export function getDisplayUnits(quantity: number, baseUnits: IterationDurationUnits) {
  return quantity === 1 ? singularUnits[baseUnits] : baseUnits
}

/** Convert duration to readable string. */
function formatDuration({quantity, units}: IterationDuration): string {
  return `${quantity} ${getDisplayUnits(quantity, units)}`
}

/** Default duration of new iteration fields. */
export const defaultIterationDuration: IterationDuration = {
  quantity: 2,
  units: 'weeks',
}
