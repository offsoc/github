import {useCallback, useMemo} from 'react'
import type {
  ActionType,
  Column,
  ColumnInstance,
  Hooks,
  IdType,
  Meta,
  ReducerTableState,
  Row,
  TableInstance,
  TableState,
} from 'react-table'

import {getGroupingMetadataFromServerGroupValue} from '../../features/grouping/get-grouping-metadata'
import type {FieldGrouping, GroupingMetadataWithSource} from '../../features/grouping/types'
import {not_typesafe_nonNullAssertion} from '../../helpers/non-null-assertion'
import {shallowEqual} from '../../helpers/util'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import type {MemexItemModel} from '../../models/memex-item-model'
import {usePaginatedMemexItemsQuery} from '../../state-providers/memex-items/queries/use-paginated-memex-items-query'
import {ensureValidPluginOrder, useCustomGroupByPluginName} from './plugins'
import {applyGroupNameToRowId} from './state-providers/table-columns/grouping'
import type {CustomRowGrouping} from './state-providers/table-columns/types'

export interface UseCustomGroupByTableState<D extends object> {
  /** Array of columns used to group the current table view rows */
  groupByColumnIds: Array<IdType<D>>
  /** Array containing list of collapsed groups */
  collapsedGroups: Array<IdType<D>>
}

type GroupingFunction<D extends object> = (
  rows: Array<Row<D>>,
) => Array<CustomRowGrouping<D>> | Array<GroupingMetadataWithSource>

type GroupValueFunction<D extends object> = (row: Row<D>) => Array<GroupingMetadataWithSource> | undefined

export interface UseCustomGroupByColumnOptions<D extends object> {
  /** Whether or not the column is configured to support group-by. */
  canGroupBy?: boolean

  /**
   * Memoized function that is used to group the rows of the table.
   * This must be provided in order for the column to be considered groupable.
   */
  getGroupedRows?: GroupingFunction<D>

  /**
   * Memoized function that is used to get grouping value for a pariticular row.
   * This must be provided if `getGroupedRows` is provided.
   */
  getGroupValue?: GroupValueFunction<D>
}

export interface UseCustomGroupByColumnProps<_D extends object> {
  /** Set to `true` if the table is currently grouping on this column */
  isGrouped: boolean
  /** Callback to enable/disable grouping on this column */
  toggleGroupBy: () => void
}

export interface UseCustomGroupByInstanceProps<D extends object> {
  /** When grouping is set by the user, this will contain the grouped rows */
  groupedRows?: Array<Row<D>>
  /** Callback to toggle the grouping for a given column */
  toggleGroupBy: (columnId: IdType<D>, value?: boolean) => void
}

export interface UseCustomGroupByRowProps<D extends object> {
  /** Set to `true` if this row is a group and contains sub-rows */
  isGrouped: boolean
  /** The column used to group these rows. Only set when `isGrouped` is `true` */
  groupedColumnId: IdType<D>
  /** The identifier used to group these rows. Only set when `isGrouped` is `true` */
  groupedValue: string
  /** The enriched object that can be used to render details in the group */
  groupedSourceObject: FieldGrouping
  /** A flag to indicate that the group should be rendered as collapsed. Only set when `isGrouped` is `true` */
  isCollapsed: boolean
  /** The rows which match this group. Only set when `isGrouped` is `true` */
  subRows: Array<Row<D>>
  /** The total number of items in this group, which in paginated data may not equal the number of subrows */
  totalCount: number
}

const ActionTypes = {
  RESET_GROUP_BY: 'useCustomGroupBy.RESET_GROUP_BY',
  SET_GROUP_BY: 'useCustomGroupBy.SET_GROUP_BY',
  TOGGLE_GROUP_BY: 'useCustomGroupBy.TOGGLE_GROUP_BY',
} as const
type ActionTypes = ObjectValues<typeof ActionTypes>

type Action<D extends object> = ResetAction | SetAction<D> | ToggleAction<D>

type ResetAction = {
  type: typeof ActionTypes.RESET_GROUP_BY
}

type SetAction<D extends object> = {
  type: typeof ActionTypes.SET_GROUP_BY
  groupedColumnIds: Array<IdType<D>>
}

type ToggleAction<D extends object> = {
  type: typeof ActionTypes.TOGGLE_GROUP_BY
  columnId: IdType<D>
  value: boolean
}
/**
 * A leaner version of the default `useGroupBy` hook that comes with
 * `react-table`, and drops these features:
 *
 *  - aggregation functions
 *  - unnecessary properties attached to columns/rows/cells
 *
 * This hook adds two features related to the default useGroupBy hook to support
 * our usage in the table view:
 *
 *  - `getGroupedRows` returns an array of group results to preserve the order,
 *    instead of an object where the keys map to grouped rows
 *  - grouped columns are shown in their default position, not before other
 *    columns
 *
 * @param hooks react-table hooks to attach behavior to within the plugin
 */
export const useCustomGroupBy = <D extends object>(hooks: Hooks<D>) => {
  hooks.stateReducers.push(reducer)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  hooks.visibleColumnsDeps.push((deps, {instance}) => [...deps, instance.state.groupByColumnIds])
  hooks.visibleColumns.push(visibleColumns)
  hooks.useInstance.push(useInstance)
}

useCustomGroupBy.pluginName = useCustomGroupByPluginName

function reducer<D extends object>(
  state: TableState<D>,
  action: ActionType,
  previousState?: TableState<D>,
  instance?: TableInstance<D>,
) {
  if (!isPluginAction<D>(action)) {
    return state
  }

  switch (action.type) {
    case ActionTypes.RESET_GROUP_BY: {
      const groupBy = (instance && instance.initialState && instance.initialState.groupByColumnIds) || []
      const newState: ReducerTableState<D> = {...state, groupByColumnIds: groupBy}

      if (shallowEqual(state, newState)) {
        return state
      }

      return newState
    }
    case ActionTypes.SET_GROUP_BY: {
      const newState: ReducerTableState<D> = {...state, groupByColumnIds: action.groupedColumnIds}

      if (shallowEqual(state, newState)) {
        return state
      }

      return newState
    }
    case ActionTypes.TOGGLE_GROUP_BY: {
      const {columnId, value: setGroupBy} = action

      const resolvedGroupBy =
        typeof setGroupBy !== 'undefined' ? setGroupBy : !state.groupByColumnIds.includes(columnId)

      if (resolvedGroupBy) {
        return {
          ...state,
          groupByColumnIds: [...state.groupByColumnIds, columnId],
        }
      }

      return {
        ...state,
        groupByColumnIds: state.groupByColumnIds.filter(d => d !== columnId),
      }
    }
  }
}

function visibleColumns<D extends object>(columns: Array<ColumnInstance<D>>, meta: Meta<D>) {
  const groupBy = meta.instance.state.groupByColumnIds || []

  for (const column of columns) {
    column.isGrouped = groupBy.includes(column.id)
  }

  return columns as Array<Column<D>>
}

type GroupedRow<D extends object> = {
  /**
   * The id of the group.
   *
   * This combines the column id and value into a unique hash, separated by a
   * colon. For nested groups a `>` is used to build up a more complex hash.
   *
   * This format is internal to the plugin and may change in the future. Callers
   * should not be relied on for any storage or user-facing presentation.
   */
  id: string
  /** Set to `true` if this row is a group and contains sub-rows */
  isGrouped: boolean
  /** The column used to group these rows. Only set when `isGrouped` is `true` */
  groupedColumnId: IdType<D>
  /** The identifier used to group these rows. Only set when `isGrouped` is `true` */
  groupedValue?: string
  /** The  underlying object associated with this group. Only set when `isGrouped` is `true` */
  groupedSourceObject?: FieldGrouping
  /** The rows which match this group. Only set when `isGrouped` is `true` */
  subRows: Array<GroupedRow<D>> | Array<Row<D>>
  /** The label to display for the group, if one exists */
  groupedLabel?: string | undefined
  /** Whether the group is collapsed */
  isCollapsed: boolean
  /** The total number of items in this group, which in paginated data may not equal the number of subrows */
  totalCount: number
}

function useInstance<D extends object>(instance: TableInstance<D>) {
  const {
    allColumns,
    plugins,
    state: {groupByColumnIds},
    dispatch,
  } = instance

  ensureValidPluginOrder(plugins, useCustomGroupBy.pluginName)

  for (const column of allColumns) {
    if (column.canGroupBy) {
      column.toggleGroupBy = () => instance.toggleGroupBy(column.id)
    }
  }

  const toggleGroupBy = useCallback(
    (columnId: IdType<D>, value: boolean) => {
      dispatch({type: ActionTypes.TOGGLE_GROUP_BY, columnId, value})
    },
    [dispatch],
  )

  const setGroupBy = useCallback(
    (value: Array<IdType<D>>) => {
      dispatch({type: ActionTypes.SET_GROUP_BY, value})
    },
    [dispatch],
  )

  const {groupedRowsList, flatRowsList, rowsByIdHash} = useGroupByRowData(instance)

  Object.assign(instance, {
    // grouped rows are only ever present when grouped, and should be checked
    // first within the application
    groupedRows: groupByColumnIds.length > 0 ? groupedRowsList : undefined,
    // for compatibility with other plugins that do not know about grouped rows,
    // this will always be populated with an array of rows to ensure the default
    // plugins works as expected
    //
    // mutating these rows will apply changes to the `groupedRows` values
    rows: flatRowsList,
    flatRows: flatRowsList,
    rowsById: rowsByIdHash,
    toggleGroupBy,
    setGroupBy,
  })
}

const actionTypeValues: Array<string> = Object.values(ActionTypes)

function isPluginAction<D extends object>(action: ActionType): action is Action<D> {
  return actionTypeValues.includes(action.type)
}

function useGroupByRowData<D extends object>(instance: TableInstance<D>) {
  const {memex_table_without_limits} = useEnabledFeatures()
  if (memex_table_without_limits) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useGroupByRowDataForPaginatedData(instance)
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useGroupByRowDataForUnpaginatedData(instance)
  }
}

function useGroupByRowDataForPaginatedData<D extends object>(instance: TableInstance<D>) {
  const {
    rows: tableRows,
    flatRows: tableFlatRows,
    rowsById: tableRowsById,
    state: {groupByColumnIds, collapsedGroups},
    allColumns,
  } = instance

  const {data: paginatedData, groupedItemQueries, groupsById} = usePaginatedMemexItemsQuery()

  return useMemo(() => {
    // If we don't have any groupByColumnIds in our table state, then we should not attempt to
    // group the data and just return early
    if (!groupByColumnIds.length || !paginatedData) {
      return {groupedRowsList: tableRows, flatRowsList: tableFlatRows, rowsByIdHash: tableRowsById}
    }

    // Ensure that the list of filtered columns exist
    const columnId = not_typesafe_nonNullAssertion(groupByColumnIds.find(g => allColumns.find(col => col.id === g)))

    // resolve the column and related group by function
    const column = allColumns.find(c => c.id === columnId)
    if (!column) {
      throw new Error(`Column with id ${columnId} is used for grouping but could not be found`)
    }

    const columnModel = column.columnModel

    if (!columnModel) {
      throw new Error(`Column with id ${columnId} is used for grouping but does not have a valid model`)
    }

    // We'll build these two hashes up as we iterate through the queries and their items.
    // We have `flatRowsList` and `rowsByIdHash` from the table instance;
    // however, the ids for these rows _do not_ have the group name applied to them.
    // Therefore we need to build up a new hash of rows with the group name applied.
    // Additionally, we need to build up a hash of rows by their old id, so that we can
    // easily rebuild the tableRows array later.
    const rowsByIdHash: Record<string, Row<D>> = {}
    const rowsByOldIdHash: Record<string, Row<D>> = {}

    const groupedRows = Object.entries(groupedItemQueries)
      .map(([groupId, queries]) => {
        const group = groupsById[groupId]
        if (!group) {
          // There isn't a known scenario where this should be the case - the
          // groupedItemQueries and groupsById should be updated in lock step
          // so we should always be able to look up a group by its groupId.
          // However, if we do encounter a scenario where we're unable to find the group
          // we will just return undefined here and then filter out the null values
          // after we've mapped over all of the entries.
          return undefined
        }
        const {groupValue, groupMetadata, totalCount} = group
        const items = queries.reduce((all, curr) => {
          all.push(...(curr?.data?.nodes || []))
          return all
        }, [] as Array<MemexItemModel>)

        const id = `${columnId}:${groupId}`
        // In order to get a distinct id for rows that may appear in multiple groups,
        // e.g. when we're grouped by Assignee
        // we want to apply the group name to the row id, to ensure that the row id will be unique

        const subRows = items.map(item => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const newRow = applyGroupNameToRowId(tableRowsById[item.id]!, id)
          rowsByIdHash[newRow.id] = newRow
          rowsByOldIdHash[item.id] = newRow
          return newRow
        })

        const sourceObject = getGroupingMetadataFromServerGroupValue(columnModel, groupValue, groupMetadata)

        const row: GroupedRow<D> = {
          id,
          isGrouped: true,
          groupedColumnId: columnId,
          groupedValue: groupId,
          groupedSourceObject: sourceObject,
          subRows,
          totalCount: totalCount?.value || 0,
          isCollapsed: collapsedGroups.indexOf(groupId) > -1,
        }
        return row
      })
      .filter((gr): gr is GroupedRow<D> => !!gr)

    const flatRowsList = tableFlatRows.map(row => rowsByOldIdHash[row.id]).filter((r): r is Row<D> => !!r)

    return {
      groupedRowsList: groupedRows,
      flatRowsList,
      rowsByIdHash,
    }
  }, [
    groupByColumnIds,
    paginatedData,
    allColumns,
    groupedItemQueries,
    tableFlatRows,
    tableRows,
    tableRowsById,
    groupsById,
    collapsedGroups,
  ])
}

function useGroupByRowDataForUnpaginatedData<D extends object>(instance: TableInstance<D>) {
  const {
    rows: tableRows,
    flatRows: tableFlatRows,
    rowsById: tableRowsById,
    allColumns,
    state: {groupByColumnIds, collapsedGroups},
  } = instance

  return useMemo(() => {
    // If we don't have any groupByColumnIds in our table state, then we should not attempt to
    // group the data and just return early
    if (!groupByColumnIds.length) {
      return {groupedRowsList: tableRows, flatRowsList: tableFlatRows, rowsByIdHash: tableRowsById}
    }

    // Ensure that the list of filtered columns exist
    const existingGroupBy = groupByColumnIds.filter(g => allColumns.find(col => col.id === g))

    const processedFlatRows: Array<Row<D>> = []
    const processedRowsById: {[id: Row<D>['id']]: Row<D>} = {}

    // Recursively group the data
    const groupedRows = groupUpRecursively(
      existingGroupBy,
      processedFlatRows,
      processedRowsById,
      allColumns,
      collapsedGroups,
      tableRows,
    )

    return {groupedRowsList: groupedRows, flatRowsList: processedFlatRows, rowsByIdHash: processedRowsById}
  }, [groupByColumnIds, tableRows, tableFlatRows, tableRowsById, allColumns, collapsedGroups])
}

function groupUpRecursively<D extends object>(
  existingGroupBy: Array<IdType<D>>,
  processedFlatRows: Array<Row<D>>,
  processedRowsById: {[id: Row<D>['id']]: Row<D>},
  allColumns: Array<ColumnInstance<D>>,
  collapsedGroups: Array<IdType<D>>,
  rows: Array<Row<D>>,
  depth = 0,
  parentId?: IdType<D>,
) {
  // If this is the last level
  if (depth === existingGroupBy.length) {
    // add rows to flatRow aggregates
    for (const row of rows) {
      processedFlatRows.push(row)
      processedRowsById[row.id] = row
    }
    // and return the rows
    return rows
  }

  const columnId = not_typesafe_nonNullAssertion(existingGroupBy[depth])

  // resolve the column and related group by function
  const column = allColumns.find(c => c.id === columnId)
  if (!column) {
    throw new Error(`Column with id ${columnId} is used for grouping but could not be found`)
  }

  if (!column.getGroupedRows) {
    throw new Error(`Column with id ${columnId} is used for grouping but does not have a valid grouping function`)
  }
  if (!column.columnModel) {
    throw new Error(`Column with id ${columnId} is used for grouping but does not have a valid model`)
  }

  // Group the rows together for this level
  // When the memex_table_without_limits FF is disabled, this will always
  // be an Array<CustomRowGrouping<D>>
  const rowGroupsArray = column.getGroupedRows(rows) as Array<CustomRowGrouping<D>>

  // Recursively group each sub-group of this level if necessary.
  const recursivelyGroupedRows = rowGroupsArray.map(({value, sourceObject, rows: rowsList}) => {
    let id = `${columnId}:${value}`
    id = parentId ? `${parentId}>${id}` : id

    const subRows = groupUpRecursively(
      existingGroupBy,
      processedFlatRows,
      processedRowsById,
      allColumns,
      collapsedGroups,
      rowsList,
      depth + 1,
      id,
    )

    const row: GroupedRow<D> = {
      id,
      isGrouped: true,
      groupedColumnId: columnId,
      groupedValue: value,
      groupedSourceObject: sourceObject,
      subRows,
      // this method is used exclusively for unpaginated data, so we can confidently use the length of the subRows
      totalCount: subRows.length,
      isCollapsed: collapsedGroups.indexOf(value) > -1,
    }

    return row
  })

  return recursivelyGroupedRows
}
