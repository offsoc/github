import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {Meta} from '@storybook/react'
import {graphql} from 'react-relay'

import type {IssueBodyHeaderStoryQuery} from './__generated__/IssueBodyHeaderStoryQuery.graphql'
import {IssueBodyHeader} from './IssueBodyHeader'

type IssueBodyHeaderQueries = {
  issueBodyHeaderQuery: IssueBodyHeaderStoryQuery
}

const meta = {
  title: 'IssueBodyHeader',
  component: IssueBodyHeader,
} satisfies Meta<typeof IssueBodyHeader>

export default meta

export const Example = {
  decorators: [relayDecorator<typeof IssueBodyHeader, IssueBodyHeaderQueries>],
  parameters: {
    relay: {
      queries: {
        issueBodyHeaderQuery: {
          type: 'fragment',
          query: graphql`
            query IssueBodyHeaderStoryQuery @relay_test_operation {
              issue: node(id: "abc") {
                ... on Issue {
                  ...IssueBodyHeader
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
            author: {
              login: 'monalisa',
              avatarUrl: 'https://avatars.githubusercontent.com/u/9919?s=40&v=4',
            },
            id: 'abc',
            viewerCanReadUserContentEdits: true,
            lastEditedAt: '2021-08-05T18:00:00Z',
            createdAt: '2021-08-05T18:00:00Z',
          }
        },
      },
      mapStoryArgs: ({queryData: {issueBodyHeaderQuery}}) => ({
        comment: issueBodyHeaderQuery.issue!,
      }),
    },
  },
} satisfies RelayStoryObj<typeof IssueBodyHeader, IssueBodyHeaderQueries>
