import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {Meta} from '@storybook/react'
import {graphql} from 'react-relay'
import {SubIssueStateProvider} from './SubIssueStateContext'
import {SubIssuesCreateDialog} from './SubIssuesCreateDialog'
import type {SubIssuesCreateDialogStoryQuery} from './__generated__/SubIssuesCreateDialogStoryQuery.graphql'

const meta = {
  title: 'Apps/Sub Issues',
  component: SubIssuesCreateDialog,
} satisfies Meta<typeof SubIssuesCreateDialog>

export default meta

type Queries = {
  subIssuesCreateDialogStoryQuery: SubIssuesCreateDialogStoryQuery
}

export const SubIssuesCreateDialogExample = {
  decorators: [
    relayDecorator<typeof SubIssuesCreateDialog, Queries>,
    Story => (
      <SubIssueStateProvider>
        <Story />
      </SubIssueStateProvider>
    ),
  ],
  parameters: {
    relay: {
      queries: {
        subIssuesCreateDialogStoryQuery: {
          type: 'fragment',
          query: graphql`
            query SubIssuesCreateDialogStoryQuery @relay_test_operation {
              node(id: "I_abc123") {
                ... on Issue {
                  ...SubIssuesCreateDialog
                }
              }
            }
          `,
          variables: {},
        },
      },
      mapStoryArgs: ({queryData}) => ({
        issue: queryData.subIssuesCreateDialogStoryQuery.node!,
        open: true,
      }),
    },
  },
} satisfies RelayStoryObj<typeof SubIssuesCreateDialog, Queries>
