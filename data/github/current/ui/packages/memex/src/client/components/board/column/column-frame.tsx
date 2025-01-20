import {testIdProps} from '@github-ui/test-id-props'
import {Box, type SxProp} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {type ComponentPropsWithoutRef, forwardRef, memo} from 'react'

type Props = {
  /**
   * A React node that will be rendered in the header area of the column
   */
  headerContent: React.ReactNode
  id?: string
  onPointerLeave?: React.MouseEventHandler<HTMLElement>
  onClick?: React.MouseEventHandler<HTMLElement>

  /**
   * A name attached to the column for testing, via a data prop
   */
  testingName?: string
} & SxProp

export const COLUMN_WIDTH = 350
export const COLUMN_GAP = 8
const MARGIN_FOR_SASH = '352px'

/**
 * Render the basic frame around column content.
 *
 * This components takes a header node, children for the column body, and any
 * additional properties are forwarded to the frame component itself.
 */
const frameWithSashStyle: BetterSystemStyleObject = {
  mr: `${COLUMN_GAP}px`,
  width: `${COLUMN_WIDTH}px`,
  minWidth: `${COLUMN_WIDTH}px`,
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'hidden',
  borderRadius: 'radii.2',
  bg: 'canvas.inset',
  '&.only': {
    borderRadius: theme => `${theme.radii[2]} ${theme.radii[2]} 0 0`,
    borderBottomColor: 'transparent',
  },
  '&.hidden:not(.last-group)': {
    borderRadius: 0,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  '&.hidden.last-group': {
    borderRadius: theme => `0 0 ${theme.radii[2]} ${theme.radii[2]}`,
    borderTopColor: 'transparent',
  },
  '&.drag-outline:not(.only)': {
    borderColor: 'accent.emphasis',
    boxShadow: theme => `0 0 0 1px ${theme.colors.accent.emphasis}`,
  },
  '&::after, &::before': {
    content: '""',
    display: 'none',
    position: 'absolute',
    top: '8px',
    width: '4px',
    bg: 'accent.emphasis',
    height: 'calc(100% - 16px)',
    border: 0,
    borderRadius: '6px',
    zIndex: 12,
  },
  'body.is-dragging &.show-sash-column.show-sash-after': {
    '&::after': {
      ml: `${MARGIN_FOR_SASH}`,
      display: 'block',
    },
  },
  /*The :not selector removes the 1st column (No Status) from the selection. */
  // Cannot reference `MissingVerticalGroupId` and `DRAG_ID_ATTRIBUTE` because cannot use string interpolation here
  'body.is-dragging &.show-sash-column.show-sash-before:not([data-dnd-drag-id="no_vertical_group"])': {
    '&::before': {
      ml: '-6px',
      display: 'block',
    },
  },
}

export const ColumnFrame = memo(
  forwardRef<HTMLDivElement, React.PropsWithChildren<ComponentPropsWithoutRef<'div'> & Props>>(
    ({headerContent, testingName, children, ...rest}, ref) => {
      return (
        <Box
          // putting it in front of sx, otherwise sx does not get applied
          {...rest}
          sx={{
            ...frameWithSashStyle,
            ...rest.sx,
          }}
          ref={ref}
          data-board-column={testingName}
          {...testIdProps('board-view-column')}
        >
          <Box sx={{flexDirection: 'column', flexShrink: 0, display: 'flex'}}>{headerContent}</Box>
          {children}
        </Box>
      )
    },
  ),
)

ColumnFrame.displayName = 'ColumnFrame'
