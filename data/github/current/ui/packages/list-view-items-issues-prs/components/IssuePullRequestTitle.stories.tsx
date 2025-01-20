import type {ReactElement} from 'react'
import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {Meta} from '@storybook/react'
import {graphql} from 'relay-runtime'

import type {IssuePullRequestTitleTestQuery} from './__generated__/IssuePullRequestTitleTestQuery.graphql'
import {IssuePullRequestTitle} from './IssuePullRequestTitle'
import {ListView} from '@github-ui/list-view'
import {ListItem} from '@github-ui/list-view/ListItem'
import type {ListItemTitle} from '@github-ui/list-view/ListItemTitle'

type IssuePullRequestTitleQueries = {
  issuePullRequestTitleQuery: IssuePullRequestTitleTestQuery
}

const meta = {
  title: 'ListViewItemsIssuesPrs',
  component: IssuePullRequestTitle,
} satisfies Meta<typeof IssuePullRequestTitle>

export default meta

export const IssuePullRequestTitleExample = {
  decorators: [
    relayDecorator<typeof IssuePullRequestTitle, IssuePullRequestTitleQueries>,
    story => (
      <ListView title="test">
        <ListItem title={story() as ReactElement<typeof ListItemTitle, string>} />
      </ListView>
    ),
  ],
  parameters: {
    relay: {
      queries: {
        issuePullRequestTitleQuery: {
          type: 'fragment',
          query: graphql`
            query IssuePullRequestTitleTestQuery($id: ID!) @relay_test_operation {
              data: node(id: $id) {
                ... on Issue {
                  ...IssuePullRequestTitle @arguments(labelPageSize: 10)
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
            number: 123,
            issueType: {
              id: 'it-xyz',
              name: 'Bug',
              isEnabled: true,
            },
            viewerCanSeeIssueType: true,
            reactionGroups: [],
          }
        },
      },
      mapStoryArgs: ({queryData: {issuePullRequestTitleQuery}}) => ({
        value: 'Example Title',
        repositoryOwner: 'github',
        repositoryName: 'issues',
        dataKey: issuePullRequestTitleQuery.data!,
      }),
    },
  },
} satisfies RelayStoryObj<typeof IssuePullRequestTitle, IssuePullRequestTitleQueries>
