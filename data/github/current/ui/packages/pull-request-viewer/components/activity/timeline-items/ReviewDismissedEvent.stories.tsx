import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {Meta} from '@storybook/react'
import {graphql} from 'relay-runtime'

import type {ReviewDismissedEventManualWithReasonStoryQuery} from './__generated__/ReviewDismissedEventManualWithReasonStoryQuery.graphql'
import type {ReviewDismissedEventSelfDismissalStoryQuery} from './__generated__/ReviewDismissedEventSelfDismissalStoryQuery.graphql'
import type {ReviewDismissedEventViaCommitStoryQuery} from './__generated__/ReviewDismissedEventViaCommitStoryQuery.graphql'
import {ReviewDismissedEvent} from './ReviewDismissedEvent'

type ReviewDismissedEventQueries = {
  reviewDismissedEventQuery:
    | ReviewDismissedEventViaCommitStoryQuery
    | ReviewDismissedEventSelfDismissalStoryQuery
    | ReviewDismissedEventManualWithReasonStoryQuery
}

const meta = {
  title: 'PullRequestViewer/ActivityView/ReviewDismissedEvent',
  component: ReviewDismissedEvent,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof ReviewDismissedEvent>

export default meta

const defaultArgs = {
  pullRequestUrl: '/monalisa/smile/pull/7',
}

const mockReviewDismissedEvent = {
  databaseId: 123,
  createdAt: '2021-01-01T00:00:00Z',
  dismissalMessage: 'This is a really long reason to not listen to what it says, Im **just** gonna :shipit:',
  dismissalMessageHTML: null,
  actor: {
    login: 'test-user',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
  },
  review: {
    fullDatabaseId: 42,
    author: {
      login: 'other-user',
    },
  },
  pullRequestCommit: {
    commit: {
      abbreviatedOid: 'abcdef0',
    },
    resourcePath: '/owner/repo/pull/42/commits/abcdef0',
  },
}

export const ViaCommit = {
  decorators: [relayDecorator<typeof ReviewDismissedEvent, ReviewDismissedEventQueries>],
  parameters: {
    relay: {
      queries: {
        reviewDismissedEventQuery: {
          type: 'fragment',
          query: graphql`
            query ReviewDismissedEventViaCommitStoryQuery($id: ID!) @relay_test_operation {
              reviewDismissedEvent: node(id: $id) {
                ...ReviewDismissedEvent_reviewDismissedEvent
              }
            }
          `,
          variables: {id: 'abc123'},
        },
      },
      mockResolvers: {
        ReviewDismissedEvent() {
          return mockReviewDismissedEvent
        },
      },
      mapStoryArgs: ({queryData: {reviewDismissedEventQuery}}) => {
        return {
          ...defaultArgs,
          queries: {reviewDismissedEventQuery},
          queryRef: reviewDismissedEventQuery.reviewDismissedEvent!,
        }
      },
    },
  },
} satisfies RelayStoryObj<typeof ReviewDismissedEvent, ReviewDismissedEventQueries>

export const SelfDismissal = {
  decorators: [relayDecorator<typeof ReviewDismissedEvent, ReviewDismissedEventQueries>],
  parameters: {
    relay: {
      queries: {
        reviewDismissedEventQuery: {
          type: 'fragment',
          query: graphql`
            query ReviewDismissedEventSelfDismissalStoryQuery($id: ID!) @relay_test_operation {
              reviewDismissedEvent: node(id: $id) {
                ...ReviewDismissedEvent_reviewDismissedEvent
              }
            }
          `,
          variables: {id: 'abc123'},
        },
      },
      mockResolvers: {
        ReviewDismissedEvent() {
          return {
            ...mockReviewDismissedEvent,
            review: {
              fullDatabaseId: 42,
              author: {
                login: 'test-user',
              },
            },
          }
        },
      },
      mapStoryArgs: ({queryData: {reviewDismissedEventQuery}}) => {
        return {
          ...defaultArgs,
          queries: {reviewDismissedEventQuery},
          queryRef: reviewDismissedEventQuery.reviewDismissedEvent!,
        }
      },
    },
  },
} satisfies RelayStoryObj<typeof ReviewDismissedEvent, ReviewDismissedEventQueries>

export const ManualWithReason = {
  decorators: [relayDecorator<typeof ReviewDismissedEvent, ReviewDismissedEventQueries>],
  parameters: {
    relay: {
      queries: {
        reviewDismissedEventQuery: {
          type: 'fragment',
          query: graphql`
            query ReviewDismissedEventManualWithReasonStoryQuery($id: ID!) @relay_test_operation {
              reviewDismissedEvent: node(id: $id) {
                ...ReviewDismissedEvent_reviewDismissedEvent
              }
            }
          `,
          variables: {id: 'abc123'},
        },
      },
      mockResolvers: {
        ReviewDismissedEvent() {
          return {
            ...mockReviewDismissedEvent,
            pullRequestCommit: null,
            dismissalMessageHTML:
              // eslint-disable-next-line github/unescaped-html-literal
              "<p>This is a really long reason to why I'm dismissing this review, YOLO, <strong>just</strong> gonna <img width='16' src='https://github.githubassets.com/images/icons/emoji/shipit.png'>.</p>",
          }
        },
      },
      mapStoryArgs: ({queryData: {reviewDismissedEventQuery}}) => {
        return {
          ...defaultArgs,
          queries: {reviewDismissedEventQuery},
          queryRef: reviewDismissedEventQuery.reviewDismissedEvent!,
        }
      },
    },
  },
} satisfies RelayStoryObj<typeof ReviewDismissedEvent, ReviewDismissedEventQueries>
