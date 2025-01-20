import {Box, Text} from '@primer/react'
import type {PropsWithChildren} from 'react'

const PolicyHeaderSx = {
  borderBottomWidth: 0,
  borderRightWidth: 0,
  borderLeftWidth: 0,
  borderStyle: 'solid',
  borderColor: 'border.default',
  paddingY: 2,
  paddingX: 4,
}

export function PolicyHeader({
  title,
  idx,
  description,
  children,
}: PropsWithChildren<{title: string; idx: number; description?: string}>) {
  return (
    <Box sx={{flexGrow: 1}}>
      <Box sx={{...PolicyHeaderSx, borderTopWidth: idx === 0 ? 0 : 1}}>
        <Text sx={{fontWeight: 'bold'}}>{title}</Text>
        {description && (
          <Text as="p" sx={{color: 'fg.muted', mb: 0}}>
            {description}
          </Text>
        )}
      </Box>
      {children}
    </Box>
  )
}
