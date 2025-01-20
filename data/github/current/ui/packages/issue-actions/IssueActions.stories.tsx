import {noop} from '@github-ui/noop'
import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {Meta} from '@storybook/react'
import {graphql} from 'relay-runtime'

import type {IssueActionsStoryQuery} from './__generated__/IssueActionsStoryQuery.graphql'
import {IssueActions} from './IssueActions'

type IssueActionsQueries = {
  actionQuery: IssueActionsStoryQuery
}

const meta = {
  title: 'IssueActions',
  component: IssueActions,
} satisfies Meta<typeof IssueActions>

export default meta

export const IssueActionsExample = {
  decorators: [relayDecorator<typeof IssueActions, IssueActionsQueries>],
  parameters: {
    relay: {
      queries: {
        actionQuery: {
          type: 'fragment',
          query: graphql`
            query IssueActionsStoryQuery($id: ID!) @relay_test_operation {
              issue: node(id: $id) {
                ... on Issue {
                  ...IssueActions
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
            id: 'abc',
            viewerCanClose: true,
            viwerCanReopen: true,
          }
        },
      },
      mapStoryArgs: ({queryData: {actionQuery}}) => ({
        actionRef: actionQuery.issue!,
        viewerCanClose: true,
        viewerCanReopen: true,
        buttonSize: 'medium',
        onAction: () => 'clicked',
        hasComment: true,
        closeButtonState: 'CLOSED',
        setCloseButtonState: noop,
      }),
    },
  },
} satisfies RelayStoryObj<typeof IssueActions, IssueActionsQueries>
