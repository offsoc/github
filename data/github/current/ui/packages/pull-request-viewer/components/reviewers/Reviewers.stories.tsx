import type {Meta, StoryObj} from '@storybook/react'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {
  buildOnBehalfOfReviewer,
  buildPullRequest,
  buildReview,
  buildReviewRequest,
  buildSuggestedReviewer,
} from '../../test-utils/query-data'
import {ReviewersTestComponent as Reviewers} from './ReviewersTestComponent'

const meta: Meta<typeof Reviewers> = {
  title: 'Apps/React Shared/Pull Requests/Reviewers',
  component: Reviewers,
  decorators: [
    Story => (
      <div style={{maxWidth: '600px'}}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'list',
            enabled: false,
          },
        ],
      },
    },
  },
}

type Story = StoryObj<typeof Reviewers>

export const PendingReviewersStory: Story = (function () {
  const environment = createMockEnvironment()

  return {
    argTypes: {
      environment: {table: {disable: true}},
    },
    args: {
      environment,
    },
    render: args => <Reviewers {...args} />,
    play: () => {
      environment.mock.resolveMostRecentOperation(operation => {
        return MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              state: 'CLOSED',
              viewerCanUpdate: false,
              reviewRequests: [
                buildReviewRequest({login: 'monalisa', assignedFromTeam: 'Team1'}),
                buildReviewRequest({
                  login: 'collaborator',
                  assignedFromTeam: 'Team2',
                  assignedFromTeamIsCodeowner: true,
                }),
                buildReviewRequest({login: 'Team1', isTeam: true}),
              ],
            })
          },
        })
      })
    },
  }
})()

export const SuggestedReviewersStory: Story = (function () {
  const environment = createMockEnvironment()

  return {
    argTypes: {
      environment: {table: {disable: true}},
    },
    args: {
      environment,
    },
    render: args => <Reviewers {...args} />,
    play: () => {
      environment.mock.resolveMostRecentOperation(operation => {
        return MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              state: 'OPEN',
              suggestedReviewers: [buildSuggestedReviewer({login: 'suggestedReviewer1'})],
              viewerCanUpdate: true,
            })
          },
        })
      })
    },
    parameters: {
      a11y: {
        config: {
          rules: [
            {
              id: 'list',
              enabled: false,
            },
          ],
        },
      },
    },
  }
})()

export const MixedReviewerStatesStory: Story = (function () {
  const environment = createMockEnvironment()

  return {
    argTypes: {
      environment: {table: {disable: true}},
    },
    args: {
      environment,
    },
    render: args => <Reviewers {...args} />,
    play: () => {
      environment.mock.resolveMostRecentOperation(operation => {
        return MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              state: 'OPEN',
              viewerCanUpdate: true,
              latestReviews: [
                buildReview({
                  login: 'approving-reviewer',
                  state: 'APPROVED',
                  onBehalfOfReviewers: [buildOnBehalfOfReviewer({asCodeowner: true, name: 'github/pull-requests'})],
                }),
                buildReview({
                  login: 'discerning-reviewer',
                  state: 'CHANGES_REQUESTED',
                }),
                buildReview({
                  login: 'commenter',
                  state: 'COMMENTED',
                }),
                buildReview({
                  login: 'dismissed-reviewer',
                  state: 'DISMISSED',
                }),
              ],
              reviewRequests: [
                buildReviewRequest({login: 'monalisa', assignedFromTeam: 'Team1'}),
                buildReviewRequest({login: 'Team1', isTeam: true}),
              ],
            })
          },
        })
      })
    },
  }
})()

export default meta
