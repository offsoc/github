import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {Meta} from '@storybook/react'
import {graphql} from 'react-relay'
import {AddSubIssueButtonGroup} from './AddSubIssueButtonGroup'
import type {AddSubIssueButtonGroupStoryQuery} from './__generated__/AddSubIssueButtonGroupStoryQuery.graphql'
import {SubIssueStateProvider} from './SubIssueStateContext'

const meta = {
  title: 'Apps/Sub Issues',
  component: AddSubIssueButtonGroup,
} satisfies Meta<typeof AddSubIssueButtonGroup>

export default meta

type Queries = {addSubIssueButtonGroupStoryQuery: AddSubIssueButtonGroupStoryQuery}

export const AddSubIssueButtonGroupExample = {
  decorators: [
    relayDecorator<typeof AddSubIssueButtonGroup, Queries>,
    Story => (
      <SubIssueStateProvider>
        <Story />
      </SubIssueStateProvider>
    ),
  ],
  parameters: {
    relay: {
      queries: {
        addSubIssueButtonGroupStoryQuery: {
          type: 'fragment',
          query: graphql`
            query AddSubIssueButtonGroupStoryQuery @relay_test_operation {
              node(id: "I_abc123") {
                ... on Issue {
                  ...AddSubIssueButtonGroup @arguments(fetchSubIssues: true)
                }
              }
            }
          `,
          variables: {},
        },
      },
      mockResolvers: {
        Issue({path}) {
          if (path?.includes('subIssues')) {
            return {
              titleHTML: 'Child 1',
              labels: {
                nodes: [
                  {
                    name: 'documentation',
                    color: '0075ca',
                  },
                  {
                    name: 'enhancement',
                    color: 'a2eeef',
                  },
                ],
              },
              assignees: {
                totalCount: 2,
                edges: [
                  {node: {login: 'monalisa', avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4'}},
                  {node: {login: 'octocat', avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4'}},
                ],
              },
              closedByPullRequestsReferences: 2,
            }
          }
          return {}
        },
      },
      mapStoryArgs: ({queryData}) => ({
        issue: queryData.addSubIssueButtonGroupStoryQuery.node!,
      }),
    },
  },
} satisfies RelayStoryObj<typeof AddSubIssueButtonGroup, Queries>
