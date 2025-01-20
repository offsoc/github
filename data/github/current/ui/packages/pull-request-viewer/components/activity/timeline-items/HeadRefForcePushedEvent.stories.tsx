import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {Meta} from '@storybook/react'
import {graphql} from 'relay-runtime'

import type {HeadRefForcePushedEventStoryQuery} from './__generated__/HeadRefForcePushedEventStoryQuery.graphql'
import {HeadRefForcePushedEvent} from './HeadRefForcePushedEvent'

type HeadRefForcePushedEventQueries = {
  headRefForcePushedEventQuery: HeadRefForcePushedEventStoryQuery
}

const meta = {
  title: 'PullRequestViewer/ActivityView/HeadRefForcePushedEvent',
  component: HeadRefForcePushedEvent,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof HeadRefForcePushedEvent>

export default meta

const defaultArgs = {
  pullRequestUrl: '/monalisa/smile/pull/7',
  repositoryUrl: '/monalisa/smile',
}

const mockHeadRefForcePushEvent = {
  databaseId: 123,
  refName: 'refs/heads/feature',
  beforeCommit: {
    abbreviatedOid: 'abc123',
    oid: 'abc123efg456',
  },
  afterCommit: {
    abbreviatedOid: 'def123',
    oid: 'def123efg456',
    authoredDate: '2021-01-01T00:00:00Z',
    authors: {
      edges: [
        {
          node: {
            user: {
              login: 'test-user',
              avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
            },
          },
        },
      ],
    },
  },
}

export const Example = {
  decorators: [relayDecorator<typeof HeadRefForcePushedEvent, HeadRefForcePushedEventQueries>],
  parameters: {
    relay: {
      queries: {
        headRefForcePushedEventQuery: {
          type: 'fragment',
          query: graphql`
            query HeadRefForcePushedEventStoryQuery($id: ID!) @relay_test_operation {
              headRefForcePushedEvent: node(id: $id) {
                ...HeadRefForcePushedEvent_headRefForcePushedEvent
              }
            }
          `,
          variables: {id: 'abc123'},
        },
      },
      mockResolvers: {
        HeadRefForcePushedEvent() {
          return mockHeadRefForcePushEvent
        },
      },
      mapStoryArgs: ({queryData: {headRefForcePushedEventQuery}}) => {
        return {
          ...defaultArgs,
          queries: {headRefForcePushedEventQuery},
          queryRef: headRefForcePushedEventQuery.headRefForcePushedEvent!,
        }
      },
    },
  },
} satisfies RelayStoryObj<typeof HeadRefForcePushedEvent, HeadRefForcePushedEventQueries>
