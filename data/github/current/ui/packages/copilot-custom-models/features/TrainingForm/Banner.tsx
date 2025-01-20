import type {PropsWithChildren} from 'react'
import {InfoIcon} from '@primer/octicons-react'
import {Box, Flash, Octicon} from '@primer/react'

export function Banner({children}: PropsWithChildren) {
  return (
    <Flash
      sx={{
        display: 'grid',
        gridTemplateColumns: 'min-content 1fr',
        gridTemplateRows: 'min-content',
        gridTemplateAreas: `'visual message'`,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          paddingBlock: 'var(--base-size-8)',
          alignSelf: 'start',
          gridArea: 'visual',
        }}
      >
        <Octicon icon={InfoIcon} />
      </Box>
      <Box
        sx={{
          fontSize: 1,
          lineHeight: '1.5',
          padding: '0.375rem var(--base-size-8)',
          alignSelf: 'center',
          gridArea: 'message',
        }}
      >
        {children}
      </Box>
    </Flash>
  )
}
