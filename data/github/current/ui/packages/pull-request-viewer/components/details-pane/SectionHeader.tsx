import {Heading} from '@primer/react'
import type {ReactNode} from 'react'
import {Suspense} from 'react'

type SectionHeaderProps = {
  title: string
  children: ReactNode
}

/**
 * Renders its title as an `<h4>` and its children just next to it in the DOM.
 * As a suspense fallback it renders just the title heading.
 */
export function SectionHeader({title, children}: SectionHeaderProps) {
  const heading = (
    // 32px height matches the pencil icon height inside the label picker,
    // so we can avoid any layout shifts when we unsuspend
    <Heading as="h4" sx={{height: '32px', fontSize: 1, fontWeight: 600}}>
      {title}
    </Heading>
  )
  return (
    <Suspense fallback={heading}>
      {heading}
      {children}
    </Suspense>
  )
}
