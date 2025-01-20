import {renderHook} from '@testing-library/react'
import {
  type PluginHook,
  type TableOptions,
  useRowSelect,
  useSortBy,
  useTable,
  type UseTableColumnOptions,
} from 'react-table'

import {getRowId} from '../../../client/components/react_table/get-row-id'
import {orderByFn} from '../../../client/components/react_table/sort/order-by-fn'
import {useCustomGroupBy} from '../../../client/components/react_table/use-custom-group-by'
import {useRanking} from '../../../client/components/react_table/use-ranking'
import {useSortedByGroupOrdering} from '../../../client/components/react_table/use-sorted-by-group-ordering'

/**
 * These plugins are a subset of the plugins used with `ReactTable`, and the
 * order is based on how they require.
 *
 * These are all present to ensure they interop correctly for the various
 * modes that we want to test.
 */
const orderedPlugins = [useSortBy, useCustomGroupBy, useSortedByGroupOrdering, useRanking, useRowSelect]

/**
 *
 * Render a table using the pre-defined set of plugins
 *
 * @param columns column configuration for the table
 * @param data data to render for the table
 * @param options additional table options for react-table
 *
 * For additional examples, check out these modules:
 *
 *  - `data/projects-table.ts`
 *  - `data/users-table.ts`
 */
export function renderTable<T extends object & {id: string | number}>(
  columns: Array<UseTableColumnOptions<T>>,
  data: Array<T>,
  options: Partial<TableOptions<T>>,
  plugins?: Array<PluginHook<any>>,
) {
  return renderHook(() =>
    useTable<T>({columns, data, orderByFn, getRowId, ...options}, ...orderedPlugins, ...(plugins ? plugins : [])),
  )
}
