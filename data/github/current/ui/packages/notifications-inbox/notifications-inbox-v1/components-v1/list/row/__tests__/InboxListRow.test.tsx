import {IssueViewerContextProvider} from '@github-ui/issue-viewer/IssueViewerContextProvider'
import {AppContext} from '@github-ui/react-core/app-context'
import {createBrowserHistory} from '@github-ui/react-core/create-browser-history'
import {jsonRoute} from '@github-ui/react-core/json-route'
import {act, render, screen, waitFor} from '@testing-library/react'
import {Suspense} from 'react'
import {graphql, RelayEnvironmentProvider, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {NotificationContextProvider} from '../../../../contexts-v1/NotificationContext'
import {mockNotification} from '../../../../../test-utils/NotificationTestUtils'
import InboxListRow, {InboxListCompactRow} from '../InboxListRow'

const LoadingFallback = () => <p>Loading...</p>

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom')
  const navigateFn = jest.fn()
  return {
    ...originalModule,
    useNavigate: () => navigateFn,
    _routerNavigateFn: navigateFn,
  }
})

/// Define components we want to test
///
/// element #0 - the name of the test suite
/// element #1 - the component to test
const ListFixtures = [['InboxListRow', InboxListRow]]
const ListFixturesCompact = [['InboxListCompactRow', InboxListCompactRow]]

type InboxListRowTestProps = [string, unknown, string[]]

/// Define payloads to use in dynamic test cases
///
/// element #0 - the name of the test case
/// element #1 - the payload to use
/// element #2 - expected string(s) to find in rendered result
const InboxFixtures: InboxListRowTestProps[] = [
  [
    'AdvisoryCredit subject',
    {subject: {__typename: 'AdvisoryCredit', ghsaId: 'GHSA-1234-5678-90ab', summary: 'summary'}},
    ['test-repo', 'summary'],
  ],
  ['CheckSuite subject', {subject: {__typename: 'CheckSuite', databaseId: 1234}}, ['Check suite #1234']],
  [
    'Commit subject',
    {subject: {__typename: 'Commit', oid: '1234567890abcdef1234567890abcdef12345678', message: 'message text'}},
    ['test-repo', 'message text'],
  ],
  [
    'Discussion subject',
    {subject: {__typename: 'Discussion', title: 'Discussion title', number: 1234}},
    ['Discussion title', '#1234'],
  ],
  ['Gist subject', {subject: {__typename: 'Gist', gistTitle: 'Test gist title'}}, ['test-repo', 'Test gist title']],
  [
    'Issue subject',
    {
      subject: {
        __typename: 'Issue',
        id: '1234',
        // n.b. we need to use both the DB field names here and the fragment aliases
        state: 'OPEN',
        issueState: 'OPEN',
        title: 'Test issue title',
        number: 1234,
      },
    },
    ['Test issue title', '#1234'],
  ],
  [
    'PullRequest subject',
    {subject: {__typename: 'PullRequest', state: 'OPEN', prState: 'OPEN', title: 'Test PR title', number: 1234}},
    ['Test PR title #1234', 'Bodytest-owner/test-repo'],
  ],
  [
    'TeamDiscussion subject',
    {subject: {__typename: 'TeamDiscussion', title: 'Test team discussion title', number: 1234}},
    ['Test team discussion title #1234', 'test-repo'],
  ],
  ['Release subject', {subject: {__typename: 'Release', tagName: 'v1.0.0'}}, ['Body']],
  [
    'RepositoryDependabotAlertsThread subject',
    {subject: {__typename: 'RepositoryDependabotAlertsThread', id: '1234'}},
    ['Your repository has dependencies with security vulnerabilities'],
  ],
  [
    'RepositoryInvitation subject',
    {subject: {__typename: 'RepositoryInvitation', permission: 'ADMIN'}},
    ['test-repo', 'Invitation to join'],
  ],
  [
    'RepositoryVulnerabilityAlert subject',
    {subject: {__typename: 'RepositoryVulnerabilityAlert', alertNumber: 1234}},
    ['Vulnerability alert #1234'],
  ],
  [
    'SecurityAdvisory subject',
    {subject: {__typename: 'SecurityAdvisory', ghsaId: 'GHSA-1234-5678-90ab', summary: 'summary'}},
    ['test-repo', 'summary'],
  ],
  [
    'WorkflowRun subject',
    {subject: {__typename: 'WorkflowRun', runNumber: 1234, workflowTitle: 'wf'}},
    ['test-repo', 'wf'],
  ],
  [
    'MemberFeatureRequestNotification subject',
    {subject: {__typename: 'MemberFeatureRequestNotification', title: 'test', body: 'testBody'}},
    ['test'],
  ],
  ['Unknown subject', {subject: {__typename: 'Unknown'}}, ['Unknown notification subject type: Unknown']],
  [
    'Repository list',
    {list: {__typename: 'Repository', name: 'test-repo-name', owner: {login: 'Test owner'}}},
    ['test-repo-name'],
  ],
  ['User list', {list: {__typename: 'User', login: 'test-user-login'}}, ['test-user-login']],
  ['Team list', {list: {__typename: 'Team', name: 'Test team name', slug: 'test-team-slug'}}, ['test-team-slug']],
  ['Organization list', {list: {__typename: 'Organization', login: 'test-org-login'}}, ['test-org-login']],
  ['Enterprise list', {list: {__typename: 'Enterprise', slug: 'test-business-login'}}, ['test-business-login']],
  ['Unknown list', {list: {__typename: 'Unknown'}}, ['Unknown notification list type: Unknown']],
]

const InboxFixturesCompact: InboxListRowTestProps[] = [
  [
    'AdvisoryCredit subject',
    {subject: {__typename: 'AdvisoryCredit', ghsaId: 'GHSA-1234-5678-90ab', summary: 'summary'}},
    ['test-repo', 'summary'],
  ],
  ['CheckSuite subject', {subject: {__typename: 'CheckSuite', databaseId: 1234}}, ['Check suite #1234']],
  [
    'Commit subject',
    {subject: {__typename: 'Commit', oid: '1234567890abcdef1234567890abcdef12345678', message: 'message text'}},
    ['test-repo', 'message text'],
  ],
  [
    'Discussion subject',
    {subject: {__typename: 'Discussion', title: 'Discussion title', number: 1234}},
    ['Discussion title', '#1234'],
  ],
  ['Gist subject', {subject: {__typename: 'Gist', gistTitle: 'Test gist title'}}, ['test-repo', 'Test gist title']],
  [
    'Issue subject',
    {
      subject: {
        __typename: 'Issue',
        id: '1234',
        // n.b. we need to use both the DB field names here and the fragment aliases
        state: 'OPEN',
        issueState: 'OPEN',
        title: 'Test issue title',
        number: 1234,
      },
    },
    ['Test issue title', '#1234'],
  ],
  [
    'PullRequest subject',
    {subject: {__typename: 'PullRequest', state: 'OPEN', prState: 'OPEN', title: 'Test PR title', number: 1234}},
    ['test-repo #1234', 'Test PR title', 'Body'],
  ],
  [
    'TeamDiscussion subject',
    {subject: {__typename: 'TeamDiscussion', title: 'Test team discussion title', number: 1234}},
    ['test-repo #1234', 'Test team discussion title', 'Body'],
  ],
  ['Release subject', {subject: {__typename: 'Release', tagName: 'v1.0.0'}}, ['test-repo', 'Body']],
  [
    'RepositoryDependabotAlertsThread subject',
    {subject: {__typename: 'RepositoryDependabotAlertsThread', id: '1234'}},
    ['Your repository has dependencies with security vulnerabilities'],
  ],
  [
    'RepositoryInvitation subject',
    {subject: {__typename: 'RepositoryInvitation', permission: 'ADMIN'}},
    ['test-repo', 'Invitation to join'],
  ],
  [
    'RepositoryVulnerabilityAlert subject',
    {subject: {__typename: 'RepositoryVulnerabilityAlert', alertNumber: 1234}},
    ['Vulnerability alert #1234'],
  ],
  [
    'SecurityAdvisory subject',
    {subject: {__typename: 'SecurityAdvisory', ghsaId: 'GHSA-1234-5678-90ab', summary: 'summary'}},
    ['test-repo', 'summary'],
  ],
  [
    'WorkflowRun subject',
    {subject: {__typename: 'WorkflowRun', runNumber: 1234, workflowTitle: 'wf'}},
    ['test-repo', 'wf'],
  ],
  [
    'MemberFeatureRequestNotification subject',
    {subject: {__typename: 'MemberFeatureRequestNotification', title: 'test', body: 'testBody'}},
    ['test'],
  ],
  ['Unknown subject', {subject: {__typename: 'Unknown'}}, ['Unknown notification subject type: Unknown']],
  [
    'Repository list',
    {list: {__typename: 'Repository', name: 'test-repo-name', owner: {login: 'Test owner'}}},
    ['test-repo-name'],
  ],
  ['User list', {list: {__typename: 'User', login: 'test-user-login'}}, ['test-user-login']],
  ['Team list', {list: {__typename: 'Team', name: 'Test team name', slug: 'test-team-slug'}}, ['test-team-slug']],
  ['Enterprise list', {list: {__typename: 'Enterprise', slug: 'test-business-login'}}, ['test-business-login']],
]

describe('InboxListRow', () => {
  describe.each(ListFixtures)('%s', (_, Component) => {
    const TestRowContainer = () => {
      const data = useLazyLoadQuery(
        graphql`
          query InboxListRow_v1_Test_Query @relay_test_operation {
            testUser: viewer {
              notificationThreads(first: 1) {
                edges {
                  node {
                    ...InboxListRow_v1_fragment
                  }
                }
              }
            }
          }
        `,
        {},
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any
      return <Component {...data.testUser.notificationThreads.edges[0].node} />
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderRow = async (notification: any) => {
      const environment = createMockEnvironment()
      const view = render(
        <AppContext.Provider
          value={{
            routes: [jsonRoute({path: '/inbox', Component: () => null})],
            history: createBrowserHistory(),
          }}
        >
          <RelayEnvironmentProvider environment={environment}>
            <IssueViewerContextProvider>
              <NotificationContextProvider>
                <Suspense fallback={<LoadingFallback />}>
                  <TestRowContainer />
                </Suspense>
              </NotificationContextProvider>
            </IssueViewerContextProvider>
          </RelayEnvironmentProvider>
        </AppContext.Provider>,
      )
      await act(async () => {
        environment.mock.resolveMostRecentOperation(operation => {
          const mockPayload = MockPayloadGenerator.generate(operation, {
            NotificationThread() {
              return mockNotification(notification)
            },
          })
          return mockPayload
        })
      })
      await waitFor(() => {
        expect(screen.getByTestId('notification-thread')).toBeInTheDocument()
      })
      return [screen.getByTestId('notification-thread'), view]
    }

    it.each(InboxFixtures)('renders %s', async (__, payload, asserts) => {
      const [row] = await renderRow(payload)
      for (const assert of asserts) {
        await waitFor(() => {
          expect(row).toHaveTextContent(assert)
        })
      }
    })
  })
})

describe('InboxListCompactRow', () => {
  describe.each(ListFixturesCompact)('%s', (_, Component) => {
    const TestRowContainer = () => {
      const data = useLazyLoadQuery(
        graphql`
          query InboxListRow_Compact_v1_Test_Query @relay_test_operation {
            testUser: viewer {
              notificationThreads(first: 1) {
                edges {
                  node {
                    ...InboxListRow_v1_fragment
                  }
                }
              }
            }
          }
        `,
        {},
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any
      return <Component {...data.testUser.notificationThreads.edges[0].node} />
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderRow = async (notification: any) => {
      const environment = createMockEnvironment()
      const view = render(
        <AppContext.Provider
          value={{
            routes: [jsonRoute({path: '/notifications_v2', Component: () => null})],
            history: createBrowserHistory(),
          }}
        >
          <RelayEnvironmentProvider environment={environment}>
            <IssueViewerContextProvider>
              <NotificationContextProvider>
                <Suspense fallback={<LoadingFallback />}>
                  <TestRowContainer />
                </Suspense>
              </NotificationContextProvider>
            </IssueViewerContextProvider>
          </RelayEnvironmentProvider>
        </AppContext.Provider>,
      )
      await act(async () => {
        environment.mock.resolveMostRecentOperation(operation => {
          const mockPayload = MockPayloadGenerator.generate(operation, {
            NotificationThread() {
              return mockNotification(notification)
            },
          })
          return mockPayload
        })
      })
      await waitFor(() => {
        expect(screen.getByTestId('notification-thread')).toBeInTheDocument()
      })
      return [screen.getByTestId('notification-thread'), view]
    }

    it.each(InboxFixturesCompact)('renders %s', async (__, payload, asserts) => {
      const [row] = await renderRow(payload)
      for (const assert of asserts) {
        await waitFor(() => {
          expect(row).toHaveTextContent(assert)
        })
      }
    })
  })
})
