import {Box} from '@primer/react'
import type {BoxProps} from '@primer/react'

export function BorderBox({sx, ...props}: BoxProps) {
  return (
    <Box
      sx={{
        border: '1px solid var(--borderColor-default, var(--color-border-default))',
        borderRadius: '8px',
        p: '16px',
        ...sx,
      }}
      {...props}
    />
  )
}
