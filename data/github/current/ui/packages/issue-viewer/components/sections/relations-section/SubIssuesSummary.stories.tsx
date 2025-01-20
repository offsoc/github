import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {Meta} from '@storybook/react'
import {graphql} from 'react-relay'
import {SubIssuesSummary} from './SubIssuesSummary'
import type {SubIssuesSummaryStoryQuery} from './__generated__/SubIssuesSummaryStoryQuery.graphql'

const meta = {
  title: 'Apps/Sub Issues',
  component: SubIssuesSummary,
} satisfies Meta<typeof SubIssuesSummary>

export default meta

type Queries = {SubIssuesSummaryStoryQuery: SubIssuesSummaryStoryQuery}

export const SubIssuesSummaryExample = {
  decorators: [relayDecorator<typeof SubIssuesSummary, Queries>],
  parameters: {
    relay: {
      queries: {
        SubIssuesSummaryStoryQuery: {
          type: 'fragment',
          query: graphql`
            query SubIssuesSummaryStoryQuery @relay_test_operation {
              node(id: "I_abc123") {
                ... on Issue {
                  ...SubIssuesSummary
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
            subIssuesSummary: {
              total: 3,
              completed: 2,
              percentComplete: 66,
            },
          }
        },
      },
      mapStoryArgs: ({queryData}) => ({
        issue: queryData.SubIssuesSummaryStoryQuery.node!,
      }),
    },
  },
} satisfies RelayStoryObj<typeof SubIssuesSummary, Queries>
