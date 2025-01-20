import {Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import type {ReactNode} from 'react'

export function ContentWrapper({children, sx}: {children: ReactNode; sx?: BetterSystemStyleObject}) {
  return (
    <Box
      sx={{
        flexGrow: 1,
        maxWidth: '1280px',
        width: '100%',
        pt: 0,
        px: [3, 3, 4],
        pb: 0,
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}
