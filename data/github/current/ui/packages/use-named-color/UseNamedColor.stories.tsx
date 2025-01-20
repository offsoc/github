import type {Meta} from '@storybook/react'
import {type ColorName, colorNames, useNamedColor} from './use-named-color'
import {Box, Text} from '@primer/react'
import {StarFillIcon} from '@primer/octicons-react'

export default {
  title: 'Utilities/useNamedColor',
} satisfies Meta

const ColorBox = ({colorName}: {colorName: ColorName}) => {
  const {bg, fg, accent, border} = useNamedColor(colorName)
  return (
    <Box sx={{p: 2, m: 2, backgroundColor: bg, color: fg, border: '1px solid', borderColor: border, borderRadius: 2}}>
      <StarFillIcon fill={accent} />
      <Text sx={{ml: 2}}>{colorName}</Text>
    </Box>
  )
}

export const AllColors = {
  name: 'useNamedColor',
  render: () => colorNames.map(name => <ColorBox key={name} colorName={name} />),
}
