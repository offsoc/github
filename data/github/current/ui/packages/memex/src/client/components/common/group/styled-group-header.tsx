import {Box, type BoxProps} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {forwardRef} from 'react'

export const GROUP_HEADER_HEIGHT = 44

const groupHeaderSx: BetterSystemStyleObject = {
  backgroundColor: 'canvas.default',
  borderBottomColor: 'border.default',
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  paddingLeft: 3,
  height: `${GROUP_HEADER_HEIGHT}px`,
  display: 'flex',
  gap: 3,
  alignItems: 'center',
  position: 'relative',

  '&.collapsed': {
    borderBottomColor: 'transparent',
  },

  '&.board': {
    borderRightColor: 'border.default',
    borderRightStyle: 'solid',
    borderRightWidth: '1px',
    borderTopColor: 'border.default',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    borderLeft: '1px solid',
    borderLeftColor: 'border.default',
    marginRight: '8px',
    paddingLeft: 2,
    gap: 2,
  },

  '&.board.collapsed': {
    borderBottomColor: 'border.default',
  },

  // :has is not currently supported in firefox, so a double border
  // will be visible when a group is collapsed in board view.
  // This should just work once support has been added.
  '&.board.collapsed:has(+ .board)': {
    borderBottomColor: 'transparent',
  },

  '&.sticky': {
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },

  '&.highlighted': {
    borderTop: '1px solid',
    borderTopColor: 'accent.fg',
  },
  '&.highlighted + &': {
    borderTop: '1px solid',
    borderTopColor: 'accent.fg',
  },
}

export const StyledGroupHeader = forwardRef<HTMLDivElement, BoxProps & {topOffset?: number}>(
  ({topOffset, style, sx, ...props}, ref) => {
    return <Box ref={ref} sx={{...groupHeaderSx, ...sx}} style={{top: topOffset ?? 0, ...style}} {...props} />
  },
)

StyledGroupHeader.displayName = 'StyledGroupHeader'
