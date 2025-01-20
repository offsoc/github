import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {render} from '@github-ui/react-core/test-utils'
// necessary import process to mock useAppPayload functionality
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {screen, act} from '@testing-library/react'
import {useEffect} from 'react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import type {OperationDescriptor} from 'relay-runtime'
import {createMockEnvironment, MockPayloadGenerator, type MockEnvironment} from 'relay-test-utils'

import {useQueryContext, useQueryEditContext} from '../../../contexts/QueryContext'
import HyperlistAppWrapper from '../../../test-utils/HyperlistAppWrapper'
import {
  buildRepositoryWithIssueTypes,
  buildSearchShortcut,
  setupExpectedAsyncErrorHandlerForFilterBar,
} from '../../../test-utils/IssueTestUtils'
import type {HyperlistTargetType} from '../../../types/analytics-event-types'
import {SearchBar} from '../SearchBar'

const mockUseFeatureFlags = jest.fn().mockReturnValue({})
jest.mock('@github-ui/react-core/use-feature-flag', () => ({
  useFeatureFlags: () => mockUseFeatureFlags({}),
}))

jest.mock('@github-ui/react-core/use-app-payload')
const mockedUseAppPayload = jest.mocked(useAppPayload)

beforeEach(() => {
  jest.clearAllMocks()
  setupExpectedAsyncErrorHandlerForFilterBar()
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let urlParams: any = {}
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => {
    return urlParams
  },
}))

interface TestComponentProps {
  editMode?: boolean
  environment: ReturnType<typeof createMockEnvironment>
  query?: string
}

function InnerTestComponent({editMode, query}: Omit<TestComponentProps, 'environment'>) {
  const {isEditing, setIsEditing, setActiveSearchQuery} = useQueryContext()
  const {setDirtyTitle} = useQueryEditContext()
  useEffect(() => {
    if (!isEditing && editMode) {
      setDirtyTitle('test')
      query && setActiveSearchQuery(query)
      setIsEditing(true)
    }
  })
  const data = useLazyLoadQuery(
    graphql`
      query SearchBarWithFilterQuery @relay_test_operation {
        node(id: "SSC_asdkasd") {
          # Spread the fragment you want to test here
          ...SearchBarCurrentViewFragment
        }
      }
    `,
    {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any

  const repoData = useLazyLoadQuery(
    graphql`
      query SearchBarWithFilterCurrentRepoQuery @relay_test_operation {
        repository(name: "test-repo-name", owner: "test-repo-owner") {
          # Spread the fragment you want to test here
          ...SearchBarRepositoryFragment
        }
      }
    `,
    {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any
  return <SearchBar currentRepository={repoData.repository} currentView={data.node} />
}

function TestComponent({environment, query, ...inner}: TestComponentProps) {
  const searchQuery = query ?? 'is:issue state:open'
  return (
    <HyperlistAppWrapper environment={environment} metadata={{query: searchQuery}}>
      <InnerTestComponent query={searchQuery} {...inner} />
    </HyperlistAppWrapper>
  )
}

test('sends analytics event when query is saved', async () => {
  const searchQuery = 'repo:github/issues-react state:open'
  mockedUseAppPayload.mockReturnValue({
    initial_view_content: {},
    enabled_features: {},
  })
  const environment = createMockEnvironment()

  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      Node() {
        return buildSearchShortcut({query: searchQuery})
      },
    })
  })
  mockRepositoryQuery(environment)

  const {user} = render(<TestComponent editMode environment={environment} query={searchQuery} />)

  const input = screen.getByTestId('filter-input')
  const saveButton = await screen.findByText('Save view')

  await user.clear(input)
  await user.type(input, 'new query')
  await user.click(saveButton)

  expectAnalyticsEvents<HyperlistTargetType>({
    type: 'search.save',
    target: 'FILTER_BAR_SAVE_BUTTON',
    data: {
      app_name: 'hyperlist',
      query: searchQuery,
      new_query: 'new query',
    },
  })
})

describe('focuses search bar on shortcut press', () => {
  test('[Cmd/Meta] + /', async () => {
    const searchQuery = 'repo:github/issues-react state:open'
    mockedUseAppPayload.mockReturnValue({
      initial_view_content: {},
      enabled_features: {},
      current_user_settings: {use_single_key_shortcut: true},
    })
    const environment = createMockEnvironment()

    environment.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        Node: () => buildSearchShortcut({query: searchQuery}),
      }),
    )
    mockRepositoryQuery(environment)

    const {user} = render(<TestComponent editMode environment={environment} query={searchQuery} />)

    const searchInput = screen.getByTestId('filter-input')

    expect(searchInput).not.toHaveFocus()

    await user.keyboard('{Meta>}[Slash]{/Meta}')

    expect(searchInput).toHaveFocus()

    await user.type(searchInput, 'extended query')

    expect(searchInput).toHaveValue(`${searchQuery} extended query`)
  })

  test('[Ctrl] + /', async () => {
    const searchQuery = 'repo:github/issues-react state:open'
    mockedUseAppPayload.mockReturnValue({
      initial_view_content: {},
      enabled_features: {},
      current_user_settings: {use_single_key_shortcut: true},
    })
    const environment = createMockEnvironment()

    environment.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        Node: () => buildSearchShortcut({query: searchQuery}),
      }),
    )
    mockRepositoryQuery(environment)

    const {user} = render(<TestComponent editMode environment={environment} query={searchQuery} />)

    const searchInput = screen.getByTestId('filter-input')

    expect(searchInput).not.toHaveFocus()

    await user.keyboard('{Control>}[Slash]{/Control}')

    expect(searchInput).toHaveFocus()

    await user.type(searchInput, 'extended query')

    expect(searchInput).toHaveValue(`${searchQuery} extended query`)
  })
})

test('does not show create issue button in archived repository', async () => {
  const searchQuery = 'repo:github/issues-react state:open'
  mockedUseAppPayload.mockReturnValue({
    initial_view_content: {},
    enabled_features: {},
    scoped_repository: {is_archived: true},
  })
  const environment = createMockEnvironment()

  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      Node() {
        return buildSearchShortcut({query: searchQuery})
      },
    })
  })

  render(<TestComponent editMode environment={environment} query={searchQuery} />)

  expect(screen.queryByRole('link', {name: 'New issue'})).not.toBeInTheDocument()
})

test('shows create issue button if repository is not archived', async () => {
  const searchQuery = 'repo:github/issues-react state:open'
  mockedUseAppPayload.mockReturnValue({
    initial_view_content: {},
    enabled_features: {},
    scoped_repository: {is_archived: false},
  })
  const environment = createMockEnvironment()

  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      Node() {
        return buildSearchShortcut({query: searchQuery})
      },
    })
  })
  mockRepositoryQuery(environment)

  render(<TestComponent editMode environment={environment} query={searchQuery} />)

  expect(await screen.findByRole('link', {name: 'New issue'})).toBeVisible()
})

test('does not show create issue button when user is emu in non org repo', async () => {
  const searchQuery = 'repo:github/issues-react state:open'
  mockedUseAppPayload.mockReturnValue({
    initial_view_content: {},
    enabled_features: {},
    scoped_repository: {is_archived: false},
    current_user: {is_emu: true},
  })
  const environment = createMockEnvironment()

  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      Node() {
        return buildSearchShortcut({query: searchQuery})
      },
    })
  })
  mockRepositoryQuery(environment, false)

  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(async () => {
    render(<TestComponent editMode environment={environment} query={searchQuery} />)
  })

  expect(screen.queryByRole('link', {name: 'New issue'})).not.toBeInTheDocument()
})

test('show create issue button when user is emu in org repo', async () => {
  const searchQuery = 'repo:github/issues-react state:open'
  mockedUseAppPayload.mockReturnValue({
    initial_view_content: {},
    enabled_features: {},
    scoped_repository: {is_archived: false},
    current_user: {is_emu: true},
  })
  const environment = createMockEnvironment()

  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      Node() {
        return buildSearchShortcut({query: searchQuery})
      },
    })
  })
  mockRepositoryQuery(environment, true)

  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(async () => {
    render(<TestComponent editMode environment={environment} query={searchQuery} />)
  })

  expect(screen.getByRole('link', {name: 'New issue'})).toBeInTheDocument()
})

test('show create issue button when user is not emu in org repo', async () => {
  const searchQuery = 'repo:github/issues-react state:open'
  mockedUseAppPayload.mockReturnValue({
    initial_view_content: {},
    enabled_features: {},
    scoped_repository: {is_archived: false},
    current_user: {is_emu: false},
  })
  const environment = createMockEnvironment()

  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      Node() {
        return buildSearchShortcut({query: searchQuery})
      },
    })
  })
  mockRepositoryQuery(environment, true)

  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(async () => {
    render(<TestComponent editMode environment={environment} query={searchQuery} />)
  })

  expect(screen.getByRole('link', {name: 'New issue'})).toBeInTheDocument()
})

test('show create issue button when user is not emu in non org repo', async () => {
  const searchQuery = 'repo:github/issues-react state:open'
  mockedUseAppPayload.mockReturnValue({
    initial_view_content: {},
    enabled_features: {},
    scoped_repository: {is_archived: false},
    current_user: {is_emu: false},
  })
  const environment = createMockEnvironment()

  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      Node() {
        return buildSearchShortcut({query: searchQuery})
      },
    })
  })
  mockRepositoryQuery(environment, false)

  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(async () => {
    render(<TestComponent editMode environment={environment} query={searchQuery} />)
  })

  expect(screen.getByRole('link', {name: 'New issue'})).toBeInTheDocument()
})

describe('when a custom path is defined in the url', () => {
  test('shows the right query for author', async () => {
    urlParams = {author: 'monalisa'}
    const searchQuery = 'repo:github/issues-react state:open'
    mockedUseAppPayload.mockReturnValue({
      initial_view_content: {},
      enabled_features: {},
    })
    const environment = createMockEnvironment()
    environment.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        Node: () => buildSearchShortcut({query: searchQuery}),
      }),
    )
    mockRepositoryQuery(environment)

    render(<TestComponent editMode environment={environment} query={searchQuery} />, {
      pathname: '/owner/repo/issues/created_by/monalisa',
    })

    const searchInput = screen.getByTestId('filter-input')
    expect(searchInput).toHaveValue('is:issue state:open author:monalisa ')
  })

  test('shows the right query for mentioned', async () => {
    urlParams = {mentioned: 'collaborator'}
    const searchQuery = 'repo:github/issues-react state:open'
    mockedUseAppPayload.mockReturnValue({
      initial_view_content: {},
      enabled_features: {},
    })
    const environment = createMockEnvironment()

    environment.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        Node: () => buildSearchShortcut({query: searchQuery}),
      }),
    )
    mockRepositoryQuery(environment)

    render(<TestComponent editMode environment={environment} query={searchQuery} />, {
      pathname: '/owner/repo/issues/mentioned/collaborator',
    })

    const searchInput = screen.getByTestId('filter-input')
    expect(searchInput).toHaveValue('is:issue state:open mentions:collaborator ')
  })
})

describe('Qualifier value validation tests', () => {
  const validValues = [
    'is:open',
    'is:closed',
    'is:merged',
    'comments:<10',
    'interactions:10..100',
    'sort:created-asc',
    'mentions:monalisa',
    'involves:monalisa',
    'commenter:@me',
    'reason:"not-planned"',
    'archived:true',
    'updated:2022-01-01',
    'created:2022-01-01',
    'closed:2022-01-01',
    'merged:2022-01-01',
    'user:monalisa',
    'team:github/engineering',
    'team-review-requested:github/engineering',
    'review-requested:monalisa',
    'review:none',
    'reviewed-by:monalisa',
    'reactions:<10',
    'org:github',
    'language:typescript',
    'draft:true',
  ]
  const invalidValues = ['is:not', 'comments:string', 'interactions:string', 'sort:false', 'reason:none']

  test.each(validValues)(`does not show invalid value warning for %s`, async filter => {
    const searchQuery = `repo:github/issues-react ${filter}`

    await setupValidationTest(searchQuery)

    expect(screen.queryByTestId('validation-error-count')).not.toBeInTheDocument()
    expect(screen.queryAllByTestId('validation-error-list')).toHaveLength(0)
  })

  test.each(invalidValues)(`shows invalid value warning for %s`, async filter => {
    const searchQuery = `repo:github/issues-react ${filter}`

    await setupValidationTest(searchQuery)

    const errors = screen.getAllByTestId('validation-error-list')
    expect(errors).toHaveLength(1)
    expect(errors[0]).toHaveTextContent(/Invalid value/)
  })

  describe('Issue type', () => {
    test.each(['type:Bug', 'type:pr', 'type:issue'])(`does not show invalid value warning for %s`, async () => {
      const searchQuery = 'type:Bug'
      mockAppPayloadForTypeFilterProvider()

      const environment = createMockEnvironment()
      mockUseFeatureFlags.mockReturnValue({issue_types: true})
      environment.mock.queueOperationResolver((operation: OperationDescriptor) =>
        MockPayloadGenerator.generate(operation, {
          Node: () => buildSearchShortcut({query: searchQuery}),
        }),
      )

      mockRepositoryQuery(environment)
      mockRepositoryWithIssueTypes(environment)

      render(<TestComponent editMode environment={environment} query={searchQuery} />)

      await focusFilterInput()

      expect(screen.queryByTestId('validation-error-count')).not.toBeInTheDocument()
      expect(screen.queryAllByTestId('validation-error-list')).toHaveLength(0)
    })

    test('shows invalid value warning when issue type is invalid', async () => {
      const searchQuery = 'type:false'
      mockAppPayloadForTypeFilterProvider()

      const environment = createMockEnvironment()
      mockUseFeatureFlags.mockReturnValue({issue_types: true})
      environment.mock.queueOperationResolver((operation: OperationDescriptor) =>
        MockPayloadGenerator.generate(operation, {
          Node: () => buildSearchShortcut({query: searchQuery}),
        }),
      )

      mockRepositoryQuery(environment)
      mockRepositoryWithIssueTypes(environment)

      render(<TestComponent editMode environment={environment} query={searchQuery} />)

      await focusFilterInput()

      const errors = screen.getAllByTestId('validation-error-list')
      expect(errors).toHaveLength(1)
      expect(errors[0]).toHaveTextContent('Invalid value false for type')
    })
  })
})

function mockRepositoryQuery(environment: MockEnvironment, isEnterpriseManaged = false) {
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      Repository() {
        return {name: 'test-repo-name', owner: 'test-repo-owner', isOwnerEnterpriseManaged: isEnterpriseManaged}
      },
    })
  })
}

async function focusFilterInput() {
  const input = screen.getByTestId('filter-input')
  await act(async () => {
    input.focus()
  })
}

async function setupValidationTest(searchQuery: string) {
  mockedUseAppPayload.mockReturnValue({
    initial_view_content: {},
    enabled_features: {},
    scoped_repository: {is_archived: true},
  })
  const environment = createMockEnvironment()

  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      Node() {
        return buildSearchShortcut({query: searchQuery})
      },
    })
  })
  mockRepositoryQuery(environment)

  render(<TestComponent environment={environment} query={searchQuery} />)

  await focusFilterInput()
}

function mockRepositoryWithIssueTypes(environment: MockEnvironment) {
  environment.mock.queueOperationResolver((operation: OperationDescriptor) =>
    MockPayloadGenerator.generate(operation, {
      Repository: () =>
        buildRepositoryWithIssueTypes({
          name: 'issues-react',
          owner: 'github',
        }),
    }),
  )
}

function mockAppPayloadForTypeFilterProvider() {
  mockedUseAppPayload.mockReturnValue({
    initial_view_content: {},
    enabled_features: {},
    scoped_repository: {
      owner: 'github',
      name: 'issues-react',
    },
  })
}
