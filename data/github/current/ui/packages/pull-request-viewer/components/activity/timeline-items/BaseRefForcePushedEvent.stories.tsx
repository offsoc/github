import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {Meta} from '@storybook/react'
import {graphql} from 'relay-runtime'

import type {BaseRefForcePushedEventStoryQuery} from './__generated__/BaseRefForcePushedEventStoryQuery.graphql'
import {BaseRefForcePushedEvent} from './BaseRefForcePushedEvent'

type BaseRefForcePushedEventQueries = {
  baseRefForcePushedEventQuery: BaseRefForcePushedEventStoryQuery
}

const meta = {
  title: 'PullRequestViewer/ActivityView/BaseRefForcePushedEvent',
  component: BaseRefForcePushedEvent,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof BaseRefForcePushedEvent>

export default meta

const defaultArgs = {
  pullRequestUrl: '/monalisa/smile/pull/7',
  repositoryUrl: '/monalisa/smile',
}

const mockBaseRefForcePushEvent = {
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
  decorators: [relayDecorator<typeof BaseRefForcePushedEvent, BaseRefForcePushedEventQueries>],
  parameters: {
    relay: {
      queries: {
        baseRefForcePushedEventQuery: {
          type: 'fragment',
          query: graphql`
            query BaseRefForcePushedEventStoryQuery($id: ID!) @relay_test_operation {
              baseRefForcePushedEvent: node(id: $id) {
                ...BaseRefForcePushedEvent_baseRefForcePushedEvent
              }
            }
          `,
          variables: {id: 'abc123'},
        },
      },
      mockResolvers: {
        BaseRefForcePushedEvent() {
          return mockBaseRefForcePushEvent
        },
      },
      mapStoryArgs: ({queryData: {baseRefForcePushedEventQuery}}) => {
        return {
          ...defaultArgs,
          queries: {baseRefForcePushedEventQuery},
          queryRef: baseRefForcePushedEventQuery.baseRefForcePushedEvent!,
        }
      },
    },
  },
} satisfies RelayStoryObj<typeof BaseRefForcePushedEvent, BaseRefForcePushedEventQueries>
