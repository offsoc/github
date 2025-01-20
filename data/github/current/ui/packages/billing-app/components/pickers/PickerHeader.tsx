import {Heading} from '@primer/react'
import {Fonts, Spacing} from '../../utils/style'

interface Props {
  title: string
}

export function PickerHeader({title}: Props) {
  return (
    <Heading as="h4" sx={{mb: Spacing.StandardPadding, fontSize: Fonts.CardHeadingFontSize}}>
      {title}
    </Heading>
  )
}
