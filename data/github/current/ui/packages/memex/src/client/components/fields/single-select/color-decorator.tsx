import {type ColorName, useNamedColor} from '@github-ui/use-named-color'
import {Box, type SxProp} from '@primer/react'

interface ColorDecoratorProps extends SxProp {
  color: ColorName
}

export const ColorDecorator = ({color, sx}: ColorDecoratorProps) => {
  const {bg, accent} = useNamedColor(color)
  return (
    <Box
      sx={{
        bg,
        borderColor: accent,
        borderWidth: 2,
        borderStyle: 'solid',
        width: 16,
        height: 16,
        borderRadius: 8,
        flexShrink: 0,
        ...sx,
      }}
    />
  )
}
