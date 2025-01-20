import type {Meta} from '@storybook/react'
import {EditIssueLabelsSection, type EditIssueLabelsSectionProps} from './LabelsSection'
import {noop} from '@github-ui/noop'
import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {graphql} from 'relay-runtime'
import {makeIssueMetadataFields} from '../../test-utils/mocks'
import type {LabelsSectionStoryQuery} from './__generated__/LabelsSectionStoryQuery.graphql'

type LabelsSectionQueries = {
  labelsQuery: LabelsSectionStoryQuery
}

const meta = {
  title: 'IssuesComponents/IssueMetadata/Sections',
  component: EditIssueLabelsSection,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof EditIssueLabelsSection>

export default meta

const defaultArgs: Partial<EditIssueLabelsSectionProps> = {
  onIssueUpdate: noop,
  singleKeyShortcutsEnabled: false,
}

export const LabelsSectionExample = {
  decorators: [relayDecorator<typeof EditIssueLabelsSection, LabelsSectionQueries>],
  args: {
    ...defaultArgs,
  },
  parameters: {
    relay: {
      queries: {
        labelsQuery: {
          type: 'fragment',
          query: graphql`
            query LabelsSectionStoryQuery($owner: String!, $repo: String!, $number: Int!) @relay_test_operation {
              repository(owner: $owner, name: $repo) {
                issue(number: $number) {
                  ...LabelsSectionFragment
                }
              }
            }
          `,
          variables: {owner: 'organization', repo: 'repository', number: 123},
        },
      },
      mockResolvers: makeIssueMetadataFields(),
      mapStoryArgs: ({queryData}) => ({
        issue: queryData.labelsQuery.repository!.issue!,
      }),
    },
  },
} satisfies RelayStoryObj<typeof EditIssueLabelsSection, LabelsSectionQueries>
