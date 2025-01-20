import type {Meta} from '@storybook/react'
import {EditIssueAssigneesSection, type EditIssueAssigneesSectionProps} from './AssigneesSection'
import {noop} from '@github-ui/noop'
import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {graphql} from 'relay-runtime'
import {makeIssueMetadataFields} from '../../test-utils/mocks'
import type {AssigneesSectionStoryQuery} from './__generated__/AssigneesSectionStoryQuery.graphql'

type AssigneesSectionQueries = {
  assigneesQuery: AssigneesSectionStoryQuery
}

const meta = {
  title: 'IssuesComponents/IssueMetadata/Sections',
  component: EditIssueAssigneesSection,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof EditIssueAssigneesSection>

export default meta

const defaultArgs: Partial<EditIssueAssigneesSectionProps> = {
  onIssueUpdate: noop,
  singleKeyShortcutsEnabled: false,
}

export const AssigneesSectionExample = {
  decorators: [relayDecorator<typeof EditIssueAssigneesSection, AssigneesSectionQueries>],
  args: {
    ...defaultArgs,
  },
  parameters: {
    relay: {
      queries: {
        assigneesQuery: {
          type: 'fragment',
          query: graphql`
            query AssigneesSectionStoryQuery($owner: String!, $repo: String!, $number: Int!) @relay_test_operation {
              repository(owner: $owner, name: $repo) {
                issue(number: $number) {
                  ...AssigneesSectionFragment
                }
              }
            }
          `,
          variables: {owner: 'organization', repo: 'repository', number: 123},
        },
      },
      mockResolvers: makeIssueMetadataFields(),
      mapStoryArgs: ({queryData}) => ({
        issue: queryData.assigneesQuery.repository!.issue!,
      }),
    },
  },
} satisfies RelayStoryObj<typeof EditIssueAssigneesSection, AssigneesSectionQueries>
