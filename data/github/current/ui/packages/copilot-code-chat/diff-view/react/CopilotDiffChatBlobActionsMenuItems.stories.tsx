import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {ChevronDownIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu} from '@primer/react'
import type {Meta} from '@storybook/react'
import {MockPullRequestResolvedData, MockViewerResolvedData} from '../../__tests__/__utils__/mock-data'
import {CopilotDiffChatBlobActionsMenuItems} from './CopilotDiffChatBlobActionsMenuItems'
import type {DiffChatWrapper_ComparisonQuery} from './__generated__/DiffChatWrapper_ComparisonQuery.graphql'
import type {DiffChatWrapper_DiffEntryQuery} from './__generated__/DiffChatWrapper_DiffEntryQuery.graphql'
import type {DiffChatWrapper_ViewerQuery} from './__generated__/DiffChatWrapper_ViewerQuery.graphql'

const StoryComponent = () => (
  <ActionMenu>
    <ActionMenu.Button trailingVisual={ChevronDownIcon}>Example Menu</ActionMenu.Button>

    <ActionMenu.Overlay width="medium">
      <ActionList>
        <CopilotDiffChatBlobActionsMenuItems
          queryVariables={{
            startOid: '',
            endOid: '',
            pullRequestId: MockPullRequestResolvedData.id,
            diffEntryId: MockPullRequestResolvedData.comparison.diffEntry.id,
          }}
        />
      </ActionList>
    </ActionMenu.Overlay>
  </ActionMenu>
)

type Queries = {
  viewer: DiffChatWrapper_ViewerQuery
  entry: DiffChatWrapper_DiffEntryQuery
  comparison: DiffChatWrapper_ComparisonQuery
}

const meta = {
  title: 'Apps/Copilot/Diff Chat/CopilotDiffChatBlobActionsMenuItems',
  component: StoryComponent,
} satisfies Meta<typeof CopilotDiffChatBlobActionsMenuItems>

export default meta

export const Example = {
  name: 'CopilotDiffChatBlobActionsMenuItems',
  decorators: [relayDecorator<typeof CopilotDiffChatBlobActionsMenuItems, Queries>],
  parameters: {
    relay: {
      queries: {
        viewer: {type: 'lazy'},
        entry: {type: 'lazy'},
        comparison: {type: 'lazy'},
      },
      mockResolvers: {
        User: () => MockViewerResolvedData,
        PullRequest: () => MockPullRequestResolvedData,
        PullRequestComparison: () => MockPullRequestResolvedData.comparison,
        PullRequestDiffEntry: () => MockPullRequestResolvedData.comparison.diffEntry,
      },
    },
  },
} satisfies RelayStoryObj<typeof CopilotDiffChatBlobActionsMenuItems, Queries>
