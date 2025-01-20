import {AlertIcon, type Icon} from '@primer/octicons-react'
import {Octicon, Text} from '@primer/react'
import type {PropsWithChildren, ReactNode} from 'react'

import {Blankslate} from '../common/blankslate'

interface BlankslateErrorMessageProps {
  icon?: Icon
  heading: ReactNode
  content: ReactNode
  as?: React.ElementType
  headingAs?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export const BlankslateErrorMessage: React.FC<PropsWithChildren<BlankslateErrorMessageProps>> = ({
  icon = AlertIcon,
  heading,
  content,
  children,
  headingAs = 'h2',
  ...props
}) => (
  <Blankslate {...props}>
    <Octicon icon={icon} size={30} sx={{color: 'fg.muted'}} />
    <Text as={headingAs} sx={{mt: 3}}>
      {heading}
    </Text>
    <Text as="p" sx={{color: 'fg.muted'}}>
      {content}
    </Text>
    {children}
  </Blankslate>
)
