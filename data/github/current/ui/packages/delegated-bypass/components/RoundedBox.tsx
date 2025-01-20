import type {ReactNode} from 'react'
import {Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

type RoundedBoxProps = {
  sx?: BetterSystemStyleObject
  children: ReactNode
}

export function RoundedBox({sx = {}, children}: RoundedBoxProps) {
  return (
    <Box
      className="Box"
      sx={{
        ...sx,
        '> :first-child': {
          borderBottomColor: 'border.default',
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
        },
      }}
    >
      {children}
    </Box>
  )
}
