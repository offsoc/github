import type {ReactElement} from 'react'
import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {Meta} from '@storybook/react'
import {graphql} from 'relay-runtime'

import type {IssuePullRequestStateIconTestQuery} from './__generated__/IssuePullRequestStateIconTestQuery.graphql'
import {IssuePullRequestStateIcon} from './IssuePullRequestStateIcon'
import {ListView} from '@github-ui/list-view'
import {ListItem} from '@github-ui/list-view/ListItem'
import type {ListItemTitle} from '@github-ui/list-view/ListItemTitle'

type IssuePullRequestStateIconQueries = {
  issuePullRequestStateIconQuery: IssuePullRequestStateIconTestQuery
}

const meta = {
  title: 'ListViewItemsIssuesPrs',
  component: IssuePullRequestStateIcon,
} satisfies Meta<typeof IssuePullRequestStateIcon>

export default meta

export const IssuePullRequestStateIconExample = {
  decorators: [
    relayDecorator<typeof IssuePullRequestStateIcon, IssuePullRequestStateIconQueries>,
    story => (
      <ListView title="test">
        <ListItem title={story() as ReactElement<typeof ListItemTitle, string>} />
      </ListView>
    ),
  ],
  parameters: {
    relay: {
      queries: {
        issuePullRequestStateIconQuery: {
          type: 'fragment',
          query: graphql`
            query IssuePullRequestStateIconTestQuery($id: ID!) @relay_test_operation {
              data: node(id: $id) {
                ... on Issue {
                  ...IssuePullRequestStateIcon
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
            title: 'title',
            titleHtml: 'title',
            labels: {nodes: []},
            assignees: {edges: [{node: {login: 'monalisa', avatarUrl: 'https://github.com/github.png?size=40'}}]},
            totalCommentsCount: 33,
            repository: {
              nameWithOwner: 'github/issues',
            },
            number: 123,
            issueType: {
              id: 'it-xyz',
              name: 'Bug',
              isEnabled: true,
            },
            viewerCanSeeIssueType: true,
            reactionGroups: [],
            state: 'CLOSED',
            stateReason: 'NOT_PLANNED',
            isReadByViewer: true,
          }
        },
      },
      mapStoryArgs: ({queryData: {issuePullRequestStateIconQuery}}) => ({
        dataKey: issuePullRequestStateIconQuery.data!,
      }),
    },
  },
} satisfies RelayStoryObj<typeof IssuePullRequestStateIcon, IssuePullRequestStateIconQueries>
