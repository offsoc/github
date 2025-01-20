import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {Meta} from '@storybook/react'
import {graphql} from 'relay-runtime'

import type {IssueRowTestQuery} from './__generated__/IssueRowTestQuery.graphql'
import {IssueRow, IssuesIndexSecondaryGraphqlQuery} from './IssueRow'
import {ListView} from '@github-ui/list-view'
import type {IssueRowSecondaryQuery} from './__generated__/IssueRowSecondaryQuery.graphql'

type IssueRowQueries = {
  issueQuery: IssueRowTestQuery
  issuesSecondary: IssueRowSecondaryQuery
}

const meta = {
  title: 'ListViewItemsIssuesPrs',
  component: IssueRow,
} satisfies Meta<typeof IssueRow>

export default meta

export const IssueRowExample = {
  decorators: [relayDecorator<typeof IssueRow, IssueRowQueries>, story => <ListView title="test">{story()}</ListView>],
  parameters: {
    relay: {
      queries: {
        issueQuery: {
          type: 'fragment',
          query: graphql`
            query IssueRowTestQuery($id: ID!) @relay_test_operation {
              issue: node(id: $id) {
                ... on Issue {
                  ...IssueRow @arguments(labelPageSize: 5, fetchRepository: true)
                }
              }
            }
          `,
          variables: {id: 'abc'},
        },
        issuesSecondary: {
          type: 'preloaded',
          query: IssuesIndexSecondaryGraphqlQuery,
          variables: {nodes: ['abc']},
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
            milestone: {
              title: 'milestone-1',
              url: 'milestone.url',
            },
            viewerCanSeeIssueType: true,
            reactionGroups: [],
          }
        },
      },
      mapStoryArgs: ({queryData: {issueQuery} /*, queryRefs*/}) => {
        return {
          issueKey: issueQuery.issue!,
          scopedRepository: {
            owner: 'github',
            name: 'issues',
            id: 'abc',
            is_archived: false,
          },
          showRepository: true,
          getMetadataHref: (type, name) => `#test(${type},${name})`,
          onNavigate: () => alert('on navigate'),
          onSelectRow: () => alert('on select row'),
          isActive: false,
          sortingItemSelected: 'title',
        }
      },
    },
  },
} satisfies RelayStoryObj<typeof IssueRow, IssueRowQueries>
