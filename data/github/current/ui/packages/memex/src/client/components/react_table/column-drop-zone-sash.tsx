import {Box} from '@primer/react'
import {memo} from 'react'
import type {ColumnInstance} from 'react-table'

import type {TableDataType} from './table-data-type'
import {useTableOverColumn} from './table-provider'

type Props = {
  visibleColumns: Array<ColumnInstance<TableDataType>>
  sticky?: boolean
  height?: number
}

const SASH_WIDTH = 3

/**
 * This is the thick vertical line that is rendered to indicate where a column will
 * be placed when dragging-and-dropping.
 */
export const ColumnDropZoneSash: React.FC<Props> = memo(props => {
  const overColumn = useTableOverColumn()
  const column = overColumn?.column
  const isLast = props.visibleColumns.at(-1) === column
  const side = overColumn?.side

  if (column) {
    let left = column.totalLeft

    if (side === 'right') {
      left += column.totalWidth
    }

    if (isLast && side === 'right') {
      // When over the right side of the final column, left-shift the sash
      // back into the viewport so that it's fully visible.
      left -= SASH_WIDTH
    } else {
      // When over any other column, left-shift the sash by enough pixels
      // so that it is center-aligned with the column dividers.
      left -= Math.ceil(SASH_WIDTH / 2)
    }

    if (props.sticky && props.height) {
      return (
        <Box
          sx={{
            bg: 'accent.emphasis',
            top: 0,
            ml: left,
            mt: -props.height,
            height: props.height,
            width: SASH_WIDTH,
            zIndex: 5,
            pointerEvents: 'none',
            position: 'sticky',
          }}
        />
      )
    }

    return (
      <Box
        sx={{
          bg: 'accent.emphasis',
          left,
          top: 0,
          bottom: 0,
          width: SASH_WIDTH,
          height: '100%',
          position: 'absolute',
        }}
      />
    )
  }

  return null
})

ColumnDropZoneSash.displayName = 'ColumnDropZoneSash'
