import {add, addDays, differenceInDays, isBefore, parseISO} from 'date-fns'

import type {
  Iteration,
  IterationConfiguration,
  IterationInterval,
  NewIteration,
} from '../api/columns/contracts/iteration'
import {
  adjustStartDate,
  compareAscending,
  durationToDays,
  formatFullDate,
  getAllIterationsForConfiguration,
  getLatestIteration,
  intervalDateRange,
  intervalEndDate,
  type IterationDuration,
  partitionAllIterations,
} from './iterations'
import {not_typesafe_nonNullAssertion} from './non-null-assertion'

type IterationSettings = {
  duration: number
  selectedStartDate: Date
}

/**
 * Create an array of iterations based on the configuration settings
 *
 * @param title the field title, to pre-populate the iteration names
 * @param settings configuration settings provided by the user
 * @param today the given date to start the iteration plan
 * @param count the number of iterations to create
 *
 * @returns an array of iteration values to store in the backend
 */
export function createInitialIterations(
  title: string,
  {duration, selectedStartDate}: IterationSettings,
  count: number,
): {iterations: Array<NewIteration>; completedIterations: Array<NewIteration>} {
  if (title.length <= 0) {
    throw new Error('A title is required to create iterations')
  }

  if (count < 0) {
    throw new Error('Count cannot be a negative number')
  }

  if (count === 0) {
    return {iterations: [], completedIterations: []}
  }

  let startDate = selectedStartDate
  const activeIterations = new Array<NewIteration>()
  const completedIterations = new Array<NewIteration>()

  for (let i = 1; i <= count; i++) {
    if (isBefore(addDays(startDate, duration), new Date())) {
      completedIterations.unshift({
        title: `${title} ${i}`,
        startDate: formatFullDate(startDate),
        duration,
      })
    } else {
      activeIterations.push({
        title: `${title} ${i}`,
        startDate: formatFullDate(startDate),
        duration,
      })
    }

    startDate = addDays(startDate, duration)
  }

  return {iterations: activeIterations, completedIterations}
}

const NonNumericTextRegex = /[A-Za-z ]*/

/**
 * Create a new iteration and return the updated configuration.
 * @param configuration The current iteration configuration.
 * @param fieldName Name of the iteration field.
 * @param startDate The start date for the iteration to create.
 * @param duration A duration override. If provided, the new iteration will have this
 * iteration instead of the configured one, and the returned configuration will have the
 * default duration updated to this duration.
 * @param overrideId Optionally explicitly set an ID. This can be used to set an in-memory
 * ID for use before the iteration exists server-side, but will need to be cleared to be
 * an empty string before actually sending the iteration data. If not provided, the ID
 * will be an empty string, which is what the server expects.
 */
export function appendNewIteration(
  configuration: IterationConfiguration,
  fieldName: string,
  startDate?: Date,
  duration?: IterationDuration,
  overrideId?: string,
): Partial<IterationConfiguration> {
  const {iterations: currentIterations, completedIterations} = configuration
  const durationDays = duration ? durationToDays(duration) : configuration.duration

  let nextStartDate: Date
  let newTitle: string

  const allIterations = getAllIterationsForConfiguration(configuration)
  const lastIteration = getLatestIteration(configuration)

  if (allIterations.length > 0 && lastIteration) {
    const latestStartDate = parseISO(lastIteration.startDate)

    nextStartDate = startDate ?? add(latestStartDate, {days: durationDays})

    const numericIdentifierText = lastIteration.title.replace(fieldName, '').replace(NonNumericTextRegex, '').trim()
    let numericIdentifier = parseInt(numericIdentifierText, 10)

    if (isNaN(numericIdentifier)) {
      // if unable to find a number in last iteration, use the number of planned iterations as a starting point
      numericIdentifier = allIterations.length
    }

    newTitle = `${fieldName} ${numericIdentifier + 1}`
  } else {
    const numericIdentifier = 1
    newTitle = `${fieldName} ${numericIdentifier}`
    nextStartDate = startDate ?? new Date()
  }

  const newIteration: Iteration = {
    id: overrideId ?? '',
    duration: durationDays,
    title: newTitle,
    titleHtml: newTitle,
    startDate: formatFullDate(nextStartDate),
  }

  const nextCurrentIterations = currentIterations.slice()
  const nextCompletedIterations = completedIterations.slice()
  if (isBefore(addDays(nextStartDate, durationDays), new Date())) {
    nextCompletedIterations.unshift(newIteration)
  } else {
    nextCurrentIterations.push(newIteration)
  }

  // Update the saved duration if one was provided
  return duration
    ? {
        iterations: nextCurrentIterations,
        completedIterations: nextCompletedIterations,
        duration: durationDays,
      }
    : {
        iterations: nextCurrentIterations,
        completedIterations: nextCompletedIterations,
      }
}

/**
 * Return a copy of the input array with the given iteration removed (matched by ID).
 */
function withoutIteration(iterations: Array<Iteration>, {id}: Pick<Iteration, 'id'>): Array<Iteration> {
  return iterations.filter(iteration => iteration.id !== id)
}

export function removeIteration(
  configuration: IterationConfiguration,
  iteration: Iteration,
): Partial<IterationConfiguration> {
  const isInCompleted = configuration.completedIterations.findIndex(x => x.id === iteration.id) !== -1
  if (isInCompleted) return {completedIterations: withoutIteration(configuration.completedIterations, iteration)}

  const isInActive = configuration.iterations.findIndex(x => x.id === iteration.id) !== -1
  if (isInActive) {
    return {iterations: withoutIteration(configuration.iterations, iteration)}
  }

  return {} // no changes; iteration wasn't found
}

/**
 * Calculate the amount that an iteration needs to be pushed back to no longer overlap with
 * another.
 * @param earlier The iteration that should come first after the pushback is performed.
 * This could actually start out as the later iteration if it was already pushed back a
 * significant amount.
 *
 * Note that this is iteration should already be in updated state, whereas the `later`
 * iteration is the one that has not yet been updated and still needs to be resolved.
 * @param later The iteration that should come last after the pushback is performed.
 * @return Positive (or 0) integer number of days to push the `later` iteration back. If 0,
 * no pushback needs be performed (the iterations don't overlap at all).
 */
function calculatePushback(earlier: Iteration, later: Iteration): number {
  const earlierEndDate = intervalDateRange(earlier).endDate
  const laterStartDate = parseISO(later.startDate)
  // If the start date of the later iteration falls on or before the end date of the earlier
  // iteration, then they are overlapping. In that case the difference will be 0 or positive.
  // If those days are equal, the difference is 0, but the overlap is 1 day, so we need to
  // always add 1.
  // If the start of the later iteration falls after the end of the early iteration, then
  // the difference will be negative. But in that case we don't want to push anything so
  // we return 0.
  return Math.max(differenceInDays(earlierEndDate, laterStartDate) + 1, 0)
}

/**
 * Update an iteration and cascade the changes to other iterations. Exact behavior depends
 * on arguments:
 * @param pullBackFollowing If this iteration's end date is pulled back, how should following
 * iterations be affected?
 *  - If `true`, all following iterations and breaks will be pulled back by the pullback
 *    amount. This is used when editing breaks.
 *  - If `false`, all following iterations and breaks would not be affected (so a new break
 *    would be created after this iteration). This is the default behavior.
 * @param shrinkBreaksWhenPushing If this iteration's end date is pushed forward (later than
 * before), following iterations will be pushed back to remove overlaps. Breaks between those
 * following iterations can either be preserved (`false`) or shrunk as needed (`true`).
 */
function cascadingUpdate(
  configuration: IterationConfiguration,
  updatedIteration: Iteration,
  pullBackFollowing: boolean,
  shrinkBreaksWhenPushing: boolean,
) {
  const all = getAllIterationsForConfiguration(configuration).sort(compareAscending)

  // We only need to recalculate the iterations after the changed one because we don't
  // allow users to change the start date of an iteration to overlap the previous one.
  const replaceIndex = all.findIndex(({id}) => id === updatedIteration.id)
  if (replaceIndex === -1) return {}

  const endDateChange = differenceInDays(
    intervalEndDate(updatedIteration),
    intervalEndDate(not_typesafe_nonNullAssertion(all[replaceIndex])),
  )

  /** The amount all following iterations should be adjusted by. Positive for later, negative for earlier. */
  const universalAdjustment =
    (endDateChange < 0 && pullBackFollowing) || (endDateChange > 0 && !shrinkBreaksWhenPushing) ? endDateChange : 0

  const [before, after] = [all.slice(0, replaceIndex), all.slice(replaceIndex + 1)]

  const updated = [...before, updatedIteration]
  for (const current of after) {
    const previous = not_typesafe_nonNullAssertion(updated.at(-1))

    // If we are shrinking breaks when pushing, we have to calculate on a per-iteration basis
    // rather than using a universal value.
    const adjustment =
      universalAdjustment === 0 && shrinkBreaksWhenPushing ? calculatePushback(previous, current) : universalAdjustment
    updated.push(adjustment !== 0 ? adjustStartDate(current, adjustment) : current)
  }

  return partitionAllIterations(updated)
}

/**
 * Replace the iteration with the matching ID and then recalculate all other iterations to
 * ensure they don't overlap. If no iteration is found with a matching ID, no change is
 * made.
 * @param pullBackFollowing If this iteration's end date is pulled back, how should following
 * iterations be affected?
 *  - If `true`, all following iterations and breaks will be pulled back by the pullback
 *    amount. This is used when editing breaks.
 *  - If `false`, all following iterations and breaks would not be affected (so a new break
 *    would be created after this iteration). This is the default behavior.
 */
export function updateIteration(
  configuration: IterationConfiguration,
  updatedIteration: Iteration,
): Partial<IterationConfiguration> {
  return cascadingUpdate(configuration, updatedIteration, false, true)
}

/**
 * Adjust a break by updating the adjacent iterations. Break changes cascade slightly
 * differently from iteration changes. If the `nextIteration` is brought earlier in time
 * (for example if the break is deleted), all following iterations are also adjusted by
 * the same amount.
 *
 * The `previousIteration` and `nextIteration` are used to locate the break in the configuration.
 */
export function updateBreak(
  configuration: IterationConfiguration,
  previousIteration: Iteration,
  nextIteration: Iteration,
  updatedBreakInterval: IterationInterval,
): Partial<IterationConfiguration> {
  const updatedPreviousIteration = {
    ...previousIteration,
    duration: differenceInDays(parseISO(updatedBreakInterval.startDate), parseISO(previousIteration.startDate)),
  }
  // When adjusting the previous iteration, we want to increase this break if the iteration
  // end date was pulled back, and shrink this break if the iteration end date was pushed
  // forward
  const withPreviousChange = {
    ...configuration,
    ...cascadingUpdate(configuration, updatedPreviousIteration, false, true),
  }

  const updatedNextIteration = {
    ...nextIteration,
    startDate: formatFullDate(addDays(intervalEndDate(updatedBreakInterval), 1)),
  }
  // When adjusting the next iteration, we want to maintain all following breaks if the
  // iteration was pushed forward, and we want to pull all following items backwards if the
  // iteration was pulled back
  return cascadingUpdate(withPreviousChange, updatedNextIteration, true, false)
}
