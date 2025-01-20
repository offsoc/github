import type {Iteration} from '../api/columns/contracts/iteration'
import {
  type LayoutSettings,
  RoadmapDateFieldNone,
  type RoadmapLayoutSettings,
  RoadmapZoomLevel,
} from '../api/view/contracts'
import type {ColumnModel} from '../models/column-model'
import {isDateColumnModel, isIterationColumnModel} from '../models/column-model/guards'
import {formatDateRangeUtc} from '../pages/roadmap/date-utils'
import {intervalDateRange} from './iterations'

/**
 * Time span for a potential or concrete roadmap item.
 * Includes valid start and end date range for the item, limited by discrete values if iterations are used.
 * If the roadmap is configured to use an iteration field(s):
 *    Includes the corresponding start/end iterations if they exist.
 *    Includes undefined start/end dates if the corresponding iteration does not exist.
 */
export type TimeSpan = {
  start: Date | undefined
  end: Date | undefined
  startIteration?: Iteration
  endIteration?: Iteration
}

/**
 * In a deserialized view state, dateFields for roadmap.layoutSettings can be ['none', or ColumnModel]
 */
export type RoadmapColumn = ColumnModel | RoadmapDateFieldNone
export type ReadonlyRoadmapColumns = ReadonlyArray<RoadmapColumn>

export function isRoadmapColumnModel(column: ColumnModel | RoadmapDateFieldNone): column is ColumnModel {
  return column !== RoadmapDateFieldNone && (isDateColumnModel(column) || isIterationColumnModel(column))
}

/**
 * On a view object, dateFields for roadmap.layoutSettings can be ['none', or date/iteration column id]
 */
export function isRoadmapColumnValueId(value: number | RoadmapDateFieldNone): value is number {
  return value !== 'none' && typeof value === 'number'
}

/**
 * Types used for determining if any date column ids have been selected for roadmap.layoutSettings
 */
type RoadmapLayoutSettingsWithDateColumns = Required<RoadmapLayoutSettings>

export function isRoadmapLayoutSettingsWithDateColumns(
  x: RoadmapLayoutSettings | RoadmapLayoutSettingsWithDateColumns | undefined,
): x is RoadmapLayoutSettingsWithDateColumns {
  return !!(x && x.dateFields && x.dateFields.length > 0)
}

const RoadmapDefaultZoomLevel = RoadmapZoomLevel.Month
export function getZoomLevelFromSettingsOrDefault(layoutSettings: LayoutSettings | undefined): RoadmapZoomLevel {
  return layoutSettings?.roadmap?.zoomLevel ?? RoadmapDefaultZoomLevel
}

export function applyNoneFallback<T>(dateFields: ReadonlyArray<T>): Array<T | RoadmapDateFieldNone> {
  return [dateFields[0] || RoadmapDateFieldNone, dateFields[1] || RoadmapDateFieldNone]
}

/**
 * Returns the tooltip text for the iteration options of a roadmap marker
 * Currently used in iteration marker headers & nubs
 */
export function getIterationOptionsTooltipText(options: Array<Iteration>) {
  return options
    .map(option => {
      const {startDate: start, endDate: end} = intervalDateRange({
        startDate: option.startDate,
        duration: option.duration,
      })

      return `${option.title}: ${formatDateRangeUtc(start, end, options.length > 1 ? 'MMM d' : 'EEE, MMM d')}`
    })
    .join(', ')
}
