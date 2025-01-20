import type {Meta} from '@storybook/react'
import {graphql} from 'relay-runtime'
import {EditIssueProjectsSection} from './ProjectsSection'
import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {ProjectsSectionStoriesTestQuery} from './__generated__/ProjectsSectionStoriesTestQuery.graphql'
import {makeIssueMetadataFields} from '../../test-utils/mocks'

type ProjectSectionsQueries = {
  issueQuery: ProjectsSectionStoriesTestQuery
}

const meta = {
  title: 'IssuesComponents/IssueMetadata/Sections',
  component: EditIssueProjectsSection,
} satisfies Meta<typeof EditIssueProjectsSection>

export default meta

export const ProjectSectionExample = {
  decorators: [relayDecorator<typeof EditIssueProjectsSection, ProjectSectionsQueries>],
  parameters: {
    relay: {
      queries: {
        issueQuery: {
          type: 'fragment',
          query: graphql`
            query ProjectsSectionStoriesTestQuery($id: ID!) @relay_test_operation {
              issue: node(id: $id) {
                ...ProjectsSectionFragment
              }
            }
          `,
          variables: {id: 'abc'},
        },
      },
      mockResolvers: makeIssueMetadataFields(),
      mapStoryArgs: ({queryData: {issueQuery}}) => ({
        issueOrPullRequest: issueQuery.issue!,
      }),
    },
  },
} satisfies RelayStoryObj<typeof EditIssueProjectsSection, ProjectSectionsQueries>
