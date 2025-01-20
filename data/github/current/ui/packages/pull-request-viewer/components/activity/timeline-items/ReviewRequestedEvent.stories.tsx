// import type {Meta} from '@storybook/react'
import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {Meta} from '@storybook/react'
import {graphql} from 'relay-runtime'

import type {ReviewRequestedEventAssignedFromTeamStoryQuery} from './__generated__/ReviewRequestedEventAssignedFromTeamStoryQuery.graphql'
import type {ReviewRequestedEventCodeOwnerStoryQuery} from './__generated__/ReviewRequestedEventCodeOwnerStoryQuery.graphql'
import type {ReviewRequestedEventSimpleStoryQuery} from './__generated__/ReviewRequestedEventSimpleStoryQuery.graphql'
import {ReviewRequestedEvent} from './ReviewRequestedEvent'

type ReviewRequestedEventQueries = {
  reviewRequestedEventQuery:
    | ReviewRequestedEventSimpleStoryQuery
    | ReviewRequestedEventCodeOwnerStoryQuery
    | ReviewRequestedEventAssignedFromTeamStoryQuery
}

const meta = {
  title: 'PullRequestViewer/ActivityView/ReviewRequestedEvent',
  component: ReviewRequestedEvent,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof ReviewRequestedEvent>

export default meta

const defaultArgs = {
  pullRequestUrl: '/monalisa/smile/pull/7',
}

const mockReviewRequestedEvent = {
  databaseId: 123,
  createdAt: '2021-01-01T00:00:00Z',
  actor: {
    login: 'test-user',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
  },
  requestedReviewAssignedFromTeamName: null,
  reviewRequest: {
    codeOwnersResourcePath: null,
    requestedReviewer: {
      __typename: 'User',
      login: 'other-user',
      resourcePath: '/other-user',
    },
  },
}

export const Simple = {
  decorators: [relayDecorator<typeof ReviewRequestedEvent, ReviewRequestedEventQueries>],
  parameters: {
    relay: {
      queries: {
        reviewRequestedEventQuery: {
          type: 'fragment',
          query: graphql`
            query ReviewRequestedEventSimpleStoryQuery($id: ID!) @relay_test_operation {
              reviewRequestedEvent: node(id: $id) {
                ...ReviewRequestedEvent_reviewRequestedEvent
              }
            }
          `,
          variables: {id: 'abc123'},
        },
      },
      mockResolvers: {
        ReviewRequestedEvent() {
          return mockReviewRequestedEvent
        },
      },
      mapStoryArgs: ({queryData: {reviewRequestedEventQuery}}) => {
        return {
          ...defaultArgs,
          queries: {reviewRequestedEventQuery},
          queryRef: reviewRequestedEventQuery.reviewRequestedEvent!,
        }
      },
    },
  },
} satisfies RelayStoryObj<typeof ReviewRequestedEvent, ReviewRequestedEventQueries>

export const CodeOwner = {
  decorators: [relayDecorator<typeof ReviewRequestedEvent, ReviewRequestedEventQueries>],
  parameters: {
    relay: {
      queries: {
        reviewRequestedEventQuery: {
          type: 'fragment',
          query: graphql`
            query ReviewRequestedEventCodeOwnerStoryQuery($id: ID!) @relay_test_operation {
              reviewRequestedEvent: node(id: $id) {
                ...ReviewRequestedEvent_reviewRequestedEvent
              }
            }
          `,
          variables: {id: 'abc123'},
        },
      },
      mockResolvers: {
        ReviewRequestedEvent() {
          return {
            ...mockReviewRequestedEvent,
            reviewRequest: {
              codeOwnersResourcePath: '/path/to/CODEOWNERS#L42',
              requestedReviewer: {
                __typename: 'Team',
                combinedSlug: 'github/some-reviewers',
                resourcePath: '/org/github/teams/some-reviewers',
              },
            },
          }
        },
      },
      mapStoryArgs: ({queryData: {reviewRequestedEventQuery}}) => {
        return {
          ...defaultArgs,
          queries: {reviewRequestedEventQuery},
          queryRef: reviewRequestedEventQuery.reviewRequestedEvent!,
        }
      },
    },
  },
} satisfies RelayStoryObj<typeof ReviewRequestedEvent, ReviewRequestedEventQueries>

export const AssignedFromTeam = {
  decorators: [relayDecorator<typeof ReviewRequestedEvent, ReviewRequestedEventQueries>],
  parameters: {
    relay: {
      queries: {
        reviewRequestedEventQuery: {
          type: 'fragment',
          query: graphql`
            query ReviewRequestedEventAssignedFromTeamStoryQuery($id: ID!) @relay_test_operation {
              reviewRequestedEvent: node(id: $id) {
                ...ReviewRequestedEvent_reviewRequestedEvent
              }
            }
          `,
          variables: {id: 'abc123'},
        },
      },
      mockResolvers: {
        ReviewRequestedEvent() {
          return {
            ...mockReviewRequestedEvent,
            requestedReviewAssignedFromTeamName: 'github/some-reviewers',
          }
        },
      },
      mapStoryArgs: ({queryData: {reviewRequestedEventQuery}}) => {
        return {
          ...defaultArgs,
          queries: {reviewRequestedEventQuery},
          queryRef: reviewRequestedEventQuery.reviewRequestedEvent!,
        }
      },
    },
  },
} satisfies RelayStoryObj<typeof ReviewRequestedEvent, ReviewRequestedEventQueries>
