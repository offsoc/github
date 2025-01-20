import {Text, type TextProps} from '@primer/react'

export function Explanation({sx, ...props}: TextProps) {
  return <Text {...props} sx={{...sx, color: 'fg.muted', fontSize: '14px', mb: '4px'}} />
}
