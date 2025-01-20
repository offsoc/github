import {SearchIcon} from '@primer/octicons-react'
import {Blankslate} from '@primer/react/experimental'

interface Props {
  heading: string
  description: string
}

export function EmptyDataBlankslate({heading, description}: Props): JSX.Element {
  return (
    <Blankslate>
      <Blankslate.Visual>
        <SearchIcon size={'medium'} />
      </Blankslate.Visual>
      <Blankslate.Heading>{heading}</Blankslate.Heading>
      <Blankslate.Description>{description}</Blankslate.Description>
    </Blankslate>
  )
}
