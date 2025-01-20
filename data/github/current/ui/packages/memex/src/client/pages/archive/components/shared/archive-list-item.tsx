import {Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {memo, useMemo, useRef} from 'react'

import useIsVisible from '../../../../components/board/hooks/use-is-visible'

const listItemStyles: BetterSystemStyleObject = {
  borderBottom: '1px solid',
  borderColor: 'border.default',
  '&:last-child': {borderBottom: 'none'},
  // Using CSS grid here because truncating text inside of nested flex contexts
  // is quite difficult to implement correctly
  display: 'grid',
  gridTemplateColumns: 'auto auto 1fr auto',
  flexShrink: 0,
}

export const ArchiveListItem = memo<React.PropsWithChildren>(function ArchiveListItem({children}) {
  const ref = useRef(null)
  const {isVisible, size} = useIsVisible({ref})

  return (
    <Box
      style={useMemo(() => ({height: isVisible ? 'unset' : size, flexShrink: 0}), [isVisible, size])}
      ref={ref}
      as="li"
      sx={listItemStyles}
    >
      {isVisible ? children : null}
    </Box>
  )
})
