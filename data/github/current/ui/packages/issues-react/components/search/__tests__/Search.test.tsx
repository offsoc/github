import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {Wrapper} from '@github-ui/react-core/test-utils'
// necessary import process to mock useAppPayload functionality
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {screen, act} from '@testing-library/react'
import {graphql} from 'react-relay'

import {TEST_IDS} from '../../../constants/test-ids'
import {JobInfoWithSubscription} from '../../../pages/JobInfo'
import HyperlistAppWrapper from '../../../test-utils/HyperlistAppWrapper'
import type {HyperlistTargetType} from '../../../types/analytics-event-types'

import {Search} from '../Search'
import {buildIssue, buildPullRequest} from './../../../test-utils/IssueTestUtils'
import {noop} from '@github-ui/noop'
import {renderRelay} from '@github-ui/relay-test-utils'
import type {SearchCurrentViewTestQuery} from './__generated__/SearchCurrentViewTestQuery.graphql'
import type {SearchCurrentRepoTestQuery} from './__generated__/SearchCurrentRepoTestQuery.graphql'
import type {SearchTestQuery} from './__generated__/SearchTestQuery.graphql'

const mockUseFeatureFlags = jest.fn().mockReturnValue({})
jest.mock('@github-ui/react-core/use-feature-flag', () => ({
  useFeatureFlags: () => mockUseFeatureFlags({}),
  useFeatureFlag: jest.fn(),
}))

jest.mock('@github-ui/react-core/use-app-payload')
jest.mock('../../../contexts/QueryContext', () => {
  const originalModule = jest.requireActual('../../../contexts/QueryContext')
  return {
    ...originalModule,
    useQueryEditContext: jest.fn().mockImplementation(originalModule.useQueryEditContext),
  }
})

jest.setTimeout(5000) // 5 sec
const mockedUseAppPayload = jest.mocked(useAppPayload)

Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(),
    mark: jest.fn(),
    clearResourceTimings: jest.fn(),
  },
})

beforeEach(() => {
  jest.clearAllMocks()
})

function setup({query = ''} = {}) {
  const issue = buildIssue()
  const pullRequest = buildPullRequest()

  const {environment} = createRelayMockEnvironment()

  const {user} = renderRelay<{
    currentView: SearchCurrentViewTestQuery
    currentRepository: SearchCurrentRepoTestQuery
    search: SearchTestQuery
  }>(
    ({queryData}) => (
      <Search
        itemIdentifier={undefined}
        currentView={queryData.currentView.node!}
        search={queryData.search}
        currentRepository={queryData.currentRepository.repository!}
        loadSearchQuery={noop}
      />
    ),
    {
      relay: {
        queries: {
          currentRepository: {
            type: 'fragment',
            query: graphql`
              query SearchCurrentRepoTestQuery @relay_test_operation {
                repository(name: "test-repo-name", owner: "test-repo-owner") {
                  ...SearchRepositoryFragment
                }
              }
            `,
            variables: {},
          },
          currentView: {
            type: 'fragment',
            query: graphql`
              query SearchCurrentViewTestQuery @relay_test_operation {
                node(id: "node-id") {
                  ...SearchBarCurrentViewFragment
                }
              }
            `,
            variables: {},
          },
          search: {
            type: 'fragment',
            query: graphql`
              query SearchTestQuery(
                $query: String = "state:open archived:false assignee:@me sort:updated-desc"
                $first: Int = 25
                $labelPageSize: Int = 20
                $skip: Int = null
              ) @relay_test_operation {
                ...SearchRootFragment
                  @arguments(
                    query: $query
                    first: $first
                    skip: $skip
                    labelPageSize: $labelPageSize
                    fetchRepository: true
                  )
              }
            `,
            variables: {
              query,
            },
          },
        },
        mockResolvers: {
          Node() {
            return {
              query,
              scopingRepository: null,
            }
          },
          SearchResultItemConnection() {
            return {
              openIssueCount: 1,
              closedIssueCount: 2,
              edges: [{node: issue}, {node: pullRequest}],
            }
          },
        },
        environment,
      },
      wrapper: ({children}) => (
        <Wrapper>
          <HyperlistAppWrapper environment={environment}>
            <JobInfoWithSubscription>{children}</JobInfoWithSubscription>
          </HyperlistAppWrapper>
        </Wrapper>
      ),
    },
  )

  return {environment, user}
}

test('adds the query from the graphQL object to the search bar', async () => {
  mockedUseAppPayload.mockReturnValue({
    initial_view_content: {
      initial_view_content: {},
      preloaded_records: [],
      enabled_features: {},
    },
    enabled_features: {},
  })

  const searchQuery = 'is:issue repo:github/issues-react state:open'

  await act(() => {
    setup({query: searchQuery})
  })

  const input = await screen.findByTestId(TEST_IDS.searchWithFilterInput)
  expect(input).toBeInTheDocument()
  expect(input).toHaveValue(`${searchQuery} `)
})

test('it does not auto add is:issue to the search bar when is:issue is not in the URL query params', async () => {
  mockedUseAppPayload.mockReturnValue({
    initial_view_content: {
      initial_view_content: {},
      preloaded_records: [],
      enabled_features: {},
    },
    enabled_features: {},
  })

  const searchQuery = 'repo:github/issues-react state:open'
  await act(() => {
    setup({query: searchQuery})
  })

  const input = await screen.findByTestId(TEST_IDS.searchWithFilterInput)
  expect(input).toBeInTheDocument()
  expect(input).toHaveValue(`${searchQuery} `)
})

test('it renders pull requests and issues in the list pane', async () => {
  mockedUseAppPayload.mockReturnValue({
    initial_view_content: {
      initial_view_content: {},
      preloaded_records: [],
      enabled_features: {},
    },
    enabled_features: {},
  })

  await act(() => {
    setup()
  })

  expect(await screen.findByText(/Issue 1/)).toBeInTheDocument()
  expect(await screen.findByText(/Pull Request 1/)).toBeInTheDocument()
})

test('sends analytics event when query is executed', async () => {
  mockedUseAppPayload.mockReturnValue({
    initial_view_content: {
      initial_view_content: {},
      preloaded_records: [],
      enabled_features: {},
    },
    enabled_features: {},
  })

  const {user} = setup()

  const input = await screen.findByPlaceholderText('Search Issues')

  await user.clear(input)
  await user.type(input, '1')
  await user.keyboard('{enter}')

  expectAnalyticsEvents<HyperlistTargetType>({
    type: 'search.execute',
    target: 'FILTER_BAR_INPUT',
    data: {
      app_name: 'hyperlist',
      new_query: '1',
    },
  })
})

test('sends analytics event when search results row is clicked', async () => {
  mockedUseAppPayload.mockReturnValue({
    initial_view_content: {
      initial_view_content: {},
      preloaded_records: [],
      enabled_features: {},
    },
    enabled_features: {},
  })

  const {user} = setup()

  const issueRow = await screen.findByText('Issue 1')

  await user.click(issueRow)

  expectAnalyticsEvents<HyperlistTargetType>({
    type: 'search_results.select_row',
    target: 'SEARCH_RESULT_ROW',
    data: {
      app_name: 'hyperlist',
      type: 'Issue',
    },
  })
})
