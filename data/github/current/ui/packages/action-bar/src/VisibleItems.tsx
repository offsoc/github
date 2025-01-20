import {testIdProps} from '@github-ui/test-id-props'
import {Box, type SxProp} from '@primer/react'
import type {CSSProperties} from 'react'

import {useActionBarContent} from './ActionBarContentContext'
import {useActionBarRef} from './ActionBarRefContext'
import {useActionBarResize} from './ActionBarResizeContext'
import {VisibleItem} from './VisibleItem'

const defaultStyles = {
  display: 'flex',
  justifyContent: 'flex-end',
  overflow: 'visible',
  flexDirection: 'row',
  marginLeft: 'auto',
  alignItems: 'center',
  boxSizing: 'content-box',
  flexShrink: 0,
  flexGrow: 0,
}

export const VisibleItems = ({sx, ...props}: SxProp & {className?: string; style?: CSSProperties}) => {
  const {actions} = useActionBarContent()
  const {gap, visibleChildEndIndex} = useActionBarResize()
  const {itemContainerRef} = useActionBarRef()
  const visibleActions = actions?.slice(0, visibleChildEndIndex)

  return (
    <Box
      {...testIdProps('action-bar')}
      ref={itemContainerRef}
      sx={{
        ...defaultStyles,
        ...sx,
        gap,
      }}
      {...props}
    >
      {visibleActions?.map(({key, render}) => (
        <VisibleItem key={key} actionKey={key}>
          {render(false)}
        </VisibleItem>
      ))}
    </Box>
  )
}
