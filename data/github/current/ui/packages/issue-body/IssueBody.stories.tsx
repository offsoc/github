import {noop} from '@github-ui/noop'
import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {Meta} from '@storybook/react'
import {graphql} from 'react-relay'

import type {IssueBodyQuery} from './__generated__/IssueBodyQuery.graphql'
import {IssueBody} from './IssueBody'

type IssueBodyQueries = {
  issueBodyQuery: IssueBodyQuery
}

const meta = {
  title: 'IssueBody',
  component: IssueBody,
} satisfies Meta<typeof IssueBody>

export default meta

export const Example = {
  decorators: [relayDecorator<typeof IssueBody, IssueBodyQueries>],
  parameters: {
    relay: {
      queries: {
        issueBodyQuery: {
          type: 'fragment',
          query: graphql`
            query IssueBodyQuery @relay_test_operation {
              repository(owner: "owner", name: "repo") {
                issue(number: 33) {
                  ...IssueBody
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
            body: 'hello',
            bodyHTML: 'hello',
            createdAt: '2021-01-01',
            author: {login: 'monalisa', avatarUrl: 'https://avatars.githubusercontent.com/u/9919?s=40&v=4'},
            locked: false,
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
      },
      mapStoryArgs: ({queryData: {issueBodyQuery}}) => ({
        issue: issueBodyQuery.repository!.issue!,
        onCommentReply: noop,
      }),
    },
  },
} satisfies RelayStoryObj<typeof IssueBody, IssueBodyQueries>
