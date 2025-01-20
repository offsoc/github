import {SortableContext, type SortableData, useSortable, verticalListSortingStrategy} from '@github-ui/drag-and-drop'
import isObject from 'lodash-es/isObject'
import {useContext, useMemo} from 'react'
import type {Row} from 'react-table'

import type {MemexItemModel} from '../../../models/memex-item-model'
import {DroppedItemIdContext} from './dropped-item-id-context'

// A note on naming: dnd-kit refers to this pattern as 'sortable', but sorting is an overloaded term in Memex due to
// items being sortable in views. It would be particularly confusing to refer to rows as 'sortable' when they are
// already 'sorted'. So instead we use the term 'reorderable' to refer to items that can be dragged and dropped to
// reorder.

export type ReorderableRowData = SortableData & {
  /** The `MemexItemModel#id` of the row. */
  originalItemId: number
  /** Injected by the `SortableContext`. */
  sortable: {
    /** We set the container ID to be the grouped value in grouped views. */
    containerId: string
  }
}

export const ReorderableRowData = {
  is(data: unknown): data is ReorderableRowData {
    return (
      isObject(data) &&
      'sortable' in data &&
      isObject(data.sortable) &&
      'containerId' in data.sortable &&
      typeof data.sortable.containerId === 'string'
    )
  },
}

/**
 * Get the unique ID for a row. Cannot be the original item ID because items can appear twice in a grouped view, and
 * dnd-kit requires this ID to be globally unique even across separate sortable containers.
 */
const reorderableRowId = (row: Row<MemexItemModel>) => `reorderable_table-row-${row.id}`

/** Register a row as draggable and sortable. Use within `ReorderableRowsContext`. */
export const useReorderableRow = (row: Row<MemexItemModel>) => {
  const sortable = useSortable({
    id: reorderableRowId(row),
    data: {
      originalItemId: row.original.id,
      // sortable field will be injected by SortableContext
    } satisfies Omit<ReorderableRowData, 'sortable'>,
  })

  const droppedItemId = useContext(DroppedItemIdContext)

  return {
    /** True if the item was just dropped and should be styled as such. */
    isDropped: row.original.id === droppedItemId,
    ...sortable,
  }
}

interface ReorderableRowsContextProps {
  /** Array of all rows in this group. */
  rows: Array<Row<MemexItemModel>>
  /** If the table is grouped, the grouped value must be provided. */
  groupedValue?: string
  children: React.ReactNode
}

/** Should be defined separately for each group, or once for ungrouped tables. */
export const ReorderableRowsContext = ({rows, children, groupedValue}: ReorderableRowsContextProps) => {
  const itemIds = useMemo(() => rows.map(reorderableRowId), [rows])
  return (
    <SortableContext items={itemIds} strategy={verticalListSortingStrategy} id={groupedValue}>
      {children}
    </SortableContext>
  )
}
