import {createContext} from 'react'

import type {TimeSpan} from '../../helpers/roadmap-helpers'

export type Viewport = {left: number; right: number}

type RoadmapContextValue = {
  /** Width of column in the roadmap */
  columnWidth: number
  /** Get the x pixel offset of the specified date in the roadmap */
  getX: (date: Date) => number
  /** Get the x pixel offset within the full roadmap time range from the specified clientX */
  getXFromClientX: (x: number) => number
  /** Get the date in the roadmap based by the clientX offset */
  getDateFromClientX: (x: number) => Date | undefined
  /** Get the date in the roadmap based by the x offset */
  getDateFromX: (x: number) => Date | undefined
  /** First date of the first time range unit (month, quarter, year, etc.) */
  timeRangeStart: Date
  /** First date of the last time range unit (month, quarter, year, etc.) */
  timeRangeEnd: Date
  /** Total pixel width of the rendered roadmap */
  totalWidth: number
  /** today is defined as the start of the day 0:00 UTC */
  today: Date
}

type RoadmapNavigationContextValue = {
  /** The scrollable roadmap container */
  roadmapRef: React.RefObject<HTMLDivElement>
  /** Scroll to center the roadmap on the specified date */
  scrollToDate: (date: Date, smooth?: boolean) => void
  /** Scroll to the next range of dates based on the current visible range */
  scrollToNextPage: (smooth?: boolean) => void
  /** Scroll to the previous range of dates based on the current visible range */
  scrollToPrevPage: (smooth?: boolean) => void
  /** Shift to the next range of dates based on the total rendered time range */
  shiftToNextRange: () => void
  /** Shift to the previous range of dates based on the total rendered time range */
  shiftToPrevRange: () => void
}

export const RoadmapContext = createContext<RoadmapContextValue | null>(null)
/** Returns the pixel range of the visible roadmap area along the x axis */
export const RoadmapGetViewportContext = createContext<(() => Viewport) | null>(null)
/** Get the apppropriate time span when adding a new item to the roadmap, based on the configured date or iteration fields */
export const RoadmapGetTimeSpanContext = createContext<((date: Date) => TimeSpan) | null>(null)
export const RoadmapNavigationContext = createContext<RoadmapNavigationContextValue | null>(null)

export const RoadmapNavigationIsScrollingLocked = createContext<boolean | null>(null)
export const RoadmapNavigationSetIsScrollingLocked = createContext<React.Dispatch<
  React.SetStateAction<boolean>
> | null>(null)
