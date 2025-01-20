import type React from 'react'
import {Box, Text, Heading} from '@primer/react'
import {Delta} from './Delta'
import type {HeroStatData} from '../types'

type Props = Omit<React.ComponentProps<typeof Box>, 'children'> & HeroStatData

export const HeroStat: React.FC<Props> = ({label, percentChange, sx = {}, total, ...restProps}) => {
  return (
    <Box
      sx={{
        alignItems: 'center',
        bg: 'neutral.subtle',
        boxShadow: 'shadow.small',
        justifyContent: 'space-between',
        p: 3,
        width: '100%',
        ...sx,
      }}
      {...restProps}
    >
      <div>
        <Heading as="h3" sx={{color: 'fg.muted', fontSize: 1, fontWeight: 'normal', mb: 1}}>
          {label}
        </Heading>
      </div>
      <Box sx={{display: 'flex', alignItems: 'baseline'}}>
        <Text sx={{color: 'fg.default', fontSize: 4}}> {total.toLocaleString()}</Text>
        <Delta value={percentChange} sx={{ml: 2}} suffix="%" />
      </Box>
    </Box>
  )
}
