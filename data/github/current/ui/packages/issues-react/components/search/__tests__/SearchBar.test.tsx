/**
 * NOTE: Do not add any more tests to this file. New tests for `SearchBar` should be added t o `ui/packages/issues-react/components/search/__tests__/SearchBarWithFilter.test.tsx` file.
 * These tests `QueryBuilder` component which is being replaced with the `Filter` component.
 * This file will be deleted soon.
 */

import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {render} from '@github-ui/react-core/test-utils'
// necessary import process to mock useAppPayload functionality
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {act, screen} from '@testing-library/react'
import {useEffect} from 'react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import type {OperationDescriptor} from 'relay-runtime'
import {createMockEnvironment, MockPayloadGenerator, type MockEnvironment} from 'relay-test-utils'

import {LABELS} from '../../../constants/labels'
import {useQueryContext, useQueryEditContext} from '../../../contexts/QueryContext'
import HyperlistAppWrapper from '../../../test-utils/HyperlistAppWrapper'
import {buildSearchShortcut, setupExpectedAsyncErrorHandlerForFilterBar} from '../../../test-utils/IssueTestUtils'
import type {HyperlistTargetType} from '../../../types/analytics-event-types'
import {SearchBar} from '../SearchBar'

jest.mock('@github-ui/react-core/use-app-payload')
const mockedUseAppPayload = jest.mocked(useAppPayload)

beforeEach(() => {
  jest.clearAllMocks()
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
      query SearchBarQuery @relay_test_operation {
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
      query SearchBarCurrentRepoQuery @relay_test_operation {
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
  setupExpectedAsyncErrorHandlerForFilterBar()
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

  const input = await screen.findByPlaceholderText('Search Issues')
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

    const searchInput = screen.getByRole('combobox', {name: LABELS.issueSearchInputAriaLabel})

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

    const searchInput = screen.getByRole('combobox', {name: LABELS.issueSearchInputAriaLabel})

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

  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(async () => {
    render(<TestComponent editMode environment={environment} query={searchQuery} />)
  })

  expect(await screen.findByRole('link', {name: 'New issue'})).toBeVisible()
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

    const searchInput = screen.getByRole('combobox', {name: LABELS.issueSearchInputAriaLabel})
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

    const searchInput = screen.getByRole('combobox', {name: LABELS.issueSearchInputAriaLabel})
    expect(searchInput).toHaveValue('is:issue state:open mentions:collaborator ')
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
