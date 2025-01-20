import {Box} from '@primer/react'
import type {PropsWithChildren} from 'react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

export interface LinesChangedCounterLabelProps {
  isAddition?: boolean
  sx?: BetterSystemStyleObject
}

export function LinesChangedCounterLabel({children, isAddition, sx}: PropsWithChildren<LinesChangedCounterLabelProps>) {
  return (
    <Box
      sx={{
        color: isAddition ? 'success.fg' : 'danger.fg',
        ml: 1,
        fontWeight: 'bold',
        fontSize: 0,
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}
