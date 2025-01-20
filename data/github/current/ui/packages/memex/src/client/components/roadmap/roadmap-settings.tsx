import {memo, useCallback, useMemo, useState} from 'react'

import type {Iteration} from '../../api/columns/contracts/iteration'
import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import type {ColumnData} from '../../api/columns/contracts/storage'
import {RoadmapDateFieldNone, type RoadmapZoomLevel, ViewTypeParam} from '../../api/view/contracts'
import {canViewTypeParamHaveColumnWidths} from '../../helpers/column-widths'
import {getAllIterations, intervalDateRangeFromUTC} from '../../helpers/iterations'
import {asCustomDateValue} from '../../helpers/parsing'
import {
  applyNoneFallback,
  getZoomLevelFromSettingsOrDefault,
  type RoadmapColumn,
  type TimeSpan,
} from '../../helpers/roadmap-helpers'
import {ViewerPrivileges} from '../../helpers/viewer-privileges'
import {
  type IterationDateMap,
  RoadmapSessionSettingsContext,
  RoadmapSettingsContext,
  RoadmapSetZoomLevelContext,
  RoadmapTableWidthContext,
  RoadmapTotalFixedColumnWidthContext,
  RoadmapZoomLevelContext,
} from '../../hooks/use-roadmap-settings'
import {ViewStateActionTypes} from '../../hooks/use-view-state-reducer/view-state-action-types'
import {useViews} from '../../hooks/use-views'
import type {ColumnModel} from '../../models/column-model'
import {isDateColumnModel, isIterationColumnModel} from '../../models/column-model/guards'
import {DEFAULT_TITLE_COLUMN_WIDTH} from '../../models/column-model/system/title'
import {useAllColumns} from '../../state-providers/columns/use-all-columns'
import {useColumnWidth} from '../../state-providers/columns/use-column-width'
import {useUserSettings} from '../user-settings'
import {ROADMAP_DATE_COLUMN_WIDTH, ROADMAP_NUMBER_COLUMN_WIDTH} from './constants'

const defaultMarkerFields: ReadonlyArray<ColumnModel> = []
export const RoadmapSettingsProvider = memo<{
  children?: React.ReactNode
}>(function RoadmapSettingsProvider({children}) {
  const {currentView, viewStateDispatch} = useViews()
  const {allColumns} = useAllColumns()

  const setDateFields = useCallback(
    (viewNumber: number, fields: Array<RoadmapColumn>): void => {
      viewStateDispatch({
        type: ViewStateActionTypes.SetRoadmapDateFields,
        viewNumber,
        dateFields: fields,
      })
    },
    [viewStateDispatch],
  )

  const toggleMarkerField = useCallback(
    (viewNumber: number, field: ColumnModel): void => {
      viewStateDispatch({
        type: ViewStateActionTypes.ToggleRoadmapMarkerFields,
        viewNumber,
        field,
      })
    },
    [viewStateDispatch],
  )

  // Return 2 date fields for UI consumption, defaulting to 'none' if not set
  const dateFields = useMemo(() => {
    if (
      currentView?.localViewState?.layout === ViewTypeParam.Roadmap &&
      currentView.localViewStateDeserialized.layoutSettings?.roadmap?.dateFields?.length
    ) {
      return applyNoneFallback(currentView.localViewStateDeserialized.layoutSettings.roadmap.dateFields)
    }

    return applyNoneFallback([])
  }, [currentView])

  const areDateFieldsDefault = useMemo(
    () => dateFields.length > 0 && currentView?.serverViewState.layoutSettings.roadmap === undefined,
    [currentView?.serverViewState.layoutSettings.roadmap, dateFields.length],
  )

  // Keep track of whether the date fields popover has been disabled/dismissed for each Roadmap view.
  // This prevents it from reappearing if the user switches between tabs with a new Roadmap view.
  const [disabledPopovers, setDisabledPopovers] = useState<{[viewId: number]: boolean}>({})

  const isDateFieldsPopoverDisabled = useMemo(() => {
    return disabledPopovers[currentView?.id ?? 0] ?? false
  }, [currentView?.id, disabledPopovers])

  const disableDateFieldsPopover = useCallback(() => {
    if (currentView?.id && !isDateFieldsPopoverDisabled) {
      setDisabledPopovers({...disabledPopovers, [currentView.id]: true})
    }
  }, [currentView?.id, isDateFieldsPopoverDisabled, disabledPopovers])

  const iterationDateMap: IterationDateMap = useMemo(() => {
    if (currentView?.localViewState?.layout !== ViewTypeParam.Roadmap) {
      return new Map()
    }
    return allColumns.reduce<IterationDateMap>((acc, column) => {
      if (isIterationColumnModel(column)) {
        const iterations = getAllIterations(column)
        const iterationOptions = iterations.reduce<NonNullable<ReturnType<IterationDateMap['get']>>>(
          (options, iteration) => {
            const {id, startDate, duration} = iteration
            const interval = intervalDateRangeFromUTC({startDate, duration})
            const result = {
              ...iteration,
              start: interval.startDate,
              end: interval.endDate,
            }

            options.set(id, result)
            return options
          },
          new Map(),
        )

        acc.set(column.id, iterationOptions)
      }
      return acc
    }, new Map())
  }, [allColumns, currentView])

  const getDateForColumnData = useCallback(
    (columnData: ColumnData, index: 0 | 1): {date: Date | undefined; iteration: Iteration | undefined} => {
      const column = dateFields[index]
      if (!column || column === 'none') return {date: undefined, iteration: undefined}

      const columnValue = columnData[column.id]
      if (!columnValue) return {date: undefined, iteration: undefined}

      if (isDateColumnModel(column)) {
        return {date: asCustomDateValue(columnValue)?.value, iteration: undefined}
      }
      if (isIterationColumnModel(column) && 'id' in columnValue) {
        // Find available iteration options
        const options = iterationDateMap.get(column.id)

        if (options) {
          // Find the matching iteration
          const iteration = options.get(columnValue.id)
          if (iteration) {
            // Look at the array position (0 or 1) to determine if we should use start or end date
            const date = index === 0 ? iteration.start : iteration.end
            return {date, iteration}
          }
        }
      }
      return {date: undefined, iteration: undefined}
    },
    [dateFields, iterationDateMap],
  )

  const getTimeSpanFromColumnData = useCallback(
    (columnData: ColumnData): TimeSpan => {
      if (!dateFields.length) return {start: undefined, end: undefined}
      const date0 = getDateForColumnData(columnData, 0)
      const date1 = getDateForColumnData(columnData, 1)
      return {
        start: date0.date,
        startIteration: date0.iteration,
        end: date1.date,
        endIteration: date1.iteration,
      }
    },
    [getDateForColumnData, dateFields],
  )

  const zoomLevel = useMemo(() => {
    return getZoomLevelFromSettingsOrDefault(currentView?.localViewState?.layoutSettings)
  }, [currentView])

  const setZoomLevel = useCallback(
    (viewNumber: number, zoom: RoadmapZoomLevel): void => {
      viewStateDispatch({
        type: ViewStateActionTypes.SetRoadmapZoomLevel,
        viewNumber,
        zoomLevel: zoom,
      })
    },
    [viewStateDispatch],
  )

  const {getWidth, updateWidth} = useColumnWidth()
  const {hasWritePermissions} = ViewerPrivileges()

  // Need to check if we are currently in a layout that supports column widths, to prevent getting column widths
  // in a board layout for example, where it is not applicable and will throw an error
  const supportsColumnWidths = currentView && canViewTypeParamHaveColumnWidths(currentView.localViewState.layout)
  const titleColumnId = allColumns.find(column => column.dataType === MemexColumnDataType.Title)?.id
  // Store local title column width per-view, for optimistic updates
  const [localTitleColumnWidth, setLocalTitleColumnWidth] = useState<Map<number, number | null>>(new Map())
  const updateLocalTitleColumnWidth = useCallback(
    (width: number | null) => {
      if (!currentView) return
      if (!hasWritePermissions) return
      setLocalTitleColumnWidth(prev => new Map(prev).set(currentView.number, width))
    },
    [currentView, hasWritePermissions],
  )

  const {roadmapShowDateFields} = useUserSettings()
  const showDateFields = roadmapShowDateFields.enabled
  const hasStartDateField = dateFields[0] !== RoadmapDateFieldNone
  const hasEndDateField = dateFields[1] !== RoadmapDateFieldNone
  const numDateFields =
    !showDateFields || (!hasStartDateField && !hasEndDateField)
      ? 0
      : hasStartDateField && hasEndDateField && dateFields[0] !== dateFields[1]
        ? 2
        : 1

  // If there is a local title column width (optimistic update), then render with that.
  // Otherwise, try to use the persisted column width, then fall back to the default width.
  const titleColumnWidth =
    (currentView?.number && localTitleColumnWidth.get(currentView.number)) ??
    (titleColumnId && supportsColumnWidths ? getWidth(titleColumnId) : undefined) ??
    DEFAULT_TITLE_COLUMN_WIDTH
  const totalFixedColumnsWidth = ROADMAP_DATE_COLUMN_WIDTH * numDateFields + ROADMAP_NUMBER_COLUMN_WIDTH
  const tableWidth = titleColumnWidth + totalFixedColumnsWidth

  const updateTitleColumnWidth = useCallback(
    (width: number) => {
      if (!titleColumnId) throw new Error('Title column not found')
      if (!hasWritePermissions) return
      updateLocalTitleColumnWidth(null)
      return updateWidth(titleColumnId, width)
    },
    [hasWritePermissions, titleColumnId, updateLocalTitleColumnWidth, updateWidth],
  )

  const markerFields =
    currentView?.localViewStateDeserialized?.layoutSettings.roadmap?.markerFields ?? defaultMarkerFields

  return (
    <RoadmapSetZoomLevelContext.Provider value={setZoomLevel}>
      <RoadmapZoomLevelContext.Provider value={zoomLevel}>
        <RoadmapTableWidthContext.Provider value={tableWidth}>
          <RoadmapTotalFixedColumnWidthContext.Provider value={totalFixedColumnsWidth}>
            <RoadmapSettingsContext.Provider
              value={useMemo(() => {
                return {
                  dateFields,
                  markerFields,
                  areDateFieldsDefault,
                  setDateFields,
                  toggleMarkerField,
                  isRoadmapMarkerFieldsDirty: currentView?.isRoadmapMarkerFieldsDirty ?? false,
                  isRoadmapDateFieldsDirty: currentView?.isRoadmapDateFieldsDirty ?? false,
                  isRoadmapZoomLevelDirty: currentView?.isRoadmapZoomLevelDirty ?? false,
                  getTimeSpanFromColumnData,
                  titleColumnWidth,
                  updateTitleColumnWidth,
                  updateLocalTitleColumnWidth,
                  showDateFields,
                }
              }, [
                dateFields,
                markerFields,
                areDateFieldsDefault,
                setDateFields,
                toggleMarkerField,
                currentView?.isRoadmapMarkerFieldsDirty,
                currentView?.isRoadmapDateFieldsDirty,
                currentView?.isRoadmapZoomLevelDirty,
                getTimeSpanFromColumnData,
                titleColumnWidth,
                updateTitleColumnWidth,
                updateLocalTitleColumnWidth,
                showDateFields,
              ])}
            >
              <RoadmapSessionSettingsContext.Provider
                value={useMemo(() => {
                  return {
                    isDateFieldsPopoverDisabled,
                    disableDateFieldsPopover,
                  }
                }, [isDateFieldsPopoverDisabled, disableDateFieldsPopover])}
              >
                {children}
              </RoadmapSessionSettingsContext.Provider>
            </RoadmapSettingsContext.Provider>
          </RoadmapTotalFixedColumnWidthContext.Provider>
        </RoadmapTableWidthContext.Provider>
      </RoadmapZoomLevelContext.Provider>
    </RoadmapSetZoomLevelContext.Provider>
  )
})
