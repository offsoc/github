import {addDays, isAfter, isBefore, subDays} from 'date-fns'
import {createContext, memo, useContext, useMemo} from 'react'
import type {Row} from 'react-table'
import invariant from 'tiny-invariant'

import type {ServerDateValue} from '../../../api/columns/contracts/date'
import type {Iteration} from '../../../api/columns/contracts/iteration'
import {SystemColumnId} from '../../../api/columns/contracts/memex-column'
import type {Milestone} from '../../../api/common-contracts'
import {RoadmapDateFieldNone} from '../../../api/view/contracts'
import type {TableDataType} from '../../../components/react_table/table-data-type'
import type {GroupItemsResult} from '../../../features/grouping/group-items'
import {dateStringFromISODate} from '../../../helpers/date-string-from-iso-string'
import {addDuration, buildBreak, compareAscending, getAllIterations} from '../../../helpers/iterations'
import {joinOxford} from '../../../helpers/join-oxford'
import type {ReadonlyRoadmapColumns, RoadmapColumn} from '../../../helpers/roadmap-helpers'
import {useRoadmapSettings} from '../../../hooks/use-roadmap-settings'
import type {ColumnModel} from '../../../models/column-model'
import type {DateColumnModel} from '../../../models/column-model/custom/date'
import type {IterationColumnModel} from '../../../models/column-model/custom/iteration'
import {isDateColumnModel, isIterationColumnModel} from '../../../models/column-model/guards'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {useAllColumns} from '../../../state-providers/columns/use-all-columns'
import {useRoadmapView} from '../roadmap-view-provider'

export const RoadmapMarkerType = {
  CustomDate: 'custom-date',
  Iteration: 'iteration',
  IterationBreak: 'iteration-break',
  Milestone: 'milestone',
} as const

interface BaseRoadmapMarker {
  id: string // should be a unique id, maybe need type+id to ensure uniqueness
  type: (typeof RoadmapMarkerType)[keyof typeof RoadmapMarkerType]
  title: string // title of the marker used when rendering marker labels
  date: string // date of the marker, used to position the marker on the roadmap
}

export interface IterationMarker extends BaseRoadmapMarker {
  type: typeof RoadmapMarkerType.Iteration | typeof RoadmapMarkerType.IterationBreak
  duration: number // used to calculate the end date of the iteration when render sticky iteration headers
  isDateField: boolean // used to determine if the iteration is currently being used as a date field
  options: Array<Iteration> // used to render the iteration details
}

export interface MilestoneMarker extends BaseRoadmapMarker {
  type: typeof RoadmapMarkerType.Milestone
  description: string // more detailed description for screen readers
  options: Array<Milestone> // used to render the milestone details, e.g. multiple milestone links
}

interface CustomDateMarker extends BaseRoadmapMarker {
  type: typeof RoadmapMarkerType.CustomDate
}

export type RoadmapMarker = IterationMarker | MilestoneMarker | CustomDateMarker

type MarkersInRangeType = {
  markersInRange: Array<RoadmapMarker> // all markers in the current time-range, sorted by date
  singleDayMarkerMap: Map<string, RoadmapMarker> // a map of markers that only have a single day duration
}

const RoadmapMarkersInRangeContext = createContext<MarkersInRangeType | null>(null)
const RoadmapMilestoneMarkersSizeContext = createContext<number | null>(null)
const RoadmapIterationMarkersSizeContext = createContext<number | null>(null)

export const RoadmapMarkersInRangeProvider = memo(function RoadmapMarkersContextProvider({
  children,
  rows,
}: {
  children: React.ReactNode
  rows: Array<Row<TableDataType>>
}) {
  const {dateFields, markerFields} = useRoadmapSettings()
  const {timeRangeStart, timeRangeEnd} = useRoadmapView()
  const {allColumns} = useAllColumns()

  const customDateFields: Array<DateColumnModel> = useMemo(() => {
    const fields = []
    for (const field of markerFields) {
      if (isDateColumnModel(field)) fields.push(field)
    }
    return fields
  }, [markerFields])

  const isMilestonesVisible = !!markerFields.find(column => column.id === SystemColumnId.Milestone)
  const milestonesGroupedByDueDate = useMemo(() => {
    const map = new Map<string, Map<number, Milestone>>()
    if (!isMilestonesVisible) return map

    function addItemMilestoneIfInDateRange(item: MemexItemModel) {
      const milestone = item.getMilestone()
      if (!milestone?.dueDate) return
      const milestoneDueDate = new Date(milestone.dueDate)
      if (milestoneDueDate < timeRangeStart || milestoneDueDate > timeRangeEnd) return
      const currentMilestones = map.get(milestone.dueDate) ?? new Map<number, Milestone>()
      map.set(milestone.dueDate, currentMilestones.set(milestone.id, milestone))
    }

    for (const row of rows) {
      addItemMilestoneIfInDateRange(row.original)
    }

    return map
  }, [isMilestonesVisible, rows, timeRangeEnd, timeRangeStart])

  const items = useMemo(() => rows.map(item => item.original), [rows])

  const customDateMarkerMap = useMemo(
    () => toCustomDateMarkers(items, customDateFields, timeRangeStart, timeRangeEnd),
    [customDateFields, items, timeRangeEnd, timeRangeStart],
  )

  const iterationMarkerMap = useMemo(
    () => toIterationMarkers(allColumns, markerFields, iterationDateFields(dateFields), timeRangeStart, timeRangeEnd),
    [allColumns, markerFields, dateFields, timeRangeStart, timeRangeEnd],
  )
  const milestoneMarkerMap = useMemo(() => toMilestoneMarkers(milestonesGroupedByDueDate), [milestonesGroupedByDueDate])

  // Markers in the current time-range, sorted by date
  const markersInRangeValue = useMemo(() => {
    // only one marker per date is allowed and the priority is milestone > custom date
    const singleDayMarkerMap = new Map([...customDateMarkerMap, ...milestoneMarkerMap])

    const markersInRange = [...iterationMarkerMap.values(), ...singleDayMarkerMap.values()].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    return {markersInRange, singleDayMarkerMap}
  }, [customDateMarkerMap, iterationMarkerMap, milestoneMarkerMap])

  return (
    <RoadmapMarkersInRangeContext.Provider value={markersInRangeValue}>
      <RoadmapMilestoneMarkersSizeContext.Provider value={milestonesGroupedByDueDate.size}>
        <RoadmapIterationMarkersSizeContext.Provider value={iterationMarkerMap.size}>
          {children}
        </RoadmapIterationMarkersSizeContext.Provider>
      </RoadmapMilestoneMarkersSizeContext.Provider>
    </RoadmapMarkersInRangeContext.Provider>
  )
})

export const useRoadmapMarkersInRange = () => {
  const context = useContext(RoadmapMarkersInRangeContext)

  invariant(context != null, 'useRoadmapMarkersInRange must be used within a RoadmapMarkersInRangeProvider')

  return context
}

export function useRoadmapMilestoneMarkersSize() {
  const context = useContext(RoadmapMilestoneMarkersSizeContext)
  invariant(context != null, 'useRoadmapMilestoneMarkersSize must be used within a RoadmapMarkersInRangeProvider')
  return context
}

export function useRoadmapIterationMarkersSize() {
  const context = useContext(RoadmapIterationMarkersSizeContext)
  invariant(context != null, 'useRoadmapIterationMarkersSize must be used within a RoadmapMarkersInRangeProvider')
  return context
}

// returns a map of iterations in the current timeline range
function toIterationMarkers(
  columns: ReadonlyArray<ColumnModel>,
  markerFields: ReadonlyArray<ColumnModel>,
  dateFields: Array<RoadmapColumn>,
  timeRangeStart: Date,
  timeRangeEnd: Date,
): Map<string, RoadmapMarker> {
  const markerMap = new Map<string, IterationMarker>()

  const iterationColumns = columns.reduce<Array<IterationColumnModel>>(
    (acc, column) => (isIterationColumnModel(column) ? (acc.push(column), acc) : acc),
    [],
  )
  const dateFieldSet = new Set(
    dateFields.map(field => (field === RoadmapDateFieldNone ? RoadmapDateFieldNone : field.databaseId)),
  )
  const markerFieldSet = new Set([...markerFields.map(field => field.databaseId)])

  function addMarkerIfInDateRange(
    dateString: string,
    isDateField: boolean,
    type: typeof RoadmapMarkerType.Iteration | typeof RoadmapMarkerType.IterationBreak,
    iteration: Iteration,
  ) {
    const date = new Date(dateString)
    if (date >= timeRangeStart && date <= timeRangeEnd) {
      const existingMarker = markerMap.get(dateString)
      // if a marker already exists, add an iteration as an option
      if (existingMarker) {
        const options = existingMarker.options

        options.push(iteration)
        markerMap.set(dateString, {
          ...existingMarker,
          title: `${options.length} iterations`,
          // surface the longest duration when markers are stacked
          duration: existingMarker.duration > iteration.duration ? existingMarker.duration : iteration.duration,
          options,
        })
      } else {
        markerMap.set(dateString, {
          id: iteration.id,
          type,
          title: iteration.title,
          date: iteration.startDate,
          duration: iteration.duration,
          isDateField,
          options: [iteration],
        })
      }
    }
  }

  for (const column of iterationColumns) {
    if (markerFieldSet.has(column.databaseId)) {
      // get all iterations and sort them by start-date
      const iterationList = getAllIterations(column).sort(compareAscending)
      const iterationEntries = iterationList.entries()

      for (const [index, iteration] of iterationEntries) {
        const iterationBreak = buildIterationBreak(iterationList[index - 1], iteration)

        if (iterationBreak !== undefined) {
          addMarkerIfInDateRange(
            iterationBreak.startDate,
            dateFieldSet.has(column.databaseId),
            RoadmapMarkerType.IterationBreak,
            iterationBreak,
          )
        }

        addMarkerIfInDateRange(
          iteration.startDate,
          dateFieldSet.has(column.databaseId),
          RoadmapMarkerType.Iteration,
          iteration,
        )
      }
    }
  }

  return markerMap
}

// returns a map of milestones in the current timeline range
function toMilestoneMarkers(milestoneMap: Map<string, Map<number, Milestone>>): Map<string, RoadmapMarker> {
  const markerMap: Map<string, RoadmapMarker> = new Map()

  for (const [dateString, milestonesById] of milestoneMap.entries()) {
    const milestones: Array<Milestone> = [...milestonesById.values()]
    const [titles, descriptions] = milestones.reduce<[Array<string>, Array<string>]>(
      (acc, milestone) => {
        acc[0].push(milestone.title)
        acc[1].push(`${milestone.title} (${milestone.repoNameWithOwner})`)
        return acc
      },
      [[], []],
    )

    markerMap.set(dateString, {
      id: `milestone:${dateString}`,
      type: RoadmapMarkerType.Milestone,
      title: milestones.length > 1 ? `${milestones.length} milestones` : joinOxford(titles),
      description: joinOxford(descriptions),
      date: dateString,
      options: milestones,
    })
  }

  return markerMap
}

// returns a map of custom-dates in the current timeline range
function toCustomDateMarkers(
  items: ReadonlyArray<MemexItemModel> | Array<GroupItemsResult<MemexItemModel>>,
  customDateFields: Array<DateColumnModel>,
  timeRangeStart: Date,
  timeRangeEnd: Date,
): Map<string, RoadmapMarker> {
  const markerMap: Map<string, RoadmapMarker> = new Map()

  function addMarkerIfInDateRange(item: MemexItemModel) {
    for (const field of customDateFields) {
      const dateValue: ServerDateValue | undefined = item.getCustomField(field.id)

      if (dateValue?.value) {
        const dateString = dateStringFromISODate(dateValue.value)
        const date = new Date(dateString)

        if (date < timeRangeStart || date > timeRangeEnd) {
          continue
        }

        markerMap.set(dateString, {
          id: `${item.id}:${field.id}`,
          type: RoadmapMarkerType.CustomDate,
          title: field.name,
          date: dateString,
        })
      }
    }
  }

  for (const itemOrGroup of items) {
    if ('rows' in itemOrGroup) {
      for (const item of itemOrGroup.rows) {
        addMarkerIfInDateRange(item)
      }
      continue
    }
    addMarkerIfInDateRange(itemOrGroup)
  }

  return markerMap
}

function iterationDateFields(dateFields: ReadonlyRoadmapColumns) {
  return dateFields.filter(dateField => dateField !== RoadmapDateFieldNone && isIterationColumnModel(dateField))
}

/**
 * Builds an iteration that represents the break between the previous iteration and the current iteration
 * @param previousIteration
 * @param iteration
 * @returns a Iteration Break
 */
function buildIterationBreak(previousIteration?: Iteration, iteration?: Iteration): Iteration | undefined {
  const breakInterval = buildBreak(previousIteration, iteration)

  if (breakInterval !== undefined) {
    return {
      id: `break-${previousIteration?.id}-${iteration?.id}`,
      title: 'Break',
      titleHtml: 'Break',
      startDate: dateStringFromISODate(breakInterval.startDate.toString()),
      duration: breakInterval.duration,
    }
  }
}

export const isCurrentIterationByMarker = (marker: RoadmapMarker) => {
  if (marker.type !== RoadmapMarkerType.Iteration) {
    return false
  }

  if (!marker.isDateField) {
    return false
  }

  const now = new Date()
  const startDate = new Date(marker.date)
  const nowAsDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dayAfterIntervalEnds = addDays(addDuration(marker.date, marker.duration || 0), 1)
  return isAfter(nowAsDateOnly, subDays(startDate, 1)) && isBefore(nowAsDateOnly, dayAfterIntervalEnds)
}
