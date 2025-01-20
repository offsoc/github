import {Box, Text} from '@primer/react'
import type {ReactNode} from 'react'

interface Props {
  name: string
  value: ReactNode
}

export function Datum({name, value}: Props) {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
      <Text sx={{color: 'fg.muted', fontSize: '12px', minWidth: '128px'}}>{name}</Text>

      {value}
    </Box>
  )
}
