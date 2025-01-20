import type {FC} from 'react'
import {Box} from '@primer/react'
import {Blankslate as PrimerBlankslate} from '@primer/react/drafts'

type BlankslateProps = {
  heading: string
  children?: React.ReactNode
}

export const Blankslate: FC<BlankslateProps> = ({heading, children}) => {
  return (
    <Box sx={{textAlign: 'center'}}>
      <PrimerBlankslate>
        <PrimerBlankslate.Heading as="h3">{heading}</PrimerBlankslate.Heading>
        {children && <PrimerBlankslate.Description>{children}</PrimerBlankslate.Description>}
      </PrimerBlankslate>
    </Box>
  )
}
