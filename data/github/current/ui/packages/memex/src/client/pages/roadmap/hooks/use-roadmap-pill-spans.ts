import {addHours, differenceInCalendarDays, isAfter} from 'date-fns'
import {useCallback, useMemo} from 'react'

import {RoadmapDateFieldNone} from '../../../api/view/contracts'
import {assertNever} from '../../../helpers/assert-never'
import type {RoadmapColumn, TimeSpan} from '../../../helpers/roadmap-helpers'
import {useRoadmapSettings} from '../../../hooks/use-roadmap-settings'
import {isDateColumnModel, isIterationColumnModel} from '../../../models/column-model/guards'
import {getSortedDates} from '../date-utils'
import {useRoadmapGetTimeSpan, useRoadmapView} from '../roadmap-view-provider'

export type RoadmapDragAndDropOperations = 'allowed-drag-update' | 'allowed-drag-expand'
const roadmapDndOperations = new Set(['move', 'expand-leading', 'expand-trailing'] as const)
export type RoadmapDndOperation = SetOptions<typeof roadmapDndOperations>

type XSpan = {startX: number; endX: number}

// Uses addHours instead of addDays to avoid DST issues and not keeping the time to midnight
// e.g. date = new Date('2022-11-06') => "Sun Nov 06 2022 19:00:00 GMT-0500 (Eastern Standard Time)"
//      addDays(date, -1) => "Sat Nov 05 2022 19:00:00 GMT-0400 (Eastern Daylight Time)"
//      addHours(new Date('2022-11-06'), -24) => "Sat Nov 05 2022 20:00:00 GMT-0400 (Eastern Daylight Time)"
export const adjustDate = (date: Date, offset: number) => {
  return addHours(date, offset * 24)
}

export const isIteration = (column: RoadmapColumn) => {
  return column !== RoadmapDateFieldNone && isIterationColumnModel(column)
}

const isDate = (column: RoadmapColumn) => {
  return column !== RoadmapDateFieldNone && isDateColumnModel(column)
}

export function useRoadmapPillSpans() {
  const getTimeSpan = useRoadmapGetTimeSpan()
  const {getX} = useRoadmapView()
  const {dateFields} = useRoadmapSettings()

  const startColumn = dateFields[0] ?? RoadmapDateFieldNone
  const endColumn = dateFields[1] ?? RoadmapDateFieldNone

  /**
   * Get the next iteration time span based on the next date
   * @param adjustedTimeSpan the original time span
   * @param operation the drag and drop operation being performed
   * @param deltaX the delta between the start and current x position
   * @param swapHandles wether the drag handles have been swapped
   * @returns The next valid time span based on dragging a roadmap pill defined by one or more iteration column.
   */
  const getGhostSpan = useCallback(
    (adjustedTimeSpan: TimeSpan, operation: RoadmapDndOperation, deltaX: number, swapHandles = false): XSpan => {
      const [startDate, endDate] = getSortedDates([adjustedTimeSpan.start, adjustedTimeSpan.end])
      if (!(startDate && endDate)) return {startX: 0, endX: 0}
      const ghostSpan = {
        startX: getX(startDate),
        endX: getX(adjustDate(endDate, 1)),
      }

      switch (operation) {
        case 'move': {
          ghostSpan.startX += deltaX
          ghostSpan.endX += deltaX
          break
        }
        case 'expand-leading': {
          if (swapHandles) {
            ghostSpan.startX = getX(endDate)
            ghostSpan.endX = getX(startDate)
            ghostSpan.endX += deltaX
          } else {
            ghostSpan.startX += deltaX
          }
          break
        }
        case 'expand-trailing': {
          if (swapHandles) {
            ghostSpan.startX = getX(adjustDate(endDate, 1))
            ghostSpan.endX = getX(adjustDate(startDate, 1))
            ghostSpan.startX += deltaX
          } else {
            ghostSpan.endX += deltaX
          }
          break
        }
      }

      return ghostSpan
    },
    [getX],
  )

  /**
   * Get the next iteration time span based on the next date
   * @param timeSpan the original time span
   * @param operation the drag and drop operation being performed
   * @param nextDate the next date to be used to calculate the next iteration
   * @returns The next valid time span based on dragging a roadmap pill defined by one or more iteration column.
   */
  const getNextTimeSpanWithIterations = useCallback(
    (timeSpan: TimeSpan, operation: RoadmapDndOperation, nextDate: Date) => {
      const nextTimeSpan = getTimeSpan(nextDate)

      // This method is a series of if/else statements to determine the nextTimeSpan while dragging,
      // based on the configured start/end field types (date/iteration/none).

      // Start: Iteration, End: Iteration
      // or Start: Iteration, End: None
      // or Start: None, End: Iteration
      //   Combinations with None show the full iteration placeholder on dragging, but save only the start/end
      if (
        (isIteration(startColumn) && isIteration(endColumn) && timeSpan.startIteration === timeSpan.endIteration) ||
        (isIteration(startColumn) && endColumn === RoadmapDateFieldNone) ||
        (startColumn === RoadmapDateFieldNone && isIteration(endColumn))
      ) {
        /* We can only move in these cases, so nextTimeSpan requires no further adjustment */
      }

      // Start: Iteration, End: Date
      else if (isIteration(startColumn) && isDate(endColumn)) {
        switch (operation) {
          case 'move': {
            if (timeSpan.start && timeSpan.end) {
              const dayDiff = differenceInCalendarDays(timeSpan.end, timeSpan.start)
              nextTimeSpan.end = nextTimeSpan.start && adjustDate(nextTimeSpan.start, dayDiff)
            } else {
              if (timeSpan.start) {
                nextTimeSpan.end = undefined
                nextTimeSpan.endIteration = undefined
              } else {
                nextTimeSpan.start = undefined
                nextTimeSpan.startIteration = undefined
              }
            }
            break
          }
          case 'expand-leading': {
            if (timeSpan.end) {
              nextTimeSpan.end = timeSpan.end
              nextTimeSpan.endIteration = timeSpan.endIteration
            }
            break
          }
          case 'expand-trailing': {
            if (timeSpan.start) {
              nextTimeSpan.start = timeSpan.start
              nextTimeSpan.startIteration = timeSpan.startIteration
            }
            break
          }
          default: {
            assertNever(operation)
          }
        }
      }

      // Start: Date, End: Iteration
      else if (isDate(startColumn) && isIteration(endColumn)) {
        switch (operation) {
          case 'move': {
            if (timeSpan.start && timeSpan.end) {
              const dayDiff = differenceInCalendarDays(timeSpan.end, timeSpan.start)
              nextTimeSpan.start = nextTimeSpan.end && adjustDate(nextTimeSpan.end, -dayDiff)
            } else {
              if (timeSpan.start) {
                nextTimeSpan.end = undefined
                nextTimeSpan.endIteration = undefined
              } else {
                nextTimeSpan.start = undefined
                nextTimeSpan.startIteration = undefined
              }
            }
            break
          }
          case 'expand-leading': {
            if (timeSpan.end) {
              nextTimeSpan.end = timeSpan.end
              nextTimeSpan.endIteration = timeSpan.endIteration
            }
            break
          }
          case 'expand-trailing': {
            if (timeSpan.start) {
              nextTimeSpan.start = timeSpan.start
              nextTimeSpan.startIteration = timeSpan.startIteration
            }
            break
          }
          default: {
            assertNever(operation)
          }
        }
      }

      // Start: Iteration1, End: Iteration2 (different iteration columns)
      else {
        switch (operation) {
          case 'move': {
            if (timeSpan.startIteration && timeSpan.endIteration && timeSpan.start && timeSpan.end) {
              // If iteration ranges aren't consistent, then moving may also resize to snap to iteration endpoints.
              // Determine changes in the start iteration, and apply to the end iteration based on the initial timeSpan length.
              const dayDiff = differenceInCalendarDays(timeSpan.end, timeSpan.start)
              const endTimeSpan = nextTimeSpan.start && getTimeSpan(adjustDate(nextTimeSpan.start, dayDiff))
              nextTimeSpan.end = endTimeSpan?.end
              nextTimeSpan.endIteration = endTimeSpan?.endIteration
            } else {
              if (timeSpan.start) {
                nextTimeSpan.end = undefined
                nextTimeSpan.endIteration = undefined
              } else {
                nextTimeSpan.start = undefined
                nextTimeSpan.startIteration = undefined
              }
            }
            break
          }
          case 'expand-leading': {
            if (timeSpan.end) {
              nextTimeSpan.end = timeSpan.end
              nextTimeSpan.endIteration = timeSpan.endIteration
            }
            break
          }
          case 'expand-trailing': {
            if (timeSpan.start) {
              nextTimeSpan.start = timeSpan.start
              nextTimeSpan.startIteration = timeSpan.startIteration
            }
            break
          }
          default: {
            assertNever(operation)
          }
        }
      }

      // When iterations are used, do not allow dragging to cross one end past the other.
      // It's worse than crossing the streams in Ghostbusters.
      // Seriously, reversed handles and switching to different valid endpoints with iterations makes the UX terrible.
      // Existing reversed pills with iterations can be corrected by dragging to move first.
      if (nextTimeSpan.start && nextTimeSpan.end && isAfter(nextTimeSpan.start, nextTimeSpan.end)) {
        return
      }

      return nextTimeSpan
    },
    [endColumn, getTimeSpan, startColumn],
  )

  /**
   * Get the next dates after applying the offset
   * @param timeSpan the original time span
   * @param operation the drag and drop operation being performed
   * @param daysOffset the number of days to offset the dates by
   * @returns The next start/end dates
   */
  const getNextTimeSpanWithDates = useCallback(
    (timeSpan: TimeSpan, operation: RoadmapDndOperation, daysOffset: number) => {
      const {start: startDate, end: endDate} = timeSpan
      let nextStartDate = startDate
      let nextEndDate = endDate

      switch (operation) {
        case 'move': {
          nextStartDate = startDate ? adjustDate(startDate, daysOffset) : undefined
          nextEndDate = endDate ? adjustDate(endDate, daysOffset) : undefined
          break
        }
        case 'expand-leading': {
          if (startDate) {
            nextStartDate = adjustDate(startDate, daysOffset)
            if (!endDate) {
              // if no trailing date is set, set the end date to be the leading date
              nextEndDate = startDate
            }
          } else if (endDate) {
            // if no leading date is set, set the start date to be the trailing date
            nextStartDate = adjustDate(endDate, daysOffset)
          }
          break
        }
        case 'expand-trailing': {
          if (endDate) {
            nextEndDate = adjustDate(endDate, daysOffset)
            if (!startDate) {
              // if no leading date is set, set the start date to be the trailing date
              nextStartDate = endDate
            }
          } else if (startDate) {
            // if no trailing date is set, set the end date to be the leading date
            nextEndDate = adjustDate(startDate, daysOffset)
          }
          break
        }
      }

      const swapHandles = !!(nextStartDate && nextEndDate && isAfter(nextStartDate, nextEndDate))

      // Since start date represent from the start of the day, while end date
      // represent the end of the day, we need to adjust the day by either
      // +/- 1 to render correctly if the dates are swapped
      if (swapHandles) {
        if (operation === 'expand-leading' && nextStartDate) {
          nextStartDate = adjustDate(nextStartDate, -1)
        }

        if (operation === 'expand-trailing' && nextEndDate) {
          nextEndDate = adjustDate(nextEndDate, 1)
        }

        ;[nextStartDate, nextEndDate] = [nextEndDate, nextStartDate]
      }

      const nextTimeSpan = {start: nextStartDate, end: nextEndDate}

      return {
        swapHandles,
        nextTimeSpan,
      }
    },
    [],
  )

  return useMemo(
    () => ({
      getNextTimeSpanWithDates,
      getNextTimeSpanWithIterations,
      getGhostSpan,
    }),
    [getNextTimeSpanWithDates, getNextTimeSpanWithIterations, getGhostSpan],
  )
}
