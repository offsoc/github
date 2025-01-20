import {Resources} from '../constants/strings'
import {Box} from '@primer/react'
import {ColorPicker} from '@github-ui/color-picker'
import type {ColorName} from '@github-ui/use-named-color'

type TypeColorProps = {
  color: ColorName
  setColor: (name: ColorName) => void
}

export const TypeColor = ({color, setColor}: TypeColorProps) => {
  return (
    <Box sx={{my: 3}}>
      <ColorPicker value={color} onChange={setColor} label={Resources.colorLabel} />
    </Box>
  )
}
