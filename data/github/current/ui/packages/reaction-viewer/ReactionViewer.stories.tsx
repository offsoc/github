import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {Meta} from '@storybook/react'
import {graphql} from 'relay-runtime'

import type {ReactionViewerGroupTestQuery} from './__generated__/ReactionViewerGroupTestQuery.graphql'
import {ReactionViewer} from './ReactionViewer'

type ReactionViewerQueries = {
  reactionGroupsQuery: ReactionViewerGroupTestQuery
}

const meta = {
  title: 'ReactionViewer',
  component: ReactionViewer,
} satisfies Meta<typeof ReactionViewer>

export default meta

export const ReactionViewerExample = {
  decorators: [relayDecorator<typeof ReactionViewer, ReactionViewerQueries>],
  parameters: {
    relay: {
      queries: {
        reactionGroupsQuery: {
          type: 'fragment',
          query: graphql`
            query ReactionViewerGroupTestQuery($id: ID!) @relay_test_operation {
              issue: node(id: $id) {
                ... on Issue {
                  ...ReactionViewerGroups
                }
              }
            }
          `,
          variables: {id: 'abc'},
        },
      },
      mockResolvers: {
        Issue() {
          return {
            id: 'abc',
            reactionGroups: [
              {
                content: 'THUMBS_UP',
                reactors: {edges: [], totalCount: 0},
                viewerHasReacted: false,
              },
              {
                content: 'THUMBS_DOWN',
                reactors: {edges: [], totalCount: 0},
                viewerHasReacted: false,
              },
              {
                content: 'LAUGH',
                reactors: {edges: [], totalCount: 0},
                viewerHasReacted: false,
              },
              {
                content: 'HOORAY',
                reactors: {edges: [], totalCount: 0},
                viewerHasReacted: false,
              },
              {
                content: 'CONFUSED',
                reactors: {edges: [], totalCount: 0},
                viewerHasReacted: false,
              },
              {
                content: 'HEART',
                reactors: {edges: [], totalCount: 0},
                viewerHasReacted: false,
              },
              {
                content: 'ROCKET',
                reactors: {edges: [], totalCount: 0},
                viewerHasReacted: false,
              },
              {
                content: 'EYES',
                reactors: {edges: [], totalCount: 0},
                viewerHasReacted: false,
              },
            ],
          }
        },
        User() {
          return {
            id: 'user',
            login: 'monalisa',
          }
        },
      },
      mapStoryArgs: ({queryData: {reactionGroupsQuery}}) => ({
        reactionGroups: reactionGroupsQuery.issue!,
        subjectId: 'abc',
      }),
    },
  },
} satisfies RelayStoryObj<typeof ReactionViewer, ReactionViewerQueries>
