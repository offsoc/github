import type {Meta} from '@storybook/react'
import {SortingOptionsMenu, type SortingOptionsMenuProps} from './SortingOptionsMenu'
import {MemoryRouter} from 'react-router-dom'
import {noop} from '@github-ui/noop'

const meta = {
  title: 'ListViewItemsIssuesPrs',
  component: SortingOptionsMenu,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  decorators: [
    Story => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof SortingOptionsMenu>

export default meta

const defaultArgs: Partial<SortingOptionsMenuProps> = {
  activeSearchQuery: 'is:open',
  sortingItemSelected: '',
  setSortingItemSelected: noop,
  setReactionEmojiToDisplay: noop,
}

export const SortingOptionsMenuExample = {
  args: {
    ...defaultArgs,
  },
}
