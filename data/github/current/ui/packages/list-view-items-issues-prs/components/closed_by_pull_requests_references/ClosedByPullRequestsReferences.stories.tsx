import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {Meta} from '@storybook/react'
import {graphql} from 'relay-runtime'
import type {LazyQueryOptions, QueryOptions} from '@github-ui/relay-test-utils/RelayTestFactories'

import type {ClosedByPullRequestsReferencesStoryQuery} from './__generated__/ClosedByPullRequestsReferencesStoryQuery.graphql'
import type {ClosedByPullRequestsReferencesQuery} from './__generated__/ClosedByPullRequestsReferencesQuery.graphql'
import {ClosedByPullRequestsReferences} from './ClosedByPullRequestsReferences'
import {Box} from '@primer/react'

type ClosedByPullRequestsReferencesQueries = {
  rootQuery: ClosedByPullRequestsReferencesStoryQuery
  listQuery: ClosedByPullRequestsReferencesQuery
}

const meta = {
  title: 'ListViewItemsIssuesPrs/ClosedByPullRequestsReferences Examples',
  component: ClosedByPullRequestsReferences,
} satisfies Meta<typeof ClosedByPullRequestsReferences>

export default meta

const mockIssueId = 'test-id'

const buildPullRequest = (index: number = 1, title?: string) => ({
  __typename: 'PullRequest',
  id: `pr-${index}`,
  number: index,
  title: title || `PR ${index}`,
  repository: {
    name: 'repoName',
    owner: {
      login: 'owner',
    },
  },
  isDraft: false,
  merged: false,
  closed: false,
  url: '',
})

const queries: {
  rootQuery: QueryOptions<ClosedByPullRequestsReferencesStoryQuery>
  listQuery: LazyQueryOptions
} = {
  rootQuery: {
    type: 'fragment',
    query: graphql`
      query ClosedByPullRequestsReferencesStoryQuery($id: ID!) @relay_test_operation {
        node(id: $id) {
          ... on Issue {
            ...ClosedByPullRequestsReferences @arguments(first: 10)
            ...ClosedByPullRequestsReferencesList @arguments(first: 10)
          }
        }
      }
    `,
    variables: {
      id: mockIssueId,
    },
  },
  listQuery: {
    type: 'lazy',
  },
}

export const SingleLinkedPullRequest = {
  decorators: [
    relayDecorator<typeof ClosedByPullRequestsReferences, ClosedByPullRequestsReferencesQueries>,
    story => <Box sx={{paddingLeft: '100px'}}>{story()}</Box>,
  ],
  parameters: {
    relay: {
      queries,
      mockResolvers: {
        Issue: () => ({
          closedByPullRequestsReferences: {
            id: mockIssueId,
            totalCount: 1,
            edges: [{node: buildPullRequest(1)}],
          },
        }),
      },
      mapStoryArgs: ({queryData: {rootQuery}}) => ({
        issueId: mockIssueId,
        closedByPullRequestsReferencesKey: rootQuery.node!,
      }),
    },
  },
} satisfies RelayStoryObj<typeof ClosedByPullRequestsReferences, ClosedByPullRequestsReferencesQueries>

export const MultipleLinkedPullRequests = {
  decorators: [
    relayDecorator<typeof ClosedByPullRequestsReferences, ClosedByPullRequestsReferencesQueries>,
    story => <Box sx={{paddingLeft: '100px'}}>{story()}</Box>,
  ],
  parameters: {
    relay: {
      queries,
      mockResolvers: {
        Issue: () => ({
          closedByPullRequestsReferences: {
            id: mockIssueId,
            totalCount: 2,
            edges: [{node: buildPullRequest(1)}, {node: buildPullRequest(2)}],
          },
        }),
      },
      mapStoryArgs: ({queryData: {rootQuery}}) => ({
        issueId: mockIssueId,
        closedByPullRequestsReferencesKey: rootQuery.node!,
      }),
    },
  },
} satisfies RelayStoryObj<typeof ClosedByPullRequestsReferences, ClosedByPullRequestsReferencesQueries>
