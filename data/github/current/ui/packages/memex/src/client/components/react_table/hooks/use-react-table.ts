import {useMemo} from 'react'
import {
  type PluginHook,
  useBlockLayout,
  useColumnOrder,
  useResizeColumns,
  useRowSelect,
  useSortBy,
  useTable,
} from 'react-table'

import {useFilteredItems} from '../../../features/filtering/hooks/use-filtered-items'
import {useHorizontalGroupedBy} from '../../../features/grouping/hooks/use-horizontal-grouped-by'
import {useSortedItems} from '../../../features/sorting/hooks/use-sorted-items'
import {useEnabledFeatures} from '../../../hooks/use-enabled-features'
import {useSortedBy} from '../../../hooks/use-sorted-by'
import type {ColumnModel} from '../../../models/column-model'
import {useMemexItems} from '../../../state-providers/memex-items/use-memex-items'
import {useSearch} from '../../filter-bar/search-context'
import {RowDragHandleColumnId} from '../column-ids'
import {getRowId} from '../get-row-id'
import {orderByFn} from '../sort/order-by-fn'
import {useTableColumns} from '../state-providers/table-columns/use-table-columns'
import type {TableDataType} from '../table-data-type'
import {useColumnReordering} from '../use-column-reordering'
import {useCustomGroupBy} from '../use-custom-group-by'
import {useDeselectAllRows} from '../use-deselect-all-rows'
import {usePersistColumnResize} from '../use-persist-column-resize'
import {usePreventColumnAutoResize} from '../use-prevent-column-auto-resize'
import {useRanking} from '../use-ranking'
import {useRowDragHandle} from '../use-row-drag-handle'
import {useRowMenuShortcut} from '../use-row-menu-shortcut'
import {useSortedByGroupOrdering} from '../use-sorted-by-group-ordering'

type TableProps = {
  fields: ReadonlyArray<ColumnModel>
  plugins: Array<PluginHook<TableDataType>>
}

export function useReactTable({fields, plugins}: TableProps) {
  const {sorts} = useSortedBy()
  const {groupedByColumnId, collapsedGroups} = useHorizontalGroupedBy()

  const {columnDefinitions, hiddenColumns} = useTableColumns()

  const sortBy = useMemo(
    () => sorts.map(sort => ({id: sort.column.id.toString(), desc: sort.direction === 'desc'})),
    [sorts],
  )

  const groupBy = useMemo(() => (groupedByColumnId ? [`${groupedByColumnId}`] : []), [groupedByColumnId])

  /**
   * Must apply this here instead of in the useRowDragDrop hook to ensure it applies on the final set of fields
   * and not before we override the useControlledState hook.
   */
  const columnOrder = useMemo(() => {
    return [RowDragHandleColumnId, ...fields.map(field => field.id.toString())]
  }, [fields])

  const tablePlugins: Array<PluginHook<TableDataType>> = [
    useBlockLayout,
    useColumnOrder,
    useSortBy,
    useCustomGroupBy,
    useSortedByGroupOrdering,
    useRanking,
    useColumnReordering,
    useRowMenuShortcut,
    useRowDragHandle,
    usePreventColumnAutoResize,
    useResizeColumns,
    usePersistColumnResize,
    useRowSelect,
    useDeselectAllRows,
    ...plugins,
  ]

  const {query} = useSearch()

  const data = useReactTableData()

  const table = useTable<TableDataType>(
    {
      columns: columnDefinitions,
      data,
      orderByFn,
      getRowId,
      initialState: {
        hiddenColumns,
        sortBy,
        groupByColumnIds: groupBy,
        collapsedGroups,
        columnOrder,
      },
      manualSortBy: true,
      autoResetHiddenColumns: false,
      autoResetSelectedRows: false,
      autoResetResize: true,
      /**
       * These allow us to control react-table's internal state based
       * on outer scope state, without having to manually
       * call table[setXXXX|dispatch]. This also occurs in the
       * initial rendering phase instead of causing an effect to reset
       * state slices
       *
       * This must be memoized deeply, to avoid excessively
       * causing object.is checks to fail, and requires merging the
       * current state with the overrides
       */
      useControlledState(state) {
        return useMemo(() => {
          return {
            ...state,
            sortBy,
            groupByColumnIds: groupBy,
            collapsedGroups,
            hiddenColumns,
            columnOrder,
          }
          /**
           * because of how this is scoped inside another 'hook',
           * react-hooks-eslint plugin has a hard time understanding its
           * dependencies.
           */
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [state, columnOrder, sortBy, query, groupBy, hiddenColumns, collapsedGroups])
      },
    },
    ...tablePlugins,
  )

  return table
}

function useReactTableData() {
  const {memex_table_without_limits} = useEnabledFeatures()
  if (memex_table_without_limits) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useReactTableDataForPaginatedData()
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useReactTableDataForUnpaginatedData()
  }
}

function useReactTableDataForPaginatedData() {
  const {items} = useMemexItems()

  // Soon this is where we will prepare the data for grouping if applicable
  return useMemo(() => items, [items])
}

function useReactTableDataForUnpaginatedData() {
  const {filteredItems} = useFilteredItems()
  const {sortUngroupedItems} = useSortedItems()
  return useMemo(() => sortUngroupedItems(filteredItems), [filteredItems, sortUngroupedItems])
}
