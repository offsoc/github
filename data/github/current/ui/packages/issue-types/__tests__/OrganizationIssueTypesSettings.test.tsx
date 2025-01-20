import type {RepositoryPickerTopRepositoriesQuery} from '@github-ui/item-picker/RepositoryPickerTopRepositoriesQuery.graphql'
import {renderRelay} from '@github-ui/relay-test-utils'
import {mockRelayId} from '@github-ui/relay-test-utils/RelayComponents'
import type {OrganizationIssueTypesSettingsQuery} from '../routes/__generated__/OrganizationIssueTypesSettingsQuery.graphql'
import {default as TOP_REPOSITORIES_QUERY} from '@github-ui/item-picker/RepositoryPickerTopRepositoriesQuery.graphql'
import ORGANIZATION_TYPE_SETTINGS_QUERY from '../routes/__generated__/OrganizationIssueTypesSettingsQuery.graphql'
import type {PreloadedQuery} from 'react-relay'
import {OrganizationIssueTypesSettings} from '../routes/OrganizationIssueTypesSettings'
import {screen} from '@testing-library/react'
import {AnalyticsProvider} from '@github-ui/analytics-provider'

const ORGANIZATION_ID = mockRelayId()

function renderTestComponent() {
  return renderRelay<{
    organizationIssueTypesSettingsQuery: OrganizationIssueTypesSettingsQuery
    topRepositoriesQuery: RepositoryPickerTopRepositoriesQuery
  }>(
    ({queryRefs: {organizationIssueTypesSettingsQuery, topRepositoriesQuery}}) => (
      <OrganizationIssueTypeSettingsWrapper
        topReposQueryRef={topRepositoriesQuery}
        organizationIssueTypesSettingsQueryRef={organizationIssueTypesSettingsQuery}
      />
    ),
    {
      relay: {
        queries: {
          topRepositoriesQuery: {
            type: 'preloaded',
            query: TOP_REPOSITORIES_QUERY,
            variables: {hasIssuesEnabled: true, topRepositoriesFirst: 10, owner: null},
          },
          organizationIssueTypesSettingsQuery: {
            type: 'preloaded',
            query: ORGANIZATION_TYPE_SETTINGS_QUERY,
            variables: {
              organization_id: 'owner',
            },
          },
        },
        mockResolvers: {
          Organization() {
            return {
              id: ORGANIZATION_ID,
              login: 'owner',
            }
          },
        },
      },
    },
  )
}

type OrganizationIssueTypeSettingsWrapperProps = {
  organizationIssueTypesSettingsQueryRef: PreloadedQuery<OrganizationIssueTypesSettingsQuery>
  topReposQueryRef: PreloadedQuery<RepositoryPickerTopRepositoriesQuery>
}

const OrganizationIssueTypeSettingsWrapper = ({
  organizationIssueTypesSettingsQueryRef,
  topReposQueryRef,
}: OrganizationIssueTypeSettingsWrapperProps) => {
  const entryProps = {
    extraProps: {},
    entryPoints: {},
    props: {},
    queries: {
      organizationIssueTypesSettingsQuery: organizationIssueTypesSettingsQueryRef,
      topRepositoriesQuery: topReposQueryRef,
    },
  }
  return (
    <AnalyticsProvider appName="issue_types" category="settings" metadata={{owner: 'owner'}}>
      <OrganizationIssueTypesSettings {...entryProps} />
    </AnalyticsProvider>
  )
}

test("Doesn't render the excluded repositories section", () => {
  renderTestComponent()

  expect(screen.queryByText('Excluded repositories')).not.toBeInTheDocument()
})
