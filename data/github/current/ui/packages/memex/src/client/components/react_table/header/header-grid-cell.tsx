import {Box, type BoxProps} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {forwardRef} from 'react'

export const HeaderGridCell = forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
  const {sx, ...other} = props

  const mergedSx: BetterSystemStyleObject = {
    display: 'flex',
    flexDirection: 'row',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '0',
    whiteSpace: 'nowrap',
    cursor: 'grab',
    userSelect: 'none',
    borderColor: 'border.default',
    borderWidth: `1px`,
    borderStyle: 'solid',
    borderRight: 'none',
    borderTop: 'none',
    borderBottom: 0,
    outline: 'none',

    '&.readonly, &.readonly:active': {
      cursor: 'default',
    },

    '&:active': {
      cursor: 'grabbing',
    },

    '&.inactive, &.inactive:active': {
      cursor: 'default',
    },

    '&.hoverable:hover': {
      backgroundColor: 'canvas.default',
    },

    '&:last-child': {
      borderRight: '1px solid transparent',
    },

    ...sx,
  }

  return <Box ref={ref} role="columnheader" aria-colspan={1} sx={mergedSx} {...other} />
})

HeaderGridCell.displayName = 'HeaderGridCell'
