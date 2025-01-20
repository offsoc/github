import {useDndContext} from '@github-ui/drag-and-drop'
import type {Row} from 'react-table'

import type {TableDataType} from '../../table-data-type'
import {ReorderableRowData} from '../reorderable-rows'

/** Determine whether any of the given rows are currently being dragged. */
export const useIsDraggingRows = (rows: Array<Row<TableDataType>>): boolean => {
  const activeDragData = useDndContext().active?.data.current

  return ReorderableRowData.is(activeDragData) && rows.some(row => row.original.id === activeDragData.originalItemId)
}
