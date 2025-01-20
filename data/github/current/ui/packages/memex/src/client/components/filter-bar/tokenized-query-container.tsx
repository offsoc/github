import {Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

const queryContainerSx: BetterSystemStyleObject = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  zIndex: 2,
  maxHeight: 'unset',
  overflowX: 'auto',
  height: '100%',
  msOverflowStyle: 'none',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}
/**
 * Div with styles that is intended to wrap the TokenizedQuery and RawFilterInput components.
 */
export function TokenizedQueryContainer({children}: React.PropsWithChildren) {
  return <Box sx={queryContainerSx}>{children}</Box>
}
