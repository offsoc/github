import {Box} from '@primer/react'
import type React from 'react'

export function EmptyState({children}: React.PropsWithChildren) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        px: 3,
        py: 5,
        border: 'solid 1px var(--borderColor-default, var(--color-border-default))',
        borderRadius: '5px',
      }}
    >
      <strong>{children}</strong>
    </Box>
  )
}
