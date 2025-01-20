import {addDays} from 'date-fns'
import {memo} from 'react'
import type {Row} from 'react-table'

import type {TableDataType} from '../../../components/react_table/table-data-type'
import {useRoadmapSettings} from '../../../hooks/use-roadmap-settings'
import {getSortedDates} from '../date-utils'
import {useRoadmapView} from '../roadmap-view-provider'
import {RoadmapGroupPill} from './roadmap-group-pill'
import {NavigationArrow} from './roadmap-pill-buttons'

type RoadmapGroupPillAreaProps = {
  rows: Array<Row<TableDataType>>
}

/**
 * RoadmapPillArea includes an item's remaining row area to the right of the table cells.
 * This may render a navigation arrow or the visible roadmap pill.
 * */
export const RoadmapGroupPillArea = memo(function RoadmapGroupPillArea({rows}: RoadmapGroupPillAreaProps) {
  const {getTimeSpanFromColumnData} = useRoadmapSettings()
  const {getX, totalWidth} = useRoadmapView()

  let minDate: Date | undefined
  let maxDate: Date | undefined
  for (const row of rows) {
    const timeSpan = getTimeSpanFromColumnData(row.original.columns)
    const [start, end] = getSortedDates([timeSpan.start, timeSpan.end])
    if (start && (!minDate || start < minDate)) minDate = start
    if (end && (!maxDate || end > maxDate)) maxDate = end
  }

  const timeSpan = {start: minDate, end: maxDate}

  // Absolute positioning within the full, scrollable roadmap width
  const pillOffsetLeft = timeSpan.start ? getX(timeSpan.start) : 0
  const pillWidth = timeSpan.end ? getX(addDays(timeSpan.end, 1)) - pillOffsetLeft : 0
  const isBefore = pillOffsetLeft + pillWidth <= 0
  const isAfter = pillOffsetLeft >= totalWidth
  const pillIsInTimeRange = !isBefore && !isAfter
  const hasDates = timeSpan.start || timeSpan.end

  return hasDates ? (
    pillIsInTimeRange ? (
      <RoadmapGroupPill
        startDate={timeSpan.start}
        endDate={timeSpan.end}
        pillOffsetLeft={pillOffsetLeft}
        pillWidth={pillWidth}
      />
    ) : hasDates ? (
      <NavigationArrow role="gridcell" isBefore={isBefore} startDate={timeSpan.start} endDate={timeSpan.end} />
    ) : null
  ) : null
})
