import {Heading, type HeadingProps} from '@primer/react'

export interface ScreenReaderHeadingProps extends Pick<HeadingProps, 'id'> {
  as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  text: string
}

export function ScreenReaderHeading({as, text, ...props}: ScreenReaderHeadingProps) {
  return (
    <Heading as={as} className="sr-only" data-testid="screen-reader-heading" {...props}>
      {text}
    </Heading>
  )
}
