import {graphql} from 'react-relay'
import {IssueTypesDialog} from '../IssueTypesDialog'
import {noop} from '@github-ui/noop'
import {waitFor, screen} from '@testing-library/react'
import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {commitUpdateIssueIssueTypeMutation} from '../../../mutations/update-issue-issue-type-mutation'

import {renderRelay} from '@github-ui/relay-test-utils'
import type {IssueTypesDialogRepoTestQuery} from './__generated__/IssueTypesDialogRepoTestQuery.graphql'
import type {IssueTypesDialogIssueTestQuery} from './__generated__/IssueTypesDialogIssueTestQuery.graphql'
import {LABELS} from '../../../constants/labels'
import {setupUserEvent} from '@github-ui/react-core/test-utils'

jest.mock('../../../mutations/update-issue-issue-type-mutation')
const mockedUpdateIssueIssueTypeMutation = jest.mocked(commitUpdateIssueIssueTypeMutation)
afterEach(() => {
  jest.clearAllMocks()
})

const repoQuery = graphql`
  query IssueTypesDialogRepoTestQuery @relay_test_operation {
    repository(name: "github", owner: "cool-repo") {
      issueTypes(first: 10) {
        ...IssueTypesDialogIssueTypes
      }
    }
  }
`

const issueQuery = graphql`
  query IssueTypesDialogIssueTestQuery @relay_test_operation {
    node(id: "I_1234") {
      ... on Issue {
        issueType {
          ...IssueTypesDialogIssueType
        }
      }
    }
  }
`
const scopedRepository = {
  owner: 'github',
  name: 'cool-repo',
}
const issueId = 'I_1234'

const setupEnv = () =>
  renderRelay<{
    repo: IssueTypesDialogRepoTestQuery
    issue: IssueTypesDialogIssueTestQuery
  }>(
    ({queryData: {repo, issue}}) => (
      <AnalyticsProvider
        appName="issue_types"
        category="issue_viewer"
        metadata={{
          owner: scopedRepository.owner,
          repositoryName: scopedRepository.name,
          issueId,
        }}
      >
        <IssueTypesDialog
          onClose={noop}
          issueId={issueId}
          initialSelectedType={issue.node!.issueType!}
          issueTypes={repo.repository!.issueTypes!}
        />
      </AnalyticsProvider>
    ),
    {
      relay: {
        queries: {
          repo: {
            type: 'fragment',
            query: repoQuery,
            variables: {},
          },
          issue: {
            type: 'fragment',
            query: issueQuery,
            variables: {},
          },
        },
        mockResolvers: {
          Issue() {
            return {
              id: 'I_1234',
              issueType: null,
            }
          },
          Repository() {
            return {
              id: 'repo1',
            }
          },
          IssueTypeConnection() {
            return {
              nodes: [
                {
                  id: 'IT_1234',
                  isEnabled: true,
                  name: 'Bug',
                  description: 'A bug',
                },
              ],
            }
          },
        },
      },
    },
  )

test('renders issue types dialog', async () => {
  setupEnv()
  await waitFor(() => {
    expect(screen.getAllByText(LABELS.issueTypes.issueTypeDialogHeader)).toHaveLength(2)
  })

  expect(screen.getByLabelText(LABELS.issueTypes.noIssueTypeOptionName)).toBeVisible()
})

test('update issue type', async () => {
  setupEnv()
  const user = setupUserEvent()
  await waitFor(() => {
    expect(screen.getAllByText(LABELS.issueTypes.issueTypeDialogHeader)).toHaveLength(2)
  })

  expect(screen.getAllByRole('radio')).toHaveLength(2)

  await user.click(await screen.findByLabelText(/Bug/))
  await user.click(screen.getByRole('button', {name: 'Change type'}))

  expect(mockedUpdateIssueIssueTypeMutation).toHaveBeenCalledTimes(1)
  expectAnalyticsEvents({
    type: 'issue_viewer.update_issue_type',
    target: 'ISSUE_VIEWER_UPDATE_ISSUE_TYPE_DIALOG',
    data: {
      app_name: 'issue_types',
      category: 'issue_viewer',
      owner: scopedRepository.owner,
      repositoryName: scopedRepository.name,
      issueId: 'I_1234',
      initialIssueTypeId: '',
      issueTypeId: 'IT_1234',
    },
  })
})
