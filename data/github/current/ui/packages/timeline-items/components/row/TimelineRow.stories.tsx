// import type {Meta} from '@storybook/react'
import {TimelineRow} from './TimelineRow'
import {GitCommitIcon} from '@primer/octicons-react'
import type {Meta} from '@storybook/react'
import {graphql} from 'relay-runtime'
import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {TimelineRowStoryActorQuery} from './__generated__/TimelineRowStoryActorQuery.graphql'

type TimelineRowQueries = {
  actorQuery: TimelineRowStoryActorQuery
}

const meta = {
  title: 'TimelineEvents/TimelineRow',
  component: TimelineRow,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof TimelineRow>

export default meta

const defaultArgs = {
  highlighted: false,
  createdAt: '2021-01-01T00:00:00Z',
  deepLinkUrl: '/monalisa/smile/pull/7#events-abc123',
  showAgoTimestamp: true,
  showActorName: true,
  children: <TimelineRow.Main> Did something eventful</TimelineRow.Main>,
  leadingIcon: GitCommitIcon,
}

export const Example = {
  decorators: [relayDecorator<typeof TimelineRow, TimelineRowQueries>],
  parameters: {
    relay: {
      queries: {
        actorQuery: {
          type: 'fragment',
          query: graphql`
            query TimelineRowStoryActorQuery @relay_test_operation {
              viewer {
                ...TimelineRowEventActor
              }
            }
          `,
          variables: {},
        },
      },
      mockResolvers: {
        User() {
          return {avatarUrl: 'http://alambic.github.localhost/avatars/u/2', login: 'monalisa'}
        },
      },
      mapStoryArgs: ({queryData: {actorQuery}}) => {
        return {
          ...defaultArgs,
          queries: {actorQuery},
          actor: actorQuery.viewer,
        }
      },
    },
  },
} satisfies RelayStoryObj<typeof TimelineRow, TimelineRowQueries>
