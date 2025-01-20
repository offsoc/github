import {Blankslate} from '@primer/react/experimental'
import {Box} from '@primer/react'
import {Constants} from '../constants/constants'
import {blankslateStyle} from '../utils/style'

interface IImsBlankslateProps {
  title: string
  description: string
  primaryAction?: string | null
}
export function ImsBlankslate(props: IImsBlankslateProps) {
  return (
    <Box className="border rounded-2" sx={blankslateStyle}>
      <Blankslate>
        <Blankslate.Heading>{props.title}</Blankslate.Heading>
        <Blankslate.Description>{props.description}</Blankslate.Description>
        {props.primaryAction && <Blankslate.PrimaryAction href="#">{props.primaryAction}</Blankslate.PrimaryAction>}
        <Blankslate.SecondaryAction href={Constants.imsRepoLink}>Learn more about IMS</Blankslate.SecondaryAction>
      </Blankslate>
    </Box>
  )
}
