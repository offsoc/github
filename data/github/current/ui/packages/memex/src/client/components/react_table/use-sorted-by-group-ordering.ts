import {useMemo} from 'react'
import type {Hooks, SortingRule, TableInstance} from 'react-table'

import {ensureValidPluginOrder, useSortedByGroupOrderingPluginName} from './plugins'

/**
 * A plugin that reorders the groupedRows in a grouped table if the
 * table is descendingly sorted on the same column that is grouped,
 * ensuring proper flatRow ordering is maintained
 */
export function useSortedByGroupOrdering<D extends object>(hooks: Hooks<D>) {
  hooks.useInstance.push(useInstance)
}

export interface UseSortedByGroupOrderingState<D extends object> {
  sortBy: Array<SortingRule<D>>
}

useSortedByGroupOrdering.pluginName = useSortedByGroupOrderingPluginName

function useInstance<D extends object>(instance: TableInstance<D>) {
  const {
    rows,
    flatRows,
    groupedRows,
    state: {sortBy, groupByColumnIds},
    plugins,
  } = instance

  ensureValidPluginOrder(plugins, useSortedByGroupOrdering.pluginName)

  const [groupSortedRows, groupSortedFlatRows] = useMemo(() => {
    if (!groupedRows) {
      return [rows, flatRows]
    }
    const sortByColumnId = sortBy[0] && sortBy[0].id
    const sortByDirection = sortBy[0] && sortBy[0].desc ? 'desc' : 'asc'
    const groupByColumnId = groupByColumnIds[0]

    const reverseGroups =
      sortByColumnId && groupByColumnId && sortByColumnId === groupByColumnId && sortByDirection === 'desc'

    const groupedAndSortedRows = reverseGroups ? groupedRows.slice().reverse() : groupedRows
    const groupedAndSortedFlatRows = reverseGroups ? groupedAndSortedRows.map(row => [...row.subRows]).flat() : flatRows

    return [groupedAndSortedRows, groupedAndSortedFlatRows] as const
  }, [flatRows, groupByColumnIds, groupedRows, rows, sortBy])

  Object.assign(instance, {
    rows: groupSortedFlatRows,
    flatRows: groupSortedFlatRows,
    groupedRows: groupedRows ? groupSortedRows : undefined,
  })
}
