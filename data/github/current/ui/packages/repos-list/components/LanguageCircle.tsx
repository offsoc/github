import {Box} from '@primer/react'

export function LanguageCircle({color}: {color?: string}) {
  return (
    <Box
      sx={{
        bg: color || 'attention.emphasis',
        borderRadius: 8,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: 'primer.border.contrast',
        width: 10,
        height: 10,
      }}
    />
  )
}
