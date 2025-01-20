import type {Meta, StoryObj} from '@storybook/react'
import {PullRequestCodeButton, type PullRequestCodeButtonProps} from './PullRequestCodeButton'
import {PageDataContextProvider} from '@github-ui/pull-request-page-data-tooling/page-data-context'
import {QueryClientProvider} from '@tanstack/react-query'
import {Wrapper} from '@github-ui/react-core/test-utils'
import queryClient from '@github-ui/pull-request-page-data-tooling/query-client'
import {BASE_PAGE_DATA_URL} from '@github-ui/pull-request-page-data-tooling/render-with-query-client'
import {createRepository} from '@github-ui/current-repository/test-helpers'

const meta = {
  title: 'Pull Requests/commits/PullRequestCodeButton',
  component: PullRequestCodeButton,
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
} satisfies Meta<typeof PullRequestCodeButton>

export default meta

const defaultArgs = {
  codespacesEnabled: false,
  copilotEnabled: false,
  headBranch: 'feature-branch',
  isEnterprise: false,
  pullRequestNumber: 12345,
  repository: createRepository(),
}

type Story = StoryObj<typeof PullRequestCodeButton>

export const LocalOnly: Story = {
  args: defaultArgs,
  render: (args: PullRequestCodeButtonProps) => <PullRequestCodeButton {...args} />,
}

export const CodespacesEnabled: Story = {
  args: {...defaultArgs, codespacesEnabled: true},
  render: (args: PullRequestCodeButtonProps) => <PullRequestCodeButton {...args} />,
}

export const CopilotEnabled: Story = {
  args: {...defaultArgs, copilotEnabled: true},
  render: (args: PullRequestCodeButtonProps) => <PullRequestCodeButton {...args} />,
}

export const Enterprise: Story = {
  args: {...defaultArgs, isEnterprise: true},
  render: (args: PullRequestCodeButtonProps) => <PullRequestCodeButton {...args} />,
}
