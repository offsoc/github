import type React from 'react'
import {Box} from '@primer/react'
import {ArrowDownIcon, ArrowUpIcon} from '@primer/octicons-react'

interface Props extends Omit<React.ComponentProps<typeof Box>, 'children'> {
  value?: number
  suffix?: React.ReactNode
}

const getColor = (value: number) => {
  if (value === 0) return ''

  if (value < 0) {
    return 'danger.fg'
  }

  return 'success.fg'
}

const getPrefix = (value: number) => {
  if (value === 0) return null

  const icon = value < 0 ? <ArrowDownIcon /> : <ArrowUpIcon />

  return <Box sx={{mx: 1}}>{icon}</Box>
}

export const Delta = ({value, suffix, sx, ...restProps}: Props) => {
  if (value === undefined) {
    return null
  }

  return (
    <Box sx={{display: 'flex', color: getColor(value), fontWeight: 'bold', ...sx}} {...restProps}>
      {getPrefix(value)}
      {Math.abs(value)}
      {suffix ?? null}
    </Box>
  )
}
