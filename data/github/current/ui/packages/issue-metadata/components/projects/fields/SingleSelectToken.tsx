import {Box, Token} from '@primer/react'
import {getTokenStyle} from './Shared'
import {useNamedColor, type ColorName} from '@github-ui/use-named-color'

type SingleSelectTokenProps = {
  inputName: string
  inputColor: ColorName
}

export const SingleSelectToken = ({inputName, inputColor}: SingleSelectTokenProps) => {
  const color = useNamedColor(inputColor)
  return (
    <Token
      sx={{
        bg: color.bg,
        color: color.fg,
        borderColor: color.border,
        ':hover': {
          bg: color.bg,
          color: color.fg,
          borderColor: color.border,
          boxShadow: 'none',
        },
        ...getTokenStyle(inputName),
      }}
      size="medium"
      text={inputName}
    />
  )
}

export const SingleSelectLeadingVisual = ({inputColor}: Omit<SingleSelectTokenProps, 'inputName'>) => {
  const {bg, accent} = useNamedColor(inputColor)
  return (
    <Box
      sx={{
        bg,
        borderColor: accent,
        borderWidth: 2,
        borderStyle: 'solid',
        borderRadius: 8,
        flexShrink: 0,
        height: '12px',
        width: '12px',
      }}
    />
  )
}
