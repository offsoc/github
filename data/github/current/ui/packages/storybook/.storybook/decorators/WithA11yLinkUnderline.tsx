/**
 * Extended from @primer/react story-helpers, adds css variable `data` properties to
 * ensure correct themes are applied for non-react elements
 */
import {useEffect} from 'react'
import type {StoryContext} from './types'

export const WithA11yLinkUnderline = (Story: React.FC<React.PropsWithChildren<StoryContext>>, context: StoryContext) => {

  return <div data-a11y-link-underlines="true">
    {Story(context)}
  </div>
}
