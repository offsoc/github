import {createContext, memo, useMemo} from 'react'
import type {SortByFn, UseTableColumnOptions} from 'react-table'

import type {EnabledFeaturesMap} from '../../../../api/enabled-features/contracts'
import {isValidHorizontalGroupByColumn} from '../../../../features/grouping/utils'
import {resolveSortFunction} from '../../../../features/sorting/resolver'
import {useEnabledFeatures} from '../../../../hooks/use-enabled-features'
import type {ColumnModel} from '../../../../models/column-model'
import {useAllColumns} from '../../../../state-providers/columns/use-all-columns'
import {useColumnWidth} from '../../../../state-providers/columns/use-column-width'
import {getColumnBehaviors} from '../../column-behaviors'
import type {TableDataType} from '../../table-data-type'
import {buildGetGroupedRowsFunction, buildGetGroupValueFunction} from './grouping'
import type {ReactTableColumnBehavior} from './types'

type TableColumns = {
  /** Column definitions for use with react-table */
  columnDefinitions: Array<UseTableColumnOptions<TableDataType>>

  /** Array of columns that should be hidden from the user */
  hiddenColumns: Array<string>
}

export const TableColumnsContext = createContext<TableColumns | null>(null)

export const TableColumnsProvider = memo<{
  children: React.ReactNode
  isFieldVisible: (column: ColumnModel) => boolean
}>(function TableColumnsProvider({isFieldVisible, children}) {
  const {allColumns} = useAllColumns()
  const {memex_group_by_multi_value_changes} = useEnabledFeatures()
  const {getWidth} = useColumnWidth()

  const columnDefinitions: Array<UseTableColumnOptions<TableDataType>> = useMemo(() => {
    return allColumns.map(column => build(column, {memex_group_by_multi_value_changes}, getWidth(column.id)))
  }, [allColumns, memex_group_by_multi_value_changes, getWidth])

  // For the roadmap view, "visible fields" do not currently control the columns shown in the view.
  const hiddenColumns = useMemo(() => {
    return allColumns.filter(col => !isFieldVisible(col)).map(col => `${col.id}`)
  }, [allColumns, isFieldVisible])

  const contextValue = useMemo(() => {
    return {columnDefinitions, hiddenColumns}
  }, [columnDefinitions, hiddenColumns])

  return <TableColumnsContext.Provider value={contextValue}>{children}</TableColumnsContext.Provider>
})

type TableSettingsFeatureFlags = Pick<EnabledFeaturesMap, 'memex_group_by_multi_value_changes'>

/** Lookup and create the column definition for use in react-table */
export function build(
  column: ColumnModel,
  flags: TableSettingsFeatureFlags = {memex_group_by_multi_value_changes: false},
  width: number | undefined,
): UseTableColumnOptions<TableDataType> {
  const definition = getColumnBehaviors(column, {
    useDistinctAssigneesGrouping: flags.memex_group_by_multi_value_changes,
  })
  return buildWith(column, definition, width)
}

/**
 * Combine the column behaviour with the column model to generate the column
 * behavior for react-table
 */
function buildWith(
  column: ColumnModel,
  definition: ReactTableColumnBehavior,
  width: number | undefined,
): UseTableColumnOptions<TableDataType> {
  const {groupingConfiguration, ...columnBehavior} = definition

  const sortFunction = resolveSortFunction(column)

  const wrappedSortFn: SortByFn<TableDataType> = (rowA, rowB, sortColumnId, desc) => {
    // as the order of groups is handled elsewhere, ignore sorting grouped rows for now
    if (rowA.isGrouped && rowB.isGrouped) {
      return 0
    }

    // stable sorting by id is disabled so that the orderByFn which calls
    // this function can sort by the ranking of the rows if the values are equal
    return sortFunction(rowA.original, rowB.original, desc, true)
  }

  const groupByOptions = groupingConfiguration
    ? {
        canGroupBy: isValidHorizontalGroupByColumn(column),
        getGroupedRows: buildGetGroupedRowsFunction(column, groupingConfiguration),
        getGroupValue: buildGetGroupValueFunction(column, groupingConfiguration),
      }
    : {
        canGroupBy: false,
      }

  return {
    canSort: true,
    sortType: wrappedSortFn,
    Header: column.name,
    id: column.id.toString(),
    minWidth: 75,
    width,
    columnModel: column,
    ...groupByOptions,
    ...columnBehavior,
  }
}
