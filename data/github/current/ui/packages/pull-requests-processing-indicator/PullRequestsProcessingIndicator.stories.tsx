import type {Meta} from '@storybook/react'
import {PullRequestsProcessingIndicator} from './PullRequestsProcessingIndicator'
import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {Box} from '@primer/react'

const args = {
  pullRequestId: 1,
  repositoryId: 1,
  stale: true,
  latest_unsynced_push_to_head_ref_at: new Date(new Date().getTime() - 20000),
}

const meta = {
  title: 'PullRequestsProcessingIndicator',
  component: PullRequestsProcessingIndicator,
  decorators: [
    Story => (
      <Box sx={{p: 3}}>
        <AnalyticsProvider appName="pull-requests-storybook" category="" metadata={{}}>
          <Story />
        </AnalyticsProvider>
      </Box>
    ),
  ],
} satisfies Meta<typeof PullRequestsProcessingIndicator>

export default meta

export const Example = {
  args,
}
