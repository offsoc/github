import {Banner} from '@primer/react/drafts'
import type {PropsWithChildren} from 'react'

interface Props extends PropsWithChildren {
  isListItem: boolean
}

export function BannerTitle({children, isListItem}: Props) {
  // The default Title is a h2 which is normally fine since Banner's typically go under a h1,
  // but when it's a ListView, the ListViewMetadata is already an h2, so we need to bump it up to an h3
  // otherwise, we get an a11y error for skipping heading levels.
  // Also, know that <Banner hideTitle /> does not actually prevent the title from rendering, it just hides it.
  // So `hideTitle` will not work.
  const as = isListItem ? 'h3' : 'h2'

  return (
    <Banner.Title as={as} style={{display: 'none'}}>
      {children}
    </Banner.Title>
  )
}
