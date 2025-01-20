import {Heading, Pagehead, TabNav} from '@primer/react'
import {Stack} from '@primer/react/drafts'
import type {Meta} from '@storybook/react'

import {AlphaLabel} from './AlphaLabel'
import {NewLabel} from './NewLabel'

export default {
  title: 'Recipes/LifecycleLabels',
} satisfies Meta

export const InNavigation = () => (
  <TabNav>
    <TabNav.Link href="#">Overview</TabNav.Link>
    <TabNav.Link href="#" selected>
      Commits
    </TabNav.Link>
    <TabNav.Link href="#">Checks</TabNav.Link>
    <TabNav.Link href="#">Files changed</TabNav.Link>
    <TabNav.Link href="#">
      <Stack direction="horizontal" gap="condensed">
        <span>Live chat</span>
        <NewLabel />
      </Stack>
    </TabNav.Link>
  </TabNav>
)

export const InPageContent = () => (
  <Pagehead>
    <Stack direction="horizontal" justify="space-between" align="center" style={{justifyContent: 'space-between'}}>
      <Heading as="h2">Staff-shipped feature</Heading>
      <AlphaLabel feedbackUrl="https://example.com" />
    </Stack>
  </Pagehead>
)
