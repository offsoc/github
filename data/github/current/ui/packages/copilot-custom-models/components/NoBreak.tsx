import {Text, type TextProps} from '@primer/react'

export function NoBreak({sx, ...props}: TextProps) {
  return <Text sx={{whiteSpace: 'nowrap', ...sx}} {...props} />
}
