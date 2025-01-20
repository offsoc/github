import {memo, useMemo, useRef} from 'react'
import type {Row} from 'react-table'

import useIsVisible from '../board/hooks/use-is-visible'
import {CELL_HEIGHT} from './constants'
import {useTableNavigation} from './navigation'
import {useIsDraggingRows} from './row-reordering/hooks/use-is-dragging-rows'
import type {TableDataType} from './table-data-type'
import {TableRow, type TableRowProps} from './table-row'

/** The number of rows that will be rendered in a batch as they are scrolled into view. */
export const VIRTUALIZATION_CHUNK_SIZE = 5

/**
 * This represents a set of rows that act as a single unit of virtualization in
 * the vertical scroll direction.
 *
 * In other words, as the user scrolls vertically, we will render a new
 * TableRowChunk as it becomes visible (as opposed to rendering each TableRow
 * individually).
 */
export const TableRowChunk = memo(function TableRowChunk(props: {
  rows: Array<Row<TableDataType>>
  rowOffset: number
  chunkIndex: number
  itemData: TableRowProps['data']
  chunkSize: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const {isVisible, size} = useIsVisible({ref, defaultHeight: CELL_HEIGHT * props.rows.length})
  const {
    state: {focus},
  } = useTableNavigation()

  const isFocused = focus && focus.type === 'coordinate' ? props.rows.some(row => row.id === focus.details.y) : false

  // If we don't render the rows when dragging, the `useReorderableRow` hook will get unmounted and dnd-kit will not
  // provide any drop data
  const isDragging = useIsDraggingRows(props.rows)

  const shouldRender = isVisible || isFocused || isDragging

  // When this chunk of rows is visible, we set the height to 'unset' so that we inherit the true
  // height of the chunk after all of its contents have been painted. Otherwise, we render a fixed
  // height as a placeholder.
  const height = isVisible ? 'unset' : `${size}px`

  const style = useMemo(() => ({height}), [height])

  return (
    <div style={style} ref={ref}>
      {shouldRender
        ? props.rows.map(row => <TableRow key={row.original.id} row={row} index={row.index} data={props.itemData} />)
        : null}
    </div>
  )
})
