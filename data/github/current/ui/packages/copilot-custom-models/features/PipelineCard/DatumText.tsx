import {Text, type TextProps} from '@primer/react'

export function DatumText({children, sx, ...props}: TextProps) {
  return (
    <Text {...props} sx={{fontSize: '16px', fontWeight: 'semibold', lineHeight: '24px', ...sx}}>
      {children}
    </Text>
  )
}
