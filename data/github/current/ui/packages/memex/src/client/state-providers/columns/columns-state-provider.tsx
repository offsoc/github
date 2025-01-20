import {createContext, memo, type MutableRefObject, useCallback, useMemo, useRef, useState} from 'react'

import type {CreateIterationConfiguration} from '../../api/columns/contracts/api'
import type {CustomColumnKind} from '../../api/columns/contracts/domain'
import {
  type MemexColumn,
  type MemexColumnDataType,
  type MemexProjectColumnId,
  SystemColumnId,
} from '../../api/columns/contracts/memex-column'
import type {NewOptions} from '../../api/columns/contracts/single-select'
import type {MemexItem} from '../../api/memex-items/contracts'
import type {PaginatedMemexItemsData} from '../../api/memex-items/paginated-views'
import {getEnabledFeatures} from '../../helpers/feature-flags'
import {fetchJSONIslandData} from '../../helpers/json-island'
import {useLazyRef} from '../../hooks/common/use-lazy-ref'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {type ColumnModel, createColumnModel} from '../../models/column-model'
import {buildInitialItemsAndColumns} from '../memex-items/memex-items-data'

/**
 * Currently only single select and iteration columns are allowed to send their settings hash.
 *
 * If you find yourself in a situation where a column type now needs to send
 * settings, update this definition and ensure the backend works the same.
 */
type ColumnOptions =
  | {
      type: typeof MemexColumnDataType.SingleSelect
      settings: {options?: NewOptions}
    }
  | {
      type: typeof MemexColumnDataType.Iteration
      settings: {configuration: CreateIterationConfiguration}
    }
  | {
      type: Exclude<CustomColumnKind, typeof MemexColumnDataType.SingleSelect | typeof MemexColumnDataType.Iteration>
      settings: undefined
    }

export type AddColumnRequest = {
  name: string
} & ColumnOptions

export type ColumnsContextType = {
  /** A list of field names defined on the server that are not allowed to be used */
  reservedColumnNames: Array<string>

  /**
   * Updates the state tracking the list of columns for the project.
   * @param newColumnModels The full set of new columns
   */
  setAllColumns: (newColumnModels: Array<ColumnModel>) => void

  /** A list of columns for the project */
  allColumns: Array<ColumnModel>

  /** A ref to the list of all columns for the project. */
  allColumnsRef: Readonly<MutableRefObject<Readonly<Array<ColumnModel>>>>

  /**
   * Updates the state tracking the list of loaded fields for the project
   * @param columnId The id of the new field to add
   */
  addLoadedFieldId: (columnId: MemexProjectColumnId) => void

  /** A ref to the set of all loaded fields for the current view of the project */
  loadedFieldIdsRef: Readonly<MutableRefObject<Readonly<Set<MemexProjectColumnId>>>>
}

export type ColumnsStableContextType = Pick<
  ColumnsContextType,
  'setAllColumns' | 'allColumnsRef' | 'addLoadedFieldId' | 'loadedFieldIdsRef'
>

/**
 * This context manages state related to the columns of a project. Because this particular
 * context contains the state object itself, whenever the state changes, components that
 * consume this context (either directly with a `useContext` or indirectly with a hook) that
 * consumes this context), will be re-rendered.
 *
 * If a component should not be re-rendered when the state changes, consider consuming the `ColumnsStableContext`
 * instead.
 */
export const ColumnsContext = createContext<ColumnsContextType | null>(null)

/**
 * This context allows consumers to access and mutate the columns of a project. Because this particular
 * context only contains a reference to the state, as well as updater functions to modify the state,
 * the context value will be stable (i.e. the same object) for the lifetime of the context. A component
 * (or hook) which consumes this context will _not_ be re-rendered when the state changes.
 *
 * If a component should be re-rendered when the state changes, consider consuming the
 * `ColumnsContext` instead.
 */
export const ColumnsStableContext = createContext<ColumnsStableContextType | null>(null)

export const ColumnsStateProvider = memo<{children: React.ReactNode}>(function ColumnsStateProvider({children}) {
  const {tasklist_block, issue_types} = useEnabledFeatures()
  const reservedColumnNamesRef = useLazyRef(() => fetchJSONIslandData('reserved-column-names') || [])
  const [allColumns, setAllColumnsState] = useState(() => {
    let initialColumns = fetchJSONIslandData('memex-columns-data') || []
    // TEMP: feature flag for tracked by column
    if (!tasklist_block) {
      initialColumns = initialColumns.filter(column => column.id !== SystemColumnId.TrackedBy)
    }

    // Extra safety check to exclude issue type column for ineligible users.
    if (!issue_types) {
      initialColumns = initialColumns.filter(column => column.id !== SystemColumnId.IssueType)
    }
    return buildColumnModels(initialColumns)
  })
  const allColumnsRef = useRef<Readonly<Array<ColumnModel>>>(allColumns)

  const loadedFieldIdsRef = useLazyRef<Readonly<Set<MemexProjectColumnId>>>(() => buildInitialLoadedColumnIds())

  const setAllColumns = useCallback((newColumnModels: Array<ColumnModel>) => {
    setAllColumnsState(newColumnModels)
    allColumnsRef.current = newColumnModels
  }, [])

  const addLoadedFieldId = useCallback(
    (newColumnId: MemexProjectColumnId) => {
      loadedFieldIdsRef.current.add(newColumnId)
    },
    [loadedFieldIdsRef],
  )

  const contextValue: ColumnsContextType = useMemo(() => {
    return {
      reservedColumnNames: reservedColumnNamesRef.current,
      setAllColumns,
      allColumns,
      allColumnsRef,
      addLoadedFieldId,
      loadedFieldIdsRef,
    }
  }, [reservedColumnNamesRef, loadedFieldIdsRef, setAllColumns, allColumns, addLoadedFieldId])

  const stableContextValue: ColumnsStableContextType = useMemo(() => {
    return {
      setAllColumns,
      allColumnsRef,
      addLoadedFieldId,
      loadedFieldIdsRef,
    }
  }, [loadedFieldIdsRef, addLoadedFieldId, setAllColumns])

  return (
    <ColumnsContext.Provider value={contextValue}>
      <ColumnsStableContext.Provider value={stableContextValue}>{children}</ColumnsStableContext.Provider>
    </ColumnsContext.Provider>
  )
})

/**
 * Returns a new array with ColumnModels to match the array of incoming MemexColumns
 * Will create ColumnModels out of the MemexColumn objects if they do not exist, and call updateModel
 * on any ColumnModels that do still exist to update their observable fields.
 *
 * @param incomingColumns List of MemexColumn objects which should be the new state
 * @returns A list of ColumnModel objects which should be used for the new state by the ColumnsStateProvider
 */
export function buildColumnModels(incomingColumns: Array<MemexColumn>) {
  return incomingColumns.map(incomingColumn => createColumnModel(incomingColumn))
}

function buildInitialLoadedColumnIds() {
  const {memex_table_without_limits} = getEnabledFeatures()
  const jsonIslandKey = memex_table_without_limits ? 'memex-paginated-items-data' : 'memex-items-data'
  const {memexItems} = buildInitialItemsAndColumns(jsonIslandKey)
  const initialItems = getInitialItems(memexItems)
  const loadedColumnIds = new Set<MemexProjectColumnId>()
  if (initialItems?.length) {
    const itemWithMaxColumns = initialItems.sort(
      (a, b) => b.memexProjectColumnValues.length - a.memexProjectColumnValues.length,
    )[0]
    if (itemWithMaxColumns) {
      for (const columnValue of itemWithMaxColumns.memexProjectColumnValues) {
        loadedColumnIds.add(columnValue.memexProjectColumnId)
      }
    }
  }
  return loadedColumnIds
}

function getInitialItems(memexItems: Array<MemexItem> | PaginatedMemexItemsData) {
  if ('nodes' in memexItems) {
    return memexItems.nodes
  } else if ('groups' in memexItems) {
    return memexItems.groupedItems.reduce((acc, groupedItems) => acc.concat(groupedItems.nodes), [] as Array<MemexItem>)
  } else {
    return memexItems
  }
}
