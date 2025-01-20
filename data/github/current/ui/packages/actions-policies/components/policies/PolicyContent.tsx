import {Box} from '@primer/react'
import type {ReactNode} from 'react'

const PolicyContentSx = {
  backgroundColor: 'canvas.default',
  borderBottomWidth: 0,
  borderTopWidth: 1,
  borderRightWidth: 0,
  borderLeftWidth: 0,
  borderStyle: 'solid',
  borderColor: 'border.default',
  paddingY: 4,
  paddingX: 4,
  flexGrow: 1,
}

export function PolicyContent({children}: {children: ReactNode}) {
  return (
    <Box as="form" sx={PolicyContentSx}>
      {children}
    </Box>
  )
}
