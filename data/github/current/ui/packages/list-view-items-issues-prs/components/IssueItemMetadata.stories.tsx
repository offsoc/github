import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {Meta} from '@storybook/react'
import {graphql} from 'relay-runtime'

import type {IssueItemMetadataTestQuery} from './__generated__/IssueItemMetadataTestQuery.graphql'
import {IssueItemMetadata} from './IssueItemMetadata'
import {ListView} from '@github-ui/list-view'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItem} from '@github-ui/list-view/ListItem'

type IssueItemMetadataQueries = {
  issueItemMetadataQuery: IssueItemMetadataTestQuery
}

const meta = {
  title: 'ListViewItemsIssuesPrs',
  component: IssueItemMetadata,
} satisfies Meta<typeof IssueItemMetadata>

export default meta

const title = <ListItemTitle value="test" />

export const IssueItemMetadataExample = {
  decorators: [
    relayDecorator<typeof IssueItemMetadata, IssueItemMetadataQueries>,
    story => (
      <ListView title="test">
        <ListItem title={title}>{story()}</ListItem>
      </ListView>
    ),
  ],
  parameters: {
    relay: {
      queries: {
        issueItemMetadataQuery: {
          type: 'fragment',
          query: graphql`
            query IssueItemMetadataTestQuery($id: ID!) @relay_test_operation {
              data: node(id: $id) {
                ... on Issue {
                  ...IssueItemMetadata @arguments(assigneePageSize: 10, includeReactions: false)
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
            closedByPullRequestsReferences: {
              totalCount: 29,
            },
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
      mapStoryArgs: ({queryData: {issueItemMetadataQuery}}) => ({
        itemKey: issueItemMetadataQuery.data!,
        showAssignees: true,
        showCommentCount: true,
        showCommentZeroCount: true,
        getMetadataHref: (type, name) => `#test(${type},${name})`,
      }),
    },
  },
} satisfies RelayStoryObj<typeof IssueItemMetadata, IssueItemMetadataQueries>
