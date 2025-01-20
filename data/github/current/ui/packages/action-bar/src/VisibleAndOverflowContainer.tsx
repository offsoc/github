import {testIdProps} from '@github-ui/test-id-props'
import {FocusKeys} from '@primer/behaviors'
import {Box, type SxProp, useFocusZone} from '@primer/react'
import type {CSSProperties, PropsWithChildren} from 'react'

import {useActionBarContent} from './ActionBarContentContext'
import {useActionBarRef} from './ActionBarRefContext'
import {useActionBarResize} from './ActionBarResizeContext'
import {OverflowMenu, type OverflowMenuProps} from './OverflowMenu'
import {VisibleItems} from './VisibleItems'

export type VisibleAndOverflowContainerProps = PropsWithChildren<{
  overflowMenuToggleProps?: OverflowMenuProps['anchorProps']
  outerContainerSx?: SxProp['sx']
  className?: string
  style?: CSSProperties
}> &
  SxProp

const defaultStyles = {
  position: 'relative',
  minWidth: 0,
  display: 'flex',
  overflow: 'visible',
  flexDirection: 'row',
  marginLeft: 'auto',
  alignItems: 'center',
  boxSizing: 'content-box',
  flexShrink: 1,
  flexGrow: 1,
}

export const VisibleAndOverflowContainer = ({
  overflowMenuToggleProps,
  children,
  outerContainerSx,
  ...props
}: VisibleAndOverflowContainerProps) => {
  const {gap, justifySpaceBetween} = useActionBarResize()
  const {outerContainerRef} = useActionBarRef()
  const {label, variant} = useActionBarContent()

  useFocusZone(
    {
      containerRef: outerContainerRef,
      bindKeys: FocusKeys.ArrowHorizontal | FocusKeys.HomeAndEnd,
      focusOutBehavior: 'wrap',
      disabled: variant !== 'toolbar',
    },
    [outerContainerRef],
  )

  return (
    <Box
      ref={outerContainerRef}
      {...testIdProps('action-bar-container')}
      role={variant === 'toolbar' ? 'toolbar' : undefined}
      aria-label={variant === 'toolbar' ? label : undefined}
      sx={{
        ...defaultStyles,
        ...outerContainerSx,
        justifyContent: justifySpaceBetween ? 'space-between' : 'flex-end',
        gap,
      }}
    >
      <VisibleItems {...props} />
      {children}
      <OverflowMenu anchorProps={overflowMenuToggleProps} />
    </Box>
  )
}
