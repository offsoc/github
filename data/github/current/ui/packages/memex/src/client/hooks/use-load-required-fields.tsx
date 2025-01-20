import {useCallback, useEffect, useMemo, useState} from 'react'

import {apiGetColumns} from '../api/columns/api-get-columns'
import {type MemexProjectColumnId, SystemColumnId} from '../api/columns/contracts/memex-column'
import {ViewTypeParam} from '../api/view/contracts'
import {
  isNegatedFilter,
  isValuePresenceFilter,
  parseFullTextQuery,
} from '../components/filter-bar/helpers/search-filter'
import useToasts, {ToastType} from '../components/toasts/use-toasts'
import {isRoadmapColumnValueId, isRoadmapLayoutSettingsWithDateColumns} from '../helpers/roadmap-helpers'
import {filterFalseyValues} from '../helpers/util'
import {ViewType} from '../helpers/view-type'
import type {ChartState} from '../state-providers/charts/use-charts'
import {useFindColumnByDatabaseId} from '../state-providers/columns/use-find-column-by-database-id'
import {useHasColumnData} from '../state-providers/columns/use-has-column-data'
import {useUpdateColumnValues} from '../state-providers/memex-items/use-update-column-values'
import {useApiRequest} from './use-api-request'
import {useEnabledFeatures} from './use-enabled-features'
import {useFindFilterableFieldByName} from './use-find-filterable-field-by-name'
import type {CurrentView, ViewState} from './use-view-state-reducer/types'

const FIELDS_REQUIRED_FOR_ALL_VIEWS: Array<MemexProjectColumnId> = [SystemColumnId.Repository]

const FIELDS_REQUIRED_FOR_CARDS: Array<MemexProjectColumnId> = [
  SystemColumnId.Title,
  SystemColumnId.Assignees,
  SystemColumnId.Status,
  ...FIELDS_REQUIRED_FOR_ALL_VIEWS,
]

const FIELDS_REQUIRED_FOR_TABLES: Array<MemexProjectColumnId> = [...FIELDS_REQUIRED_FOR_ALL_VIEWS]

const defaultMissingFieldIds: Array<MemexProjectColumnId> = []

export function useLoadMissingFieldsById() {
  const {findMissingColumnIds} = useFindMissingColumnIds()
  const {loadColumnsWithItemColumnValues} = useLoadColumnsWithItemColumnValues()

  const [missingFieldIds, setMissingFieldIds] = useState(defaultMissingFieldIds)

  const addPotentiallyMissingFieldIds = useCallback(
    (potentiallyMissingFieldIds: Array<MemexProjectColumnId>) => {
      const incomingMissingFieldIds = findMissingColumnIds(potentiallyMissingFieldIds)
      setMissingFieldIds(currentMissingColumnIds => {
        const newItemsNotInCurrent = incomingMissingFieldIds.filter(x => !currentMissingColumnIds.includes(x))
        if (newItemsNotInCurrent.length === 0) return currentMissingColumnIds
        return [...new Set([...currentMissingColumnIds, ...incomingMissingFieldIds])]
      })
    },
    [findMissingColumnIds],
  )

  const request = useCallback(
    async (columnIdsMissing: Array<MemexProjectColumnId>) => {
      await loadColumnsWithItemColumnValues(columnIdsMissing)

      setMissingFieldIds(defaultMissingFieldIds)
    },
    [loadColumnsWithItemColumnValues],
  )

  const {perform: loadColumnsData} = useApiRequest({request})

  useEffect(() => {
    if (missingFieldIds.length > 0) {
      loadColumnsData(missingFieldIds)
    } else {
      setMissingFieldIds(defaultMissingFieldIds)
    }
  }, [missingFieldIds, findMissingColumnIds, loadColumnsData])

  return {missingFieldIds, addPotentiallyMissingFieldIds}
}
/**
 * A hook that returns an object with a `getFieldIdsFromFilter` that,
 * when passed a filter, parses that filter and returns the Set of
 * field ids that are required by that filter
 *
 * @returns A set of field ids based on the filter provided
 */
export function useGetFieldIdsFromFilter() {
  const {findFilterableFieldByName} = useFindFilterableFieldByName()

  const getFieldIdsFromFilter = useCallback(
    function getFieldIdsFromFilter(filter: string) {
      const fieldIdsContainedInFilter = new Set<number | SystemColumnId>()
      const {fieldFilters} = parseFullTextQuery(filter)

      const addToFieldsToLoadByName = (fieldName: string) => {
        const field = findFilterableFieldByName(fieldName)
        if (field) {
          fieldIdsContainedInFilter.add(field.id)
        }
      }

      for (const fieldFilter of fieldFilters) {
        let fieldName = fieldFilter[0]
        const fieldValues = fieldFilter[1]

        /**
         * strip `-` filter if it exists
         */
        if (isNegatedFilter(fieldName)) {
          fieldName = fieldName.slice(1)
        }

        /**
         * If a `no:` or `has:` type field filter, add each of the values
         * otherwise, add the field name
         */
        if (isValuePresenceFilter(fieldName)) {
          for (const fieldValue of fieldValues) {
            addToFieldsToLoadByName(fieldValue)
          }
        } else {
          addToFieldsToLoadByName(fieldName)
        }
      }

      return fieldIdsContainedInFilter
    },
    [findFilterableFieldByName],
  )

  return {getFieldIdsFromFilter}
}
/**
 * Ensure that the proper data is loaded for the current view.
 *
 * This ensures that, for example, if a view has "Issues" visible and uses the
 * board layout, we load the "Assignees" data (required for boards) and the
 * "Issues" data if they're not already loaded, as well as any fields which may
 * be filtered upon using a columnFilter search
 *
 * @param opts Options to dictate what view data is loaded
 */
const useLoadVisibleFieldsForView = (currentView: CurrentView | undefined) => {
  const {findMissingColumnIds} = useFindMissingColumnIds()
  const {getFieldIdsFromFilter} = useGetFieldIdsFromFilter()
  const {missingFieldIds, addPotentiallyMissingFieldIds} = useLoadMissingFieldsById()

  useEffect(() => {
    if (!currentView) return

    const missingColumnIds = findMissingColumnIds(extractFieldIdsFromView(currentView, getFieldIdsFromFilter))
    addPotentiallyMissingFieldIds(missingColumnIds)
  }, [addPotentiallyMissingFieldIds, currentView, findMissingColumnIds, getFieldIdsFromFilter])

  return missingFieldIds
}

function extractFieldIdsFromView(
  currentView: NonNullable<CurrentView>,
  getFieldIdsFromFilter: (filter: string) => Set<number | SystemColumnId>,
) {
  const {
    localViewStateDeserialized: {
      visibleFields,
      viewType,
      filter,
      verticalGroupByColumns,
      horizontalGroupByColumns,
      aggregationSettings,
      sortByColumnsAndDirections,
      sliceBy,
    },
  } = currentView

  /**
   * Collect the fields necessary to display the view
   */
  const fieldsToLoad = new Set(
    visibleFields
      .map(col => col.id)
      .concat(viewType !== ViewType.Table ? FIELDS_REQUIRED_FOR_CARDS : FIELDS_REQUIRED_FOR_TABLES),
  )

  for (const groupByColumn of verticalGroupByColumns) {
    if (groupByColumn.id !== SystemColumnId.Status) fieldsToLoad.add(groupByColumn.id)
  }

  for (const groupByColumn of horizontalGroupByColumns) {
    fieldsToLoad.add(groupByColumn.id)
  }

  for (const aggregateField of aggregationSettings.sum) {
    fieldsToLoad.add(aggregateField.id)
  }

  for (const sortByColumn of sortByColumnsAndDirections) {
    fieldsToLoad.add(sortByColumn.column.id)
  }

  if (sliceBy.field?.id) {
    fieldsToLoad.add(sliceBy.field.id)
    if (sliceBy.field.id === SystemColumnId.TrackedBy) {
      fieldsToLoad.add(SystemColumnId.Tracks)
    }
  }

  const fieldIdsFromSlicerFilter = sliceBy.filter ? getFieldIdsFromFilter(sliceBy.filter) : []
  const fieldIdsFromFilter = getFieldIdsFromFilter(filter)
  return Array.from(new Set([...fieldsToLoad, ...fieldIdsFromFilter, ...fieldIdsFromSlicerFilter]))
}

/**
 * A hook that preloads columns that are required in some view (ie: grouped or sorted by)
 */
export function useLoadRequiredFieldsForViewsAndCurrentView(views: ViewState['views'], currentView?: CurrentView) {
  const {findMissingColumnIds} = useFindMissingColumnIds()
  const {findColumnByDatabaseId} = useFindColumnByDatabaseId()
  const {loadColumnsWithItemColumnValues} = useLoadColumnsWithItemColumnValues()

  const {perform: loadGroupedAndSortedByFields} = useApiRequest({request: loadColumnsWithItemColumnValues})

  /**
   * Preload fields used in sort by or grouped by across all views
   */
  useEffect(() => {
    const columnIds = new Set(
      Object.values(views)
        .map(view => {
          const requiredIds = [
            ...(view.localViewState.verticalGroupBy || []),
            ...view.localViewState.groupBy,
            ...view.localViewState.sortBy.map(s => s[0]),
          ]
          if (
            view.localViewState.layout === ViewTypeParam.Roadmap &&
            isRoadmapLayoutSettingsWithDateColumns(view.localViewState.layoutSettings.roadmap)
          ) {
            requiredIds.push(...view.localViewState.layoutSettings.roadmap.dateFields.filter(isRoadmapColumnValueId))
          }
          return requiredIds
        })
        .flat(),
    )
    const missingColumnColumnIds = filterFalseyValues([...columnIds].map(id => findColumnByDatabaseId(id)?.id))
    const unloadedColumns = findMissingColumnIds(missingColumnColumnIds)

    if (unloadedColumns.length === 0) return

    loadGroupedAndSortedByFields(unloadedColumns)
  }, [findColumnByDatabaseId, findMissingColumnIds, loadGroupedAndSortedByFields, views])

  /**
   * Load visible fields for the current view, returning the ids of the missing fields
   */
  return useLoadVisibleFieldsForView(currentView)
}

type FindMissingColumnIdsHookReturnType = {
  /**
   * Calculates which columns we do not have column value data for based on a list of ids that are required
   * @param requiredColumnIds A list of ids that we know we want data for - will be checked against loaded columns state
   */
  findMissingColumnIds: (requiredColumnIds: Array<MemexProjectColumnId>) => Array<MemexProjectColumnId>
}

export const useFindMissingColumnIds = (): FindMissingColumnIdsHookReturnType => {
  const {hasColumnData} = useHasColumnData()
  const findMissingColumnIds = useCallback(
    (requiredColumnIds: Array<MemexProjectColumnId>) => {
      // make sure status column is always added to required columns
      const idsWithStatusColumn = [...new Set(requiredColumnIds).add(SystemColumnId.Status)]
      return idsWithStatusColumn.filter(columnId => !hasColumnData(columnId))
    },
    [hasColumnData],
  )

  return {findMissingColumnIds}
}

type LoadColumnsWithItemColumnValues = {
  /**
   * Makes a request to server to get column data for a list of column ids and updates those values in the memex item store
   * @param columnIds A list of ids to send to the server and retrieve data for
   */
  loadColumnsWithItemColumnValues: (columnIds: Array<MemexProjectColumnId>) => Promise<void>
}

export const useLoadColumnsWithItemColumnValues = (): LoadColumnsWithItemColumnValues => {
  const {updateAllColumnValues} = useUpdateColumnValues()
  const {addToast} = useToasts()
  const {memex_table_without_limits, memex_mwl_limited_field_ids} = useEnabledFeatures()

  const loadColumnsWithItemColumnValues = useCallback(
    async (columnIds: Array<MemexProjectColumnId>) => {
      // We use the /paginated_items API to load additional columns
      // when the memex_mwl_limited_field_ids feature flag is enabled
      if (memex_table_without_limits && memex_mwl_limited_field_ids) return

      if (columnIds.length === 0) return
      const errorMessages: Array<string> = []

      await Promise.allSettled(
        columnIds.map(async id => {
          const response = await apiGetColumns({memexProjectColumnIds: [id]})
          for (const columnWithItems of response.memexProjectColumns) {
            updateAllColumnValues(columnWithItems)
            const partialFailure = columnWithItems.partialFailures
            if (partialFailure) {
              errorMessages.push(partialFailure.message)
            }
          }
        }),
      )

      if (errorMessages && errorMessages.length > 0) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          message: errorMessages.join(', '),
          type: ToastType.warning,
          keepAlive: true,
        })
      }
    },
    [addToast, memex_mwl_limited_field_ids, memex_table_without_limits, updateAllColumnValues],
  )

  return {loadColumnsWithItemColumnValues}
}

/**
 * A hook that lazily loads all fields necessary for displaying a chart
 * based on the current _local_ chart state
 * @param chart
 * @returns
 */
export function useLoadRequiredFieldsForChartConfiguration(
  chartConfiguration: ChartState['localVersion']['configuration'],
) {
  const {getFieldIdsFromFilter} = useGetFieldIdsFromFilter()
  const {missingFieldIds, addPotentiallyMissingFieldIds} = useLoadMissingFieldsById()
  const {findColumnByDatabaseId} = useFindColumnByDatabaseId()
  const [isValid, setIsValid] = useState(true)

  useEffect(() => {
    const requiredFieldIds = getFieldIdsFromFilter(chartConfiguration.filter)
    const invalidFieldIds = new Set<number>()

    if (typeof chartConfiguration.xAxis.dataSource.column === 'number') {
      const columnId = chartConfiguration.xAxis.dataSource.column
      const column = findColumnByDatabaseId(columnId)
      if (column) {
        requiredFieldIds.add(column.id)
      } else {
        invalidFieldIds.add(columnId)
      }
    }

    if (chartConfiguration.xAxis.groupBy) {
      const columnId = chartConfiguration.xAxis.groupBy.column
      const column = findColumnByDatabaseId(columnId)
      if (column) {
        requiredFieldIds.add(column.id)
      } else {
        invalidFieldIds.add(columnId)
      }
    }

    if (chartConfiguration.yAxis.aggregate.columns) {
      for (const columnId of chartConfiguration.yAxis.aggregate.columns) {
        const column = findColumnByDatabaseId(columnId)
        if (column) {
          requiredFieldIds.add(column.id)
        } else {
          invalidFieldIds.add(columnId)
        }
      }
    }

    setIsValid(invalidFieldIds.size === 0)

    if (isValid && requiredFieldIds.size > 0) {
      addPotentiallyMissingFieldIds([...requiredFieldIds])
    }
  }, [
    addPotentiallyMissingFieldIds,
    chartConfiguration.filter,
    chartConfiguration.xAxis.dataSource.column,
    chartConfiguration.xAxis.groupBy,
    chartConfiguration.yAxis.aggregate.columns,
    findColumnByDatabaseId,
    getFieldIdsFromFilter,
    setIsValid,
    isValid,
  ])

  return useMemo(
    () => ({
      isLoading: missingFieldIds.length > 0,
      isValid,
      missingFieldIds,
    }),
    [missingFieldIds, isValid],
  )
}
