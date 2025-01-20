import {createContext, useContext} from 'react'
import invariant from 'tiny-invariant'

import type {Iteration} from '../api/columns/contracts/iteration'
import type {ColumnData} from '../api/columns/contracts/storage'
import type {RoadmapZoomLevel} from '../api/view/contracts'
import type {ReadonlyRoadmapColumns, RoadmapColumn, TimeSpan} from '../helpers/roadmap-helpers'
import type {ColumnModel} from '../models/column-model'

type IterationWithDates = Iteration & {start: Date; end: Date}
export type IterationDateMap = Map<number, Map<string | number, IterationWithDates>>

export const RoadmapSettingsContext = createContext<{
  dateFields: ReadonlyRoadmapColumns
  markerFields: ReadonlyArray<ColumnModel>
  /**
   * Whether or not the date fields being returned are the default date fields,
   * which were initially assigned to show the user some data in the roadmap view.
   * This implies that the date fields are not persisted yet. In most cases, this
   * will be false, and it should only be true during the initial roadmap setup.
   */
  areDateFieldsDefault: boolean
  setDateFields: (viewNumber: number, column: Array<RoadmapColumn>) => void
  toggleMarkerField: (viewNumber: number, field: ColumnModel) => void
  isRoadmapDateFieldsDirty: boolean
  isRoadmapMarkerFieldsDirty: boolean
  isRoadmapZoomLevelDirty: boolean
  getTimeSpanFromColumnData: (columnData: ColumnData) => TimeSpan
  /** Width of the title column in the roadmap */
  titleColumnWidth: number
  /** Function to persist the width of the title column for adjusting the roadmap table size */
  updateTitleColumnWidth: (width: number) => Promise<void> | void
  /** Function to locally update the width of the title column, or reset to defaults */
  updateLocalTitleColumnWidth: (width: number | null) => void
  /** Wether to display the date fields in the roadmap table */
  showDateFields: boolean
} | null>(null)

/** Temporary, non-persisted session state settings retained for each Roadmap view */
export const RoadmapSessionSettingsContext = createContext<{
  isDateFieldsPopoverDisabled: boolean
  disableDateFieldsPopover: () => void
} | null>(null)

/**
 * This hook exposes the current fields that are used for the roadmap specific layout settings
 * applied to the view
 */
export const useRoadmapSettings = () => {
  const ctx = useContext(RoadmapSettingsContext)
  if (!ctx) {
    throw new Error('useRoadmapSettings must be used within a RoadmapSettingsContext')
  }
  return ctx
}

/**
 * This hook exposes the non-persisted session state settings retained for each Roadmap view
 */
export const useRoadmapSessionSettings = () => {
  const ctx = useContext(RoadmapSessionSettingsContext)
  if (!ctx) {
    throw new Error('useRoadmapSessionSettings must be used within a RoadmapSessionSettingsContext')
  }
  return ctx
}

/** Width of table adjacent to roadmap */
export const RoadmapTableWidthContext = createContext<number | null>(null)
export const useRoadmapTableWidth = () => {
  const ctx = useContext(RoadmapTableWidthContext)
  invariant(ctx != null, 'useRoadmapTableWidth must be used within a RoadmapTableWidthContext')
  return ctx
}

/** Total width of non-resizable columns in the roadmap */
export const RoadmapTotalFixedColumnWidthContext = createContext<number | null>(null)
export const useRoadmapTotalFixedColumnWidth = () => {
  const ctx = useContext(RoadmapTotalFixedColumnWidthContext)
  invariant(ctx != null, 'useRoadmapTotalFixedColumnWidth must be used within a RoadmapTotalFixedColumnWidthContext')
  return ctx
}

export const RoadmapZoomLevelContext = createContext<RoadmapZoomLevel | null>(null)
export const useRoadmapZoomLevel = () => {
  const ctx = useContext(RoadmapZoomLevelContext)
  invariant(ctx != null, 'useRoadmapZoomLevel must be used within a RoadmapZoomLevelContext')
  return ctx
}

export const RoadmapSetZoomLevelContext = createContext<
  ((viewNumber: number, zoomLevel: RoadmapZoomLevel) => void) | null
>(null)
export const useRoadmapSetZoomLevel = () => {
  const ctx = useContext(RoadmapSetZoomLevelContext)
  invariant(ctx != null, 'useRoadmapSetZoomLevel must be used within a RoadmapSetZoomLevelContext')
  return ctx
}
