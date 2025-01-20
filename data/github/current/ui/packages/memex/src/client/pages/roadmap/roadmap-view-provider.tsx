import {useDebounce} from '@github-ui/use-debounce'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {addMonths, differenceInDays} from 'date-fns'
import {
  memo,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import invariant from 'tiny-invariant'

import type {Iteration} from '../../api/columns/contracts/iteration'
import {RoadmapDateFieldNone, type RoadmapZoomLevel} from '../../api/view/contracts'
import {RoadmapDateFieldsMenuContext} from '../../features/roadmap/roadmap-date-fields-menu'
import {getAllIterations, intervalDateRangeFromUTC} from '../../helpers/iterations'
import type {TimeSpan} from '../../helpers/roadmap-helpers'
import {
  useRoadmapSessionSettings,
  useRoadmapSettings,
  useRoadmapTableWidth,
  useRoadmapZoomLevel,
} from '../../hooks/use-roadmap-settings'
import type {ColumnModel} from '../../models/column-model'
import {isIterationColumnModel} from '../../models/column-model/guards'
import {useAllColumns} from '../../state-providers/columns/use-all-columns'
import {startOfDayUtc} from './date-utils'
import {
  RoadmapContext,
  RoadmapGetTimeSpanContext,
  RoadmapGetViewportContext,
  RoadmapNavigationContext,
  RoadmapNavigationIsScrollingLocked,
  RoadmapNavigationSetIsScrollingLocked,
  type Viewport,
} from './roadmap-contexts'

const SCROLL_THROTTLE_MS = 500
const PAGE_SCROLL_OVERLAP = 50

type ZoomConfig = {columnWidth: number; timeRangeMonths: number}
const zoomConfigs: {[key in RoadmapZoomLevel]: ZoomConfig} = {
  month: {columnWidth: 48, timeRangeMonths: 6},
  quarter: {columnWidth: 16, timeRangeMonths: 18},
  year: {columnWidth: 4, timeRangeMonths: 72},
}

type ShiftTimeRangeArgs = {
  date: Date
  direction: 'next' | 'prev' | 'none'
  zoomLevel?: RoadmapZoomLevel
  completed?: boolean
}

export const RoadmapViewProvider = memo(function RoadmapViewProvider({children}: {children: ReactNode}) {
  // Only "today" reflects the start of day in local time, and will vary depending on the viewer's timezone.
  // All other item dates are consistent across timezones.
  const today = useMemo(() => {
    return startOfDayUtc(new Date())
  }, [])
  const tableWidth = useRoadmapTableWidth()
  const zoomLevel = useRoadmapZoomLevel()
  const {disableDateFieldsPopover} = useRoadmapSessionSettings()

  // Mirror local zoom state from layout settings. This allows us more fine-grained control shifting the layout when the zoom is changed.
  const [localZoomState, setLocalZoomState] = useState<RoadmapZoomLevel>(zoomLevel)
  const columnWidth = useMemo(() => {
    return zoomConfigs[localZoomState].columnWidth
  }, [localZoomState])

  const [{timeRangeStart, timeRangeEnd}, setTimeRangeState] = useState({
    timeRangeStart: startOfDayUtc(addMonths(today, -zoomConfigs[zoomLevel].timeRangeMonths)),
    timeRangeEnd: startOfDayUtc(addMonths(today, zoomConfigs[zoomLevel].timeRangeMonths)),
  })

  const roadmapRef = useRef<HTMLDivElement | null>(null)
  const shiftTimeRangeArgs = useRef<ShiftTimeRangeArgs | null>(null)

  const totalDays = useMemo(
    () => Math.abs(differenceInDays(timeRangeEnd, timeRangeStart)),
    [timeRangeEnd, timeRangeStart],
  )

  const totalWidth = totalDays * columnWidth
  const startX = 0
  const endX = totalWidth

  const getX = useCallback(
    (date: Date) => {
      const timeRange = timeRangeEnd.getTime() - timeRangeStart.getTime()
      const time = date.getTime() - timeRangeStart.getTime()
      const x = startX + (time / timeRange) * (endX - startX)
      return x
    },
    [endX, startX, timeRangeEnd, timeRangeStart],
  )

  const getXFromClientX = useCallback((clientX: number) => {
    if (roadmapRef && roadmapRef.current) {
      const roadmapLeft = roadmapRef.current.getBoundingClientRect().left
      return roadmapRef.current.scrollLeft + clientX - roadmapLeft
    }
    return 0
  }, [])

  const getDateFromX = useCallback(
    (xOffset: number) => {
      const startTime = timeRangeStart.getTime()
      const timeRange = timeRangeEnd.getTime() - startTime
      const utcTime = xOffset * (timeRange / totalWidth) + startTime
      const utcStartOfDay = new Date(new Date(utcTime).setUTCHours(0, 0, 0, 0))
      return utcStartOfDay
    },
    [timeRangeEnd, timeRangeStart, totalWidth],
  )

  const getDateFromClientX = useCallback(
    (clientX: number) => {
      if (roadmapRef && roadmapRef.current) {
        const roadmapLeft = roadmapRef.current.getBoundingClientRect().left
        return getDateFromX(roadmapRef.current.scrollLeft + clientX - roadmapLeft)
      }
    },
    [getDateFromX],
  )

  const clientWidth = useSyncExternalStore(
    useCallback(notify => {
      if (!roadmapRef.current) return () => undefined
      const observer = new ResizeObserver(notify)
      observer.observe(roadmapRef.current)
      return () => {
        observer.disconnect()
      }
    }, []),
    useCallback(() => {
      return roadmapRef.current?.clientWidth ?? 1
    }, [roadmapRef]),
  )

  const getViewport = useCallback((): Viewport => {
    if (roadmapRef && roadmapRef.current) {
      const visibleLeft = roadmapRef.current.scrollLeft + tableWidth
      return {left: visibleLeft, right: visibleLeft + clientWidth - tableWidth}
    }
    return {left: 0, right: 0}
  }, [tableWidth, clientWidth])

  const shiftTimeRangeDebounced = useDebounce((args: ShiftTimeRangeArgs) => {
    // Debounce since scroll events can fire successively when the user continues to hold the mouse button down when scrolling to the browser's edge.
    shiftTimeRange(args)
  }, SCROLL_THROTTLE_MS)

  const shiftTimeRange = useCallback(
    // This method shifts immediately if any previous roadmap shift has completed.
    (args: ShiftTimeRangeArgs) => {
      const lastShift = shiftTimeRangeArgs.current
      if (!lastShift || lastShift.completed) {
        shiftTimeRangeArgs.current = args
        const zoom = args.zoomLevel || localZoomState
        setTimeRangeState({
          timeRangeStart: startOfDayUtc(addMonths(args.date, -zoomConfigs[zoom].timeRangeMonths)),
          timeRangeEnd: startOfDayUtc(addMonths(args.date, zoomConfigs[zoom].timeRangeMonths)),
        })
      }
    },
    [localZoomState],
  )

  const shiftToNextRange = useCallback(() => {
    shiftTimeRangeDebounced({date: timeRangeEnd, direction: 'next'})
  }, [shiftTimeRangeDebounced, timeRangeEnd])

  const shiftToPrevRange = useCallback(() => {
    shiftTimeRangeDebounced({date: timeRangeStart, direction: 'prev'})
  }, [shiftTimeRangeDebounced, timeRangeStart])

  const getRoadmapTargetOffset = useCallback(() => {
    // Focus point is where to center the date within the visible space (after the table width),
    // e.g. 1/3 means the date will be placed at exactly the 1/3 point of the visible space.
    // focusPoint = 1 would place it at the right-hand side of the visible space, and focusPoint = 0
    // would place it at the left-hand side of the visible space.
    const focusPoint = 1 / 3

    // Using roadmapRef.current?.clientWidth here instead of clientWidth because the latter is not updated yet
    // when this method is first called for scrollToDate(today) on initial page load.
    const visiblePillAreaWidth = (roadmapRef.current?.clientWidth ?? window.innerWidth) - tableWidth

    return Math.floor(tableWidth + visiblePillAreaWidth * focusPoint - columnWidth / 2)
  }, [tableWidth, columnWidth])

  // Scroll once to center on the date. Shifts the roadmap range if the date is near or outside the timerange boundaries.
  const scrollToDate = useCallback(
    (date: Date, smooth = false) => {
      if (roadmapRef && roadmapRef.current) {
        const x = getX(date)
        const offset = getRoadmapTargetOffset()
        if (x - offset < 1) {
          shiftTimeRange({date, direction: 'prev'})
        } else if (x + offset > totalWidth - 1) {
          shiftTimeRange({date, direction: 'next'})
        } else {
          roadmapRef.current?.scrollTo({left: x - offset, behavior: smooth ? 'smooth' : 'auto'})
        }
      }
    },
    [getX, shiftTimeRange, getRoadmapTargetOffset, totalWidth],
  )

  const scrollToNextPage = useCallback(
    (smooth = false) => {
      if (roadmapRef && roadmapRef.current) {
        const currentX = roadmapRef.current.scrollLeft - tableWidth
        const newX = currentX + roadmapRef.current.offsetWidth - PAGE_SCROLL_OVERLAP
        roadmapRef.current?.scrollTo({left: newX, behavior: smooth ? 'smooth' : 'auto'})
      }
    },
    [tableWidth],
  )

  const scrollToPrevPage = useCallback(
    (smooth = false) => {
      if (roadmapRef && roadmapRef.current) {
        const currentX = roadmapRef.current.scrollLeft + tableWidth
        const newX = currentX - roadmapRef.current.offsetWidth + PAGE_SCROLL_OVERLAP
        roadmapRef.current?.scrollTo({left: newX, behavior: smooth ? 'smooth' : 'auto'})
      }
    },
    [tableWidth],
  )

  const [isDateConfigurationMenuOpen, setDateConfigurationMenuOpen] = useState(false)

  const setOpenDateConfigurationMenu = useCallback(
    (open: boolean) => {
      disableDateFieldsPopover()
      setDateConfigurationMenuOpen(open)
    },
    [disableDateFieldsPopover],
  )

  // Create and use a cache mapping all iterations with their corresponding date ranges.
  // This provides valid time spans for adding new items if the roadmap is configured to use iterations.
  type IterationWithDates = Iteration & {start: Date; end: Date}
  type IterationsMap = {[fieldId: string]: Array<IterationWithDates>}
  const {allColumns} = useAllColumns()
  const {dateFields} = useRoadmapSettings()

  const iterationDateMap: IterationsMap = useMemo(() => {
    const map = allColumns.reduce<IterationsMap>((acc, column) => {
      if (isIterationColumnModel(column)) {
        const iterations = getAllIterations(column)
        const iterationsWithDates = iterations.map(iteration => {
          const {startDate, duration} = iteration
          const interval = intervalDateRangeFromUTC({startDate, duration})
          return {
            ...iteration,
            start: interval.startDate,
            end: interval.endDate,
          }
        })
        acc[column.id] = iterationsWithDates
      }
      return acc
    }, {})
    return map
  }, [allColumns])

  const getIteration = useCallback(
    (column: ColumnModel, date: Date) => {
      const match = iterationDateMap[column.id]?.find(iteration => {
        return date >= iteration.start && date <= iteration.end
      })
      return match
    },
    [iterationDateMap],
  )

  // Get the appropriate time span when adding a new item to the roadmap, based on the configured date or iteration fields.
  // This may have an undefined start/end date if the date is outside the configured iteration range, if applicable.
  const getTimeSpan = useCallback(
    (date: Date): TimeSpan => {
      const startColumn = dateFields[0] ?? RoadmapDateFieldNone
      const endColumn = dateFields[1] ?? RoadmapDateFieldNone
      const result: TimeSpan = {start: date, end: date}

      if (startColumn !== RoadmapDateFieldNone && isIterationColumnModel(startColumn)) {
        const iteration = getIteration(startColumn, date)
        if (iteration) {
          result.start = iteration.start
          result.startIteration = iteration
          if (endColumn === RoadmapDateFieldNone) {
            // Include the full iteration as a tempoary placeholder, even if the start or end date is None
            result.end = iteration.end
            result.endIteration = iteration
          }
        } else {
          result.start = undefined
        }
      }

      if (endColumn !== RoadmapDateFieldNone && isIterationColumnModel(endColumn)) {
        const iteration = getIteration(endColumn, date)
        if (iteration) {
          result.end = iteration.end
          result.endIteration = iteration
          if (startColumn === RoadmapDateFieldNone) {
            // Include the full iteration as a tempoary placeholder, even if the start or end date is None
            result.start = iteration.start
            result.startIteration = iteration
          }
        } else {
          result.end = undefined
        }
      }
      return result
    },
    [dateFields, getIteration],
  )

  useLayoutEffect(() => {
    if (zoomLevel !== localZoomState && roadmapRef && roadmapRef.current) {
      const focalPoint = getRoadmapTargetOffset() + roadmapRef.current.scrollLeft

      const dateToFocus = getDateFromX(focalPoint)
      setLocalZoomState(zoomLevel)
      shiftTimeRange({date: dateToFocus, direction: 'none', zoomLevel})
    }
  }, [zoomLevel, shiftTimeRange, localZoomState, getRoadmapTargetOffset, columnWidth, getDateFromX])

  useLayoutEffect(() => {
    // If there is an outstanding request, position the scrollbar prior to painting the screen to avoid flicker.
    if (shiftTimeRangeArgs.current && roadmapRef.current) {
      const {date, direction, completed} = shiftTimeRangeArgs.current
      if (!completed) {
        const x = getX(date)
        const offset =
          direction === 'next' ? roadmapRef.current.offsetWidth : direction === 'prev' ? 0 : getRoadmapTargetOffset()
        roadmapRef.current?.scrollTo({left: x - offset})
      }
    }
  }, [columnWidth, getX, timeRangeEnd, timeRangeStart, getRoadmapTargetOffset])

  useEffect(() => {
    // If there is an outstanding request, smoothly scroll the new center date from the side to the center of the roadmap.
    if (shiftTimeRangeArgs.current && roadmapRef.current) {
      const {date, completed} = shiftTimeRangeArgs.current
      if (!completed) {
        scrollToDate(date, true)
        shiftTimeRangeArgs.current = {...shiftTimeRangeArgs.current, completed: true}
      }
    }
  }, [scrollToDate, timeRangeEnd, timeRangeStart])

  const [isScrollingLocked, setIsScrollingLocked] = useState(false)

  return (
    <RoadmapGetTimeSpanContext.Provider value={getTimeSpan}>
      <RoadmapGetViewportContext.Provider value={getViewport}>
        <RoadmapContext.Provider
          value={useMemo(() => {
            return {
              columnWidth,
              getX,
              getXFromClientX,
              getDateFromClientX,
              getDateFromX,
              timeRangeEnd,
              timeRangeStart,
              totalWidth,
              today,
            }
          }, [
            columnWidth,
            getX,
            getXFromClientX,
            getDateFromClientX,
            getDateFromX,
            timeRangeEnd,
            timeRangeStart,
            totalWidth,
            today,
          ])}
        >
          <RoadmapNavigationSetIsScrollingLocked.Provider value={setIsScrollingLocked}>
            <RoadmapNavigationIsScrollingLocked.Provider value={isScrollingLocked}>
              <RoadmapNavigationContext.Provider
                value={useMemo(() => {
                  return {
                    roadmapRef,
                    scrollToDate,
                    scrollToNextPage,
                    scrollToPrevPage,
                    shiftToNextRange,
                    shiftToPrevRange,
                  }
                }, [scrollToDate, scrollToNextPage, scrollToPrevPage, shiftToNextRange, shiftToPrevRange])}
              >
                <RoadmapDateFieldsMenuContext.Provider
                  value={useMemo(() => {
                    return {
                      isDateConfigurationMenuOpen,
                      setOpenDateConfigurationMenu,
                    }
                  }, [isDateConfigurationMenuOpen, setOpenDateConfigurationMenu])}
                >
                  {children}
                </RoadmapDateFieldsMenuContext.Provider>
              </RoadmapNavigationContext.Provider>
            </RoadmapNavigationIsScrollingLocked.Provider>
          </RoadmapNavigationSetIsScrollingLocked.Provider>
        </RoadmapContext.Provider>
      </RoadmapGetViewportContext.Provider>
    </RoadmapGetTimeSpanContext.Provider>
  )
})

export const useRoadmapView = () => {
  const context = useContext(RoadmapContext)
  if (context === null) {
    throw new Error('useRoadmapView must be used within a RoadmapViewContext')
  }

  return context
}

export const useRoadmapGetTimeSpan = () => {
  const getTimeSpan = useContext(RoadmapGetTimeSpanContext)
  invariant(getTimeSpan != null, 'useRoadmapGetTimeSpan must be used within a RoadmapGetTimeSpanContext')
  return getTimeSpan
}

export const useRoadmapGetViewport = () => {
  const getViewport = useContext(RoadmapGetViewportContext)
  invariant(getViewport != null, 'useRoadmapGetViewport must be used within a RoadmapGetViewportContext')
  return getViewport
}

export const useRoadmapNavigation = () => {
  const context = useContext(RoadmapNavigationContext)
  if (context === null) {
    throw new Error('useRoadmapNavigation must be used within a RoadmapNavigationContext')
  }

  return context
}

export const useRoadmapIsScrollingLocked = () => {
  const context = useContext(RoadmapNavigationIsScrollingLocked)
  invariant(context !== null)
  return context
}
export const useRoadmapSetIsScrollingLocked = () => {
  const context = useContext(RoadmapNavigationSetIsScrollingLocked)
  invariant(context !== null)
  return context
}
