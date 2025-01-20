import {render} from '@github-ui/react-core/test-utils'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {ComponentWithPreloadedQueryRef, mockRelayId} from '@github-ui/relay-test-utils/RelayComponents'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {act, fireEvent, screen, within} from '@testing-library/react'
import {useEffect, useRef} from 'react'
import {graphql, usePreloadedQuery, type OperationDescriptor, type PreloadedQuery} from 'react-relay'
import {MockPayloadGenerator, type createMockEnvironment} from 'relay-test-utils'

import {LabelPickerGraphqlQuery} from '@github-ui/item-picker/LabelPicker'
import {noop} from '@github-ui/noop'
import PreloadedQueryBoundary from '@github-ui/relay-preloaded-query-boundary'
import {TEST_IDS} from '../../../constants/test-ids'
import {useQueryContext, useQueryEditContext} from '../../../contexts/QueryContext'
import HyperlistAppWrapper from '../../../test-utils/HyperlistAppWrapper'
import {buildIssue, buildIssues, buildPullRequest} from '../../../test-utils/IssueTestUtils'
import {ListError} from '../ListError'
import {ListItems} from '../ListItems'
import type {ListItemsSearchRootQuery} from './__generated__/ListItemsSearchRootQuery.graphql'
import {MESSAGES} from '../../../constants/messages'
import type {RelayMockEnvironment} from 'relay-test-utils/lib/RelayModernMockEnvironment'

jest.mock('@github-ui/react-core/use-app-payload')

jest.mock('react-relay', () => {
  const originalModule = jest.requireActual('react-relay')

  return {
    __esModule: true,
    ...originalModule,
    useLazyLoadQuery: jest.fn(() => ({search: {openIssueCount: 1, closedIssueCount: 2}})),
  }
})

jest.setTimeout(60000)

const mockedUseAppPayload = jest.mocked(useAppPayload)

type ScopedRepository = {id: number; name: string; owner: string}

const MOCK_REPOSITORY = {id: 1, name: 'hyperlist-web', owner: 'github'}

const searchRoot = graphql`
  query ListItemsSearchRootQuery(
    $query: String = "state:open archived:false assignee:@me sort:updated-desc"
    $first: Int = 25
    $labelPageSize: Int = 20
    $skip: Int = null
  ) @relay_test_operation {
    ...ListItemsPaginated_results
      @arguments(query: $query, first: $first, skip: $skip, labelPageSize: $labelPageSize, fetchRepository: true)
  }
`

function mockRoute(
  query: string,
  scoped_repository?: ScopedRepository,
  enabledFeatures: {[key: string]: boolean | undefined} = {},
) {
  mockedUseAppPayload.mockReturnValue({
    initial_view_content: {},
    enabled_features: {...enabledFeatures},
    scoped_repository,
    query,
  })
}

beforeEach(() => {
  jest.clearAllMocks()
})

type TestComponentProps = {
  environment: ReturnType<typeof createMockEnvironment>
  query: string
  scoped_repository?: ScopedRepository
  executeQueryFunction?: (query: string) => void
  enabledFeatureFlags?: {[key: string]: boolean | undefined}
}

function TestComponent({
  environment,
  query,
  scoped_repository,
  enabledFeatureFlags,
  executeQueryFunction,
}: TestComponentProps) {
  mockRoute(query, scoped_repository, enabledFeatureFlags)

  function WrappedIssueListItems({queryRef}: {queryRef: PreloadedQuery<ListItemsSearchRootQuery>}) {
    const {setActiveSearchQuery, setExecuteQuery} = useQueryContext()
    const {setDirtySearchQuery} = useQueryEditContext()
    const listRef = useRef()
    useLayoutEffect(() => {
      setActiveSearchQuery(query)
      setDirtySearchQuery(query)
    })
    useEffect(() => {
      executeQueryFunction && setExecuteQuery(() => executeQueryFunction)
    }, [setExecuteQuery])

    const preloadedData = usePreloadedQuery<ListItemsSearchRootQuery>(searchRoot, queryRef)

    return <ListItems search={preloadedData} listRef={listRef} isBulkSupported={true} />
  }
  return (
    <HyperlistAppWrapper environment={environment}>
      <PreloadedQueryBoundary fallback={ListError} onRetry={noop}>
        <ComponentWithPreloadedQueryRef
          component={WrappedIssueListItems}
          query={searchRoot}
          queryVariables={{
            query,
            first: 25,
            labelPageSize: 20,
            skip: 0,
          }}
        />
      </PreloadedQueryBoundary>
    </HyperlistAppWrapper>
  )
}

test('renders issues list with issues and pull requests', async () => {
  const query = 'state:open'
  const {environment} = createRelayMockEnvironment()
  const issueTitle = 'my super specific issue title'
  const pullRequestTitle = 'my super specific pull request title'

  render(<TestComponent environment={environment} query={query} scoped_repository={MOCK_REPOSITORY} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      expect(operation.request.node.operation.name).toBe('ListItemsSearchRootQuery')
      return MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection() {
          return {
            openIssueCount: 1,
            closedIssueCount: 2,
            edges: [
              {
                node: buildIssue({title: issueTitle}),
              },
              {
                node: buildPullRequest({title: pullRequestTitle}),
              },
            ],
          }
        },
      })
    })
  })

  await screen.findByText(issueTitle)
  screen.getByText(pullRequestTitle)
  const sectionFilterLinks = screen.getAllByTestId('list-view-section-filter-link')
  expect(sectionFilterLinks.length).toBe(2)
  const sectionFilter1 = screen.getByTestId('list-view-section-filter-0')
  expect(sectionFilter1.textContent).toContain('Open1')
  const sectionFilter2 = screen.getByTestId('list-view-section-filter-1')
  expect(sectionFilter2.textContent).toContain('Closed2')
})

test('renders issues list with one item', async () => {
  const query = 'state:open'
  const {environment} = createRelayMockEnvironment()
  const issueTitle = 'my super specific issue title'

  render(<TestComponent environment={environment} query={query} scoped_repository={MOCK_REPOSITORY} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection() {
          return {
            openIssueCount: 1,
            closedIssueCount: 2,
            edges: [
              {
                node: buildIssue({title: issueTitle}),
              },
            ],
          }
        },
      }),
    )
  })

  await screen.findByText(issueTitle)
  const sectionFilterLinks = screen.getAllByTestId('list-view-section-filter-link')
  expect(sectionFilterLinks.length).toBe(2)
  const sectionFilter1 = screen.getByTestId('list-view-section-filter-0')
  expect(sectionFilter1.textContent).toContain('Open1')
  const sectionFilter2 = screen.getByTestId('list-view-section-filter-1')
  expect(sectionFilter2.textContent).toContain('Closed2')
})

test('renders ListError when edges are null (meaning ES performance is degraded)', async () => {
  jest.spyOn(console, 'error').mockImplementation() // there is a console.error call we need to mock here
  const query = 'state:open'
  const {environment} = createRelayMockEnvironment()

  render(<TestComponent environment={environment} query={query} scoped_repository={MOCK_REPOSITORY} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      expect(operation.request.node.operation.name).toBe('ListItemsSearchRootQuery')
      return MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection() {
          return {
            edges: null,
          }
        },
      })
    })
  })

  await screen.findByText('Failed to load issues.')
})

test('renders required elements for issue list items', async () => {
  const query = 'state:open is:issue'
  const {environment} = createRelayMockEnvironment()
  const issue = buildIssue()

  render(<TestComponent environment={environment} query={query} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection() {
          return {
            openIssueCount: 1,
            closedIssueCount: 2,
            edges: [
              {
                node: issue,
              },
            ],
          }
        },
      }),
    )
  })

  await screen.findByText(issue.title)
  screen.getByText(issue.labels.nodes[0]!.name)

  // Issue Status
  const status = screen.getByTestId(TEST_IDS.listRowStateIcon)
  within(status).getByRole('img', {hidden: true})

  // repo name and number (e.g. "hyperlist-web#123")
  const repoNameAndNumberEl = screen.getByTestId(TEST_IDS.listRowRepoNameAndNumber)
  expect(within(repoNameAndNumberEl).getByText(`${issue.repository.owner.login}/${issue.repository.name}`)).toBeTruthy()
  expect(within(repoNameAndNumberEl).getByText(`#${issue.number}`)).toBeTruthy()
})

test('renders required elements for pull request list items', async () => {
  const query = 'state:open is:pr sort:created-desc'
  const {environment} = createRelayMockEnvironment()
  const pullRequest = buildPullRequest()

  render(<TestComponent environment={environment} query={query} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection() {
          return {
            openIssueCount: 1,
            closedIssueCount: 2,
            edges: [
              {
                node: pullRequest,
              },
            ],
          }
        },
      }),
    )
  })

  await screen.findByText(pullRequest.title)
  screen.getByText(pullRequest.labels.nodes[0]!.name)

  // PR Status
  const status = screen.getByTestId(TEST_IDS.listRowStateIcon)
  within(status).getByRole('img', {hidden: true})

  // Check Run Status
  screen.getByLabelText('See all checks')
  screen.getByText(`5/${pullRequest.headCommit.commit.statusCheckRollup.contexts.checkRunCount}`)
  expect(screen.getByTestId('checks-status-badge-icon-only')).toBeTruthy()

  // repo name and number (e.g. "hyperlist-web#123")
  const repoNameAndNumberEl = screen.getByTestId(TEST_IDS.listRowRepoNameAndNumber)
  expect(
    within(repoNameAndNumberEl).getByText(`${pullRequest.repository.owner.login}/${pullRequest.repository.name}`),
  ).toBeTruthy()
  expect(within(repoNameAndNumberEl).getByText(`#${pullRequest.number}`)).toBeTruthy()
})

test('renders sorting menu with correct sorting option if sort param is passed in query', async () => {
  const query = 'state:open is:issue sort:updated-desc'
  const {environment} = createRelayMockEnvironment()
  const issue = buildIssue()

  render(<TestComponent environment={environment} query={query} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection() {
          return {
            openIssueCount: 1,
            closedIssueCount: 2,
            edges: [
              {
                node: issue,
              },
            ],
          }
        },
      }),
    )
  })

  await screen.findByText(issue.title)
  const sortMenu = await screen.findByTestId('action-bar-item-sort-by')
  const sortButton = within(sortMenu).getByRole('button')
  fireEvent.click(sortButton)
  const sortingLabel = await screen.findByText('Recently updated')
  expect(sortingLabel).toBeInTheDocument()
})

test('renders sorting menu with correct sorting option if sort param is not passed in query', async () => {
  const query = 'state:open is:issue'
  const {environment} = createRelayMockEnvironment()
  const issue = buildIssue()

  render(<TestComponent environment={environment} query={query} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection() {
          return {
            openIssueCount: 1,
            closedIssueCount: 2,
            edges: [
              {
                node: issue,
              },
            ],
          }
        },
      }),
    )
  })

  await screen.findByText(issue.title)
  const sortMenu = await screen.findByTestId('action-bar-item-sort-by')
  const sortButton = within(sortMenu).getByRole('button')
  fireEvent.click(sortButton)
  const sortingLabel = await screen.findByText('Newest')
  expect(sortingLabel).toBeInTheDocument()
})

test('updates url when sorting option is changed', async () => {
  const query = 'state:open is:issue'
  const {environment} = createRelayMockEnvironment()
  const issue = buildIssue()
  const executeQueryFunction = jest.fn()
  const replaceState = jest.spyOn(window.history, 'replaceState').mockImplementation(() => {})

  render(<TestComponent environment={environment} query={query} executeQueryFunction={executeQueryFunction} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection() {
          return {
            openIssueCount: 1,
            closedIssueCount: 2,
            edges: [
              {
                node: issue,
              },
            ],
          }
        },
      }),
    )
  })

  await screen.findByText(issue.title)
  const sortMenu = await screen.findByTestId('action-bar-item-sort-by')
  const sortButton = within(sortMenu).getByRole('button')
  fireEvent.click(sortButton)
  const newestLabel = await screen.findByText('Newest')
  fireEvent.click(newestLabel)

  // select sort by recently updated
  fireEvent.click(sortButton)
  const recentlyUpdatedLabel = await screen.findByText('Recently updated')
  fireEvent.click(recentlyUpdatedLabel)

  expect(replaceState).toHaveBeenCalledWith(null, '', '/issues?q=state%3Aopen%20is%3Aissue%20sort%3Aupdated-desc')
})

test('show repository owner and name when not scoped to a repository', async () => {
  const query = 'state:open is:pr sort:created-desc'
  const {environment} = createRelayMockEnvironment()
  const issue = buildIssue()

  render(<TestComponent environment={environment} query={query} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection() {
          return {
            openIssueCount: 1,
            closedIssueCount: 2,
            edges: [
              {
                node: issue,
              },
            ],
          }
        },
      }),
    )
  })

  await screen.findByText(issue.title)

  const repoNameAndNumberEl = screen.getByTestId(TEST_IDS.listRowRepoNameAndNumber)
  within(repoNameAndNumberEl).getByText(`${issue.repository.owner.login}/${issue.repository.name}`)
  expect(within(repoNameAndNumberEl).getByText(`#${issue.number}`)).toBeInTheDocument()
})

test('do not show repository owner and name when scoped to a repository', async () => {
  const query = 'state:open is:pr sort:created-desc'
  const {environment} = createRelayMockEnvironment()
  const issue = buildIssue()

  render(<TestComponent environment={environment} query={query} scoped_repository={MOCK_REPOSITORY} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection() {
          return {
            openIssueCount: 1,
            closedIssueCount: 2,
            edges: [
              {
                node: issue,
              },
            ],
          }
        },
      }),
    )
  })

  await screen.findByText(issue.title)

  const repoNameAndNumberEl = screen.getByTestId(TEST_IDS.listRowRepoNameAndNumber)
  const repoNwo = within(repoNameAndNumberEl).queryByText(`${issue.repository.owner.login}/${issue.repository.name}`)
  expect(repoNwo).toBeNull()

  within(repoNameAndNumberEl).getByText(`#${issue.number}`)
})

test('show no result indicators when there are no results in a scope repo', async () => {
  const query = 'state:open is:pr sort:created-desc'
  const {environment} = createRelayMockEnvironment()

  render(<TestComponent environment={environment} query={query} scoped_repository={MOCK_REPOSITORY} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection() {
          return {
            issueCount: 0,
            edges: [],
          }
        },
      }),
    )
  })

  expect(screen.getByText('No results')).toBeInTheDocument()
})

test('show pagination options in wrong page', async () => {
  const query = 'state:open is:pr sort:created-desc'
  const {environment} = createRelayMockEnvironment()

  render(<TestComponent environment={environment} query={query} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection() {
          return {
            issueCount: 100,
            edges: [],
          }
        },
      }),
    )
  })

  expect(screen.getByText('No results')).toBeInTheDocument()

  const paginationArea = screen.getByRole('navigation', {name: 'Pagination'})
  expect(paginationArea).toBeInTheDocument()
})

test('pagination between different result pages', async () => {
  const query = 'state:open'
  const {environment} = createRelayMockEnvironment()
  const issueTitle = 'my super specific issue title'

  render(<TestComponent environment={environment} query={query} scoped_repository={MOCK_REPOSITORY} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      expect(operation.request.node.operation.name).toBe('ListItemsSearchRootQuery')
      expect(operation.request.variables.skip).toBe(0)
      return MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection() {
          return {
            openIssueCount: 100,
            closedIssueCount: 2,
            edges: buildIssues({title: issueTitle, number: 25}),
            issueCount: 100,
          }
        },
      })
    })
  })

  const firstInPage1 = await screen.findByText(`${issueTitle} 0`)
  expect(firstInPage1).toBeInTheDocument()
  const lastInPage1 = await screen.findByText(`${issueTitle} 24`)
  expect(lastInPage1).toBeInTheDocument()

  const paginationArea = await screen.findByRole('navigation', {name: 'Pagination'})
  expect(paginationArea).toBeInTheDocument()
  const previous = within(paginationArea).getByRole('button', {name: 'Previous'})
  expect(previous).toBeInTheDocument()
  expect(previous.getAttribute('aria-disabled')).toBe('true')
  const next = within(paginationArea).getByRole('link', {name: 'Next Page'})
  expect(next).toBeInTheDocument()
  expect(next.getAttribute('aria-disabled')).not.toBe('true')

  const page1Link = within(paginationArea).getByRole('link', {name: 'Page 1'})
  const page2Link = within(paginationArea).getByRole('link', {name: 'Page 2'})
  expect(page1Link.getAttribute('aria-current')).toBe('page')
  expect(page2Link.getAttribute('aria-current')).not.toBe('page')
  act(() => {
    // set focus on next button
    next.focus()
    next.click()
  })

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      expect(operation.request.node.operation.name).toBe('SearchPaginatedQuery')
      expect(operation.request.variables.skip).toBe(25)
      return MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection() {
          return {
            openIssueCount: 100,
            closedIssueCount: 2,
            edges: buildIssues({title: issueTitle, number: 25, start: 25}),
            issueCount: 100,
          }
        },
      })
    })
  })

  const firstInPage2 = await screen.findByText(`${issueTitle} 25`)
  expect(firstInPage2).toBeInTheDocument()
  const lastInPage2 = await screen.findByText(`${issueTitle} 49`)
  expect(lastInPage2).toBeInTheDocument()

  expect(page1Link.getAttribute('aria-current')).not.toBe('page')
  expect(page2Link.getAttribute('aria-current')).toBe('page')

  const previousLink = within(paginationArea).getByRole('link', {name: 'Previous Page'})
  expect(previousLink).toBeInTheDocument()
  act(() => {
    // set focus on previous link
    previousLink.focus()
    previousLink.click()
  })

  expect(page1Link.getAttribute('aria-current')).toBe('page')
  expect(page2Link.getAttribute('aria-current')).not.toBe('page')

  const firstInPage3 = await screen.findByText(`${issueTitle} 0`)
  expect(firstInPage3).toBeInTheDocument()
  const lastInPage3 = await screen.findByText(`${issueTitle} 24`)
  expect(lastInPage3).toBeInTheDocument()

  // no more pages to go back to
  expect(previous.getAttribute('aria-disabled')).toBe('true')
})

// skipped due to an issue with parsing the css of the banner component
// https://github.com/github/primer/issues/3869
test.skip('shows more results available banner', async () => {
  const {environment} = createRelayMockEnvironment()
  const issueTitle = 'my super specific issue title'

  render(
    <TestComponent
      environment={environment}
      query={''}
      scoped_repository={MOCK_REPOSITORY}
      enabledFeatureFlags={{issues_react_index_more_results_banner: true}}
    />,
  )

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      expect(operation.request.node.operation.name).toBe('ListItemsSearchRootQuery')
      expect(operation.request.variables.skip).toBe(0)
      return MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection() {
          return {
            openIssueCount: 1000,
            closedIssueCount: 2,
            edges: buildIssues({title: issueTitle, number: 25}),
            issueCount: 1002,
          }
        },
      })
    })
  })

  const paginationArea = await screen.findByRole('navigation', {name: 'Pagination'})
  expect(paginationArea).toBeInTheDocument()
  const last = within(paginationArea).getByRole('link', {name: 'Page 40...'})

  act(() => {
    // set focus on next button
    last.focus()
    last.click()
  })

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      expect(operation.request.node.operation.name).toBe('SearchPaginatedQuery')
      expect(operation.request.variables.skip).toBe(975)
      return MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection() {
          return {
            openIssueCount: 1000,
            closedIssueCount: 2,
            edges: buildIssues({title: issueTitle, number: 25, start: 975}),
            issueCount: 1002,
          }
        },
      })
    })
  })

  expect(screen.getByText(MESSAGES.moreItemsAvailableDescription(1000, 'issues'))).toBeVisible()
})

test('updates bulk action picker data', async () => {
  const query = 'is:issue state:open'
  const {environment} = createRelayMockEnvironment()
  const issueTitle = 'my super specific issue title'

  render(<TestComponent environment={environment} query={query} scoped_repository={MOCK_REPOSITORY} />)

  // search
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection() {
          return {
            openIssueCount: 1,
            closedIssueCount: 2,
            edges: [
              {
                node: buildIssue({title: issueTitle, owner: 'github', repo: 'hyperlist-web'}),
              },
            ],
          }
        },
      }),
    )
  })

  await screen.findByText(issueTitle)

  const item = screen.getByTestId('list-view-item-trailing-badge')
  expect(item).toHaveTextContent('bug')
  expect(item).toBeInTheDocument()

  // select issue for bulk actions
  const checkbox = await screen.findByLabelText(`Select: ${issueTitle}`)
  expect(checkbox).toBeInTheDocument()

  await act(async () => {
    checkbox.click()
  })

  await act(async () => {
    environment.mock.queuePendingOperation(LabelPickerGraphqlQuery, {owner: 'github', repo: 'hyperlist-web'})
    environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      expect(operation.fragment.node.name).toBe('LabelPickerQuery')
      return MockPayloadGenerator.generate(operation, {
        Repository() {
          return {
            id: 'R_kwAEHB',
            labels: {
              nodes: [
                {
                  name: 'bug',
                  nameHTML: 'bug',
                  color: 'd73a4a',
                  description: "Something isn't working",
                  id: mockRelayId(),
                },
              ],
            },
          }
        },
      })
    })
  })

  // open label menu
  await screen.findAllByTestId('action-bar')
  let bulkSetLabel = await screen.findByTestId('bulk-set-label-button')
  await act(async () => {
    bulkSetLabel.click()
  })

  let labelPicker = await screen.findByLabelText('Label results')

  // assert that attached label is not selected
  let options = await within(labelPicker).findAllByRole('option')
  expect(options[0]).toHaveAttribute('aria-selected', 'false')

  // select label in picker
  fireEvent.click(await within(options[0]!).findByText('bug'))

  // close the picker and invoke bulk action
  bulkSetLabel = await screen.findByTestId('bulk-set-label-button')

  await act(async () => {
    bulkSetLabel.click()
  })

  const noPicker = screen.queryByLabelText('Label results')
  expect(noPicker).not.toBeInTheDocument()

  // open the picker again, expecting to see the added label checked
  await act(async () => {
    bulkSetLabel.click()
  })

  // assert that label is no longer unselected
  labelPicker = await screen.findByLabelText('Label results')
  bulkSetLabel = await screen.findByTestId('bulk-set-label-button')
  options = await within(labelPicker).findAllByRole('option')
  expect(options[0]).toHaveAttribute('aria-selected')
})

test('does not allow selections when query supports PR', async () => {
  const query = 'state:open'
  const {environment} = createRelayMockEnvironment()
  const issueTitle = 'my super specific issue title'
  const prTitle = 'this is a PR'

  render(<TestComponent environment={environment} query={query} scoped_repository={MOCK_REPOSITORY} />)

  // search
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection() {
          return {
            openIssueCount: 2,
            closedIssueCount: 2,
            edges: [
              {
                node: buildIssue({title: issueTitle}),
              },
              {
                node: buildPullRequest({title: prTitle}),
              },
            ],
          }
        },
      }),
    )
  })

  const items = screen.getAllByTestId('list-view-item-trailing-badge')
  expect(items).toHaveLength(2)
  expect(items[0]).toHaveTextContent('bug')
  expect(items[1]).toHaveTextContent('bug')

  // select all checkbox should not be present
  expect(screen.queryByTestId('select-all-checkbox')).not.toBeInTheDocument()

  // list item checkboxes should not be present
  expect(screen.queryAllByLabelText(/Select:/)).toHaveLength(0)

  // There should be no bulk actions available
  expect(screen.queryByTestId('list-view-actions')).not.toBeInTheDocument()
})

test('pagination unselects previously selected items', async () => {
  const query = 'is:issue state:open'
  const {environment} = createRelayMockEnvironment()
  const issueTitle = 'my super specific issue title'

  render(<TestComponent environment={environment} query={query} scoped_repository={MOCK_REPOSITORY} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      expect(operation.request.node.operation.name).toBe('ListItemsSearchRootQuery')
      expect(operation.request.variables.skip).toBe(0)
      return MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection() {
          return {
            openIssueCount: 50,
            closedIssueCount: 2,
            edges: buildIssues({title: issueTitle, number: 25}),
            issueCount: 50,
          }
        },
      })
    })
  })

  // Assert nothing is selected in the beginning
  const listElement = screen.getByTestId('list')
  let checkboxes: HTMLInputElement[] = within(listElement).getAllByRole('checkbox')
  let selectedCheckboxes = checkboxes.filter(checkbox => checkbox.checked)
  expect(selectedCheckboxes.length).toBe(0)

  // select the first and last item in the first page
  const checkboxFirstInPage1 = await screen.findByLabelText(`Select: ${issueTitle} 0`)
  expect(checkboxFirstInPage1).toBeInTheDocument()
  const checkboxLastInPage1 = await screen.findByLabelText(`Select: ${issueTitle} 24`)
  expect(checkboxLastInPage1).toBeInTheDocument()

  await act(async () => {
    checkboxFirstInPage1.click()
    checkboxLastInPage1.click()
  })

  // Assert that 2 items are selected
  checkboxes = within(listElement).getAllByRole('checkbox')
  selectedCheckboxes = checkboxes.filter(checkbox => checkbox.checked)
  expect(selectedCheckboxes.length).toBe(2)

  // Paginate to next page
  const paginationArea = await screen.findByRole('navigation', {name: 'Pagination'})
  const next = within(paginationArea).getByRole('link', {name: 'Next Page'})
  act(() => next.click())

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      expect(operation.request.node.operation.name).toBe('SearchPaginatedQuery')
      expect(operation.request.variables.skip).toBe(25)
      return MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection() {
          return {
            openIssueCount: 50,
            closedIssueCount: 2,
            edges: buildIssues({title: issueTitle, number: 25, start: 25}),
            issueCount: 50,
          }
        },
      })
    })
  })

  // Assert that no items are selected
  checkboxes = within(listElement).getAllByRole('checkbox')
  selectedCheckboxes = checkboxes.filter(checkbox => checkbox.checked)
  expect(selectedCheckboxes.length).toBe(0)
}, 40000)

test('supports shift selection', async () => {
  const query = 'is:issue state:open'
  const {environment} = createRelayMockEnvironment()
  const issueTitle = 'my super specific issue title'

  render(
    <TestComponent
      environment={environment}
      query={query}
      scoped_repository={MOCK_REPOSITORY}
      enabledFeatureFlags={{issues_react_shift_select: true}}
    />,
  )

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      expect(operation.request.node.operation.name).toBe('ListItemsSearchRootQuery')
      expect(operation.request.variables.skip).toBe(0)
      return MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection() {
          return {
            openIssueCount: 50,
            closedIssueCount: 2,
            edges: buildIssues({title: issueTitle, number: 25}),
            issueCount: 50,
          }
        },
      })
    })
  })

  // Assert nothing is selected in the beginning
  const listElement = screen.getByTestId('list')
  const checkboxes: HTMLInputElement[] = within(listElement).getAllByRole('checkbox')
  let selectedCheckboxes = checkboxes.filter(checkbox => checkbox.checked)
  expect(selectedCheckboxes.length).toBe(0)

  // Shift select some items
  const checkboxSecond = await screen.findByLabelText(`Select: ${issueTitle} 2`)
  expect(checkboxSecond).toBeInTheDocument()
  const checkboxEighth = await screen.findByLabelText(`Select: ${issueTitle} 8`)
  expect(checkboxEighth).toBeInTheDocument()

  await act(async () => {
    checkboxSecond.click()
  })
  fireEvent.keyDown(window, {shiftKey: true})
  fireEvent.click(checkboxEighth)
  fireEvent.keyUp(window, {shiftKey: true})

  // Assert that 7 items are selected
  selectedCheckboxes = checkboxes.filter(checkbox => checkbox.checked)
  expect(selectedCheckboxes.length).toBe(7)

  // Shift select some more items from bottom to top
  const checkboxTwentieth = await screen.findByLabelText(`Select: ${issueTitle} 20`)
  expect(checkboxTwentieth).toBeInTheDocument()
  const checkboxTwentyFourth = await screen.findByLabelText(`Select: ${issueTitle} 24`)
  expect(checkboxTwentyFourth).toBeInTheDocument()

  await act(async () => {
    checkboxTwentyFourth.click()
  })
  fireEvent.keyDown(window, {shiftKey: true})
  fireEvent.click(checkboxTwentieth)
  fireEvent.keyUp(window, {shiftKey: true})

  // Assert that 12 items are selected
  selectedCheckboxes = checkboxes.filter(checkbox => checkbox.checked)
  expect(selectedCheckboxes.length).toBe(12)

  // Shift deselect
  const checkboxFourth = await screen.findByLabelText(`Select: ${issueTitle} 4`)
  expect(checkboxSecond).toBeInTheDocument()
  const checkboxTwentysecond = await screen.findByLabelText(`Select: ${issueTitle} 22`)
  expect(checkboxEighth).toBeInTheDocument()

  await act(async () => {
    checkboxFourth.click()
  })
  fireEvent.keyDown(window, {shiftKey: true})
  fireEvent.click(checkboxTwentysecond)
  fireEvent.keyUp(window, {shiftKey: true})

  // Assert that 4 items are selected
  selectedCheckboxes = checkboxes.filter(checkbox => checkbox.checked)
  expect(selectedCheckboxes.length).toBe(4)
}, 40000)

async function mockListItemQuery(environment: RelayMockEnvironment, issueTitle: string) {
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      expect(operation.request.node.operation.name).toBe('ListItemsSearchRootQuery')
      return MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection() {
          return {
            openIssueCount: 1,
            closedIssueCount: 2,
            edges: [
              {
                node: buildIssue({title: issueTitle}),
              },
            ],
          }
        },
      })
    })
  })
}

test('does not render the issue type filter when the feature flag is disabled', async () => {
  const query = 'state:open'
  const {environment} = createRelayMockEnvironment()
  const issueTitle = 'my super specific issue title'

  render(
    <TestComponent
      environment={environment}
      query={query}
      scoped_repository={MOCK_REPOSITORY}
      enabledFeatureFlags={{issue_types: false}}
    />,
  )

  await mockListItemQuery(environment, issueTitle)
  await screen.findByText(issueTitle)

  expect(
    screen.queryByRole('button', {
      name: /Filter by issue type/i,
    }),
  ).not.toBeInTheDocument()
})

test('renders the issue type filter when the feature flag is enabled', async () => {
  const query = 'state:open'
  const {environment} = createRelayMockEnvironment()
  const issueTitle = 'my super specific issue title'

  render(
    <TestComponent
      environment={environment}
      query={query}
      scoped_repository={MOCK_REPOSITORY}
      enabledFeatureFlags={{issue_types: true}}
    />,
  )

  await mockListItemQuery(environment, issueTitle)
  await screen.findByText(issueTitle)

  expect(
    screen.getByRole('button', {
      name: /Filter by issue type/i,
    }),
  ).toBeInTheDocument()
})
