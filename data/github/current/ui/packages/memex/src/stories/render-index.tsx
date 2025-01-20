import {ArrowRightIcon, BookIcon, TableIcon} from '@primer/octicons-react'
import {ActionList, ThemeProvider} from '@primer/react'
import {StrictMode} from 'react'
import type {Root} from 'react-dom/client'

import {getStoryFullPathname, initialStory} from './story-definitions'

/**
 * Render a general index page with links for Primer Recipe Storybook and Memex Projects staging.
 *
 * When opening a staging environment URL at "drafts.github.io",
 * Memex takes over and previously redirected to the default Memex story.
 * Now we instead render a general index for better discoverability
 * of other Storybook pages.
 */
export function renderIndex(root: Root) {
  root.render(
    <StrictMode>
      <ThemeProvider>
        <ActionList
          style={{
            maxWidth: '100%',
            width: '300px',
            margin: 'var(--stack-padding-spacious) auto',
            border: '1px solid var(--borderColor-default)',
            background: 'var(--bgColor-muted)',
            borderRadius: 'var(--borderRadius-small)',
          }}
        >
          <ActionList.LinkItem href="/storybook">
            <ActionList.LeadingVisual>
              <BookIcon />
            </ActionList.LeadingVisual>
            Primer Recipes Storybook
            <ActionList.TrailingVisual>
              <ArrowRightIcon />
            </ActionList.TrailingVisual>
          </ActionList.LinkItem>
          <ActionList.LinkItem href={getStoryFullPathname(initialStory)}>
            <ActionList.LeadingVisual>
              <TableIcon />
            </ActionList.LeadingVisual>
            Projects staging environment
            <ActionList.TrailingVisual>
              <ArrowRightIcon />
            </ActionList.TrailingVisual>
          </ActionList.LinkItem>
        </ActionList>
      </ThemeProvider>
    </StrictMode>,
  )
}
