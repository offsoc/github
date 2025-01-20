import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {Meta} from '@storybook/react'
import {MockPullRequestResolvedData} from '../../__tests__/__utils__/mock-data'
import type {CopilotDiffChatHeaderMenu_Query} from './__generated__/CopilotDiffChatHeaderMenu_Query.graphql'
import {CopilotDiffChatHeaderMenu} from './CopilotDiffChatHeaderMenu'

type Queries = {
  entry: CopilotDiffChatHeaderMenu_Query
}

const meta = {
  title: 'Apps/Copilot/Diff Chat/CopilotDiffChatHeaderMenu',
  component: () => (
    <div style={{marginLeft: '200px'}}>
      <CopilotDiffChatHeaderMenu
        queryVariables={{
          startOid: '',
          endOid: '',
          pullRequestId: MockPullRequestResolvedData.id,
        }}
      />
    </div>
  ),
} satisfies Meta<typeof CopilotDiffChatHeaderMenu>

export default meta

export const Example = {
  name: 'CopilotDiffChatHeaderMenu',
  decorators: [relayDecorator<typeof CopilotDiffChatHeaderMenu, Queries>],
  parameters: {
    relay: {
      queries: {entry: {type: 'lazy'}},
      mockResolvers: {
        PullRequest: () => MockPullRequestResolvedData,
        PullRequestDiffEntry: () => MockPullRequestResolvedData.comparison.diffEntry,
      },
    },
  },
} satisfies RelayStoryObj<typeof CopilotDiffChatHeaderMenu, Queries>
