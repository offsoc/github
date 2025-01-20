import {IssueViewerContextProvider} from '@github-ui/issue-viewer/IssueViewerContextProvider'
import {AppContext} from '@github-ui/react-core/app-context'
import {createBrowserHistory} from '@github-ui/react-core/create-browser-history'
import {jsonRoute} from '@github-ui/react-core/json-route'
import {act, render, screen, waitFor} from '@testing-library/react'
import {Suspense} from 'react'
import {graphql, RelayEnvironmentProvider, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {NotificationContextProvider} from '../../../contexts-v1/NotificationContext'
import {mockNotification} from '../../../../test-utils/NotificationTestUtils'
import InboxList from '../InboxList'

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

describe('InboxList', () => {
  const InboxListContainer = () => {
    const data = useLazyLoadQuery(
      graphql`
        query InboxList_v1_Test_Query @relay_test_operation {
          testUser: viewer {
            ...InboxList_v1_fragment @arguments(query: "", first: 1)
            ...InboxList_v1_threadFragment @arguments(query: "", first: 1)
          }
        }
      `,
      {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any
    return <InboxList queryReference={data.testUser} />
  }

  test('renders', async () => {
    const environment = createMockEnvironment()
    render(
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
                <InboxListContainer />
              </Suspense>
            </NotificationContextProvider>
          </IssueViewerContextProvider>
        </RelayEnvironmentProvider>
      </AppContext.Provider>,
    )
    expect(screen.getByText('Loading...')).toBeInTheDocument()

    // Resolve the most recent operation by populating the User field with three notifications
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        const mockPayload = MockPayloadGenerator.generate(operation, {
          NotificationThreadConnection() {
            return {
              edges: [1, 2, 3].map(number => ({
                cursor: `cursor-${number}`,
                node: mockNotification({number}),
              })),
            }
          },
        })
        return mockPayload
      })
    })

    await waitFor(() => {
      expect(screen.getByTestId('notification-list')).toHaveTextContent(`3 notifications`)
    })
    for (const number of [1, 2, 3]) {
      await waitFor(() => {
        expect(screen.getByTestId('notification-list')).toHaveTextContent(`test-owner/test-repo`)
      })
      await waitFor(() => {
        expect(screen.getByTestId('notification-list')).toHaveTextContent(`Test subject #${number}`)
      })
    }
  })
})
