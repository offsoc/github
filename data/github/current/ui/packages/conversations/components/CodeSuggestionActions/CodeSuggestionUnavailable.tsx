import {Box, type SxProp, Text} from '@primer/react'

export function CodeSuggestionUnavailable({reason, sx}: {reason: string} & SxProp) {
  return (
    <Box sx={{...{m: 2}, ...sx}}>
      <Text as="small" sx={{color: 'fg.muted'}}>
        {reason}
      </Text>
    </Box>
  )
}
