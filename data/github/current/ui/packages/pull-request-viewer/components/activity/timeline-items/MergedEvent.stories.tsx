// import type {Meta} from '@storybook/react'
import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {Meta} from '@storybook/react'
import {graphql} from 'relay-runtime'

import type {MergedEventManualMergeStoryQuery} from './__generated__/MergedEventManualMergeStoryQuery.graphql'
import type {MergedEventMergeQueueApiStoryQuery} from './__generated__/MergedEventMergeQueueApiStoryQuery.graphql'
import type {MergedEventMergeQueueStoryQuery} from './__generated__/MergedEventMergeQueueStoryQuery.graphql'
import {MergedEvent} from './MergedEvent'

type MergedEventQueries = {
  mergedEventQuery:
    | MergedEventManualMergeStoryQuery
    | MergedEventMergeQueueStoryQuery
    | MergedEventMergeQueueApiStoryQuery
}

const meta = {
  title: 'PullRequestViewer/ActivityView/MergedEvent',
  component: MergedEvent,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof MergedEvent>

export default meta

const defaultArgs = {
  pullRequestUrl: '/monalisa/smile/pull/7',
}

const mockMergedEvent = {
  databaseId: 123,
  createdAt: '2021-01-01T00:00:00Z',
  viaMergeQueue: false,
  viaMergeQueueAPI: false,
  mergeRefName: 'main',
  mergeCommit: {
    oid: '9e7341906dcde47785faee95f9bb41d57c7391fd',
    abbreviatedOid: '9e73419',
  },
  actor: {
    login: 'test-user',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
  },
}

export const ManualMergeExample = {
  decorators: [relayDecorator<typeof MergedEvent, MergedEventQueries>],
  parameters: {
    relay: {
      queries: {
        mergedEventQuery: {
          type: 'fragment',
          query: graphql`
            query MergedEventManualMergeStoryQuery($id: ID!) @relay_test_operation {
              mergedEvent: node(id: $id) {
                ...MergedEvent_mergedEvent
              }
            }
          `,
          variables: {id: 'abc123'},
        },
      },
      mockResolvers: {
        MergedEvent() {
          return mockMergedEvent
        },
      },
      mapStoryArgs: ({queryData: {mergedEventQuery}}) => {
        return {
          ...defaultArgs,
          queries: {mergedEventQuery},
          queryRef: mergedEventQuery.mergedEvent!,
        }
      },
    },
  },
} satisfies RelayStoryObj<typeof MergedEvent, MergedEventQueries>

export const MergeQueueExample = {
  decorators: [relayDecorator<typeof MergedEvent, MergedEventQueries>],
  parameters: {
    relay: {
      queries: {
        mergedEventQuery: {
          type: 'fragment',
          query: graphql`
            query MergedEventMergeQueueStoryQuery($id: ID!) @relay_test_operation {
              mergedEvent: node(id: $id) {
                ...MergedEvent_mergedEvent
              }
            }
          `,
          variables: {id: 'abc123'},
        },
      },
      mockResolvers: {
        MergedEvent() {
          return {
            ...mockMergedEvent,
            viaMergeQueue: true,
            viaMergeQueueAPI: false,
          }
        },
      },
      mapStoryArgs: ({queryData: {mergedEventQuery}}) => {
        return {
          ...defaultArgs,
          queries: {mergedEventQuery},
          queryRef: mergedEventQuery.mergedEvent!,
        }
      },
    },
  },
} satisfies RelayStoryObj<typeof MergedEvent, MergedEventQueries>

export const MergeQueueApiExample = {
  decorators: [relayDecorator<typeof MergedEvent, MergedEventQueries>],
  parameters: {
    relay: {
      queries: {
        mergedEventQuery: {
          type: 'fragment',
          query: graphql`
            query MergedEventMergeQueueApiStoryQuery($id: ID!) @relay_test_operation {
              mergedEvent: node(id: $id) {
                ...MergedEvent_mergedEvent
              }
            }
          `,
          variables: {id: 'abc123'},
        },
      },
      mockResolvers: {
        MergedEvent() {
          return {
            ...mockMergedEvent,
            viaMergeQueue: true,
            viaMergeQueueAPI: true,
          }
        },
      },
      mapStoryArgs: ({queryData: {mergedEventQuery}}) => {
        return {
          ...defaultArgs,
          queries: {mergedEventQuery},
          queryRef: mergedEventQuery.mergedEvent!,
        }
      },
    },
  },
} satisfies RelayStoryObj<typeof MergedEvent, MergedEventQueries>
