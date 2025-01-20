import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {Meta} from '@storybook/react'
import {graphql} from 'relay-runtime'

import type {IssueTypeIndicatorTestQuery} from './__generated__/IssueTypeIndicatorTestQuery.graphql'
import {IssueTypeIndicator} from './IssueTypeIndicator'
import {ListView} from '@github-ui/list-view'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItem} from '@github-ui/list-view/ListItem'
import type {ReactElement} from 'react'

type IssueTypeIndicatorQueries = {
  issueQuery: IssueTypeIndicatorTestQuery
}

const meta = {
  title: 'IssueTypeIndicator',
  component: IssueTypeIndicator,
} satisfies Meta<typeof IssueTypeIndicator>

export default meta

export const IssueTypeIndicatorExample = {
  decorators: [
    relayDecorator<typeof IssueTypeIndicator, IssueTypeIndicatorQueries>,
    story => (
      <ListView title="test">
        <ListItem title={<ListItemTitle leadingBadge={story() as ReactElement} value={''} />} />
      </ListView>
    ),
  ],
  parameters: {
    relay: {
      queries: {
        issueQuery: {
          type: 'fragment',
          query: graphql`
            query IssueTypeIndicatorTestQuery($id: ID!) @relay_test_operation {
              issue: node(id: $id) {
                ... on Issue {
                  ...IssueTypeIndicator
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
            number: 123,
            issueType: {
              id: 'it-xyz',
              name: 'Bug',
              isEnabled: true,
            },
            viewerCanSeeIssueType: true,
          }
        },
      },
      mapStoryArgs: ({queryData: {issueQuery}}) => ({
        dataKey: issueQuery.issue!,
        getIssueTypeHref: login => `#test(${login})`,
      }),
    },
  },
} satisfies RelayStoryObj<typeof IssueTypeIndicator, IssueTypeIndicatorQueries>
