import {noop} from '@github-ui/noop'
import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {Meta} from '@storybook/react'
import {graphql} from 'react-relay'

import type {IssueBodyHeaderActionsStoryQuery} from './__generated__/IssueBodyHeaderActionsStoryQuery.graphql'
import {IssueBodyHeaderActions} from './IssueBodyHeaderActions'

type IssueBodyHeaderActionsQueries = {
  issueBodyHeaderActionsQuery: IssueBodyHeaderActionsStoryQuery
}

const meta = {
  title: 'IssueBodyHeaderActions',
  component: IssueBodyHeaderActions,
} satisfies Meta<typeof IssueBodyHeaderActions>

export default meta

export const Example = {
  decorators: [relayDecorator<typeof IssueBodyHeaderActions, IssueBodyHeaderActionsQueries>],
  parameters: {
    relay: {
      queries: {
        issueBodyHeaderActionsQuery: {
          type: 'fragment',
          query: graphql`
            query IssueBodyHeaderActionsStoryQuery @relay_test_operation {
              author: node(id: "abc") {
                ... on User {
                  ...IssueBodyHeaderActions
                }
              }
            }
          `,
          variables: {},
        },
      },
      mockResolvers: {
        User() {
          return {
            login: 'monalisa',
            avatarUrl: 'https://avatars.githubusercontent.com/u/9919?s=40&v=4',
          }
        },
      },
      mapStoryArgs: ({queryData: {issueBodyHeaderActionsQuery}}) => ({
        startIssueBodyEdit: noop,
        author: issueBodyHeaderActionsQuery.author!,
        viewerCanUpdate: true,
      }),
    },
  },
} satisfies RelayStoryObj<typeof IssueBodyHeaderActions, IssueBodyHeaderActionsQueries>
