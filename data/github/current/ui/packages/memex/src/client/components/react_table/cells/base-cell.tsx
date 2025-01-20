import {Box, type BoxProps} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {forwardRef} from 'react'

import {useTableCellHeight} from '../table-provider'

type BaseCellProps = BoxProps & {
  editing?: boolean
  disallowSelection?: boolean
}

const editingStyles: BetterSystemStyleObject = {
  paddingLeft: '12px',
} as const

const baseStyles: BetterSystemStyleObject = {
  display: 'flex',
  alignItems: 'center',
  flexGrow: 1,
  overflow: 'hidden',
  padding: '12px',
  position: 'relative',
} as const

export const BaseCell = forwardRef<HTMLDivElement, BaseCellProps>((props, ref) => {
  const {sx, editing, disallowSelection, ...other} = props
  const cellHeight = useTableCellHeight()

  const editingStylesNew = editing ? editingStyles : {}

  const mergedSx: BetterSystemStyleObject = {
    ...baseStyles,
    height: `${cellHeight}px`,
    ...sx,
    userSelect: disallowSelection ? 'none' : 'auto',
    ...editingStylesNew,
  }

  return <Box ref={ref} sx={mergedSx} {...other} />
})

BaseCell.displayName = 'BaseCell'
