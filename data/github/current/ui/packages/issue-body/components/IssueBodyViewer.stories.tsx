import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {SafeHTMLString} from '@github-ui/safe-html'
import type {Meta} from '@storybook/react'
import {graphql} from 'react-relay'

import type {IssueBodyViewerReactionsStoryQuery} from './__generated__/IssueBodyViewerReactionsStoryQuery.graphql'
import {IssueBodyViewer} from './IssueBodyViewer'

type IssueBodyViewerQueries = {
  reactionGroupsQuery: IssueBodyViewerReactionsStoryQuery
}

const meta = {
  title: 'IssueBodyViewer',
  component: IssueBodyViewer,
} satisfies Meta<typeof IssueBodyViewer>

export default meta

export const Example = {
  decorators: [relayDecorator<typeof IssueBodyViewer, IssueBodyViewerQueries>],
  parameters: {
    relay: {
      queries: {
        reactionGroupsQuery: {
          type: 'fragment',
          query: graphql`
            query IssueBodyViewerReactionsStoryQuery @relay_test_operation {
              issue: node(id: "abc") {
                ... on Issue {
                  ...IssueBodyViewer
                  ...IssueBodyViewerReactable
                }
              }
            }
          `,
          variables: {},
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
        Actor() {
          return {
            id: 'user',
            login: 'monalisa',
          }
        },
      },
      mapStoryArgs: ({queryData: {reactionGroupsQuery}}) => ({
        html: 'hello world' as SafeHTMLString,
        markdown: 'hello world',
        comment: reactionGroupsQuery.issue!,
        bodyVersion: '1',
        locked: false,
        viewerCanUpdate: true,
        reactable: reactionGroupsQuery.issue!,
      }),
    },
  },
} satisfies RelayStoryObj<typeof IssueBodyViewer, IssueBodyViewerQueries>
