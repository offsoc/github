import type {Meta, StoryObj} from '@storybook/react'

import {SharedMarkdownContent} from '../SharedMarkdownContent'
import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {createRepository} from '@github-ui/current-repository/test-helpers'

const meta = {
  title: 'Apps/Code View Shared/SharedMarkdownContent',
  component: SharedMarkdownContent,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof SharedMarkdownContent>

export default meta

const defaultArgs = {
  repo: createRepository({
    id: 1,
    name: 'test-repo',
    ownerLogin: 'owner',
    defaultBranch: 'main',
    createdAt: '2021-10-01T00:00:00Z',
    currentUserCanPush: true,
    isFork: false,
    isEmpty: false,
    ownerAvatar: 'www.github.com/avatar',
    public: true,
    private: false,
    isOrgOwned: false,
  }),
  onAnchorClick: () => {},
  richText: 'This is a test' as SafeHTMLString,
  stickyHeaderHeight: 0,
}

type Story = StoryObj<typeof SharedMarkdownContent>

export const Default: Story = {
  render: () => (
    <Wrapper appPayload={{helpUrl: ''}}>
      <CurrentRepositoryProvider repository={defaultArgs.repo}>
        <SharedMarkdownContent
          onAnchorClick={defaultArgs.onAnchorClick}
          richText={defaultArgs.richText}
          stickyHeaderHeight={defaultArgs.stickyHeaderHeight}
        />
      </CurrentRepositoryProvider>
    </Wrapper>
  ),
}
