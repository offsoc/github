import {Wrapper} from '@github-ui/react-core/test-utils'
import type {Meta, StoryObj} from '@storybook/react'

import {PullRequestHeader, type PullRequestHeaderProps} from './PullRequestHeader'
import {getCommitsRoutePayload} from '../test-utils/mock-data'
import {PageDataContextProvider} from '@github-ui/pull-request-page-data-tooling/page-data-context'
import queryClient from '@github-ui/pull-request-page-data-tooling/query-client'
import {QueryClientProvider} from '@tanstack/react-query'
import {BASE_PAGE_DATA_URL} from '@github-ui/pull-request-page-data-tooling/render-with-query-client'

const meta = {
  title: 'Pull Requests/commits/Header',
  component: PullRequestHeader,
  decorators: [
    Story => {
      // Resets the Tanstack Query Client Cache between stories to ensure that we don't use stale data.
      queryClient.clear()
      return (
        <PageDataContextProvider basePageDataUrl={`${BASE_PAGE_DATA_URL}/commits`}>
          <QueryClientProvider client={queryClient}>
            <Wrapper appPayload={{helpUrl: ''}}>
              <Story />
            </Wrapper>
          </QueryClientProvider>
        </PageDataContextProvider>
      )
    },
  ],
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof PullRequestHeader>

export default meta

const defaultArgs = getCommitsRoutePayload()

type Story = StoryObj<typeof PullRequestHeader>

export const Open: Story = {
  args: defaultArgs,
  render: (args: PullRequestHeaderProps) => <PullRequestHeader {...args} />,
}

export const Closed: Story = {
  args: {
    ...defaultArgs,
    pullRequest: {
      ...defaultArgs['pullRequest'],
      state: 'closed',
    },
    user: {
      ...defaultArgs['user'],
      canChangeBase: false,
    },
  },
  render: (args: PullRequestHeaderProps) => <PullRequestHeader {...args} />,
}

export const Queued: Story = {
  args: {
    ...defaultArgs,
    pullRequest: {
      ...defaultArgs['pullRequest'],
      state: 'queued',
    },
    user: {
      ...defaultArgs['user'],
      canChangeBase: false,
    },
  },
  render: (args: PullRequestHeaderProps) => <PullRequestHeader {...args} />,
}

export const Merged: Story = {
  args: {
    ...defaultArgs,
    pullRequest: {
      ...defaultArgs['pullRequest'],
      state: 'merged',
    },
    user: {
      ...defaultArgs['user'],
      canChangeBase: false,
    },
  },
  render: (args: PullRequestHeaderProps) => <PullRequestHeader {...args} />,
}

export const Draft: Story = {
  args: {
    ...defaultArgs,
    pullRequest: {
      ...defaultArgs['pullRequest'],
      state: 'draft',
    },
  },
  render: (args: PullRequestHeaderProps) => <PullRequestHeader {...args} />,
}

export const CannotEditTitle: Story = {
  args: {
    ...defaultArgs,
    user: {
      ...defaultArgs['user'],
      canEditTitle: false,
    },
  },
  render: (args: PullRequestHeaderProps) => <PullRequestHeader {...args} />,
}

export const CannotChangeBase: Story = {
  args: {
    ...defaultArgs,
    user: {
      ...defaultArgs['user'],
      canChangeBase: false,
    },
  },
  render: (args: PullRequestHeaderProps) => <PullRequestHeader {...args} />,
}

export const CodespacesDisabled: Story = {
  args: {
    ...defaultArgs,
    repository: {
      ...defaultArgs['repository'],
      codespacesEnabled: false,
    },
  },
  render: (args: PullRequestHeaderProps) => <PullRequestHeader {...args} />,
}

export const CodespacesEnterprise: Story = {
  args: {
    ...defaultArgs,
    repository: {
      ...defaultArgs['repository'],
      isEnterprise: true,
    },
  },
  render: (args: PullRequestHeaderProps) => <PullRequestHeader {...args} />,
}

export const CopilotEnabled: Story = {
  args: {
    ...defaultArgs,
    repository: {
      ...defaultArgs['repository'],
      copilotEnabled: true,
    },
  },
  render: (args: PullRequestHeaderProps) => <PullRequestHeader {...args} />,
}
