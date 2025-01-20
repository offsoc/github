import type {Meta} from '@storybook/react'
import {EditIssueMilestonesSection} from './MilestonesSection'
import {noop} from '@github-ui/noop'
import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {makeIssueMetadataFields} from '../../test-utils/mocks'
import {graphql} from 'relay-runtime'
import type {MilestonesSectionStoryQuery} from './__generated__/MilestonesSectionStoryQuery.graphql'

type MilestonesSectionQueries = {
  milestonesQuery: MilestonesSectionStoryQuery
}

const meta = {
  title: 'IssuesComponents/IssueMetadata/Sections',
  component: EditIssueMilestonesSection,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof EditIssueMilestonesSection>

export default meta

const defaultArgs: Partial<typeof EditIssueMilestonesSection> = {
  onIssueUpdate: noop,
  singleKeyShortcutsEnabled: false,
}

export const MilestonesSectionExample = {
  decorators: [relayDecorator<typeof EditIssueMilestonesSection, MilestonesSectionQueries>],
  args: {
    ...defaultArgs,
  },
  parameters: {
    relay: {
      queries: {
        milestonesQuery: {
          type: 'fragment',
          query: graphql`
            query MilestonesSectionStoryQuery($owner: String!, $repo: String!, $number: Int!) @relay_test_operation {
              repository(owner: $owner, name: $repo) {
                issue(number: $number) {
                  ...MilestonesSectionFragment
                }
              }
            }
          `,
          variables: {owner: 'organization', repo: 'repository', number: 123},
        },
      },
      mockResolvers: makeIssueMetadataFields(),
      mapStoryArgs: ({queryData}) => ({
        issue: queryData.milestonesQuery.repository!.issue!,
      }),
    },
  },
} satisfies RelayStoryObj<typeof EditIssueMilestonesSection, MilestonesSectionQueries>
