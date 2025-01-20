import {Box, Token, type TokenProps} from '@primer/react'
import {useCallback} from 'react'

interface Props extends TokenProps {
  color: string
}

export function LanguageToken({color, ...props}: Props) {
  const leadingVisual = useCallback(() => <Circle color={color} />, [color])

  return <Token leadingVisual={leadingVisual} {...props} size="large" />
}

interface CircleProps {
  color: string
}
function Circle({color}: CircleProps) {
  return <Box sx={{backgroundColor: color, borderRadius: '9999px', height: '8px', width: '8px'}} />
}
